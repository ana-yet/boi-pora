import { Hono } from 'hono'
import { MongoClient, ObjectId } from 'mongodb'

type Bindings = {
  MONGODB_URI?: string
  DB_NAME?: string
  CORS_ORIGIN?: string
  /** Local dev: proxy books routes to Nest (e.g. http://127.0.0.1:4000) when Mongo hangs in Workers. */
  BOOKS_API_PROXY?: string
}

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

async function proxyToNest(c: {
  env: Bindings
  req: { method: string; url: string; header: (name: string) => string | undefined }
}): Promise<Response | null> {
  const base = c.env.BOOKS_API_PROXY?.replace(/\/$/, '')
  if (!base) return null

  const incoming = new URL(c.req.url)
  const target = `${base}${incoming.pathname}${incoming.search}`

  const headers = new Headers()
  const accept = c.req.header('Accept')
  if (accept) headers.set('Accept', accept)

  const res = await fetch(target, {
    method: c.req.method,
    headers,
  })

  return withCorsHeaders(c, res)
}

async function withDb<T>(
  c: { env: Bindings },
  fn: (db: ReturnType<MongoClient['db']>) => Promise<T>,
): Promise<T> {
  const { MONGODB_URI, DB_NAME } = c.env

  if (!MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is not set. Add it to honobackend/.env, or set BOOKS_API_PROXY=http://127.0.0.1:4000 to use Nest locally.',
    )
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
    booksProxy: Boolean(c.env.BOOKS_API_PROXY),
    hasMongoUri: Boolean(c.env.MONGODB_URI),
  })
})

app.get('/api/v1/books', async (c) => {
  const proxied = await proxyToNest(c)
  if (proxied) return proxied

  try {
    return await withDb(c, async (db) => {
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
    })
  } catch (error) {
    console.error(error)
    const message =
      error instanceof Error ? error.message : 'Failed to fetch books'
    return c.json({ message }, 500)
  }
})

app.get('/api/v1/books/search', async (c) => {
  const proxied = await proxyToNest(c)
  if (proxied) return proxied

  try {
    return await withDb(c, async (db) => {
      const booksCollection = db.collection('books')

      const q = c.req.query('q') || ''
      const limit = Math.min(
        parseInt(c.req.query('limit') || '20', 10) || 20,
        100,
      )

      const items = await booksCollection
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
    })
  } catch (error) {
    console.error(error)
    const message =
      error instanceof Error ? error.message : 'Search failed'
    return c.json({ message }, 500)
  }
})

app.get('/api/v1/books/slug/:slug', async (c) => {
  const proxied = await proxyToNest(c)
  if (proxied) return proxied

  try {
    return await withDb(c, async (db) => {
      const slug = c.req.param('slug')
      const book = await db.collection('books').findOne({ slug })

      if (!book) {
        return c.json({ message: 'Book not found' }, 404)
      }

      return c.json(book)
    })
  } catch (error) {
    console.error(error)
    const message =
      error instanceof Error ? error.message : 'Failed to fetch book by slug'
    return c.json({ message }, 500)
  }
})

app.get('/api/v1/books/:id', async (c) => {
  const proxied = await proxyToNest(c)
  if (proxied) return proxied

  try {
    return await withDb(c, async (db) => {
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
    })
  } catch (error) {
    console.error(error)
    const message =
      error instanceof Error ? error.message : 'Failed to fetch book'
    return c.json({ message }, 500)
  }
})

export default app
