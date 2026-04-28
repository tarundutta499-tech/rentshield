import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase.js";

const AuthContext = createContext(null);

// Auto-logout timeout (7 minutes = 420000 ms)
const AUTO_LOGOUT_TIME = 7 * 60 * 1000; // 7 minutes in milliseconds
let logoutTimer = null;

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

// Activity tracking functions
const resetLogoutTimer = useCallback(() => {
  if (logoutTimer) {
    clearTimeout(logoutTimer);
  }
  logoutTimer = setTimeout(() => {
    console.log("Auto-logout: 7 minutes of inactivity reached");
    
    // Show warning before logout
    const warningMessage = "Session will expire in 10 seconds due to inactivity...";
    console.warn(warningMessage);
    
    // Show browser notification if possible
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Session Expiring', {
        body: warningMessage,
        icon: '/favicon.ico'
      });
    }
    
    // Logout after 10 seconds warning
    setTimeout(() => {
      signOut(auth);
    }, 10000);
  }, AUTO_LOGOUT_TIME);
}, []);

const handleUserActivity = useCallback(() => {
  console.log("User activity detected - resetting logout timer");
  resetLogoutTimer();
}, [resetLogoutTimer]);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(true);
      try {
        if (!u) {
          setProfile(null);
          // Clear logout timer when user signs out
          if (logoutTimer) {
            clearTimeout(logoutTimer);
            logoutTimer = null;
          }
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

  // Global activity tracking
  useEffect(() => {
    const activityEvents = [
      'mousedown',
      'mousemove', 
      'keypress', 
      'scroll', 
      'touchstart', 
      'click'
    ];

    const handleActivity = () => {
      if (user) {
        handleUserActivity();
      }
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (logoutTimer) {
        clearTimeout(logoutTimer);
      }
    };
  }, [user, handleUserActivity]);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      isEmailVerified: Boolean(user?.email ? user.emailVerified : true),
      signOut: () => signOut(auth),
      handleUserActivity // Expose activity handler for manual calls
    }),
    [user, profile, loading, handleUserActivity]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

