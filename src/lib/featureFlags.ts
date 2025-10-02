/**
 * Feature flags for gradual rollout and kill-switches
 */
export const FEATURE_FLAGS = {
  // Ably realtime chat - set to false to use polling fallback
  ABLY_ENABLED: false,
  
  // Polling interval when Ably is disabled (ms)
  POLLING_INTERVAL: 10000,
  
  // Ably channel attach timeout (ms)
  ABLY_ATTACH_TIMEOUT: 5000,
} as const;

export type FeatureFlags = typeof FEATURE_FLAGS;
