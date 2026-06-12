'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function TermsPage() {
  return (
    <main className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
      <nav className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/" className="text-slate-400 hover:text-amber-500 transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <span className="text-slate-900 font-bold">Syarat & Ketentuan</span>
      </nav>

      <h1 className="text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tight mb-3">
        Syarat & Ketentuan
      </h1>
      <p className="text-slate-400 text-sm mb-10">Terakhir diperbarui: Juni 2026</p>

      <div className="space-y-8 text-slate-600 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-3">1. Penerimaan Ketentuan</h2>
          <p>
            Dengan mengakses dan menggunakan Toko Rizky, Anda menyetujui untuk terikat oleh syarat dan ketentuan ini.
            Jika Anda tidak setuju, mohon untuk tidak menggunakan layanan kami.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-3">2. Akun Pengguna</h2>
          <p>
            Anda bertanggung jawab menjaga kerahasiaan kredensial akun Anda dan atas semua aktivitas yang terjadi di
            dalamnya. Informasi yang Anda berikan harus akurat dan terkini.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-3">3. Produk & Harga</h2>
          <p>
            Kami berusaha menampilkan informasi produk dan harga seakurat mungkin. Harga dapat berubah sewaktu-waktu
            tanpa pemberitahuan. Ketersediaan produk tidak dijamin dan dapat berubah.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-3">4. Pemesanan & Pembayaran</h2>
          <p>
            Pesanan dianggap sah setelah pembayaran berhasil diverifikasi. Kami berhak menolak atau membatalkan pesanan
            jika terjadi kesalahan harga, kecurigaan penipuan, atau alasan lain yang wajar.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-3">5. Pengiriman & Retur</h2>
          <p>
            Estimasi waktu pengiriman bersifat perkiraan. Ketentuan pengembalian produk mengikuti kebijakan retur kami.
            Detail lebih lanjut tersedia pada halaman{' '}
            <Link href="/shipping" className="text-amber-500 font-bold hover:underline">Pengiriman & Retur</Link>.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-3">6. Batasan Tanggung Jawab</h2>
          <p>
            Toko Rizky tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan layanan ini di
            luar kendali wajar kami. Untuk pertanyaan, silakan{' '}
            <Link href="/contact" className="text-amber-500 font-bold hover:underline">hubungi kami</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
