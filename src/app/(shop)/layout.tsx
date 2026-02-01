'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ReactNode } from 'react';

export default function ShopLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <Navbar />
            <main className="flex-grow min-h-screen">
                {children}
            </main>
            <Footer />
        </>
    );
}
