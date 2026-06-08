"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ErrorContent() {
  const params = useSearchParams();
  const message = params.get("message") ?? "Transaksi gagal.";
  const orderId = params.get("order_id") ?? undefined;

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-2 text-xl font-black uppercase tracking-tight text-slate-900">Pembayaran Gagal</h1>
      <p className="text-sm text-slate-600">{message}</p>
      {orderId && <p className="mt-1 text-xs text-slate-500">Order ID: {orderId}</p>}
      <Link href="/" className="mt-4 inline-flex items-center rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-amber-500 transition-colors">
        Kembali ke Beranda
      </Link>
    </main>
  );
}
