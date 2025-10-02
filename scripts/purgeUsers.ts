#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// Environment check
const APP_ENV = process.env.APP_ENV || 'development';

if (APP_ENV !== 'staging') {
  console.error('❌ ABORT: This script can only run in staging environment');
  console.error(`   Current APP_ENV: ${APP_ENV}`);
  console.error('   Set APP_ENV=staging to proceed');
  process.exit(1);
}

console.log('✅ Environment check passed: staging');

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - VITE_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Backup directory
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.join(process.cwd(), 'backups', timestamp);

// Tables to backup and purge (in order)
const TABLES_TO_PURGE = [
  'messages',
  'chats',
  'reviews',
  'bookings',
  'invitations',
  'favorites',
  'manual_blocks',
  'time_off',
  'trainers',
  'profiles'
];

// Storage buckets to clear
const STORAGE_BUCKETS = [
  'avatars',
  'chat-attachments',
  'trainer-videos',
  'certificates'
];

/**
 * Create backup directory
 */
function createBackupDir() {
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  console.log(`📁 Backup directory created: ${backupDir}`);
}

/**
 * Export table data to JSON
 */
async function backupTable(tableName: string) {
  console.log(`📦 Backing up ${tableName}...`);
  
  const { data, error } = await supabase
    .from(tableName)
    .select('*');
  
  if (error) {
    console.warn(`⚠️  Warning: Could not backup ${tableName}: ${error.message}`);
    return 0;
  }
  
  const filePath = path.join(backupDir, `${tableName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`   ✓ Backed up ${data?.length || 0} rows to ${tableName}.json`);
  
  return data?.length || 0;
}

/**
 * Backup auth.users data
 */
async function backupAuthUsers() {
  console.log('📦 Backing up auth.users...');
  
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.warn(`⚠️  Warning: Could not backup auth.users: ${error.message}`);
    return 0;
  }
  
  // Only save essential fields
  const userData = users?.map(u => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    raw_user_meta_data: u.raw_user_meta_data
  })) || [];
  
  const filePath = path.join(backupDir, 'auth_users.json');
  fs.writeFileSync(filePath, JSON.stringify(userData, null, 2));
  console.log(`   ✓ Backed up ${userData.length} users to auth_users.json`);
  
  return userData.length;
}

/**
 * Clear storage bucket
 */
async function clearStorageBucket(bucketName: string) {
  console.log(`🗑️  Clearing storage bucket: ${bucketName}...`);
  
  try {
    const { data: files, error: listError } = await supabase
      .storage
      .from(bucketName)
      .list();
    
    if (listError) {
      console.warn(`   ⚠️  Could not list files in ${bucketName}: ${listError.message}`);
      return 0;
    }
    
    if (!files || files.length === 0) {
      console.log(`   ✓ Bucket ${bucketName} is empty`);
      return 0;
    }
    
    // Delete files in batches
    const filePaths = files.map(f => f.name);
    const { error: deleteError } = await supabase
      .storage
      .from(bucketName)
      .remove(filePaths);
    
    if (deleteError) {
      console.warn(`   ⚠️  Error deleting files from ${bucketName}: ${deleteError.message}`);
      return 0;
    }
    
    console.log(`   ✓ Deleted ${filePaths.length} files from ${bucketName}`);
    return filePaths.length;
  } catch (err: any) {
    console.warn(`   ⚠️  Error with bucket ${bucketName}: ${err.message}`);
    return 0;
  }
}

/**
 * Truncate table
 */
async function truncateTable(tableName: string) {
  console.log(`🗑️  Truncating ${tableName}...`);
  
  const { error } = await supabase
    .from(tableName)
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (error) {
    console.warn(`   ⚠️  Warning: Could not truncate ${tableName}: ${error.message}`);
    return false;
  }
  
  console.log(`   ✓ Truncated ${tableName}`);
  return true;
}

/**
 * Delete all auth users
 */
async function deleteAuthUsers() {
  console.log('🗑️  Deleting auth users...');
  
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error(`   ❌ Could not list users: ${error.message}`);
    return 0;
  }
  
  let deletedCount = 0;
  
  for (const user of users || []) {
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (!deleteError) {
      deletedCount++;
    } else {
      console.warn(`   ⚠️  Failed to delete user ${user.email}: ${deleteError.message}`);
    }
  }
  
  console.log(`   ✓ Deleted ${deletedCount} users`);
  return deletedCount;
}

/**
 * Prompt for confirmation
 */
async function promptConfirmation(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('\n⚠️  Type "YES, PURGE USERS" to confirm purge: ', (answer) => {
      rl.close();
      resolve(answer.trim() === 'YES, PURGE USERS');
    });
  });
}

/**
 * Main purge function
 */
async function main() {
  console.log('\n🚨 FITANA USER PURGE SCRIPT 🚨\n');
  console.log('This will:');
  console.log('  1. Backup all user data to JSON files');
  console.log('  2. Delete all user-generated data from tables');
  console.log('  3. Clear all storage buckets');
  console.log('  4. Delete all auth users');
  console.log('\n⚠️  THIS ACTION CANNOT BE UNDONE!\n');

  // Prompt for confirmation
  const confirmed = await promptConfirmation();
  
  if (!confirmed) {
    console.log('\n❌ Purge cancelled by user');
    process.exit(0);
  }

  console.log('\n✅ Confirmation received. Starting purge...\n');

  // Step 1: Create backups
  console.log('=== STEP 1: CREATING BACKUPS ===\n');
  createBackupDir();
  
  let totalBackedUp = 0;
  totalBackedUp += await backupAuthUsers();
  
  for (const table of TABLES_TO_PURGE) {
    totalBackedUp += await backupTable(table);
  }
  
  console.log(`\n✓ Total records backed up: ${totalBackedUp}\n`);

  // Step 2: Truncate tables
  console.log('=== STEP 2: TRUNCATING TABLES ===\n');
  
  for (const table of TABLES_TO_PURGE) {
    await truncateTable(table);
  }

  // Step 3: Clear storage buckets
  console.log('\n=== STEP 3: CLEARING STORAGE BUCKETS ===\n');
  
  let totalFilesDeleted = 0;
  for (const bucket of STORAGE_BUCKETS) {
    totalFilesDeleted += await clearStorageBucket(bucket);
  }
  
  console.log(`\n✓ Total files deleted: ${totalFilesDeleted}\n`);

  // Step 4: Delete auth users
  console.log('=== STEP 4: DELETING AUTH USERS ===\n');
  
  const deletedUsers = await deleteAuthUsers();

  // Summary
  console.log('\n=== PURGE COMPLETE ===\n');
  console.log(`📦 Backups saved to: ${backupDir}`);
  console.log(`🗑️  Tables truncated: ${TABLES_TO_PURGE.length}`);
  console.log(`🗑️  Files deleted: ${totalFilesDeleted}`);
  console.log(`🗑️  Users deleted: ${deletedUsers}`);
  console.log('\n✅ Database is now clean and ready for fresh testing\n');
}

// Run the script
main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
