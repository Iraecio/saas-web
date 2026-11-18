/// <reference types="node" />

import type { IncomingMessage, ServerResponse } from 'node:http';
import { isEnabled, type RuntimeConfig } from '../src/app/core/config/runtime-config';

export default function runtimeConfigHandler(_req: IncomingMessage, res: ServerResponse): void {
  const config: RuntimeConfig = {
    features: {
      devQuickAccess: isEnabled(process.env['ENABLE_DEV_QUICK_ACCESS']),
    },
  };

  res.statusCode = 200;
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(config));
}
