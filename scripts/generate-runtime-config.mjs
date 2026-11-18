import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const enabledValues = new Set(['1', 'true', 'yes', 'on']);
const devQuickAccess = enabledValues.has(
  (process.env.ENABLE_DEV_QUICK_ACCESS ?? '').trim().toLowerCase(),
);
const outputPath = join('dist', 'saas-web', 'browser', 'runtime-config.json');

await writeFile(
  outputPath,
  `${JSON.stringify({ features: { devQuickAccess } })}\n`,
  'utf8',
);
