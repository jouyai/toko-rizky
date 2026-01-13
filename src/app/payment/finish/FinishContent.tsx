'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
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
    const updateOrderStatus = async () => {
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
            // LAKUKAN UPDATE STATUS KE SUCCESS
            await updateDoc(orderRef, {
              status: 'success',
              paymentMethod: 'midtrans',
              updatedAt: new Date()
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

    updateOrderStatus();
  }, [orderId, statusCode, transactionStatus]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        
        {isUpdating ? (
          <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mx-auto mb-4" />
        ) : statusCode === '200' ? (
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        ) : (
          <XCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        )}

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {isUpdating ? 'Memproses...' : statusCode === '200' ? 'Terima Kasih!' : 'Status Pembayaran'}
        </h1>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        {orderId && (
            <div className="bg-gray-100 p-3 rounded mb-6 text-sm font-mono text-gray-500">
                Order ID: {orderId}
            </div>
        )}

        <div className="grid gap-3">
          <Link href="/profile">
             <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Lihat Riwayat Pesanan</Button>
          </Link>
          <Link href="/">
             <Button variant="outline" className="w-full">Kembali ke Beranda</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}