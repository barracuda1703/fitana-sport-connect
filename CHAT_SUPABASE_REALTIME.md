# Fitana Chat - Supabase Realtime Implementation

## Architecture

### Channel Naming
- Pattern: `chat:{chatId}`
- Example: `chat:10d31a4a-36aa-45ad-b248-8ab4a0641115`

### Message Flow
1. User types message → optimistic UI update
2. Direct insert to `public.messages` table via Supabase client
3. Supabase Realtime `postgres_changes` delivers INSERT event to all subscribers
4. Other clients receive message instantly via WebSocket
5. Replace optimistic message with DB row (contains real ID and timestamp)

### Presence Tracking
- Tracks online status per chat conversation (not global)
- Green dot = other user has THIS specific chat open
- Gray dot = other user offline or viewing different chat
- Uses Supabase Realtime presence on channel `chat:{chatId}`
- Auto-cleanup when user closes tab or navigates away

### Typing Indicators
- Broadcast event `typing` with `{ userId, typing: true/false }`
- Auto-clear after 3s of no typing activity
- Not echoed to sender (self: false in channel config)
- Uses Supabase Realtime broadcast feature

## Security (RLS)

### Messages Table
- **SELECT**: Only if user is participant (`chat.client_id` or `chat.trainer_id`)
- **INSERT**: Only if user is participant AND `sender_id = auth.uid()`

### Chats Table
- **SELECT**: Only if user is `client_id` or `trainer_id`

### Realtime Subscription
- `postgres_changes` filter: `chat_id=eq.{chatId}`
- RLS automatically enforces access control on realtime events
- No manual capability/token management needed
- Authenticated via Supabase session token

## Local Testing

### Two Browsers Test
1. Open chat in Chrome (User A logged in)
2. Open same chat in Firefox Private (User B logged in)
3. Send message from A → appears in B instantly (< 1s)
4. Type in B → "Pisze..." indicator shows in A
5. Close B tab → green dot in A turns gray

### Network Inspection
Open DevTools → Network tab:
- **WebSocket**: `wss://leppkgscskqlukxxulpa.supabase.co/realtime/v1/websocket`
- **No polling**: No repeated GET requests to `/messages`
- **Events**: 
  - `postgres_changes:INSERT` - new messages
  - `presence:sync` - online status updates
  - `broadcast:typing` - typing indicators

### Expected Latency
- Local users: < 500ms message delivery
- International: < 2s message delivery
- Presence updates: instant (< 100ms)

## Troubleshooting

### "Timeout podczas łączenia z czatem"
**Causes:**
- User not authenticated (no session)
- User not participant in this chat (RLS blocks access)
- `messages` table not in `supabase_realtime` publication

**Debug steps:**
```javascript
// Check auth
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session?.user?.id);

// Check RLS
const { data, error } = await supabase
  .from('messages')
  .select('*')
  .eq('chat_id', chatId)
  .limit(1);
console.log('RLS access:', data, error);
```

### Messages not appearing in realtime
**Causes:**
- Realtime not enabled on `messages` table
- RLS policies blocking INSERT events
- Browser console showing Realtime errors

**Debug steps:**
```sql
-- Check realtime publication
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'messages';

-- Should return 1 row. If empty, run:
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
```

### "Offline" even though other user is online
**Remember:** Presence is per-chat, not global.
- Other user must have THIS CHAT open (not just logged in)
- Other user must be on `/chat/{chatId}` route
- Check: Does other user's channel have same `chatId`?

**Debug presence:**
```javascript
// In browser console
const channel = supabase.channel('chat:YOUR_CHAT_ID');
channel.subscribe();
channel.on('presence', { event: 'sync' }, () => {
  console.log('Presence state:', channel.presenceState());
});
```

### Duplicate messages appearing
**Cause:** Both optimistic UI and realtime event showing same message

**Fix:** Already handled in code - `onNewMessage` checks `sender_id`:
```typescript
if (newMessage.sender_id !== userId) {
  onNewMessage(newMessage); // Only show messages from OTHER users
}
```

## Configuration

### Feature Flags (`src/lib/featureFlags.ts`)
```typescript
USE_SUPABASE_REALTIME: true          // Enable Supabase Realtime (default)
SUPABASE_CHANNEL_TIMEOUT: 10000      // 10s timeout for channel subscribe
SUPABASE_PRESENCE_HEARTBEAT: 30000   // 30s presence heartbeat interval
```

### Environment Variables
Uses standard Lovable Cloud Supabase env vars:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Anon/public key

No additional API keys needed. No secrets in browser bundle.

