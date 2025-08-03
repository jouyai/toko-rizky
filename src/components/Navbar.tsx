'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, LogOut, Wrench } from 'lucide-react';

export default function Navbar() {
    // Ambil user dan userProfile dari AuthContext
    const { user, userProfile } = useAuth();

    const handleLogout = async () => {
        await signOut(auth);
    };

    return (
        <nav className="w-full bg-white/80 shadow-md backdrop-blur-md py-3 px-6 flex justify-between items-center sticky top-0 z-50">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
                TokoRizky
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-2">
                <Link href="/" passHref>
                    <Button variant="ghost">Beranda</Button>
                </Link>
                <Link href="/product" passHref>
                    <Button variant="ghost">Produk</Button>
                </Link>
                 <Link href="/about" passHref>
                    <Button variant="ghost">Tentang Kami</Button>
                </Link>
                <Link href="/contact" passHref>
                    <Button variant="ghost">Kontak</Button>
                </Link>
            </div>

            {/* Actions and Auth */}
            <div className="flex items-center gap-3">
                <Link href="/cart" passHref>
                    <Button variant="outline" size="icon">
                        <ShoppingCart className="h-4 w-4" />
                        <span className="sr-only">Keranjang Belanja</span>
                    </Button>
                </Link>

                {user ? (
                    <>
                        {/* Tampilkan tombol Dashboard HANYA jika role user adalah 'admin' */}
                        {userProfile?.role === 'admin' && (
                            <Link href="/dashboard/products" passHref>
                                <Button variant="outline" size="icon">
                                    <Wrench className="h-4 w-4" />
                                    <span className="sr-only">Dashboard</span>
                                </Button>
                            </Link>
                        )}
                        <Link href="/profile" passHref>
                            <Button variant="outline" size="icon">
                                <User className="h-4 w-4" />
                                <span className="sr-only">Profil</span>
                            </Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={handleLogout}>
                            <LogOut className="h-4 w-4" />
                            <span className="sr-only">Logout</span>
                        </Button>
                    </>
                ) : (
                    <>
                        <Link href="/login" passHref>
                           <Button>Login</Button>
                        </Link>
                        <Link href="/register" passHref>
                           <Button variant="outline">Register</Button>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
