'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <main className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
      <nav className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/" className="text-slate-400 hover:text-amber-500 transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <span className="text-slate-900 font-bold">Kebijakan Privasi</span>
      </nav>

      <h1 className="text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tight mb-3">
        Kebijakan Privasi
      </h1>
      <p className="text-slate-400 text-sm mb-10">Terakhir diperbarui: Juni 2026</p>

      <div className="space-y-8 text-slate-600 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-3">1. Informasi yang Kami Kumpulkan</h2>
          <p>
            Kami mengumpulkan informasi yang Anda berikan saat membuat akun dan melakukan pemesanan, seperti nama,
            alamat email, nomor telepon, dan alamat pengiriman. Data ini diperlukan untuk memproses pesanan Anda.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-3">2. Penggunaan Informasi</h2>
          <p>
            Informasi Anda digunakan untuk memproses transaksi, mengirim pesanan, memberikan dukungan pelanggan,
            dan menginformasikan pembaruan terkait pesanan Anda. Kami tidak menjual data pribadi Anda kepada pihak ketiga.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-3">3. Keamanan Data</h2>
          <p>
            Kami menggunakan langkah-langkah keamanan yang wajar untuk melindungi data Anda. Pembayaran diproses melalui
            payment gateway tepercaya (Midtrans), dan kami tidak menyimpan detail kartu pembayaran Anda di server kami.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-3">4. Cookie</h2>
          <p>
            Kami menggunakan cookie untuk menjaga sesi login Anda dan meningkatkan pengalaman berbelanja. Anda dapat
            menonaktifkan cookie melalui pengaturan browser, namun beberapa fitur mungkin tidak berfungsi optimal.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-3">5. Hak Anda</h2>
          <p>
            Anda berhak mengakses, memperbarui, atau meminta penghapusan data pribadi Anda. Untuk permintaan tersebut,
            silakan{' '}
            <Link href="/contact" className="text-amber-500 font-bold hover:underline">hubungi kami</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
