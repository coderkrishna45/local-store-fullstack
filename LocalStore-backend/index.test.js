const assert = require('node:assert/strict');
const { once } = require('node:events');
const { test } = require('node:test');
const app = require('./index');

test('serves API health, keeps unknown endpoints in the API, and requires authentication', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  t.after(() => new Promise(resolve => server.close(resolve)));
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;

  const health = await fetch(`${base}/api/health`);
  assert.equal(health.status, 503);
  assert.deepEqual(await health.json(), { status: 'degraded', db: 'disconnected' });

  const missing = await fetch(`${base}/api/unknown`);
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { message: 'API endpoint not found' });

  const orders = await fetch(`${base}/api/orders`);
  assert.equal(orders.status, 401);
  await orders.json();
});
