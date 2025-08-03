'use client'; // <-- TAMBAHKAN BARIS INI

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

// Tambahkan tipe untuk data pengguna dari Firestore
interface UserProfile {
  name: string;
  email: string;
  role: 'admin' | 'buyer';
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null; // Tambahkan state untuk profil pengguna
  loading: boolean; // Tambahkan state loading
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (!authUser) {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setUserProfile(doc.data() as UserProfile);
        }
        setLoading(false);
      });
      return () => unsubProfile();
    }
  }, [user]);


  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);