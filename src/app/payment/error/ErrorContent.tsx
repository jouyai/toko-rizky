"use client";

import { useSearchParams } from "next/navigation";

export default function ErrorContent() {
  const params = useSearchParams();
  const message = params.get("message") ?? "Transaksi gagal.";
  const orderId = params.get("order_id") ?? undefined;

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-2 text-xl font-semibold">Pembayaran Gagal</h1>
      <p className="text-sm text-gray-600">{message}</p>
      {orderId && <p className="mt-1 text-xs text-gray-500">Order ID: {orderId}</p>}
      <a href="/" className="mt-4 inline-block rounded bg-black px-4 py-2 text-white">
        Kembali ke Beranda
      </a>
    </main>
  );
}
