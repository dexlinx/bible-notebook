"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

const AuthContext = createContext({ user: null, loading: true });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[AuthProvider] Setting up listener...");
    let unsubscribe;

    // Set loading to false after 3 seconds no matter what - for dev/local testing
    const hardTimeout = setTimeout(() => {
      console.warn("[AuthProvider] Hard timeout (3s) - forcing loading to false for local dev");
      setLoading(false);
    }, 3000);

    try {
      unsubscribe = onAuthStateChanged(auth, (authUser) => {
        console.log("[AuthProvider] onAuthStateChanged fired:", authUser?.uid || 'no user');
        clearTimeout(hardTimeout);
        if (authUser) {
          setUser(authUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      }, (error) => {
        console.error("[AuthProvider] Auth error:", error?.message);
        clearTimeout(hardTimeout);
        setUser(null);
        setLoading(false);
      });
    } catch (error) {
      console.error("[AuthProvider] Failed to setup listener:", error?.message);
      clearTimeout(hardTimeout);
      setUser(null);
      setLoading(false);
    }

    return () => {
      clearTimeout(hardTimeout);
      if (unsubscribe) {
        console.log("[AuthProvider] Cleaning up listener");
        unsubscribe();
      }
    };
  }, []);

  console.log("[AuthProvider] Rendering with state:", { loading, userUid: user?.uid });

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);