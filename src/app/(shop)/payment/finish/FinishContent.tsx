'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { updateOrderStatus } from '@/controllers/orderController';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function FinishContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Ambil parameter dari URL yang dikirim Midtrans
  const orderId = searchParams.get('order_id');
  const transactionStatus = searchParams.get('transaction_status'); // settlement / capture / pending
  const statusCode = searchParams.get('status_code'); // 200 / 201

  const [isUpdating, setIsUpdating] = useState(true);
  const [message, setMessage] = useState('Memverifikasi pembayaran...');

  useEffect(() => {
    const confirmOrderUpdate = async () => {
      if (!orderId) {
        setIsUpdating(false);
        return;
      }

      try {
        // Cek status dari URL parameter Midtrans
        // Jika status_code 200 dan transaction_status settlement/capture -> Success
        if (statusCode === '200' && (transactionStatus === 'settlement' || transactionStatus === 'capture')) {

          const orderRef = doc(db, 'orders', orderId);

          // Cek dulu apakah order ada
          const orderSnap = await getDoc(orderRef);

          if (orderSnap.exists()) {
            await updateOrderStatus(orderId, 'paid', {
              paymentMethod: 'midtrans',
            });
            setMessage('Pembayaran Berhasil! Pesanan sedang diproses.');
          }
        } else if (transactionStatus === 'pending') {
            setMessage('Menunggu pembayaran diselesaikan.');
        } else {
            setMessage('Status pembayaran belum terkonfirmasi otomatis. Silakan cek berkala.');
        }

      } catch (error) {
        console.error("Gagal update status:", error);
        setMessage('Terjadi kesalahan saat memperbarui status pesanan.');
      } finally {
        setIsUpdating(false);
      }
    };

    confirmOrderUpdate();
  }, [orderId, statusCode, transactionStatus]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        
        {isUpdating ? (
          <Loader2 className="w-16 h-16 text-amber-500 animate-spin mx-auto mb-4" />
        ) : statusCode === '200' ? (
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        ) : (
          <XCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        )}

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {isUpdating ? 'Memproses...' : statusCode === '200' ? 'Terima Kasih!' : 'Status Pembayaran'}
        </h1>

        <p className="text-slate-600 mb-6">{message}</p>

        {orderId && (
            <div className="bg-slate-100 p-3 rounded mb-6 text-sm font-mono text-slate-500">
                Order ID: {orderId}
            </div>
        )}

        <div className="grid gap-3">
          <Link href="/profile" className="block w-full bg-slate-900 hover:bg-amber-500 text-white rounded-xl py-3.5 text-sm font-bold uppercase tracking-widest text-center transition-all">
            Lihat Riwayat Pesanan
          </Link>
          <Link href="/" className="block w-full border-2 border-slate-200 text-slate-700 hover:border-slate-900 rounded-xl py-3.5 text-sm font-bold uppercase tracking-widest text-center transition-all">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}