'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase';

export default function Navbar() {
    const { user } = useAuth();

    const handleLogout = async () => {
        await signOut(auth);
    };

    return (
        <nav className="w-full bg-white shadow-md py-4 px-6 flex justify-between items-center sticky top-0 z-50">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
                TokoRizky
            </Link>
            <div className="space-x-4">
            <Link href="/" className="text-gray-700 hover:text-indigo-600">
                    Beranda
                </Link>
                <Link href="/product" className="text-gray-700 hover:text-indigo-600">
                    Produk
                </Link>
                <Link href="/dashboard/products" className="text-gray-700 hover:text-indigo-600">
                    Dashboard Produk
                </Link>


                {user ? (
                    <>
                        <Link href="/profile" className="text-gray-700 hover:text-indigo-600">
                            Profile
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            href="/login"
                            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md"
                        >
                            Login
                        </Link>
                        <Link
                            href="/register"
                            className="text-indigo-500 border border-indigo-500 hover:bg-indigo-50 px-4 py-2 rounded-md"
                        >
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}