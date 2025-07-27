'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login'); // Redirect kalau belum login
    }
  }, [user, router]);

  if (!user) return null; // Jangan render dulu kalau belum login

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center text-indigo-600">Profil Pengguna</h1>
        <div className="space-y-3 text-gray-700">
          <div>
            <strong>Nama:</strong> {user.displayName || 'Tidak ada nama'}
          </div>
          <div>
            <strong>Email:</strong> {user.email}
          </div>
          <div>
            <strong>UID:</strong> {user.uid}
          </div>
        </div>
      </div>
    </div>
  );
}
