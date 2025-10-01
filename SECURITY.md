# Security Documentation

## Overview

This document describes the security measures implemented in this application to protect user data and prevent unauthorized access.

## Security Hardening Implementation (v2)

### Date: 2025-10-01
### Status: ✅ Implemented (1 manual step required)

---

## 🔒 Implemented Security Measures

### 1. View Security (SECURITY INVOKER)

**Issue Fixed:** `SUPA_security_definer_view`

All database views now use `SECURITY INVOKER` semantics with `security_barrier = on`. This ensures:
- Views execute with the permissions of the calling user, not the view owner
- Row-Level Security (RLS) policies are properly enforced
- No privilege escalation through views

**Views Secured:**
- `trainers_public_view` - Now uses SECURITY INVOKER
- `trainers_directory_public` - New sanitized public view

### 2. Profiles Table - Owner-Only Access

**Issue Fixed:** `PUBLIC_USER_DATA`

The `profiles` table is now strictly owner-only:
- ✅ Users can ONLY view their own profile
- ✅ No enumeration of other users' profiles
- ✅ Email addresses are NEVER exposed publicly
- ✅ All PII (personally identifiable information) is protected

**Policies Applied:**
```sql
- profiles_select_own: SELECT only own row
- profiles_update_own: UPDATE only own row
- profiles_insert_own: INSERT only own row
- Revoked all public/anon access
```

### 3. Invitations - Strict Access Control

**Issue Fixed:** `EXPOSED_SENSITIVE_DATA`

Invitations are now only visible to authorized parties:
- ✅ Only the trainer who created the invitation can see it
- ✅ Only the intended recipient (by email match) can see it
- ✅ Removed "anyone can view by token" policy
- ✅ No unauthenticated access to invitation data

**Secure Access Method:**
For authenticated invitation retrieval, use the RPC function:
```typescript
const { data, error } = await supabase.rpc('get_invitation_for_authed', { 
  token: invitationToken 
});
```

This function:
- Requires authentication
- Only returns non-PII fields
- Validates the user has permission (trainer or recipient)
- Checks invitation is not expired

### 4. Public Trainer Directory (Sanitized)

Created a new view `trainers_directory_public` that:
- ✅ Contains ONLY non-sensitive data (no emails, no phone numbers)
- ✅ Uses SECURITY INVOKER semantics
- ✅ Available to anonymous users for trainer discovery
- ✅ Properly filtered (only active trainers with off_mode = false)

**Non-Sensitive Fields Exposed:**
- id, display_name, bio, specialties, languages
- gallery, has_video, is_verified, price_from
- rating, review_count, services, locations
- created_at, name, city, avatarurl

### 5. Defensive Defaults

Applied default privilege restrictions:
```sql
- Revoked PUBLIC/anon access to all tables by default
- Revoked PUBLIC/anon access to all functions by default
- Revoked PUBLIC/anon access to all sequences by default
```

This ensures future tables/functions are secure by default.

---

## ⚠️ REQUIRED MANUAL STEP

### Enable Leaked Password Protection

**Issue:** `SUPA_auth_leaked_password_protection`

**Status:** ⚠️ REQUIRES DASHBOARD CONFIGURATION

**Action Required:**
1. Open Lovable Cloud backend dashboard
2. Navigate to: **Authentication** → **Providers** → **Email**
3. Enable: **"Leaked password protection"** (uses Pwned Passwords database)
4. Set minimum password strength requirements:
   - Minimum length: 8 characters (recommended)
   - Require uppercase: Yes
   - Require lowercase: Yes
   - Require numbers: Yes
   - Require special characters: Yes (recommended)

**Why This Is Important:**
Leaked password protection prevents users from using passwords that have been compromised in data breaches. This is a critical security feature that protects against credential stuffing attacks.

**Access Dashboard:**
```
Click "View Backend" in the Lovable interface to access dashboard
```

---

## 🔐 RLS Policies Summary

### profiles table
- `profiles_select_own`: Users can only SELECT their own row
- `profiles_update_own`: Users can only UPDATE their own row
- `profiles_insert_own`: Users can only INSERT their own row

### trainers table
- `Authenticated users can view trainers`: Logged-in users can view all trainers
- `Trainers can view their own profile`: Trainers can view their own profile
- `Users can update their own trainer profile`: Only owner can update
- `Users can insert their own trainer profile`: Only owner can insert

### invitations table
- `invitations_select_owner_or_recipient`: Only trainer or recipient can view
- `Trainers can update their invitations`: Only creator can update
- `Trainers can create invitations`: Only trainer can create
- `Trainers can delete their invitations`: Only creator can delete
- `Clients can accept their invitations`: Recipients can update status

### bookings table
- `Users can view their own bookings`: Only participants can view
- `Users can update their own bookings`: Only participants can update
- `Users can delete their own bookings`: Only participants can delete
- `Users can create bookings`: Participants can create

---

## 🛡️ Security Functions

### get_safe_profile_data(uuid)
Returns only non-sensitive profile data (name, avatar) for users who have a relationship through:
- Direct user match (own profile)
- Shared bookings
- Existing chat conversation

### get_invitation_for_authed(uuid)
Securely retrieves invitation details for authenticated users who are either:
- The trainer who created the invitation
- The recipient (matched by email)

Returns only: id, trainer_id, booking_id, status, expires_at, invitation_data

### users_have_bookings_together(uuid, uuid)
Checks if two users have any bookings together (as trainer/client pairs).

---

## 📋 Security Checklist

- [x] Views use SECURITY INVOKER with security_barrier
- [x] Profiles table is owner-only for PII
- [x] Invitations require authentication for access
- [x] Email addresses never exposed in public views
- [x] Public trainer directory uses sanitized view
- [x] Defensive defaults prevent accidental exposures
- [x] All SECURITY DEFINER functions reviewed and secured
- [ ] **Leaked password protection enabled** (MANUAL STEP REQUIRED)

---

## 🔍 Verification

To verify security measures are working:

```sql
-- Check views are using security_invoker
SELECT schemaname, viewname 
FROM pg_views 
WHERE schemaname = 'public';

-- Check profile policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Check invitation policies
SELECT * FROM pg_policies WHERE tablename = 'invitations';

-- Test as anonymous user (should fail)
-- Try to access profiles or invitations without authentication
```

---

## 📞 Security Contact

If you discover a security vulnerability:
1. Do NOT create a public issue
2. Contact the development team directly
3. Provide detailed information about the vulnerability
4. Allow reasonable time for fix before disclosure

---

## 🔄 Security Audit History

| Date | Version | Changes | Status |
|------|---------|---------|--------|
| 2025-10-01 | v2 | Comprehensive security hardening | ✅ Complete (1 manual step) |
| 2025-09-30 | v1 | Initial RLS policies | ✅ Complete |

---

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/security/best-practices)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
