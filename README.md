# Kashpages (Firebase)

This repository has been migrated from a Supabase/Lovable backend to **Firebase**.
The application now uses:

- Firebase Authentication (email/password, Google OAuth, etc.)
- Firestore for application data (`shops`, `profiles`, `reviews`, `analytics_events`, etc.)
- Firebase Storage for image uploads
- Firebase Functions / Realtime Database can be added as needed

## Getting Started

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable the necessary services: Authentication, Firestore, Storage, and optionally Functions or Realtime Database.
3. Copy your Firebase configuration values and place them in a `.env.local` file at the project root. Vite loads `.env`, `.env.local`, and `.env.[mode]` automatically; `.env.local` is preferred for local secrets. You can also put them in `.env`, but make sure not to commit any real credentials.

   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_FIREBASE_MEASUREMENT_ID=...
   ```

   See `.env.example` for a template.

4. After changing env variables **restart the dev server** (Vite doesn’t pick up edits mid‑run).

5. Install dependencies and run the development server:

   ```bash
   npm install
   npm run dev
   ```

5. Start coding! All example database interactions are located in `src/pages` and `src/components`.

## Migration Notes

- Authentication logic is now in `src/hooks/useAuth.tsx` using the Firebase SDK.
- Previous Supabase client under `src/integrations/supabase` has been removed. Firebase initialization lives in `src/integrations/firebase/client.ts`.
- Search for `supabase` in the codebase to find remaining references; they have been replaced with Firestore examples but may require adjustment.
- Remove old Supabase-related environment variables from your `.env`.

## Deployment

Deploy the frontend as you normally would (Vercel, Netlify, etc.).
For backend features you can deploy Firebase Functions (`firebase deploy --only functions`) or enable the Realtime Database rules.

## Additional Resources

- [Firebase Web SDK documentation](https://firebase.google.com/docs/web/setup)
- [Firestore querying guide](https://firebase.google.com/docs/firestore/query-data/queries)
- [Firebase Authentication guide](https://firebase.google.com/docs/auth)

Enjoy building with Firebase! Feel free to adapt the data model and add new services as your app evolves.
