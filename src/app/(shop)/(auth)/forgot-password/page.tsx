'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { resetPassword } from '@/controllers/authController';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('Email reset password telah dikirim.');
    } catch (err: any) {
      const message =
        err?.code === 'auth/user-not-found'
          ? 'Email tidak terdaftar.'
          : err?.code === 'auth/invalid-email'
            ? 'Format email tidak valid.'
            : 'Gagal mengirim email. Coba lagi.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-amber-500 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Login
        </Link>

        {sent ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Cek Email Anda</h1>
            <p className="text-sm text-slate-500">
              Kami telah mengirim tautan reset password ke <strong>{email}</strong>. Ikuti instruksinya untuk membuat password baru.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Lupa Password</h1>
            <p className="text-sm text-slate-500 mb-6">
              Masukkan email akun Anda. Kami akan mengirim tautan untuk mengatur ulang password.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="email@contoh.com"
                    className="w-full rounded-xl border-2 border-slate-200 bg-white py-3 pl-10 pr-4 text-sm focus:border-amber-500 focus:ring-0 transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 bg-slate-900 hover:bg-amber-500 disabled:bg-slate-300 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kirim Tautan Reset'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
