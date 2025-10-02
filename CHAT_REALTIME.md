# Fitana Chat - Hard Realtime via Ably

## Overview
Chat uses **Ably Realtime channels only** for instant messaging. No polling fallback. Messages persist in Supabase; Ably handles real-time transport and presence.

## Architecture

### Token-Based Auth
- Browser calls `POST /functions/v1/ably-token` with Supabase JWT
- Server generates Ably `TokenRequest` with capabilities for user's chats only
- Channel pattern: `chat:<chatId>` (e.g., `chat:10d31a4a-36aa-45ad-b248-8ab4a0641115`)
- Token TTL: 1 hour, auto-refreshed by Ably SDK

### Message Flow
1. User types message in UI
2. Client sends to `POST /functions/v1/chat-send` (Supabase Edge Function)
3. Server persists to `messages` table
4. Server publishes to Ably channel `chat:<chatId>` event `message`
5. All connected clients receive message instantly via WebSocket

### Presence "Online" Indicator
- Each client joins Ably presence when entering chat
- Green dot shows only when other participant is actually present in the channel
- Gray dot when offline
- Uses `presence.enter()` / `presence.leave()` + `presence.get()` to track all members

## Configuration

### Feature Flags (`src/lib/featureFlags.ts`)
```typescript
ABLY_ENABLED: true                // Always enabled
ABLY_REQUIRE_REALTIME: true       // No polling fallback
ABLY_ATTACH_TIMEOUT: 3000         // 3s before showing error
```

### Environment Variables
Server-side only (Edge Functions):
- `ABLY_API_KEY` - Full API key (format: `appId.keyId:keySecret`)
- Never exposed in browser bundle

## Error Handling

### Attach Failures
If channel doesn't attach within 3s:
- Show inline error card with "Połącz ponownie" button
- Rest of app continues to work
- Reconnect button calls:
  ```typescript
  ably.connection.connect();
  ably.auth.authorize();
  channel.attach();
  ```

### Common Error Codes
- **401** - Token expired or invalid → reconnect to get new token
- **403** - User not participant of this chat → verify RLS policies
- **400** - Malformed capability → check token endpoint
- **Timeout** - Network issue or Ably unavailable → show reconnect UI

### Diagnostic Steps
1. **Check Ably Dashboard**: Go to https://ably.com/dashboard → Messages stats
2. **Browser DevTools**:
   - Console: Look for `[useAblyChat]` and `[Ably]` logs
   - Network: Verify `/functions/v1/ably-token` returns 200 + valid TokenRequest
   - Network: Check WebSocket connection to `realtime.ably.io`
3. **Edge Function Logs**: Check Supabase logs for `[ably-token]` and `[chat-send]` entries

## No Polling
- Removed all `setInterval()` polling logic
- Removed "Tryb offline" / "odświeżane co 10s" banners
- Messages appear only via Ably realtime or manual refresh (load from DB on mount)

## API Endpoints

### `POST /functions/v1/ably-token`
**Auth**: Supabase JWT (Authorization: Bearer)
**Returns**: Ably TokenRequest
```json
{
  "keyName": "appId.keyId",
  "clientId": "user-uuid",
  "capability": "{\"chat:xxx\":[\"publish\",\"subscribe\",\"presence\"]}",
  "timestamp": 1234567890,
  "ttl": 3600000,
  "mac": "signature"
}
```

### `POST /functions/v1/chat-send`
**Auth**: Supabase JWT
**Body**:
```json
{
  "chatId": "uuid",
  "content": "Hello",
  "imageUrl": "https://..." // optional
}
```
**Returns**:
```json
{
  "message": {
    "id": "uuid",
    "chat_id": "uuid",
    "sender_id": "uuid",
    "content": "Hello",
    "created_at": "2025-10-02T21:00:00.000Z"
  }
}
```

## Testing Checklist
- [ ] No polling requests in DevTools during chat
- [ ] WebSocket to `realtime.ably.io` active
- [ ] Send/receive messages instantly between two clients
- [ ] Ably Dashboard shows increased message count
- [ ] Green dot only when other user present, gray when offline
- [ ] Attach failure → inline error with reconnect button
- [ ] Rest of app (nav, map, calendar) unaffected by chat errors

## UI Unchanged
- All existing styles, layouts, components kept as-is
- Only internal transport changed from polling/Supabase realtime to Ably channels
- Avatar, message bubbles, fonts, colors remain unchanged
