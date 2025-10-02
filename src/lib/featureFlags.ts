/**
 * Feature flags for realtime chat
 */
export const FEATURE_FLAGS = {
  // Ably realtime chat - always enabled
  ABLY_ENABLED: true,
  
  // Require realtime (no polling fallback)
  ABLY_REQUIRE_REALTIME: true,
  
  // Ably channel attach timeout (ms)
  ABLY_ATTACH_TIMEOUT: 10000, // 10 seconds timeout for channel attach
} as const;

export type FeatureFlags = typeof FEATURE_FLAGS;
