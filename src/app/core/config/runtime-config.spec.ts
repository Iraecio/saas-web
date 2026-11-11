import { describe, expect, it } from 'vitest';
import { isEnabled } from './runtime-config';

describe('isEnabled', () => {
  it.each(['1', 'true', 'TRUE', ' yes ', 'on'])('enables explicit truthy value %s', (value) => {
    expect(isEnabled(value)).toBe(true);
  });

  it.each([undefined, '', '0', 'false', 'no', 'disabled'])('defaults %s to disabled', (value) => {
    expect(isEnabled(value)).toBe(false);
  });
});
