'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/lib/CartContext';
import { updateOrderStatus } from '@/controllers/orderController';

type PaymentStatus = {
  orderId: string;
  status: string;
  transactionId: string | null;
  paymentType: string | null;
  transactionStatus: string | null;
};

export default function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const fallbackTransactionId =
    searchParams.get('transaction_id') ||
    searchParams.get('transactionId') ||
    searchParams.get('id') ||
    searchParams.get('payment_id');

  const { clearCart } = useCart();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState('');
  const [hasClearedCart, setHasClearedCart] = useState(false);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!orderId) {
        setError('Order ID tidak ditemukan.');
        setIsChecking(false);
        return;
      }

      try {
        const response = await fetch(`/api/create-transaction?order_id=${encodeURIComponent(orderId)}`, {
          cache: 'no-store',
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Gagal mengecek status pembayaran.');
        }

        setPaymentStatus(data);

        if (!hasClearedCart && (data.status === 'paid' || data.status === 'success' || data.transactionId)) {
          await Promise.allSettled([
            clearCart(),
            updateOrderStatus(orderId, data.status || 'paid', {
              transactionId: data.transactionId || null,
              paymentType: data.paymentType || null,
              transactionStatus: data.transactionStatus || null,
              fraudStatus: data.fraudStatus || null,
            }),
          ]);
          setHasClearedCart(true);
        }
      } catch (err: any) {
        setError(err.message || 'Gagal mengecek status pembayaran.');
      } finally {
        setIsChecking(false);
      }
    };

    checkPaymentStatus();
  }, [orderId, clearCart, hasClearedCart]);

  const displayStatus = paymentStatus?.status || (isChecking ? 'Checking' : 'Success');
  const displayTransactionId = paymentStatus?.transactionId || fallbackTransactionId || 'N/A';
  const isPaid = displayStatus === 'paid' || displayStatus === 'settlement' || displayStatus === 'capture';
  const isPending = displayStatus === 'pending' || displayStatus === 'Checking';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
        <div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
            error ? 'bg-amber-100' : isPending ? 'bg-amber-100' : 'bg-green-100'
          }`}
        >
          {isChecking ? (
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          ) : error ? (
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          ) : (
            <CheckCircle className="h-8 w-8 text-green-600" />
          )}
        </div>

        <h1 className="mb-2 text-2xl font-bold text-slate-900">
          {isChecking
            ? 'Mengecek Pembayaran...'
            : error
              ? 'Pembayaran Perlu Dicek'
              : isPaid
                ? 'Payment Successful!'
                : 'Payment Pending'}
        </h1>

        <p className="mb-6 text-slate-600">
          {isChecking
            ? 'Mohon tunggu, kami sedang mengambil status transaksi dari Midtrans.'
            : error
              ? 'Pembayaran berhasil diarahkan, tetapi status terbaru belum bisa diambil otomatis.'
              : isPaid
                ? 'Thank you for your purchase. We have received your payment.'
                : 'Transaksi Anda masih menunggu konfirmasi pembayaran.'}
        </p>

        {error && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-left text-sm text-amber-700">
            {error}
          </div>
        )}

        <div className="mb-6 rounded-lg bg-slate-50 p-3 text-left text-sm">
          <div className="mb-1 flex justify-between gap-4">
            <span className="text-slate-500">Order ID:</span>
            <span className="font-mono font-medium text-slate-800">{orderId || 'N/A'}</span>
          </div>
          <div className="mb-1 flex justify-between gap-4">
            <span className="text-slate-500">Status:</span>
            <span className={`font-medium ${isPaid ? 'text-green-600' : 'text-amber-600'}`}>
              {displayStatus}
            </span>
          </div>
          <div className="mb-1 flex justify-between gap-4">
            <span className="text-slate-500">Transaction ID:</span>
            <span className="break-all text-right font-mono font-medium text-slate-800">
              {displayTransactionId}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Payment Type:</span>
            <span className="font-medium text-slate-800">{paymentStatus?.paymentType || 'N/A'}</span>
          </div>
        </div>

        <Link
          href="/profile"
          className="inline-block w-full rounded-xl bg-slate-900 px-6 py-3 font-bold text-white transition-colors hover:bg-amber-500 text-xs uppercase tracking-widest"
        >
          Lihat Pesanan
        </Link>
      </div>
    </div>
  );
}