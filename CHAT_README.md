# Fitana Chat System - Safe Ably Implementation

## Overview

Safe chat implementation with Ably Realtime, token-based auth, feature flags, error boundaries, and polling fallback to prevent white screens.

## Architecture

### 1. Feature Flag (`src/lib/featureFlags.ts`)
- `ABLY_ENABLED`: Default `false` - uses polling fallback
- `POLLING_INTERVAL`: 10 seconds for DB message polling
- `ABLY_ATTACH_TIMEOUT`: 5 seconds before falling back

### 2. Token-Based Auth (`supabase/functions/ably-token/index.ts`)
- Endpoint: `POST /functions/v1/ably-token`
- Requires: `Authorization: Bearer <supabase_access_token>`
- Returns: Ably TokenRequest with capabilities
- Capabilities: Only `chat:<chat_id>` channels for user's chats
- Security: clientId = user.id, capability restricted per user

### 3. Ably Client Singleton (`src/lib/ablyClient.ts`)
- `getAblyClient()`: Returns null if feature flag disabled
- `authCallback`: Fetches token from edge function
- `reconnectAbly()`: Force reconnect + reauth
- Connection state events dispatched to window

### 4. Chat Hook (`src/hooks/useAblyChat.ts`)
- Returns: `{ channelState, error, publishMessage, publishTyping, reconnect, isConnected, isPollingMode }`
- States: `idle | connecting | attaching | attached | disconnected | suspended | failed`
- Polling mode: Loads messages every 10s when Ably disabled
- Attach timeout: Falls back to suspended after 5s
- Offline queue: Messages queued when not connected

### 5. Safe Chat Page (`src/pages/ChatSafe.tsx`)
- Loads messages from DB first (always works)
- Uses `useAblyChat` hook for realtime
- Persists all messages to DB via `chatsService.sendMessage()`
- Publishes to Ably only if connected
- Queues messages when offline (sent when reconnected)
- Shows actionable error states with reconnect button
- No infinite spinners - deterministic states only

### 6. Error Boundary (`src/components/ErrorBoundary.tsx`)
- Catches React errors anywhere in chat
- Shows readable error card instead of blank screen
- Provides "Refresh" and "Try Again" buttons

## Message Flow

### Send Message (Persist + Publish)
1. Persist to Supabase DB first (via `chatsService.sendMessage()`)
2. Add to local state (optimistic)
3. If connected: Publish to Ably channel
4. If disconnected: Queue message, send when connected
5. Other user receives via Ably realtime OR next poll

### Receive Message
1. If Ably enabled + connected: Receive via Ably channel subscription
2. If polling mode: Receive via 10s DB poll
3. Deduplicate by message ID

## States & UI

### Connection States
- **idle**: Initial state, not connected yet
- **connecting/attaching**: Shows "Łączenie..." with yellow pulsing dot
- **attached**: Shows "Online" with green dot (if other user online)
- **disconnected/suspended**: Shows "Offline – próbuję połączyć..." with yellow dot + reconnect button
- **failed**: Shows error alert with reason + reconnect button

### Polling Mode (ABLY_ENABLED=false)
- Shows yellow dot + "Tryb offline"
- Info banner: "Wiadomości odświeżane co 10s"
- Input always enabled, messages saved to DB
- Other user sees message on next poll

## Enabling/Disabling Ably

### To Enable Ably Realtime:
1. Set `ABLY_ENABLED: true` in `src/lib/featureFlags.ts`
2. Ensure `ABLY_API_KEY` secret is configured in Supabase
3. Deploy (automatic via Lovable Cloud)

### To Disable (Kill-Switch):
1. Set `ABLY_ENABLED: false` in `src/lib/featureFlags.ts`
2. App immediately uses polling fallback
3. All features work, just slower refresh (10s)

## Debugging

### Client Logs
- `[Ably]`: Connection state changes
- `[useAblyChat]`: Channel attach/detach, messages
- `[Chat]`: Message send/receive

### Server Logs (Edge Function)
- `[ably-token]`: Token generation, user ID, chat count

### Common Issues

**Attach timeout → suspended**
- Means channel didn't attach in 5s
- App falls back to polling automatically
- Check `ABLY_API_KEY` secret is set
- Check token endpoint returns 200

**Token 401/403**
- User not logged in (check Supabase auth)
- User not member of chat (check RLS policies)
- Shows actionable error with reconnect button

**Messages not appearing**
- Check DB: `SELECT * FROM messages WHERE chat_id = '...'`
- Messages always saved to DB first
- If Ably disconnected, they appear on next poll (10s)

## Database Schema

### Tables
- `chats`: (id, client_id, trainer_id, created_at, updated_at)
- `messages`: (id, chat_id, sender_id, content, image_url, created_at, read_at)

### RLS Policies
- Users can only see their own chats
- Users can only send messages in their chats
- See `chatsService` for secure queries

## Security

### Token Auth
- Never send ABLY_API_KEY to client
- Token generated server-side with user's chat capabilities only
- clientId = user.id (enforced by Ably)
- Capability: Only `chat:<chat_id>` for user's chats

### Why Not signOut() on 401?
- Ably token errors are transient (network, rate limits)
- Don't destroy user session for realtime errors
- Fall back to polling gracefully
- Show error + reconnect button

## QA Checklist

- [ ] Token endpoint returns 200 with valid TokenRequest
- [ ] Two users send/receive messages in realtime (< 1s latency)
- [ ] Offline mode: Messages queued and sent when reconnected
- [ ] User outside chat gets 401/403 with clear error message
- [ ] No infinite spinners - all states show text status
- [ ] Polling mode works (ABLY_ENABLED=false)
- [ ] No ABLY_API_KEY in client bundle (`grep ABLY_API_KEY dist/`)
- [ ] ErrorBoundary catches errors, no white screens

## Next Steps

1. Test with feature flag OFF (polling works)
2. Enable ABLY_ENABLED=true
3. Monitor logs for token/attach issues
4. If issues persist, keep flag OFF (app still works!)
