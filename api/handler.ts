/// <reference types="node" />

import type { IncomingMessage, ServerResponse } from 'node:http';

export type SsrRequestHandler = (
  req: IncomingMessage,
  res: ServerResponse,
) => unknown | Promise<unknown>;

export type SsrHandlerLoader = () => Promise<{
  reqHandler: SsrRequestHandler;
}>;

const serverBundlePath = '../dist/saas-web/server/server.mjs';
const ENABLED_VALUES = new Set(['1', 'true', 'yes', 'on']);

const loadSsrHandler: SsrHandlerLoader = () => import(serverBundlePath);

export async function handleVercelRequest(
  req: IncomingMessage,
  res: ServerResponse,
  loadHandler: SsrHandlerLoader = loadSsrHandler,
) {
  if (req.url?.split('?', 1)[0] === '/api/runtime-config') {
    const enabled = ENABLED_VALUES.has(
      (process.env['ENABLE_DEV_QUICK_ACCESS'] ?? '').trim().toLowerCase(),
    );

    res.statusCode = 200;
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ features: { devQuickAccess: enabled } }));
    return;
  }

  const { reqHandler } = await loadHandler();
  return reqHandler(req, res);
}

export default handleVercelRequest;
