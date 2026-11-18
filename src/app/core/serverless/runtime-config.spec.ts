import { describe, expect, it, vi } from 'vitest';
import runtimeConfigHandler from '../../../../api/runtime-config';

describe('Vercel runtime config handler', () => {
  it('defaults dev quick access to disabled', () => {
    const previous = process.env['ENABLE_DEV_QUICK_ACCESS'];
    delete process.env['ENABLE_DEV_QUICK_ACCESS'];
    const response = createResponse();

    runtimeConfigHandler({} as never, response.value);

    expect(response.statusCode()).toBe(200);
    expect(response.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store');
    expect(response.end).toHaveBeenCalledWith(
      JSON.stringify({ features: { devQuickAccess: false } }),
    );
    restoreEnvironment(previous);
  });

  it('enables dev quick access from the Vercel environment', () => {
    const previous = process.env['ENABLE_DEV_QUICK_ACCESS'];
    process.env['ENABLE_DEV_QUICK_ACCESS'] = 'true';
    const response = createResponse();

    runtimeConfigHandler({} as never, response.value);

    expect(response.end).toHaveBeenCalledWith(
      JSON.stringify({ features: { devQuickAccess: true } }),
    );
    restoreEnvironment(previous);
  });
});

function createResponse() {
  let statusCode = 0;
  const setHeader = vi.fn();
  const end = vi.fn();
  const value = {
    get statusCode() {
      return statusCode;
    },
    set statusCode(value: number) {
      statusCode = value;
    },
    setHeader,
    end,
  } as never;

  return { value, statusCode: () => statusCode, setHeader, end };
}

function restoreEnvironment(value: string | undefined): void {
  if (value === undefined) delete process.env['ENABLE_DEV_QUICK_ACCESS'];
  else process.env['ENABLE_DEV_QUICK_ACCESS'] = value;
}
