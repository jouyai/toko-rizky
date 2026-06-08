import './globals.css';
import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/AuthContext';
import { ToastProvider } from '@/components/ToastProvider';
import { CartProvider } from '@/lib/CartContext';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Toko Rizky - Belanja Online Terpercaya',
    template: '%s | Toko Rizky',
  },
  description: 'Temukan produk berkualitas dengan harga terbaik di Toko Rizky.',
  keywords: ['toko online', 'fashion', 'aksesoris', 'belanja murah'],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          <CartProvider>
            <ToastProvider />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}