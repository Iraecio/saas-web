import { describe, expect, it, vi } from 'vitest';

import { handleVercelRequest, type SsrHandlerLoader } from '../../../../api/handler';

describe('Vercel SSR handler', () => {
  const request = {} as Parameters<typeof handleVercelRequest>[0];
  const response = {} as Parameters<typeof handleVercelRequest>[1];

  it('loads the SSR bundle and delegates the original request and response', async () => {
    const handlerResult = { status: 200 };
    const reqHandler = vi.fn().mockResolvedValue(handlerResult);
    const loadHandler: SsrHandlerLoader = vi.fn().mockResolvedValue({ reqHandler });

    await expect(handleVercelRequest(request, response, loadHandler)).resolves.toBe(handlerResult);
    expect(loadHandler).toHaveBeenCalledOnce();
    expect(reqHandler).toHaveBeenCalledOnce();
    expect(reqHandler).toHaveBeenCalledWith(request, response);
  });

  it('propagates SSR handler failures to the platform runtime', async () => {
    const handlerError = new Error('SSR request failed');
    const loadHandler: SsrHandlerLoader = vi.fn().mockResolvedValue({
      reqHandler: vi.fn().mockRejectedValue(handlerError),
    });

    await expect(handleVercelRequest(request, response, loadHandler)).rejects.toBe(handlerError);
  });
});
