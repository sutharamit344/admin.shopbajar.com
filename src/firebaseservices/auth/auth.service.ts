import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../app/config/firebase";

const googleProvider = new GoogleAuthProvider();

export const authService = {
  /**
   * Sign in with Google.
   */
  async signInWithGoogle(): Promise<User | null> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  },

  /**
   * Sign out.
   */
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  },

  /**
   * Checks if current user is an admin via a 'canary' read.
   */
  async isUserAdmin(): Promise<boolean> {
    try {
      const docRef = doc(db, "meta", "adminCheck");
      await getDoc(docRef);
      return true;
    } catch (error) {
      // Permission denied = not an admin
      return false;
    }
  },

  /**
   * Observer for auth state changes.
   */
  onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },
};
