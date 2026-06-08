'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useCart } from '@/lib/CartContext';
import { updateOrderStatus } from '@/controllers/orderController';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');
    const transactionId = searchParams.get('transaction_id');
    const { user } = useAuth();
    const { clearCart } = useCart();
    const [isUpdated, setIsUpdated] = useState(false);

    useEffect(() => {
        const confirmPayment = async () => {
            if (orderId && user) {
                try {
                    await updateOrderStatus(orderId, 'paid', {
                        transactionId: transactionId || 'N/A',
                    });
                    await clearCart();
                    setIsUpdated(true);
                } catch (error) {
                    console.error("Gagal update status:", error);
                }
            }
        };
        confirmPayment();
    }, [orderId, user, transactionId]);

    return (
        <div className="max-w-md mx-auto py-20 text-center space-y-6">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
            <h1 className="text-2xl font-black uppercase">Pembayaran Berhasil!</h1>
            <p className="text-slate-500">Pesanan {orderId} sedang kami proses.</p>
            {!isUpdated && <div className="flex items-center justify-center gap-2 text-xs text-amber-600"><Loader2 className="w-3 h-3 animate-spin" /> Mengonfirmasi status...</div>}
            <div className="bg-slate-50 p-4 rounded-lg border text-sm text-left">
                <p>Transaction ID: <span className="font-bold">{transactionId || 'N/A'}</span></p>
            </div>
            <Link href="/profile" className="block w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-amber-500 transition-colors">Lihat Pesanan</Link>
        </div>
    );
}