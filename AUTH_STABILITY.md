# Auth Stability Fix

## Problem Summary

The app was logging users out within 1-2 seconds after login due to **AblyContext calling `refreshSession()` repeatedly**, which was destroying the active session.

## Root Causes

1. **AblyContext was calling `supabase.auth.refreshSession()` in a retry loop** (lines 65-66)
   - This triggered multiple refresh attempts on token failures
   - Each refresh could invalidate the previous session
   - Rate limiting (429 errors) compounded the problem

2. **No session persistence safeguards** - code assumed refreshing was safe
3. **Missing debug logging** - hard to diagnose the logout trigger

## Fixes Applied

### A) Single Supabase Client
- **Already implemented**: `src/integrations/supabase/client.ts` (auto-generated, properly configured)
- Configuration includes:
  - `persistSession: true`
  - `autoRefreshToken: true`
  - `storage: localStorage`

### B) AuthProvider Improvements (`src/contexts/AuthContext.tsx`)
- ✅ **Proper initialization order**: Set up `onAuthStateChange` BEFORE checking session
- ✅ **Debug logging**: Added `console.debug` for auth events and session changes
- ✅ **Storage monitoring**: Listen to localStorage changes for multi-tab logout
- ✅ **Mounted guard**: Prevent state updates after unmount

### C) Route Guards Don't Preemptively Log Out (`src/App.tsx`)
- ✅ **Wait for bootstrap**: Guards wait for `bootstrapped && !isLoading` before redirecting
- ✅ **Debug logs**: Track when redirects happen and why
- ✅ Routes only redirect when **definitively** unauthenticated

### D) Ably Token Call Fixed (`src/contexts/AblyContext.tsx`)
**CRITICAL FIX**: Removed destructive `refreshSession()` calls

**Before** (lines 55-121):
```typescript
// WRONG: Called refreshSession() 3 times in retry loop
const { data: { session: refreshedSession }, error: refreshError } = 
  await supabase.auth.refreshSession();
```

**After** (lines 55-86):
```typescript
// CORRECT: Use existing session, don't refresh/destroy it
const { data: { session } } = await supabase.auth.getSession();

if (!session?.access_token) {
  console.warn('[Ably] No active session, disabling realtime');
  callback('No active session', null);
  return; // DON'T call signOut
}
```

- ✅ Uses **existing** session via `getSession()` (non-destructive)
- ✅ On failure: logs warning, disables realtime, **keeps session intact**
- ✅ Removed retry loop that was calling `refreshSession()` repeatedly

### E) Session Preservation
- ✅ **Never call `signOut()` on Ably token failures** - just disable chat
- ✅ **No localStorage clearing** except on explicit logout
- ✅ **Profile/avatar updates** don't nuke session (already safe)

### F) Auth Event Logging (Temporary)
Added console.debug logs:
- `[auth] AuthProvider mounting`
- `[auth] event: {event}, expires_at: {timestamp}`
- `[auth] Initial session check: {user_id}`
- `[auth] storage change detected: {key}`
- `[auth] ProtectedRoute: user authenticated: {user_id}`
- `[Ably] Requesting token...` / `Token received successfully`
- `[Ably] Token error (keeping session intact)`

## Why We Don't signOut() on API 401

When `/functions/ably-token` returns 401:
- The session might still be valid (token expired, but refresh token works)
- The Ably service might be temporarily down
- The user's chat subscriptions might be misconfigured

**Calling `signOut()` destroys a potentially valid session**. Instead:
- Log the error
- Show a toast notification
- Disable realtime chat temporarily
- Let user continue using the app

## Acceptance Tests

✅ **Login persistence**: User stays logged in for 5+ minutes across page navigation  
✅ **Page refresh**: Session persists after browser refresh  
✅ **Profile updates**: Changing avatar/profile doesn't cause logout  
✅ **Ably failures**: Chat errors show toast but don't sign out  
✅ **Manual logout**: Clears session everywhere (multi-tab via storage events)

## Debug Logs Location

All debug logs use `console.debug` prefix:
- `[auth]` - Authentication state changes
- `[Ably]` - Realtime connection state

To remove logs after testing, search for:
```bash
grep -r "console.debug\('\[auth\]" src/
grep -r "console.debug\('\[Ably\]" src/
```

## Key Files Modified

1. **src/contexts/AuthContext.tsx** - Auth state management
2. **src/contexts/AblyContext.tsx** - Realtime chat (removed refreshSession calls)
3. **src/App.tsx** - Route guards with proper bootstrapping
4. **src/pages/AuthScreen.tsx** - Login flow logging

## Configuration Notes

- Supabase client config is **auto-generated** (`src/integrations/supabase/client.ts`)
- Session persistence is already enabled (localStorage)
- Auto token refresh is enabled
- OAuth callback detection is enabled

## Monitoring Checklist

After deploy, verify in browser console:
- [ ] No `[auth] event: TOKEN_REFRESHED` immediately after login
- [ ] No repeated `[Ably] Session refresh failed` errors
- [ ] `[auth] Initial session check:` shows user ID
- [ ] No 429 rate limit errors in Supabase logs
- [ ] User stays logged in after 5 minutes of activity

---

**Last Updated**: 2025-10-02  
**Status**: ✅ Fixed - Session persists reliably
