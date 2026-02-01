'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Gem,
  Leaf,
  Handshake,
  ArrowRight,
  Quote
} from 'lucide-react';

export default function AboutPage() {
  useEffect(() => {
    document.title = 'Tentang Kami | Toko Rizky';
  }, []);

  return (
    <main className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-[1200px] px-4 sm:px-6 mt-6">
        <div
          className="relative min-h-[480px] lg:min-h-[520px] rounded-2xl overflow-hidden flex flex-col items-center justify-center text-center p-8"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url("https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1600&auto=format&fit=crop")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="max-w-3xl space-y-6">
            <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight uppercase">
              Mengangkat Fashion Melalui Seni
            </h1>
            <p className="text-slate-100 text-lg md:text-xl font-medium max-w-2xl mx-auto opacity-90">
              Temukan perjalanan Toko Rizky, di mana kerajinan tradisional bertemu dengan sensibilitas fashion modern.
            </p>
            <div className="pt-4">
              <Link
                href="/product"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-lg font-bold text-sm uppercase tracking-widest transition-all hover:scale-105"
              >
                Jelajahi Koleksi
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="w-full max-w-[1200px] px-4 sm:px-6 mt-8">
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/" className="text-slate-400 hover:text-amber-500 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <span className="text-slate-900 font-bold">Tentang Kami</span>
        </nav>
      </div>

      {/* Our Story Section */}
      <section className="w-full max-w-[1200px] px-4 sm:px-6 py-16 lg:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-3 py-1 rounded bg-amber-100 text-amber-600 text-xs font-bold uppercase tracking-widest">
              Sejak 2012
            </div>
            <h2 className="text-slate-900 text-3xl lg:text-4xl font-black leading-tight uppercase tracking-tight">
              Warisan di Setiap Jahitan
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              Didirikan dengan passion untuk kualitas, Toko Rizky dimulai sebagai workshop butik kecil di jantung kota. Apa yang dimulai sebagai proyek personal untuk mendefinisikan ulang keanggunan kasual telah tumbuh menjadi destinasi fashion terkemuka.
            </p>
            <p className="text-slate-500 text-lg leading-relaxed">
              Selama bertahun-tahun, kami telah berkomitmen untuk memberikan keunggulan dalam setiap siluet. Kami percaya bahwa apa yang Anda kenakan adalah perpanjangan dari identitas Anda, dan kami berusaha membuat ekspresi itu seindah mungkin.
            </p>
            <div className="flex gap-8 pt-4">
              <div>
                <span className="block text-3xl font-black text-amber-500">12+</span>
                <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Tahun Pengalaman</span>
              </div>
              <div>
                <span className="block text-3xl font-black text-amber-500">50k+</span>
                <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Pelanggan Puas</span>
              </div>
              <div>
                <span className="block text-3xl font-black text-amber-500">100%</span>
                <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Bahan Etis</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-2xl">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop")` }}
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl max-w-[240px] border border-slate-100">
              <Quote className="w-8 h-8 text-amber-500 mb-2" />
              <p className="italic text-sm text-slate-600">"Fashion adalah armor untuk bertahan dalam realita kehidupan sehari-hari."</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values Section */}
      <section className="w-full bg-white py-20 lg:py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-amber-500 font-bold uppercase tracking-widest text-xs">Misi Kami</h2>
            <h3 className="text-slate-900 text-3xl lg:text-4xl font-black uppercase tracking-tight">
              Fashion Berkesadaran untuk Jiwa Modern
            </h3>
            <p className="text-slate-500 text-lg">
              Kami percaya pada fashion yang menghormati bumi dan orang-orang yang membuatnya, tanpa mengorbankan kemewahan.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="group p-8 rounded-2xl border border-slate-100 bg-slate-50 hover:border-amber-200 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Gem className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-slate-900">Kualitas Premium</h4>
              <p className="text-slate-500">
                Kami hanya menggunakan kain berkelanjutan terbaik untuk daya tahan yang lama dan kenyamanan tak tertandingi di setiap produk.
              </p>
            </div>
            <div className="group p-8 rounded-2xl border border-slate-100 bg-slate-50 hover:border-amber-200 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600 mb-6 group-hover:bg-green-500 group-hover:text-white transition-colors">
                <Leaf className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-slate-900">Berkelanjutan</h4>
              <p className="text-slate-500">
                Proses kami memprioritaskan bahan ramah lingkungan dan produksi etis untuk meminimalkan jejak lingkungan.
              </p>
            </div>
            <div className="group p-8 rounded-2xl border border-slate-100 bg-slate-50 hover:border-amber-200 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Handshake className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-slate-900">Kerajinan Lokal</h4>
              <p className="text-slate-500">
                Setiap produk adalah bukti keterampilan pengrajin lokal kami, menjaga teknik tradisional tetap hidup di era modern.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full max-w-[1200px] px-4 sm:px-6 pb-16 lg:pb-24">
        <div className="bg-slate-100 rounded-2xl p-8 lg:p-12 text-center space-y-6">
          <h2 className="text-2xl lg:text-3xl font-black max-w-xl mx-auto text-slate-900 uppercase tracking-tight">
            Siap Merasakan Kualitas Sejati?
          </h2>
          <p className="text-slate-500 text-lg max-w-lg mx-auto">
            Jelajahi koleksi terbaru kami dan temukan tambahan sempurna untuk lemari pakaian Anda.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Link
              href="/product"
              className="bg-slate-900 hover:bg-amber-500 text-white px-10 py-4 rounded-lg font-bold transition-all text-xs uppercase tracking-widest"
            >
              Belanja Koleksi
            </Link>
            <Link
              href="/contact"
              className="bg-white text-slate-900 hover:bg-slate-50 px-10 py-4 rounded-lg font-bold border border-slate-200 transition-all text-xs uppercase tracking-widest"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
