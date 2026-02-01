'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('Email tidak terdaftar');
      } else if (err.code === 'auth/wrong-password') {
        setError('Password salah');
      } else if (err.code === 'auth/invalid-email') {
        setError('Format email tidak valid');
      } else {
        setError('Gagal login. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="relative flex min-h-screen w-full flex-col lg:flex-row overflow-x-hidden">
      {/* Left Side: Lifestyle Image (Hidden on mobile, 50% on desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center opacity-80"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format&fit=crop")`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">Toko Rizky</span>
          </div>

          {/* Tagline */}
          <div className="max-w-md">
            <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-4 uppercase tracking-tight">
              Elevate Your Wardrobe.
            </h1>
            <p className="text-lg text-slate-200">
              Akses koleksi fashion terkurasi dan penawaran eksklusif yang dirancang khusus untuk gaya unik Anda.
            </p>
          </div>

          {/* Footer */}
          <div className="flex gap-4 text-sm text-slate-300">
            <span>© 2024 Toko Rizky Inc.</span>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 bg-slate-50">
        <div className="mx-auto w-full max-w-[440px]">
          {/* Header */}
          <div className="mb-10">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-8 flex items-center gap-2">
              <div className="bg-amber-500 rounded-lg p-1.5 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fillRule="evenodd" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">Toko Rizky</span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 mb-2 uppercase">
              Selamat Datang
            </h2>
            <p className="text-sm text-slate-500">
              Belum punya akun?{' '}
              <Link href="/register" className="font-bold text-amber-500 hover:text-amber-600 transition-colors">
                Daftar sekarang
              </Link>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-700 mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="nama@email.com"
                className="block w-full rounded-xl border-2 border-slate-200 bg-white py-4 px-5 text-slate-900 placeholder:text-slate-400 focus:ring-0 focus:border-amber-500 focus:shadow-[0_0_0_4px_rgba(245,158,11,0.1)] text-sm transition-all duration-200 hover:border-slate-300"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-700" htmlFor="password">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs font-bold text-amber-500 hover:text-amber-600 transition-colors">
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="block w-full rounded-xl border-2 border-slate-200 bg-white py-4 pl-5 pr-14 text-slate-900 placeholder:text-slate-400 focus:ring-0 focus:border-amber-500 focus:shadow-[0_0_0_4px_rgba(245,158,11,0.1)] text-sm transition-all duration-200 hover:border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-slate-900 hover:bg-amber-500 px-4 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-sm transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Memproses...
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-xs text-slate-500">
              Dengan masuk, Anda menyetujui{' '}
              <Link href="/terms" className="font-medium underline hover:text-amber-500 transition-colors">
                Syarat & Ketentuan
              </Link>{' '}
              dan{' '}
              <Link href="/privacy" className="font-medium underline hover:text-amber-500 transition-colors">
                Kebijakan Privasi
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
