import { Hono } from 'hono'

const app = new Hono();


// custom not-found message
app.notFound((c) => {
  return c.text('The endpoint is not available', 404)
})

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// GET all books 
app.get('/api/v1/books', async (c) => {
  const page = parseInt(c.req.query('page') || '1', 10) || 1
  const limit = Math.min(parseInt(c.req.query('limit') || '20', 10) || 20, 100)

  const category = c.req.query('category')
  const status = c.req.query('status')
  const sort = c.req.query('sort')
  const search = c.req.query('search')

  return c.json({
    message: 'Books endpoint working',
    filters: {
      page,
      limit,
      category,
      status,
      sort,
      search,
    },
  })
})

export default app
