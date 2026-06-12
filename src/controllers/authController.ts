import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, updateDoc, Unsubscribe } from 'firebase/firestore';
import { auth, db } from '@/firebase';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserProfile {
  name: string;
  email: string;
  role: 'admin' | 'buyer';
  phone?: string;
  address?: string;
}

export interface AuthResult {
  user: User;
  profile: UserProfile;
}

// ─── Profile real-time listener ──────────────────────────────────────────────

export function listenUserProfile(
  userId: string,
  callback: (profile: UserProfile | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, 'users', userId), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as UserProfile);
    } else {
      callback(null);
    }
  });
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const docSnap = await getDoc(doc(db, 'users', userId));
  if (!docSnap.exists()) return null;
  return docSnap.data() as UserProfile;
}

// ─── Auth operations ─────────────────────────────────────────────────────────

export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<AuthResult> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(credential.user, { displayName: name });

  const profile: UserProfile = {
    name,
    email,
    role: 'buyer',
  };

  await setDoc(doc(db, 'users', credential.user.uid), profile);

  return { user: credential.user, profile };
}

export async function loginUser(
  email: string,
  password: string
): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

// ─── Role helpers ────────────────────────────────────────────────────────────

export function isAdmin(profile: UserProfile | null): boolean {
  return profile?.role === 'admin';
}

export function checkAdminOrRedirect(
  profile: UserProfile | null,
  loading: boolean,
  onRedirect: () => void
): boolean {
  if (loading) return false;
  if (!profile || profile.role !== 'admin') {
    onRedirect();
    return false;
  }
  return true;
}

export async function updateUserProfile(
  userId: string,
  data: { name: string }
): Promise<void> {
  await updateDoc(doc(db, 'users', userId), { name: data.name });
  const user = auth.currentUser;
  if (user) {
    await updateProfile(user, { displayName: data.name });
  }
}
