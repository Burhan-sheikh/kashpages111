// This file initializes Firebase SDKs and exports the services used throughout the app.
// Configure your environment variables in `.env` or equivalent.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// basic sanity check – missing config will usually cause the app to fail silently
// Log the configuration so we can inspect what `import.meta.env` is providing.
console.debug("Firebase env values:", {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
});

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  // if these are undefined/empty we'll warn loudly and even throw so devs can't miss it
  const debugValues = {
    apiKey: firebaseConfig.apiKey,
    projectId: firebaseConfig.projectId,
  };
  console.error(
    "Firebase configuration looks incomplete. Make sure you've defined the env variables in .env or .env.local",
    debugValues
  );
  throw new Error(
    "Missing Firebase configuration. values: " + JSON.stringify(debugValues)
  );
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const realtimeDb = getDatabase(app);
export const functions = getFunctions(app);
