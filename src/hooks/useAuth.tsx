import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  AUTH_SESSION_DURATION_MS,
  auth,
  clearAuthSession,
  db,
  getAuthSessionStartedAt,
  handleFirestoreError,
  markAuthSessionStarted,
  OperationType,
} from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  setProfile: (profile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  setProfile: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        let startedAt = getAuthSessionStartedAt();
        if (!startedAt) {
          markAuthSessionStarted();
          startedAt = getAuthSessionStartedAt();
        }

        if (Date.now() - startedAt >= AUTH_SESSION_DURATION_MS) {
          clearAuthSession();
          await auth.signOut();
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        setUser(user);
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            setProfile(null);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        }
      } else {
        clearAuthSession();
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const startedAt = getAuthSessionStartedAt();
    const remainingMs = startedAt + AUTH_SESSION_DURATION_MS - Date.now();

    if (remainingMs <= 0) {
      clearAuthSession();
      auth.signOut();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      clearAuthSession();
      auth.signOut();
    }, remainingMs);

    return () => window.clearTimeout(timeoutId);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
