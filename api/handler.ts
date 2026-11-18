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

const loadSsrHandler: SsrHandlerLoader = () => import(serverBundlePath);

export async function handleVercelRequest(
  req: IncomingMessage,
  res: ServerResponse,
  loadHandler: SsrHandlerLoader = loadSsrHandler,
) {
  const { reqHandler } = await loadHandler();
  return reqHandler(req, res);
}

export default handleVercelRequest;
