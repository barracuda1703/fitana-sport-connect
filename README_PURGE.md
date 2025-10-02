# User Purge Script

## ⚠️ WARNING: DESTRUCTIVE OPERATION

This script **permanently deletes all user accounts and user-generated data** from the Fitana application database. Use with extreme caution!

## Purpose

The purge script is designed for:
- **Testing environments**: Clean slate for fresh testing
- **Staging resets**: Remove test data before production deployment
- **Development**: Reset database to initial state

## Safety Features

The script includes multiple safety measures:

1. **Environment Check**: Only runs when `APP_ENV=staging`
2. **Full Backups**: Creates JSON backups of all data before deletion
3. **Explicit Confirmation**: Requires typing "YES, PURGE USERS" to proceed
4. **Detailed Logging**: Shows every operation for transparency

## What Gets Deleted

### Database Tables (in order):
1. `messages` - All chat messages
2. `chats` - All chat conversations
3. `reviews` - All trainer reviews
4. `bookings` - All booking records
5. `invitations` - All trainer invitations
6. `favorites` - All favorited trainers
7. `manual_blocks` - All manual calendar blocks
8. `time_off` - All time-off periods
9. `trainers` - All trainer profiles
10. `profiles` - All user profiles

### Storage Buckets:
- `avatars/*` - All profile avatars
- `chat-attachments/*` - All chat attachments
- `trainer-videos/*` - All trainer videos
- `certificates/*` - All trainer certificates

### Auth:
- All users from `auth.users`

## What's Preserved

The following reference/lookup tables remain intact:
- Sports categories
- Cities
- Languages
- System configuration

## Prerequisites

1. **Environment Variables** must be set:
   ```bash
   export APP_ENV=staging
   export VITE_SUPABASE_URL=your_supabase_url
   export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **Dependencies**: Install required packages
   ```bash
   npm install
   ```

3. **TypeScript Runtime**: The script requires `tsx` to run TypeScript directly
   ```bash
   npm install -D tsx
   ```

## How to Run

### Step 1: Set Environment to Staging

```bash
export APP_ENV=staging
```

**CRITICAL**: The script will **refuse to run** unless `APP_ENV=staging` is set.

### Step 2: Run the Purge Script

```bash
npm run purge:users
```

Or directly:

```bash
tsx scripts/purgeUsers.ts
```

### Step 3: Confirm the Operation

When prompted, type exactly:

```
YES, PURGE USERS
```

Any other input will cancel the operation.

## Backup Location

All backups are saved to:

```
./backups/<timestamp>/
```

Where `<timestamp>` is the current date/time in ISO format.

### Backup Files:

- `auth_users.json` - Auth user accounts
- `profiles.json` - User profiles
- `trainers.json` - Trainer profiles
- `bookings.json` - Booking records
- `reviews.json` - Review records
- `messages.json` - Chat messages
- `chats.json` - Chat conversations
- `invitations.json` - Trainer invitations
- `favorites.json` - Favorited trainers
- `manual_blocks.json` - Calendar blocks
- `time_off.json` - Time-off periods

## Example Output

```
🚨 FITANA USER PURGE SCRIPT 🚨

This will:
  1. Backup all user data to JSON files
  2. Delete all user-generated data from tables
  3. Clear all storage buckets
  4. Delete all auth users

⚠️  THIS ACTION CANNOT BE UNDONE!

⚠️  Type "YES, PURGE USERS" to confirm purge: YES, PURGE USERS

✅ Confirmation received. Starting purge...

=== STEP 1: CREATING BACKUPS ===

📁 Backup directory created: ./backups/2025-10-02T15-30-45-123Z
📦 Backing up auth.users...
   ✓ Backed up 42 users to auth_users.json
📦 Backing up messages...
   ✓ Backed up 1,234 rows to messages.json
...

=== STEP 2: TRUNCATING TABLES ===

🗑️  Truncating messages...
   ✓ Truncated messages
...

=== STEP 3: CLEARING STORAGE BUCKETS ===

🗑️  Clearing storage bucket: avatars...
   ✓ Deleted 42 files from avatars
...

=== STEP 4: DELETING AUTH USERS ===

🗑️  Deleting auth users...
   ✓ Deleted 42 users

=== PURGE COMPLETE ===

📦 Backups saved to: ./backups/2025-10-02T15-30-45-123Z
🗑️  Tables truncated: 10
🗑️  Files deleted: 156
🗑️  Users deleted: 42

✅ Database is now clean and ready for fresh testing
```

## Restoring from Backup

To restore data from a backup:

1. Locate the backup directory in `./backups/<timestamp>/`
2. Use Supabase's import tools or write a custom restore script
3. Import JSON files back to their respective tables
4. Note: Auth users will need to re-register (passwords cannot be restored)

## Troubleshooting

### "ABORT: This script can only run in staging environment"

**Solution**: Set `APP_ENV=staging` before running:
```bash
export APP_ENV=staging
npm run purge:users
```

### "Missing required environment variables"

**Solution**: Ensure both variables are set:
```bash
export VITE_SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### "Could not backup [table]" warnings

These warnings are non-fatal. The script will continue and create backups for all accessible tables.

### Permission errors

Ensure your `SUPABASE_SERVICE_ROLE_KEY` has admin privileges to:
- Read all tables
- Delete from all tables
- Manage auth users
- Access storage buckets

## Security Notes

1. **Never run in production**: The `APP_ENV` check prevents this, but always double-check your environment
2. **Service Role Key**: Keep your service role key secret and never commit it to version control
3. **Backup Security**: Backup files may contain sensitive user data. Store them securely and delete when no longer needed
4. **Audit Trail**: The script logs all operations. Review logs after purge to confirm expected behavior

## NPM Script

The script is available as an npm command:

```json
{
  "scripts": {
    "purge:users": "tsx scripts/purgeUsers.ts"
  }
}
```

Run with:
```bash
npm run purge:users
```

## Support

For issues or questions:
1. Review this documentation
2. Check the backup files were created successfully
3. Verify environment variables are correct
4. Contact the development team if problems persist
