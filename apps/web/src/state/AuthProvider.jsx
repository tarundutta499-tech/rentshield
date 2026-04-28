import React, { createContext, useContext, useEffect, useMemo, useState, useRef, useCallback } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase.js";

const AuthContext = createContext(null);

// Auto-logout timeout (7 minutes = 420000 ms)
const AUTO_LOGOUT_TIME = 7 * 60 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Use useRef for timer to persist across re-renders
  const logoutTimerRef = useRef(null);
  const activityTimerRef = useRef(null);

  async function ensureUserDoc(user) {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data();

    const base = {
      uid: user.uid,
      email: user.email ?? null,
      phoneNumber: user.phoneNumber ?? null,
      displayName: user.displayName ?? null,
      role: null,
      verifiedBadge: false,
      reputationScore: 600,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(ref, base, { merge: true });
    return base;
  }

  // Activity tracking functions with proper cleanup
  const resetLogoutTimer = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    
    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
      activityTimerRef.current = null;
    }
    
    logoutTimerRef.current = setTimeout(() => {
      console.log("Auto-logout: 7 minutes of inactivity reached");
      signOut(auth);
    }, AUTO_LOGOUT_TIME);
  }, []);

  const handleUserActivity = useCallback(() => {
    if (user) {
      console.log("User activity detected - resetting logout timer");
      resetLogoutTimer();
    }
  }, [user, resetLogoutTimer]);

  // Auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u || null);
      setLoading(true);
      try {
        if (!u) {
          setProfile(null);
          // Clear all timers when user signs out
          resetLogoutTimer();
          return;
        }
        const p = await ensureUserDoc(u);
        setProfile(p);
        
        // Start auto-logout timer when user signs in
        resetLogoutTimer();
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  // Global activity tracking with proper cleanup
  useEffect(() => {
    if (!user) return;

    const activityEvents = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'
    ];

    const handleActivity = () => {
      handleUserActivity();
    };

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Cleanup function
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      // Clear all timers
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
      if (handleActivityRef.current) {
        clearTimeout(handleActivityRef.current);
        handleActivityRef.current = null;
      }
    };
  }, [user, handleUserActivity]);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      isEmailVerified: Boolean(user?.email ? user.emailVerified : true),
      signOut: async () => {
      try {
        console.log("Logging out...");
        await firebaseSignOut(auth);
        console.log("Logged out successfully");
      } catch (error) {
        console.error("Logout error:", error);
      }
    },
      handleUserActivity
    }),
    [user, profile, loading, handleUserActivity]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
