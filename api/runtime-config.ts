/// <reference types="node" />

import type { IncomingMessage, ServerResponse } from 'node:http';

const ENABLED_VALUES = new Set(['1', 'true', 'yes', 'on']);

function isEnabled(value: string | undefined): boolean {
  return value !== undefined && ENABLED_VALUES.has(value.trim().toLowerCase());
}

export default function runtimeConfigHandler(_req: IncomingMessage, res: ServerResponse): void {
  const config = {
    features: {
      devQuickAccess: isEnabled(process.env['ENABLE_DEV_QUICK_ACCESS']),
    },
  };

  res.statusCode = 200;
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(config));
}
