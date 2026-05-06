import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  isSignInWithEmailLink,
  sendEmailVerification,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const firestoreDatabaseId = import.meta.env.VITE_FIRESTORE_DATABASE_ID;
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const AUTH_SESSION_DURATION_MS = 20 * 60 * 1000;
const AUTH_SESSION_STARTED_AT_KEY = 'nexus_auth_session_started_at';
const EMAIL_LINK_SIGN_IN_KEY = 'nexus_email_link_sign_in';

function getActionCodeSettings() {
  return {
    url: `${window.location.origin}/login`,
    handleCodeInApp: true,
  };
}

export function markAuthSessionStarted() {
  localStorage.setItem(AUTH_SESSION_STARTED_AT_KEY, String(Date.now()));
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_SESSION_STARTED_AT_KEY);
}

export function getAuthSessionStartedAt() {
  const value = localStorage.getItem(AUTH_SESSION_STARTED_AT_KEY);
  const startedAt = value ? Number(value) : 0;
  return Number.isFinite(startedAt) ? startedAt : 0;
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    markAuthSessionStarted();
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  if (!result.user.emailVerified) {
    await sendEmailVerification(result.user, getActionCodeSettings());
    await signOut(auth);
    clearAuthSession();
    throw Object.assign(new Error('Email chưa được xác minh. Mình đã gửi lại email xác minh cho bạn.'), {
      code: 'auth/email-not-verified',
    });
  }
  markAuthSessionStarted();
  return result.user;
}

export async function registerWithEmail(email: string, password: string, displayName: string) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName.trim()) {
    await updateProfile(result.user, { displayName: displayName.trim() });
  }
  await sendEmailVerification(result.user, getActionCodeSettings());
  await signOut(auth);
  clearAuthSession();
  return result.user;
}

export async function resendVerificationEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(result.user, getActionCodeSettings());
  await signOut(auth);
  clearAuthSession();
}

export async function sendPasswordReset(email: string) {
  await sendPasswordResetEmail(auth, email, getActionCodeSettings());
}

export async function sendEmailOtpLink(email: string) {
  await sendSignInLinkToEmail(auth, email, getActionCodeSettings());
  localStorage.setItem(EMAIL_LINK_SIGN_IN_KEY, email);
}

export function hasEmailOtpLink(url = window.location.href) {
  return isSignInWithEmailLink(auth, url);
}

export async function completeEmailOtpLink(email?: string, url = window.location.href) {
  const storedEmail = localStorage.getItem(EMAIL_LINK_SIGN_IN_KEY) || '';
  const result = await signInWithEmailLink(auth, email || storedEmail, url);
  localStorage.removeItem(EMAIL_LINK_SIGN_IN_KEY);
  markAuthSessionStarted();
  return result.user;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
