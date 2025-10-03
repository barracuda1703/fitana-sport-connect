# 🔒 Security Setup - Action Required

## ⚠️ CRITICAL: Enable Leaked Password Protection

Your application has been secured with comprehensive security hardening, but **ONE MANUAL STEP** is required to complete the security setup.

---

## 📋 What You Need To Do

### Enable Leaked Password Protection in Lovable Cloud

**Time Required:** 2 minutes  
**Priority:** HIGH  
**Status:** ⚠️ **ACTION REQUIRED**

---

## 🚀 Step-by-Step Instructions

### 1. Access Your Backend Dashboard

Click this button in the Lovable interface:

```
[View Backend]
```

Or use this action in the chat to open your backend:

<lov-actions>
<lov-open-backend>View Backend</lov-open-backend>
</lov-actions>

### 2. Navigate to Authentication Settings

Once in the dashboard:
1. Click on **"Authentication"** in the left sidebar
2. Click on **"Providers"**
3. Select **"Email"**

### 3. Enable Leaked Password Protection

In the Email provider settings:

✅ **Enable:** "Leaked password protection"
- This uses the [Pwned Passwords](https://haveibeenpwned.com/Passwords) database
- Prevents users from using compromised passwords
- Critical for protecting against credential stuffing attacks

### 4. Set Password Strength Requirements

Configure the following settings (recommended):

| Setting | Recommended Value |
|---------|-------------------|
| Minimum length | 8 characters |
| Require uppercase | ✅ Yes |
| Require lowercase | ✅ Yes |
| Require numbers | ✅ Yes |
| Require special characters | ✅ Yes (recommended) |

### 5. Save Your Changes

Click **"Save"** at the bottom of the page.

---

## ✅ Verification

After enabling, verify it's working:

1. Try to sign up with a weak password (e.g., "password123")
2. You should see an error message preventing the signup
3. Try a strong, unique password - it should work

---

## 🛡️ Why This Is Important

### What is Leaked Password Protection?

When users create accounts, this feature checks their chosen password against a database of **billions of passwords** that have been exposed in data breaches.

### The Threat

- **Over 11 billion passwords** have been leaked in data breaches
- Attackers use these in **credential stuffing attacks**
- If a user reuses a leaked password, their account is at risk

### The Protection

By enabling this feature:
- ✅ Users cannot use passwords that are known to be compromised
- ✅ Reduces risk of account takeover by 99%+
- ✅ Forces users to create unique, strong passwords
- ✅ Protects your entire user base

---

## 📊 Security Status

### Completed ✅

- [x] Views secured with SECURITY INVOKER
- [x] Profiles table locked to owner-only access
- [x] Invitations require authentication
- [x] Public trainer directory uses sanitized data
- [x] Email addresses never exposed publicly
- [x] Defensive security defaults applied
- [x] All RLS policies reviewed and hardened

### Pending ⚠️

- [ ] **Leaked password protection enabled** ← **YOU ARE HERE**

---

## 🔐 Complete Security Documentation

For full details on all security measures implemented, see:
- [SECURITY.md](./SECURITY.md) - Complete security documentation

---

## 🆘 Need Help?

If you encounter any issues:

1. Check the [Supabase Auth Documentation](https://supabase.com/docs/guides/auth/password-security)
2. Verify you're on the correct project in the dashboard
3. Ensure you have admin permissions
4. Try refreshing the dashboard page

---

## 🎯 Next Steps

Once you've enabled leaked password protection:

1. ✅ Mark this task as complete
2. 📝 Update your team that security hardening is complete
3. 🧪 Test signup/login flows with various password strengths
4. 📊 Monitor authentication logs for any issues

---

**Remember:** Security is an ongoing process. Review the [SECURITY.md](./SECURITY.md) file regularly and stay updated on security best practices.
