import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (req: VercelRequest, res: VercelResponse) => {
  const { reqHandler } = await import('../dist/saas-web/server/server.mjs');
  return reqHandler(req, res);
};
