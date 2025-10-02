/**
 * Feature flags for realtime chat
 */
export const FEATURE_FLAGS = {
  // Ably realtime chat - always enabled
  ABLY_ENABLED: true,
  
  // Require realtime (no polling fallback)
  ABLY_REQUIRE_REALTIME: true,
  
  // Ably channel attach timeout (ms)
  ABLY_ATTACH_TIMEOUT: 3000,
} as const;

export type FeatureFlags = typeof FEATURE_FLAGS;
