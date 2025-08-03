import './globals.css';
import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import { ToastProvider } from '@/components/ToastProvider';
import { CartProvider } from '@/lib/CartContext';
import Footer from '@/components/Footer';
import type { Metadata } from 'next'; // 1. Impor tipe Metadata

// 2. Tambahkan objek metadata
export const metadata: Metadata = {
  title: {
    default: 'Toko Rizky - Belanja Online Terpercaya', // Judul default untuk halaman utama
    template: '%s | Toko Rizky', // Template untuk halaman lain
  },
  description: 'Temukan produk berkualitas dengan harga terbaik di Toko Rizky.',
  keywords: ['toko online', 'fashion', 'aksesoris', 'belanja murah'],
};


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <ToastProvider />
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="container mx-auto px-4 py-6 flex-grow">{children}</main>
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
