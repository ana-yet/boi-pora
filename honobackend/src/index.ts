import { Hono } from 'hono'

const app = new Hono();


// custom not-found message
app.notFound((c) => {
  return c.text('The endpoint is not available', 404)
})

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
