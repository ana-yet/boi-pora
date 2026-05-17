import { Hono } from 'hono'
import type { Context } from 'hono'
import { MongoClient, ObjectId } from 'mongodb'

type Bindings = {
  MONGODB_URI?: string
  DB_NAME?: string
  CORS_ORIGIN?: string
  /** Fallback when MongoDB fails (e.g. http://127.0.0.1:4000 for local Nest). */
  BOOKS_API_PROXY?: string
}

type AppContext = Context<{ Bindings: Bindings }>

const DEFAULT_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]

const app = new Hono<{ Bindings: Bindings }>()

function getAllowedOrigins(corsOrigin?: string): string[] {
  const fromEnv = (corsOrigin ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
  return fromEnv.length > 0 ? fromEnv : DEFAULT_ORIGINS
}

function resolveAllowOrigin(requestOrigin: string | undefined, allowed: string[]): string {
  if (requestOrigin && allowed.includes(requestOrigin)) {
    return requestOrigin
  }
  return allowed[0] ?? 'http://localhost:3000'
}

/** Always attach CORS headers (including 4xx/5xx and handler errors). */
app.use('*', async (c, next) => {
  const allowed = getAllowedOrigins(c.env.CORS_ORIGIN)
  const requestOrigin = c.req.header('Origin')
  const allowOrigin = resolveAllowOrigin(requestOrigin, allowed)

  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods':
      'GET, HEAD, OPTIONS, POST, PUT, PATCH, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }

  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204, corsHeaders)
  }

  try {
    await next()
  } finally {
    for (const [key, value] of Object.entries(corsHeaders)) {
      c.res.headers.set(key, value)
    }
  }
})

function withCorsHeaders(
  c: { env: Bindings; req: { header: (name: string) => string | undefined } },
  res: Response,
): Response {
  const allowed = getAllowedOrigins(c.env.CORS_ORIGIN)
  const allowOrigin = resolveAllowOrigin(c.req.header('Origin'), allowed)
  const headers = new Headers(res.headers)
  headers.set('Access-Control-Allow-Origin', allowOrigin)
  headers.set('Vary', 'Origin')
  return new Response(res.body, { status: res.status, headers })
}

async function proxyToNest(c: AppContext): Promise<Response | null> {
  const base = c.env.BOOKS_API_PROXY?.replace(/\/$/, '')
  if (!base) return null

  const incoming = new URL(c.req.url)
  const target = `${base}${incoming.pathname}${incoming.search}`

  try {
    const res = await fetch(target, {
      method: c.req.method,
      headers: { Accept: 'application/json' },
    })

    const contentType = res.headers.get('content-type') ?? ''

    if (!res.ok || !contentType.includes('application/json')) {
      const body = await res.text().catch(() => '')
      console.error('[books proxy] failed', target, res.status, body.slice(0, 200))
      return null
    }

    console.warn('[books proxy] serving via BOOKS_API_PROXY fallback:', target)
    return withCorsHeaders(c, res)
  } catch (err) {
    console.error('[books proxy] unreachable', target, err)
    return null
  }
}

/** Primary: MongoDB. Fallback: BOOKS_API_PROXY only when Mongo throws. */
async function tryMongoThenProxy(
  c: AppContext,
  fromMongo: () => Promise<Response>,
): Promise<Response> {
  if (c.env.MONGODB_URI) {
    try {
      return await fromMongo()
    } catch (error) {
      console.error('[books] MongoDB failed, trying BOOKS_API_PROXY', error)
    }
  }

  const proxied = await proxyToNest(c)
  if (proxied) return proxied

  if (!c.env.MONGODB_URI && !c.env.BOOKS_API_PROXY) {
    return c.json(
      {
        message: 'No data source configured',
        hint: 'Set MONGODB_URI and/or BOOKS_API_PROXY in honobackend/.env',
      },
      500,
    )
  }

  return c.json(
    {
      message: 'Failed to load books data',
      hint: c.env.BOOKS_API_PROXY
        ? 'MongoDB failed and Nest proxy is unavailable. Fix MONGODB_URI or start `npm run dev:api`.'
        : 'MongoDB failed. Check MONGODB_URI.',
    },
    500,
  )
}

