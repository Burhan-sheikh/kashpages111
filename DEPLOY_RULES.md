# Firebase Security Rules Deployment Guide

## Current Error
```
FirebaseError: Missing or insufficient permissions.
```

This means the Firestore security rules need to be deployed to Firebase.

## Quick Fix - Deploy Rules

### Option 1: Firebase Console (Recommended for Quick Fix)

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**: `flashqr-55b72` (or your project name)

#### Deploy Firestore Rules:
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy the content from `firestore.rules` file in your repo
5. Paste it into the rules editor
6. Click **Publish**

#### Deploy Storage Rules:
7. Navigate to **Storage** → **Rules** tab
8. Copy the content from `storage.rules` file in your repo
9. Paste it into the rules editor
10. Click **Publish**

### Option 2: Firebase CLI (Recommended for Production)

If you have Firebase CLI installed:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init

# Deploy only security rules
firebase deploy --only firestore:rules,storage
```

## What Changed in Rules

### Firestore Rules (`firestore.rules`)

**Key Changes:**
1. ✅ **Profiles now publicly readable** - Needed for public shop pages
2. ✅ **Profile creation allowed during signup** - Users can create their own profile
3. ✅ **Shops publicly readable** - Anyone can view shops (for public pages)
4. ✅ **Collection name fixed**: `user_roles` → `roles` (matches app code)

**Security maintained:**
- Users can only create/update their own profiles
- Users can only create/update shops they own
- Only admins can manage roles

### Storage Rules (`storage.rules`)

**Current rules (no changes needed):**
- ✅ Public read access for all files
- ✅ Write access only to authenticated users in their own folder
- ✅ Path structure: `shop-assets/{userId}/...`

## Verify Deployment

After deploying rules:

1. **Clear browser cache** and reload your app
2. **Try signing in** - should work without permission errors
3. **Check console** - no more "Missing or insufficient permissions" errors
4. **Test shop creation** - should be able to upload images

## Testing Checklist

- [ ] Sign up new user → Profile created successfully
- [ ] Sign in existing user → Profile loads without errors
- [ ] Dashboard loads → No permission errors
- [ ] Shop setup → Can upload cover image
- [ ] Shop setup → Can upload gallery images
- [ ] Shop setup → Can save/publish shop
- [ ] Public shop page → Can view shop without authentication

## Common Issues

### "Rules deployment failed"
- Make sure you're logged into the correct Firebase account
- Check that you have owner/editor permissions on the project
- Verify the rules syntax is correct (no trailing commas, etc.)

### "Still getting permission errors"
- Wait 1-2 minutes for rules to propagate
- Clear browser cache and cookies
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
- Check Firebase Console → Firestore/Storage → Rules tab to verify they're deployed

### "signInWithPassword 400 error"
- This usually means wrong email/password
- Or the user doesn't exist yet
- Try signing up first, then signing in

## Firebase Project Info

Based on your errors, your Firebase project is:
- **Project ID**: `flashqr-55b72`
- **Storage Bucket**: `flashqr-55b72.firebasestorage.app`

## Next Steps After Deployment

1. ✅ Deploy the rules (using one of the options above)
2. ✅ Test the application thoroughly
3. ✅ Monitor Firebase Console → Usage tab for any issues
4. ✅ Set up Firebase Authentication email templates if needed

## Security Best Practices

### Current Setup (Good):
- ✅ Authentication required for writes
- ✅ Users can only modify their own data
- ✅ Public read for shops (needed for public pages)
- ✅ Admin role checks in place

### Consider Adding:
- Rate limiting for API calls
- Content validation in rules (size limits, allowed fields)
- Automated testing for security rules

## Rollback If Needed

If the new rules cause issues:

```bash
# Get previous rules version from Firebase Console
# Or revert the commit in your repo
git revert a6c9823f9ea51d79893543b0b57be82858d3d7be

# Then deploy the old rules
firebase deploy --only firestore:rules
```

## Support

If you encounter issues:
1. Check Firebase Console → Firestore/Storage → Rules tab
2. Look at Firebase Console → Firestore/Storage → Usage tab for denied requests
3. Check browser console for detailed error messages
4. Review Firebase Authentication → Users tab to verify user creation

---

**Important**: Deploy these rules immediately to fix the "Missing or insufficient permissions" error!
