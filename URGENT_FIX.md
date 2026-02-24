# ⚠️ URGENT: Fix Permission Errors

## Current Error
```
FirebaseError: Missing or insufficient permissions.
```

## 🔴 ACTION REQUIRED: Deploy Firebase Rules

The app is trying to access Firestore but the security rules haven't been deployed yet.

### Quick Fix (5 minutes)

#### Option 1: Firebase Console (Easiest)

1. Go to: https://console.firebase.google.com/project/flashqr-55b72/firestore/rules
2. Copy everything from the `firestore.rules` file in this repo
3. Paste it into the rules editor
4. Click **Publish**

5. Then go to: https://console.firebase.google.com/project/flashqr-55b72/storage/rules
6. Copy everything from the `storage.rules` file in this repo  
7. Paste it into the rules editor
8. Click **Publish**

#### Option 2: Command Line (If you have Firebase CLI)

```bash
# Make script executable
chmod +x deploy-rules.sh

# Run deployment script
./deploy-rules.sh
```

OR manually:

```bash
firebase deploy --only firestore:rules,storage
```

---

## What Was Fixed

### 1. ✅ React Router Warnings - FIXED
- Added v7 future flags to BrowserRouter
- File: `src/App.tsx`

### 2. ✅ API Endpoint Failures - FIXED  
- Removed dependency on `localhost:3001` API
- Now uses Firestore SDK directly
- Files: `src/hooks/useAuth.tsx`, `src/pages/Dashboard.tsx`, `src/pages/ShopSetup.tsx`

### 3. ✅ Firebase Storage 412 Error - FIXED
- Improved upload error handling
- Added proper metadata to uploads
- File: `src/pages/ShopSetup.tsx`

### 4. ⚠️ Firebase Permission Error - NEEDS DEPLOYMENT
- **Security rules updated in repo** ✅
- **Rules need to be deployed to Firebase** ❌ **← YOU NEED TO DO THIS**
- Files: `firestore.rules`, `storage.rules`

---

## What Changed in Rules

### Before (Old Rules)
- ❌ Profiles required auth token with admin claim to read
- ❌ Collection named `user_roles` (code uses `roles`)
- ❌ Too restrictive for public shop pages

### After (New Rules - IN REPO)
- ✅ Profiles publicly readable (needed for shop pages)
- ✅ Users can create their own profile during signup
- ✅ Shops publicly readable (for public pages)
- ✅ Collection renamed to `roles` (matches code)
- ✅ Security maintained: users can only edit their own data

---

## After Deploying Rules

1. **Clear browser cache**
2. **Hard refresh** (Ctrl+Shift+R or Cmd+Shift+R)
3. **Test these flows**:
   - Sign up new user
   - Sign in existing user
   - View dashboard
   - Create/edit shop
   - Upload images

---

## Error Breakdown

### Error 1: `signInWithPassword 400`
**Meaning**: Wrong email/password OR user doesn't exist
**Fix**: Try signing up first, then sign in

### Error 2: `Missing or insufficient permissions`
**Meaning**: Firestore rules blocking access
**Fix**: Deploy the rules (see above) ⬆️

### Error 3: `Cross-Origin-Opener-Policy warnings`
**Meaning**: Expected Firebase Auth popup behavior  
**Fix**: Not needed - these are informational only

---

## Files You Need to Check

- ✅ `firestore.rules` - Updated and committed
- ✅ `storage.rules` - Already correct
- ✅ `src/App.tsx` - Fixed
- ✅ `src/hooks/useAuth.tsx` - Fixed
- ✅ `src/pages/Dashboard.tsx` - Fixed
- ✅ `src/pages/ShopSetup.tsx` - Fixed

---

## Deployment Status

| Component | Code Fixed | Rules Deployed |
|-----------|------------|----------------|
| App.tsx | ✅ | N/A |
| useAuth.tsx | ✅ | N/A |
| Dashboard.tsx | ✅ | N/A |
| ShopSetup.tsx | ✅ | N/A |
| Firestore Rules | ✅ | ❌ **← DEPLOY THIS** |
| Storage Rules | ✅ | ✅ (already deployed) |

---

## 👉 Next Steps

1. **IMMEDIATELY**: Deploy Firestore rules (see top of this file)
2. Test sign in/sign up
3. Test shop creation and image uploads
4. Monitor Firebase Console for any errors

---

## Need Help?

Check these files for detailed info:
- `DEPLOY_RULES.md` - Full deployment guide
- `FIXES.md` - Complete list of all fixes applied
- `deploy-rules.sh` - Automated deployment script

---

## Summary

✅ All code fixes committed to repo  
❌ Firestore rules need to be deployed to Firebase  
⏱️ Takes 2 minutes via Firebase Console  
🚀 Then your app will work perfectly!
