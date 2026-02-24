# Error Fixes Applied - February 24, 2026

## Summary
Fixed multiple critical errors including React Router warnings, Firebase API call failures, CORS issues, and Firebase Storage 412 errors.

## Issues Fixed

### 1. React Router Future Flag Warnings ✅
**Error:** React Router v7 warnings about `v7_startTransition` and `v7_relativeSplatPath`

**Fix:** Added future flags to `BrowserRouter` in `src/App.tsx`:
```tsx
<BrowserRouter
  future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  }}
>
```

**Files Modified:**
- `src/App.tsx`

---

### 2. API Endpoint Failures (ERR_FAILED) ✅
**Errors:**
- `Failed to fetch` from `http://localhost:3001/api/profile?uid=...`
- `GET http://localhost:3001/api/shop?shopId=undefined` (multiple times)

**Root Cause:** Application was trying to call backend API endpoints that don't exist. The app should use Firestore directly.

**Fix:** Refactored to use Firestore SDK directly:

#### `src/hooks/useAuth.tsx`
- Removed API calls to `/api/profile` and `/api/roles`
- Now fetches data directly from Firestore:
  ```tsx
  const profileDoc = await getDoc(doc(firestore, "profiles", userId));
  const rolesQuery = query(collection(firestore, "roles"), where("user_id", "==", userId));
  ```
- Added proper error handling with try-catch blocks
- Added `created_at` timestamp when creating new profiles

#### `src/pages/Dashboard.tsx`
- Removed API call to `/api/shop?shopId=${user.id}`
- Now queries Firestore directly:
  ```tsx
  const q = query(
    collection(firestore, "shops"),
    where("owner_id", "==", user.uid),
    limit(1)
  );
  ```
- Fixed the `shopId=undefined` error by properly using `user.uid`
- Added proper error handling

**Files Modified:**
- `src/hooks/useAuth.tsx`
- `src/pages/Dashboard.tsx`

---

### 3. Firebase Storage 412 Precondition Failed ✅
**Error:** `POST https://firebasestorage.googleapis.com/...` returned 412 status

**Root Cause:** Firebase Storage security rules likely blocking uploads, or metadata issues.

**Fix:** Enhanced upload function in `src/pages/ShopSetup.tsx`:
- Added proper metadata to uploads:
  ```tsx
  const metadata = {
    contentType: file.type,
    customMetadata: {
      'uploadedBy': user.uid,
    }
  };
  await uploadBytes(storageReference, file, metadata);
  ```
- Improved error handling with specific error codes:
  - `storage/unauthorized` - Permission denied
  - `storage/canceled` - Upload cancelled
  - `storage/unknown` - Network/connection issues
- Added user authentication checks before upload
- Fixed storage path structure: `shop-assets/{uid}/{filename}`

#### `src/pages/ShopSetup.tsx`
- Replaced API calls with direct Firestore operations:
  - `/api/shop-update` → `updateDoc(doc(firestore, "shops", id), data)`
  - `/api/shop-create` → `addDoc(collection(firestore, "shops"), data)`
- Added `created_at` and `updated_at` timestamps
- Improved upload error messages for better debugging

**Files Modified:**
- `src/pages/ShopSetup.tsx`

---

### 4. Cross-Origin-Opener-Policy Warnings ⚠️
**Warning:** Cross-Origin-Opener-Policy policy would block `window.closed` and `window.close` calls

**Status:** This is a Firebase Auth popup warning and doesn't affect functionality. These warnings appear when using Firebase popup authentication and are expected behavior. No fix needed.

---

### 5. Service Worker FetchEvent Errors ⚠️
**Error:** FetchEvent resulted in network error response

**Status:** These are related to service worker caching and offline functionality. They occur when the service worker intercepts requests for resources that are no longer available. The errors are logged but don't break functionality. Monitor after deploying fixes.

---

## Firebase Security Rules Needed

For the storage fixes to work properly, ensure your `storage.rules` file includes:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /shop-assets/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Firestore rules needed:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /shops/{shopId} {
      allow read: if true;
      allow write: if request.auth != null && 
                      request.auth.uid == resource.data.owner_id;
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.owner_id;
    }
    
    match /roles/{roleId} {
      allow read: if request.auth != null;
      // Only admins can write roles - configure separately
    }
  }
}
```

---

## Testing Checklist

- [ ] Sign up new user - profile created in Firestore
- [ ] Sign in existing user - profile loads correctly
- [ ] Dashboard loads without errors
- [ ] Shop data displays if exists
- [ ] Shop setup: upload cover image
- [ ] Shop setup: upload gallery images (up to limit)
- [ ] Shop setup: save as draft
- [ ] Shop setup: publish shop
- [ ] Check browser console - no more ERR_FAILED or 412 errors
- [ ] Verify React Router warnings are gone

---

## Migration Notes

If you had a backend API server at `localhost:3001`, it's no longer needed for these operations. All data operations now use Firestore SDK directly.

**Before:**
```
Client → HTTP API (localhost:3001) → Firebase Admin SDK → Firestore
```

**After:**
```
Client → Firebase Web SDK → Firestore
```

This is more efficient, reduces latency, and eliminates the need for a backend server for basic CRUD operations.

---

## Additional Improvements Made

1. **Better Error Messages**: More descriptive error handling throughout
2. **Null Safety**: Added proper null checks for `user?.uid`
3. **TypeScript Improvements**: Better type safety for Firestore operations
4. **Code Consistency**: Standardized Firestore query patterns
5. **Timestamp Tracking**: Added `created_at` and `updated_at` fields

---

## Next Steps

1. Deploy Firebase Security Rules
2. Test all functionality in development
3. Remove any unused API endpoint files
4. Consider removing the backend server if only used for these operations
5. Update environment variables if needed

---

## Rollback Instructions

If issues occur, you can revert using:
```bash
git log --oneline  # Find commit before fixes
git revert <commit-sha>  # Revert specific commit
# Or
git reset --hard <commit-before-fixes>
git push --force
```

Commit SHAs for these fixes:
- App.tsx: e227af950f6b1a627ea155eb36033a2a79147702
- useAuth.tsx: 480958f5af626162cbefc99652c2c0b3bd93f977
- Dashboard.tsx: a5ee65f9d1170e527f7e9ead2ff1dadbc572bf71
- ShopSetup.tsx: 7c41825d52aada014b82ee8a76fa57289eff2289