## Implementation Details

### Hook: `useSupabaseChat`
Location: `src/hooks/useSupabaseChat.ts`

**Responsibilities:**
- Create Realtime channel with presence enabled
- Subscribe to `postgres_changes` for message INSERTs
- Track presence (online/offline status)
- Handle broadcast events for typing indicators
- Auto-reconnect on connection loss
- 10s timeout for subscribe operation

**Usage:**
```typescript
const {
  channelStatus,      // 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'
  error,              // Error object if status is 'error'
  isOtherUserOnline,  // boolean - true if other user has chat open
  publishTyping,      // (isTyping: boolean) => Promise<void>
  reconnect,          // () => Promise<void> - manual reconnect
  isConnected,        // boolean - true if status is 'connected'
} = useSupabaseChat({
  chatId: '10d31a4a-...',
  userId: 'user-id-here',
  onNewMessage: (msg) => setMessages(prev => [...prev, msg]),
  onTyping: (isTyping) => setIsTyping(isTyping),
  onPresence: (isOnline) => console.log('Other user online:', isOnline),
});
```

### Message Sending Flow
1. User clicks send button
2. Add optimistic message to UI (temp ID: `temp-{timestamp}`)
3. Upload image to Supabase Storage (if image attached)
4. **Direct insert** to `messages` table:
   ```typescript
   const { data: dbMessage } = await supabase
     .from('messages')
     .insert({
       chat_id: chatId,
       sender_id: user.id,
       content: text,
       image_url: imageUrl || null,
     })
     .select()
     .single();
   ```
5. Replace temp message with DB message in UI
6. `postgres_changes` event automatically delivered to other subscribers
7. Update `chats.updated_at` timestamp

**No Edge Function needed!** Direct client → DB → Realtime.

## Migration from Ably

### What Changed
**Removed:**
- ❌ `src/hooks/useAblyChat.ts` (replaced with `useSupabaseChat`)
- ❌ `src/lib/ablyClient.ts` (no Ably client needed)
- ❌ `supabase/functions/ably-token/index.ts` (no token endpoint)
- ❌ `supabase/functions/chat-send/index.ts` (direct DB insert instead)
- ❌ `ABLY_API_KEY` secret from Supabase
- ❌ `ably` npm package

**Added:**
- ✅ `src/hooks/useSupabaseChat.ts` (Supabase Realtime hook)
- ✅ SQL migration to enable realtime on `messages` table
- ✅ Updated feature flags for Supabase config

**Changed:**
- 🔄 `src/pages/ChatSafe.tsx` - uses `useSupabaseChat` instead of `useAblyChat`
- 🔄 Message sending - direct DB insert instead of Edge Function

### Benefits
1. **Simplicity**: No separate token endpoint, no Edge Function for sending messages
2. **Security**: RLS policies protect all access, no API keys in browser
3. **Cost**: One less external service (Ably subscription)
4. **Consistency**: Same transport for all data (messages, bookings, presence)
5. **Performance**: Direct DB insert → realtime event (one less hop)

### Rollout
**Zero downtime migration:**
1. ✅ Enable realtime on `messages` table (SQL migration)
2. ✅ Deploy new code with `USE_SUPABASE_REALTIME: true`
3. ✅ Test with 2 browsers - verify instant message delivery
4. ✅ Remove Ably code/keys after confirming stability

## Performance Metrics

### Expected Metrics
- **Message latency**: < 1s (local), < 2s (international)
- **Presence sync**: < 100ms
- **Memory usage**: ~5MB per chat (stable, no leaks)
- **WebSocket**: Single connection per user (all chats multiplexed)

### Monitoring
Check Supabase Dashboard → Realtime:
- Active connections count
- Message throughput
- Error rate

## FAQ

**Q: Does this work offline?**
A: No. Realtime requires active WebSocket connection. Offline support would need service workers and sync queues.

**Q: What's the max message size?**
A: ~1MB for text. Images stored separately in Storage (max 5MB).

**Q: Can users edit/delete messages?**
A: Not implemented yet, but possible via:
- UPDATE trigger → realtime event
- UI to render edited/deleted states

**Q: Does this scale to group chats?**
A: Yes. Channel supports unlimited subscribers. Each user gets own presence entry.

**Q: What about message reactions?**
A: Not implemented, but straightforward:
- Store reactions in `message_reactions` table
- Subscribe to `postgres_changes` on that table
- Render reactions in message bubble

---

**Last updated:** 2025-10-02  
**Ably → Supabase Realtime migration complete ✅**
