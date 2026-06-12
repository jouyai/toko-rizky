'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Send,
  ExternalLink,
  Loader2,
  CheckCircle,
  Instagram,
  Facebook,
  Twitter,
  Youtube
} from 'lucide-react';
import { toast } from 'sonner';

// Nomor WhatsApp tujuan (format internasional tanpa + / 0), diambil dari env.
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Order Inquiry');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = 'Hubungi Kami | Toko Rizky';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal mengirim pesan.');

      setSubmitted(true);
      toast.success('Pesan Anda telah terkirim!');

      // Reset form after delay
      setTimeout(() => {
        setName('');
        setEmail('');
        setSubject('Order Inquiry');
        setMessage('');
        setSubmitted(false);
      }, 3000);
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengirim pesan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/" className="text-slate-400 hover:text-amber-500 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <span className="text-slate-900 font-bold">Hubungi Kami</span>
      </nav>

      {/* Page Heading */}
      <div className="mb-10">
        <h1 className="text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tight mb-3">
          Hubungi Kami
        </h1>
        <p className="text-slate-500 max-w-2xl">
          Punya pertanyaan tentang pesanan atau butuh saran styling? Tim kami siap membantu memastikan pengalaman belanja Anda di Toko Rizky menjadi luar biasa.
        </p>
      </div>

      {/* Main Content Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column: Contact Form */}
        <div className="bg-white rounded-xl p-6 lg:p-10 shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-tight">Kirim Pesan</h3>

          {submitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Pesan Terkirim!</h4>
              <p className="text-slate-500">Terima kasih telah menghubungi kami. Kami akan segera membalas pesan Anda.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-700">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Masukkan nama lengkap"
                  className="w-full rounded-xl border-2 border-slate-200 bg-white py-4 px-5 focus:ring-0 focus:border-amber-500 focus:shadow-[0_0_0_4px_rgba(245,158,11,0.1)] transition-all duration-200 text-sm text-slate-900 placeholder:text-slate-400 hover:border-slate-300"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-700">
                  Alamat Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="email@contoh.com"
                  className="w-full rounded-xl border-2 border-slate-200 bg-white py-4 px-5 focus:ring-0 focus:border-amber-500 focus:shadow-[0_0_0_4px_rgba(245,158,11,0.1)] transition-all duration-200 text-sm text-slate-900 placeholder:text-slate-400 hover:border-slate-300"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-700">
                  Subjek
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white py-4 px-5 focus:ring-0 focus:border-amber-500 focus:shadow-[0_0_0_4px_rgba(245,158,11,0.1)] transition-all duration-200 text-sm cursor-pointer text-slate-900 hover:border-slate-300 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_16px_center] bg-no-repeat"
                >
                  <option value="Order Inquiry">Pertanyaan Pesanan</option>
                  <option value="Product Information">Informasi Produk</option>
                  <option value="Styling Advice">Saran Styling</option>
                  <option value="Returns & Exchanges">Pengembalian & Penukaran</option>
                  <option value="Feedback">Masukan & Saran</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-700">
                  Pesan
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  placeholder="Ada yang bisa kami bantu?"
                  rows={5}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white py-4 px-5 focus:ring-0 focus:border-amber-500 focus:shadow-[0_0_0_4px_rgba(245,158,11,0.1)] transition-all duration-200 resize-none text-sm text-slate-900 placeholder:text-slate-400 hover:border-slate-300"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 bg-slate-900 hover:bg-amber-500 disabled:bg-slate-300 text-white font-bold py-4 px-8 rounded-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Kirim Pesan
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Contact Info & Map */}
        <div className="flex flex-col gap-8">
          {/* Contact Details */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Hubungi Langsung</h3>

            <div className="flex flex-col gap-5">
              {/* WhatsApp */}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:border-green-500 transition-colors group"
              >
                <div className="bg-green-100 p-3 rounded-lg text-green-600">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900">WhatsApp</p>
                  <p className="text-slate-500 text-sm">Chat langsung dengan tim kami</p>
                  <span className="text-green-600 text-xs font-bold mt-2 flex items-center gap-1 group-hover:underline">
                    Chat Sekarang <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Quick Link */}
      <div className="bg-amber-50 rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6 mt-12">
        <div>
          <h4 className="text-lg font-bold text-slate-900">Mencari jawaban cepat?</h4>
          <p className="text-slate-500 text-sm">Halaman FAQ kami mencakup pertanyaan umum tentang pengiriman, ukuran, dan pengembalian.</p>
        </div>
        <Link
          href="/faq"
          className="bg-white text-amber-500 border-2 border-amber-500 font-bold px-8 py-3 rounded-lg hover:bg-amber-500 hover:text-white transition-all text-xs uppercase tracking-widest whitespace-nowrap"
        >
          Lihat FAQ
        </Link>
      </div>
    </main>
  );
}