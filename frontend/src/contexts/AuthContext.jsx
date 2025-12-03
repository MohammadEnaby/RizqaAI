import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState(false);

  async function signup(email, password, name, role, phone) {
    if (!auth) throw new Error("Firebase not initialized");
    
    try {
      console.log("🔐 Creating user account...");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("✅ Account created successfully");
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: name
      });
      console.log("✅ Display name updated");

      // Store user profile in Firestore if available
      if (db) {
        try {
          await setDoc(doc(db, "users", userCredential.user.uid), {
            name: name,
            email: email,
            phone: phone,
            role: role,
            createdAt: new Date().toISOString()
          });
          console.log("✅ User profile saved to Firestore");
        } catch (dbError) {
          console.error("❌ FIRESTORE ERROR:", dbError.code, dbError.message);
          if (dbError.code === 'permission-denied') {
            console.error("🚨 FIX REQUIRED: Update Firestore security rules!");
            console.error("📖 See FIX_FIRESTORE_PERMISSIONS.md for instructions");
          }
          // User is still created, just not saved to Firestore
        }
      }

      return userCredential;
    } catch (error) {
      console.error("❌ Signup error:", error);
      throw error;
    }
  }

  async function login(email, password) {
    if (!auth) throw new Error("Firebase not initialized");
    
    try {
      console.log("🔐 Logging in...");
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Login successful");
      return result;
    } catch (error) {
      console.error("❌ Login error:", error);
      throw error;
    }
  }

  async function initiateGoogleSignIn() {
    if (!auth) throw new Error("Firebase not initialized");
    
    const provider = new GoogleAuthProvider();
    
    try {
      console.log("🔐 Opening Google sign-in popup...");
      const result = await signInWithPopup(auth, provider);
      console.log("✅ Google sign-in successful");
      
      // Check if user already exists in Firestore
      if (db) {
        try {
          const userDoc = await getDoc(doc(db, "users", result.user.uid));
          if (userDoc.exists()) {
            console.log("✅ Existing user - logging in");
            return { user: result.user, isNewUser: false, profile: userDoc.data() };
          } else {
            console.log("🆕 New user - needs to complete profile");
            return { user: result.user, isNewUser: true };
          }
        } catch (dbError) {
          console.error("❌ FIRESTORE ERROR:", dbError.code, dbError.message);
          if (dbError.code === 'permission-denied') {
            console.error("🚨 FIX REQUIRED: Update Firestore security rules!");
            console.error("📖 See FIX_FIRESTORE_PERMISSIONS.md for instructions");
            throw new Error("Database permissions error. Please contact support or check Firestore rules.");
          }
          throw dbError;
        }
      } else {
        // No Firestore - treat as existing user
        return { user: result.user, isNewUser: false };
      }
      
    } catch (error) {
      console.error("❌ Google Sign-In Error:", error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error("Sign-in cancelled.");
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error("Pop-up blocked! Please allow pop-ups.");
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error("Google Sign-In not enabled in Firebase Console.");
      }
      
      throw error;
    }
  }

  async function completeGoogleProfile(uid, name, role, password, phone) {
    if (!db) throw new Error("Firestore not initialized");
    
    try {
      await setDoc(doc(db, "users", uid), {
        name: name,
        email: currentUser.email,
        phone: phone,
        role: role,
        hasCustomPassword: !!password,
        createdAt: new Date().toISOString()
      });
      
      // Update display name
      if (currentUser) {
        await updateProfile(currentUser, {
          displayName: name
        });
      }
      
      console.log("✅ Google user profile completed");
      
      // Refresh user profile
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
    } catch (error) {
      console.error("❌ Error completing profile:", error);
      if (error.code === 'permission-denied') {
        console.error("🚨 FIX REQUIRED: Update Firestore security rules!");
        console.error("📖 See FIX_FIRESTORE_PERMISSIONS.md for instructions");
        throw new Error("Database permissions error. Please update Firestore rules.");
      }
      throw error;
    }
  }

  async function resetPassword(email) {
    if (!auth) throw new Error("Firebase not initialized");
    
    try {
      console.log("📧 Sending password reset email...");
      await sendPasswordResetEmail(auth, email);
      console.log("✅ Password reset email sent");
    } catch (error) {
      console.error("❌ Password reset error:", error);
      throw error;
    }
  }

  function logout() {
    if (!auth) throw new Error("Firebase not initialized");
    return signOut(auth);
  }

  useEffect(() => {
    if (!auth) {
      setConfigError(true);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user && db) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
            console.log("✅ User profile loaded");
          } else {
            console.warn("⚠️ User authenticated but no profile in Firestore");
          }
        } catch (error) {
          if (error.code === 'permission-denied') {
            console.error("❌ Cannot read user profile: Firestore permissions denied");
            console.error("📖 See FIX_FIRESTORE_PERMISSIONS.md for instructions");
          } else {
            console.warn("⚠️ Could not fetch user profile:", error.message);
          }
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (configError) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fc5c7d 0%, #6a82fb 100%)',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '500px',
          width: '100%',
          background: 'white',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔥</div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#e53e3e',
            marginBottom: '16px'
          }}>
            Firebase Not Configured
          </h2>
          <p style={{ color: '#666', marginBottom: '24px', lineHeight: '1.6' }}>
            Your Firebase configuration is missing. Please check your <code style={{
              background: '#f7f7f7',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>.env</code> file.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '12px 32px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    initiateGoogleSignIn,
    completeGoogleProfile,
    resetPassword,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
