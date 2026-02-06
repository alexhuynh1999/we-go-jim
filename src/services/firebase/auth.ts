import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './config';

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<User> => {
  if (!auth) throw new Error('Firebase is not configured. Add your credentials to a .env file.');
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const signOut = async (): Promise<void> => {
  if (!auth) return;
  await firebaseSignOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    // Firebase not configured: immediately report "no user" so the app renders the login page
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

export { isFirebaseConfigured };
