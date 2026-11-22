import assert from 'node:assert/strict';
import test from 'node:test';
import { probe } from './probe.mjs';

const config = { project: 'sample-123', token: 'test-token' };

test('REST sends a bearer token and quota project without outputting notebook names', async () => {
  const result = await probe({ ...config, mode: 'rest', request: async (url, options) => {
    assert.equal(url, 'https://notebook.googleapis.com/v1/notebooks?pageSize=1');
    assert.equal(options.headers.Authorization, 'Bearer test-token');
    assert.equal(options.headers['x-goog-user-project'], 'sample-123');
    assert.equal(options.redirect, 'error');
    return Response.json({ notebooks: [{ displayName: 'Private notebook' }] });
  } });
  assert.deepEqual(result, { ok: true, mode: 'rest', returnedCount: 1 });
});

test('MCP tool discovery sends Google protocol metadata and reports available tools', async () => {
  const names = ['list_notebooks', 'create_notebook', 'create_source', 'get_source'];
  const result = await probe({ ...config, mode: 'mcp', request: async (url, options) => {
    assert.equal(url, 'https://notebook.googleapis.com/mcp');
    assert.equal(options.headers['Mcp-Method'], 'tools/list');
    assert.equal(JSON.parse(options.body).method, 'tools/list');
    return Response.json({ jsonrpc: '2.0', id: 1, result: { tools: names.map(name => ({ name })) } });
  } });
  assert.deepEqual(result.tools, names);
});

test('HTTP and MCP errors are reported without copying a sensitive upstream body', async () => {
  await assert.rejects(() => probe({ ...config, mode: 'rest',
    request: async () => new Response('private contents', { status: 403 }) }), /HTTP 403/);
  await assert.rejects(() => probe({ ...config, mode: 'mcp',
    request: async () => Response.json({ id: 1, error: { message: 'private contents' } }) }),
  /did not return an MCP tool list/);
});
