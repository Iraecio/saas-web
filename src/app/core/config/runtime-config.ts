export interface RuntimeConfig {
  features: {
    devQuickAccess: boolean;
  };
}

const ENABLED_VALUES = new Set(['1', 'true', 'yes', 'on']);

export function isEnabled(value: string | undefined): boolean {
  return value !== undefined && ENABLED_VALUES.has(value.trim().toLowerCase());
}
