import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import PaymentSuccessClient from './PaymentSuccessClient';

export const dynamic = 'force-dynamic';

function PaymentSuccessFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Mengecek Pembayaran...</h1>
        <p className="text-gray-600">Mohon tunggu, kami sedang mengambil status transaksi.</p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessFallback />}>
      <PaymentSuccessClient />
    </Suspense>
  );
}