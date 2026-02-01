'use client';

import { useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext'; // Import useAuth

export default function CreateAdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth(); // Dapatkan status user dan loading
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Redirect jika user sudah login
  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      await updateProfile(newUser, {
        displayName: name,
      });

      await setDoc(doc(db, 'users', newUser.uid), {
        name: name,
        email: email,
        role: 'admin',
      });

      // Arahkan ke halaman utama setelah berhasil
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Gagal membuat akun admin');
    }
  };

  // Tampilkan loading atau null jika user sudah login untuk mencegah form muncul sesaat
  if (loading || user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md border-2 border-red-500">
        <h2 className="text-2xl font-bold mb-2 text-center text-red-600">Buat Akun Admin Baru</h2>
        <p className="text-center text-sm text-gray-600 mb-6">Halaman ini hanya untuk development. Jangan digunakan di produksi.</p>

        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nama Lengkap Admin</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition"
          >
            Buat Admin
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Kembali ke halaman{' '}
          <Link href="/login" className="text-indigo-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
