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

  it('serves runtime config without loading the SSR bundle', async () => {
    const previous = process.env['ENABLE_DEV_QUICK_ACCESS'];
    process.env['ENABLE_DEV_QUICK_ACCESS'] = 'true';
    const loadHandler: SsrHandlerLoader = vi.fn();
    const response = {
      statusCode: 0,
      setHeader: vi.fn(),
      end: vi.fn(),
    } as unknown as Parameters<typeof handleVercelRequest>[1];

    await handleVercelRequest(
      { url: '/api/runtime-config' } as Parameters<typeof handleVercelRequest>[0],
      response,
      loadHandler,
    );

    expect(loadHandler).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(response.end).toHaveBeenCalledWith(
      JSON.stringify({ features: { devQuickAccess: true } }),
    );

    if (previous === undefined) delete process.env['ENABLE_DEV_QUICK_ACCESS'];
    else process.env['ENABLE_DEV_QUICK_ACCESS'] = previous;
  });
});
