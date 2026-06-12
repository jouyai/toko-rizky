'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQS = [
  {
    q: 'Bagaimana cara memesan produk?',
    a: 'Pilih produk yang Anda inginkan, tentukan ukuran dan jumlah, lalu tambahkan ke keranjang. Setelah itu lanjutkan ke checkout dan selesaikan pembayaran.',
  },
  {
    q: 'Metode pembayaran apa saja yang tersedia?',
    a: 'Kami menerima pembayaran melalui transfer bank, kartu kredit/debit, dan e-wallet yang difasilitasi oleh Midtrans sebagai payment gateway kami.',
  },
  {
    q: 'Berapa lama waktu pengiriman?',
    a: 'Pengiriman Regular memakan waktu 2-4 hari kerja, Express 1-2 hari kerja, dan Same Day untuk area tertentu. Estimasi dapat berbeda tergantung lokasi.',
  },
  {
    q: 'Apakah ada gratis ongkir?',
    a: 'Ya, Anda mendapatkan gratis ongkos kirim untuk pembelian di atas Rp 500.000.',
  },
  {
    q: 'Bagaimana kebijakan pengembalian (retur)?',
    a: 'Produk dapat diretur dalam 14 hari setelah diterima, dengan syarat masih dalam kondisi asli beserta label. Pengembalian dana diproses dalam 5-7 hari kerja.',
  },
  {
    q: 'Bagaimana cara mengetahui ukuran yang tepat?',
    a: 'Silakan kunjungi halaman Panduan Ukuran kami untuk tabel ukuran lengkap dan cara mengukur tubuh Anda dengan benar.',
  },
  {
    q: 'Bagaimana jika saya lupa password?',
    a: 'Pada halaman login, klik "Lupa Password", masukkan email Anda, dan ikuti tautan reset yang kami kirim ke email tersebut.',
  },
];

export default function FaqPage() {
  return (
    <main className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
      <nav className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/" className="text-slate-400 hover:text-amber-500 transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <span className="text-slate-900 font-bold">FAQ</span>
      </nav>

      <div className="mb-10">
        <h1 className="text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tight mb-3">
          Pertanyaan Umum
        </h1>
        <p className="text-slate-500">
          Temukan jawaban atas pertanyaan yang paling sering diajukan. Tidak menemukan jawaban?{' '}
          <Link href="/contact" className="text-amber-500 font-bold hover:underline">Hubungi kami</Link>.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {FAQS.map((item, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left font-bold text-slate-900">{item.q}</AccordionTrigger>
            <AccordionContent className="text-slate-600 leading-relaxed">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </main>
  );
}
