import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app = null;
let auth = null;
let db = null;

if (!firebaseConfig.apiKey) {
  console.error("❌ Firebase configuration is missing. Please check your .env file.");
} else {
  try {
    console.log("🔥 Initializing Firebase...");
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    
    try {
      db = getFirestore(app);
      console.log("✅ Firebase and Firestore initialized successfully");
    } catch (firestoreError) {
      console.warn("⚠️ Firestore initialization failed. You need to enable Firestore in Firebase Console.");
      console.warn("Firestore error:", firestoreError.message);
    }
    
  } catch (error) {
    console.error("❌ Firebase initialization error:", error);
  }
}

export { auth, db };
export default app;
