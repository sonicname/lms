import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

export default {
  port: Bun.env.PORT ? parseInt(Bun.env.PORT) : 8000,
  fetch: app.fetch,
};
