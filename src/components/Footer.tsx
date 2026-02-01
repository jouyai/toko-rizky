'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Globe, Smartphone, Mail, Instagram, Facebook, Twitter } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Subscribe:', email);
    setEmail('');
  };

  return (
    <footer className="bg-white border-t border-slate-100 pt-16 md:pt-20 pb-8 md:pb-10">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16 mb-16 md:mb-20">
          {/* Brand Column */}
          <div className="space-y-6">
            <h2 className="text-xl font-black uppercase tracking-tighter">Toko Rizky</h2>
            <p className="text-slate-500 text-xs leading-relaxed uppercase tracking-widest">
              Mendefinisikan elegansi modern sejak 2024. Koleksi esensial untuk gaya kontemporer Anda.
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-slate-200 text-slate-400 hover:text-white hover:bg-slate-900 hover:border-slate-900 transition-all duration-300 rounded"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-slate-200 text-slate-400 hover:text-white hover:bg-slate-900 hover:border-slate-900 transition-all duration-300 rounded"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-slate-200 text-slate-400 hover:text-white hover:bg-slate-900 hover:border-slate-900 transition-all duration-300 rounded"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="mailto:info@tokoriky.com"
                className="w-10 h-10 flex items-center justify-center border border-slate-200 text-slate-400 hover:text-white hover:bg-slate-900 hover:border-slate-900 transition-all duration-300 rounded"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Collections Column */}
          <div>
            <h4 className="font-black mb-6 md:mb-8 text-[10px] uppercase tracking-[0.2em]">Koleksi</h4>
            <ul className="space-y-3 md:space-y-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <li>
                <Link href="/product?category=pria" className="hover:text-slate-900 transition-colors">
                  Koleksi Pria
                </Link>
              </li>
              <li>
                <Link href="/product?category=wanita" className="hover:text-slate-900 transition-colors">
                  Koleksi Wanita
                </Link>
              </li>
              <li>
                <Link href="/product" className="hover:text-slate-900 transition-colors">
                  Produk Terbaru
                </Link>
              </li>
              <li>
                <Link href="/product?category=aksesoris" className="hover:text-slate-900 transition-colors">
                  Aksesoris
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="font-black mb-6 md:mb-8 text-[10px] uppercase tracking-[0.2em]">Bantuan</h4>
            <ul className="space-y-3 md:space-y-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <li>
                <Link href="/size-guide" className="hover:text-slate-900 transition-colors">
                  Panduan Ukuran
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-slate-900 transition-colors">
                  Pengiriman & Retur
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-slate-900 transition-colors">
                  Hubungi Kami
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-slate-900 transition-colors">
                  Tentang Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="font-black mb-6 md:mb-8 text-[10px] uppercase tracking-[0.2em]">Newsletter</h4>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-6">
              Daftar untuk akses awal dan pratinjau koleksi terbaru.
            </p>
            <form onSubmit={handleSubscribe}>
              <div className="flex border-b border-slate-200 pb-2 focus-within:border-slate-900 transition-colors">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Alamat Email"
                  required
                  className="flex-1 bg-transparent border-none text-[10px] font-bold uppercase tracking-widest focus:ring-0 px-0 placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="text-[10px] font-black uppercase tracking-widest hover:text-amber-500 transition-colors"
                >
                  Daftar
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 pt-8 md:pt-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 text-center md:text-left">
            © {new Date().getFullYear()} Toko Rizky Fashion Group. All rights reserved.
          </p>
          <div className="flex gap-6 md:gap-8 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
