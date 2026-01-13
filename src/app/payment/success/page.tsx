'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id');
  const [status, setStatus] = useState('Memproses...');

  useEffect(() => {
    const updateOrderStatus = async () => {
      if (orderId) {
        try {
          const orderRef = doc(db, 'orders', orderId);
          // Update status order menjadi success
          await updateDoc(orderRef, {
            status: 'success',
            paymentDate: new Date()
          });
          setStatus('Pembayaran Berhasil Dikonfirmasi!');
        } catch (error) {
          console.error("Gagal update status:", error);
          setStatus('Pembayaran berhasil, namun gagal mengupdate status. Hubungi admin.');
        }
      }
    };

    updateOrderStatus();
  }, [orderId]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
      <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Terima Kasih!</h1>
      <p className="text-gray-600 mb-6">{status}</p>
      <p className="text-sm text-gray-500 mb-8">Order ID: {orderId}</p>
      <div className="space-x-4">
        <Button onClick={() => router.push('/')} variant="outline">Kembali ke Beranda</Button>
        <Button onClick={() => router.push('/profile')}>Lihat Pesanan Saya</Button>
      </div>
    </div>
  );
}