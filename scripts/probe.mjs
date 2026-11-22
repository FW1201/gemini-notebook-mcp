import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const mcpEndpoint = 'https://notebook.googleapis.com/mcp';
const restEndpoint = 'https://notebook.googleapis.com/v1/notebooks?pageSize=1';

export async function probe({ mode, project, token, request = fetch }) {
  if (!['rest', 'mcp'].includes(mode)) throw new Error('Choose rest or mcp.');
  if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(project ?? '')) {
    throw new Error('Provide a valid Google Cloud project ID.');
  }
  if (!token || /\s/.test(token)) throw new Error('No valid Google access token was returned.');

  const headers = {
    Authorization: 'Bearer ' + token,
    'x-goog-user-project': project
  };
  const options = { headers, redirect: 'error', signal: AbortSignal.timeout(15000) };
  if (mode === 'mcp') {
    const version = '2026-07-28';
    Object.assign(headers, {
      Accept: 'application/json, text/event-stream',
      'Content-Type': 'application/json',
      'MCP-Protocol-Version': version,
      'Mcp-Method': 'tools/list'
    });
    options.method = 'POST';
    options.body = JSON.stringify({
      jsonrpc: '2.0', id: 1, method: 'tools/list',
      params: { _meta: { 'io.modelcontextprotocol/protocolVersion': version } }
    });
  }

  const response = await request(mode === 'mcp' ? mcpEndpoint : restEndpoint, options);
  if (!response.ok) {
    throw new Error('Google returned HTTP ' + response.status +
      '. Check OAuth scope, account eligibility, API enablement and project quota.');
  }
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error('Google returned a response other than the documented JSON format.');
  }
  const result = await response.json();
  if (mode === 'rest') {
    if (!result || typeof result !== 'object' || Array.isArray(result) ||
        (result.notebooks !== undefined && !Array.isArray(result.notebooks))) {
      throw new Error('Google returned an unexpected notebook list.');
    }
    return { ok: true, mode, returnedCount: result.notebooks?.length ?? 0 };
  }

  if (result.id !== 1 || result.error || !Array.isArray(result.result?.tools)) {
    throw new Error('Google did not return an MCP tool list.');
  }
  const tools = result.result.tools.map(({name}) => name);
  if (!['list_notebooks', 'create_notebook', 'create_source', 'get_source'].every(name => tools.includes(name))) {
    throw new Error('Google MCP did not advertise the required tools.');
  }
  return { ok: true, mode, tools };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [mode, project] = process.argv.slice(2);
    if (!['rest', 'mcp'].includes(mode) || !project) {
      throw new Error('Usage: node scripts/probe.mjs <rest|mcp> <google-cloud-project-id>');
    }
    let token;
    try {
      token = execFileSync('gcloud', ['auth', 'application-default', 'print-access-token'], {
        encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 20000
      }).trim();
    } catch {
      throw new Error('Could not obtain Google ADC. Sign in using the documented scope and retry.');
    }
    console.log(JSON.stringify(await probe({ mode, project, token }), null, 2));
  } catch (error) {
    console.error('Probe failed: ' + error.message);
    process.exitCode = 1;
  }
}