async function withDb<T>(
  c: { env: Bindings },
  fn: (db: ReturnType<MongoClient['db']>) => Promise<T>,
): Promise<T> {
  const { MONGODB_URI, DB_NAME } = c.env

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set')
  }

  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 4_000,
    connectTimeoutMS: 4_000,
    socketTimeoutMS: 10_000,
  })

  try {
    await client.connect()
    return await fn(client.db(DB_NAME || 'boi-pora'))
  } finally {
    await client.close().catch(() => undefined)
  }
}

function booksSortOption(sort?: string): Record<string, 1 | -1> {
  if (sort === 'rating' || sort === 'ratingCount') {
    return { [sort]: -1 }
  }
  if (sort === 'createdAt' || sort === 'oldest') {
    return { createdAt: sort === 'oldest' ? 1 : -1 }
  }
  if (sort === 'title_asc') return { title: 1 }
  if (sort === 'title_desc') return { title: -1 }
  return { title: 1 }
}

app.notFound((c) => {
  return c.json({ message: 'The endpoint is not available' }, 404)
})

app.onError((err, c) => {
  console.error(err)
  return c.json(
    {
      message: err instanceof Error ? err.message : 'Internal Server Error',
    },
    500,
  )
})

app.get('/', (c) => {
  return c.json({
    ok: true,
    service: 'honobackend',
    primary: 'mongodb',
    booksProxyFallback: Boolean(c.env.BOOKS_API_PROXY),
    hasMongoUri: Boolean(c.env.MONGODB_URI),
  })
})

app.get('/api/v1/books', (c) =>
  tryMongoThenProxy(c, () =>
    withDb(c, async (db) => {
      const booksCollection = db.collection('books')

      const page = parseInt(c.req.query('page') || '1', 10) || 1
      const limit = Math.min(
        parseInt(c.req.query('limit') || '20', 10) || 20,
        100,
      )

      const category = c.req.query('category')
      const status = c.req.query('status')
      const sort = c.req.query('sort')
      const search = c.req.query('search')

      const skip = (page - 1) * limit

      const filter: Record<string, unknown> = {}

      if (category) filter.category = category
      if (status) filter.status = status

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } },
        ]
      }

      const sortOption = booksSortOption(sort)

      const [items, total] = await Promise.all([
        booksCollection
          .find(filter)
          .sort(sortOption)
          .skip(skip)
          .limit(limit)
          .toArray(),
        booksCollection.countDocuments(filter),
      ])

      return c.json({
        items,
        total,
        page,
        limit,
      })
    }),
  ),
)

app.get('/api/v1/books/search', (c) =>
  tryMongoThenProxy(c, () =>
    withDb(c, async (db) => {
      const q = c.req.query('q') || ''
      const limit = Math.min(
        parseInt(c.req.query('limit') || '20', 10) || 20,
        100,
      )

      const items = await db
        .collection('books')
        .find({
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { author: { $regex: q, $options: 'i' } },
            { category: { $regex: q, $options: 'i' } },
          ],
        })
        .limit(limit)
        .toArray()

      return c.json(items)
    }),
  ),
)

app.get('/api/v1/books/slug/:slug', (c) =>
  tryMongoThenProxy(c, () =>
    withDb(c, async (db) => {
      const slug = c.req.param('slug')
      const book = await db.collection('books').findOne({ slug })

      if (!book) {
        return c.json({ message: 'Book not found' }, 404)
      }

      return c.json(book)
    }),
  ),
)

app.get('/api/v1/books/:id', (c) =>
  tryMongoThenProxy(c, () =>
    withDb(c, async (db) => {
      const id = c.req.param('id')

      if (!ObjectId.isValid(id)) {
        return c.json({ message: 'Invalid book ID' }, 400)
      }

      const book = await db.collection('books').findOne({
        _id: new ObjectId(id),
      })

      if (!book) {
        return c.json({ message: 'Book not found' }, 404)
      }

      return c.json(book)
    }),
  ),
)

export default app
