import './globals.css';
import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import { ToastProvider } from '@/components/ToastProvider';
import { CartProvider } from '@/lib/CartContext'; // <-- Impor CartProvider

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider> {/* <-- Bungkus dengan CartProvider */}
            <ToastProvider />
            <Navbar />
            <main className="container mx-auto px-4 py-6">{children}</main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}