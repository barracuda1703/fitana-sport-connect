/**
 * Feature flags for Supabase Realtime chat
 */
export const FEATURE_FLAGS = {
  // Supabase Realtime (enabled by default)
  USE_SUPABASE_REALTIME: true,
  
  // Supabase channel subscribe timeout (ms)
  SUPABASE_CHANNEL_TIMEOUT: 10000, // 10 seconds timeout for channel subscribe
  
  // Presence heartbeat interval (ms)
  SUPABASE_PRESENCE_HEARTBEAT: 30000, // 30 seconds heartbeat
} as const;

export type FeatureFlags = typeof FEATURE_FLAGS;
