/**
 * Feature flags for gradual rollout and kill-switches
 */
export const FEATURE_FLAGS = {
  // Chat realtime - use Supabase Realtime instead of Ably
  CHAT_SUPABASE_REALTIME: true,
  
  // Polling interval when realtime is disabled (ms)
  POLLING_INTERVAL: 0,
} as const;

export type FeatureFlags = typeof FEATURE_FLAGS;
