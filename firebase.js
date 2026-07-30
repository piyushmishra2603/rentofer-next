// Central Firebase client init.
// Every converted page imports { db, auth } from here instead of
// re-running initializeApp() on every page like the old HTML did.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCExyC1UlqWl-tTJWVtoQx6E-rppaYQgcU",
  authDomain: "smart-property-portal.firebaseapp.com",
  projectId: "smart-property-portal",
  storageBucket: "smart-property-portal.firebasestorage.app",
};

// getApps()/getApp() guard is required in Next.js because fast refresh
// (and multiple pages importing this file) can otherwise try to call
// initializeApp() more than once and crash with "duplicate-app".
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
