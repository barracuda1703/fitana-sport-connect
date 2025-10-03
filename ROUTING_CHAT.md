# Chat Routing Fix - No More 404s

## Problem
- `/chat` was returning 404 because only `/chat/:chatId` route existed
- Navigation was pointing to old `/chat-list` path
- No redirects for legacy URLs

## Solution

### Routes Added (React Router v6)
1. **`/chat`** - Chat index showing conversation list (ChatListPage)
2. **`/chat/:chatId`** - Individual chat thread (ChatSafePage)

### Legacy Redirects
All old URLs now redirect to `/chat`:
- `/chat-list` → `/chat`
- `/messages` → `/chat`
- `/wiadomosci` → `/chat`
- `/client/messages` → `/chat`
- `/trainer/messages` → `/chat`

### Navigation Wiring
**BottomNavigation** already points to `/chat`:
- Client: Home, Calendar, **Chat**, Profile
- Trainer: Dashboard, Calendar, **Chat**, Profile

Both roles use `/chat` route (lines 24, 31 in `src/components/BottomNavigation.tsx`)

### Participant Verification
**ChatSafePage** (`/chat/:chatId`) now verifies user is a participant:
1. Loads all user's chats via `chatsService.getByUserId(user.id)`
2. Checks if `chatId` exists in user's chats
3. If not found → toast error + redirect to `/chat`
4. If found → load messages and display chat

### History Fallback
Vite dev server already configured with `historyApiFallback: true` in `vite.config.ts` (line 14), so deep links work in preview.

## File Changes
- `src/App.tsx`: Added `/chat` index route, `/chat/:chatId` thread route, and 5 legacy redirects
- `src/pages/ChatSafe.tsx`: Added participant verification guard
- `ROUTING_CHAT.md`: This documentation

## Testing Checklist
- [x] `/chat` shows conversation list (or empty state)
- [x] Clicking a conversation navigates to `/chat/:chatId`
- [x] Bottom nav "Wiadomości" goes to `/chat`
- [x] Old URLs (`/chat-list`, `/messages`, etc.) redirect to `/chat`
- [x] Non-participant trying to access `/chat/:id` → friendly error + redirect
- [x] Page refresh on `/chat` and `/chat/:id` works (no 404)

## How to Change Nav Target
If you need to change where "Wiadomości" button goes:
1. Open `src/components/BottomNavigation.tsx`
2. Find `clientTabs` (line 21) and `trainerTabs` (line 28)
3. Change `route: '/chat'` to desired path
4. Make sure the route exists in `src/App.tsx`
