'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useCart } from '@/lib/CartContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase';
import { Heart, Search, User, LogOut, Settings, FileText, Menu, X, ShoppingCart, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const { user, userProfile } = useAuth();
    const { itemCount = 0 } = useCart();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/');
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur-md">
            <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-4 md:gap-8">
                {/* Logo & Nav Links */}
                <div className="flex items-center gap-8 lg:gap-12 shrink-0">
                    <Link href="/" className="flex items-center gap-2">
                        <h2 className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 uppercase">
                            Toko Rizky
                        </h2>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
                        <Link href="/product" className="text-xs font-bold uppercase tracking-widest hover:text-amber-500 transition-colors">
                            Produk Baru
                        </Link>
                        <Link href="/product?category=pria" className="text-xs font-bold uppercase tracking-widest hover:text-amber-500 transition-colors">
                            Pria
                        </Link>
                        <Link href="/product?category=wanita" className="text-xs font-bold uppercase tracking-widest hover:text-amber-500 transition-colors">
                            Wanita
                        </Link>
                        <Link href="/about" className="text-xs font-bold uppercase tracking-widest hover:text-amber-500 transition-colors">
                            Tentang
                        </Link>
                        <Link href="/contact" className="text-xs font-bold uppercase tracking-widest hover:text-amber-500 transition-colors">
                            Kontak
                        </Link>
                    </nav>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex items-center border-b border-slate-200 py-1 group focus-within:border-slate-900 transition-colors">
                        <Search className="w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari produk..."
                            className="bg-transparent border-none focus:ring-0 text-sm w-32 lg:w-40 px-2 placeholder:text-slate-400 font-medium"
                        />
                    </div>

                    {/* Search Button - Mobile */}
                    <button
                        className="p-2 hover:text-amber-500 transition-colors md:hidden"
                        onClick={() => setSearchOpen(!searchOpen)}
                    >
                        <Search className="w-5 h-5" />
                    </button>

                    {/* Icons */}
                    <div className="flex items-center gap-1 md:gap-2">
                        <Link href="/wishlist" className="p-2 hover:text-amber-500 transition-colors hidden sm:flex">
                            <Heart className="w-5 h-5" />
                        </Link>

                        <Link href="/cart" className="p-2 hover:text-amber-500 transition-colors relative">
                            <ShoppingCart className="w-5 h-5" />
                            {itemCount > 0 && (
                                <span className="absolute top-0.5 right-0.5 bg-amber-500 text-[10px] text-white font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                    {itemCount > 9 ? '9+' : itemCount}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="p-2 hover:text-amber-500 transition-colors outline-none">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden hover:border-amber-500 transition-colors">
                                            {user.photoURL ? (
                                                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-5 h-5 text-slate-600" />
                                            )}
                                        </div>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-100 shadow-lg rounded-xl p-2 z-[60]">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-bold leading-none text-slate-900">{userProfile?.name || 'User'}</p>
                                            <p className="text-xs leading-none text-slate-500 truncate">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-slate-100 my-2" />

                                    {userProfile?.role === 'admin' && (
                                        <>
                                            <DropdownMenuItem asChild>
                                                <Link href="/dashboard" className="cursor-pointer text-amber-600 font-bold flex items-center gap-2 focus:bg-amber-50 focus:text-amber-700 rounded-lg px-2 py-2">
                                                    <LayoutDashboard className="w-4 h-4" />
                                                    <span>Dashboard Admin</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-slate-100 my-2" />
                                        </>
                                    )}

                                    <DropdownMenuItem asChild>
                                        <Link href="/profile" className="cursor-pointer flex items-center gap-2 text-slate-600 hover:text-slate-900 focus:bg-slate-50 rounded-lg px-2 py-2">
                                            <User className="w-4 h-4" />
                                            <span>Profile Saya</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/orders" className="cursor-pointer flex items-center gap-2 text-slate-600 hover:text-slate-900 focus:bg-slate-50 rounded-lg px-2 py-2">
                                            <FileText className="w-4 h-4" />
                                            <span>Pesanan Saya</span>
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator className="bg-slate-100 my-2" />

                                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 rounded-lg px-2 py-2 flex items-center gap-2">
                                        <LogOut className="w-4 h-4" />
                                        <span>Logout</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="hidden sm:flex items-center gap-2">
                                <Link href="/login">
                                    <button className="text-xs font-bold uppercase tracking-widest hover:text-amber-500 transition-colors px-4 py-2">
                                        Login
                                    </button>
                                </Link>
                                <Link href="/register">
                                    <button className="bg-slate-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-amber-500 transition-colors px-4 py-2">
                                        Register
                                    </button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            className="p-2 hover:text-amber-500 transition-colors lg:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Search Bar */}
            {searchOpen && (
                <div className="md:hidden border-t border-slate-100 px-4 py-3 bg-white">
                    <div className="flex items-center border border-slate-200 rounded px-3 py-2">
                        <Search className="w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari produk..."
                            className="bg-transparent border-none focus:ring-0 text-sm w-full px-2 placeholder:text-slate-400 font-medium"
                            autoFocus
                        />
                    </div>
                </div>
            )}

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t border-slate-100 bg-white">
                    <nav className="flex flex-col px-4 py-4 space-y-1">
                        <Link
                            href="/product"
                            className="text-xs font-bold uppercase tracking-widest hover:text-amber-500 transition-colors py-3 border-b border-slate-50"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Produk Baru
                        </Link>
                        {/* More mobile links... simplified for brevity if needed but keeping them is safer */}
                        <Link
                            href="/product?category=pria"
                            className="text-xs font-bold uppercase tracking-widest hover:text-amber-500 transition-colors py-3 border-b border-slate-50"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Pria
                        </Link>
                        <Link
                            href="/product?category=wanita"
                            className="text-xs font-bold uppercase tracking-widest hover:text-amber-500 transition-colors py-3 border-b border-slate-50"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Wanita
                        </Link>

                        {userProfile?.role === 'admin' && (
                            <Link
                                href="/dashboard"
                                className="text-xs font-bold uppercase tracking-widest text-amber-600 hover:text-amber-500 transition-colors py-3 border-b border-slate-50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Dashboard Admin
                            </Link>
                        )}

                        {!user && (
                            <div className="flex gap-2 pt-4">
                                <Link href="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                                    <button className="w-full border border-slate-200 text-xs font-bold uppercase tracking-widest hover:border-slate-900 transition-colors px-4 py-3">
                                        Login
                                    </button>
                                </Link>
                                <Link href="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                                    <button className="w-full bg-slate-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-amber-500 transition-colors px-4 py-3">
                                        Register
                                    </button>
                                </Link>
                            </div>
                        )}

                        {user && (
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setMobileMenuOpen(false);
                                }}
                                className="text-xs font-bold uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors py-3 text-left w-full"
                            >
                                Logout
                            </button>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}