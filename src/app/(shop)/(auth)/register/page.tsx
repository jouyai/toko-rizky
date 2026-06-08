'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { registerUser } from '@/controllers/authController';
import { Loader2, Eye, EyeOff, User, Mail, Lock, ArrowLeft, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!agreedToTerms) {
      setError('Anda harus menyetujui Syarat & Ketentuan');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setLoading(true);

    try {
      await registerUser(email, password, name);
      router.push('/');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email sudah terdaftar');
      } else if (err.code === 'auth/invalid-email') {
        setError('Format email tidak valid');
      } else if (err.code === 'auth/weak-password') {
        setError('Password terlalu lemah');
      } else {
        setError('Gagal mendaftar. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };



  // Show loading while checking auth
  if (authLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-10 w-10 text-slate-400 mx-auto mb-4" />
          <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      {/* Visual Side (Left) */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-cover"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop")`
          }}
        />
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight">Toko Rizky</span>
          </div>

          {/* Tagline */}
          <div className="max-w-md">
            <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-4 uppercase tracking-tight">
              Elevate Your Everyday Style.
            </h1>
            <p className="text-lg text-white/90">
              Bergabunglah dengan komunitas kami dan dapatkan akses ke koleksi eksklusif, rekomendasi personal, dan penawaran musiman.
            </p>
          </div>

          {/* Footer */}
          <div className="text-sm text-white/70">
            © 2024 Toko Rizky Fashion Group.
          </div>
        </div>
      </div>

      {/* Form Side (Right) */}
      <div className="w-full lg:w-1/2 flex flex-col bg-slate-50 overflow-y-auto">
        {/* Navigation Header */}
        <div className="flex justify-between items-center px-6 lg:px-8 py-6">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-amber-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Kembali ke Home</span>
          </Link>
          <div className="lg:hidden flex items-center gap-2">
            <span className="font-bold text-slate-900">Toko Rizky</span>
          </div>
        </div>

        {/* Registration Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-8 py-8 lg:py-12">
          <div className="w-full max-w-[480px] space-y-8">
            {/* Page Heading */}
            <div className="space-y-2">
              <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 uppercase">
                Gabung Toko Rizky
              </h2>
              <p className="text-slate-500 text-sm">
                Gerbang Anda menuju koleksi fashion eksklusif.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Full Name Field */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-700">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="John Doe"
                    className="w-full pl-12 pr-5 py-4 bg-white border-2 border-slate-200 rounded-xl focus:ring-0 focus:border-amber-500 focus:shadow-[0_0_0_4px_rgba(245,158,11,0.1)] outline-none transition-all duration-200 text-slate-900 placeholder:text-slate-400 text-sm hover:border-slate-300"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-700">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="john@email.com"
                    className="w-full pl-12 pr-5 py-4 bg-white border-2 border-slate-200 rounded-xl focus:ring-0 focus:border-amber-500 focus:shadow-[0_0_0_4px_rgba(245,158,11,0.1)] outline-none transition-all duration-200 text-slate-900 placeholder:text-slate-400 text-sm hover:border-slate-300"
                  />
                </div>
              </div>

              {/* Password Fields Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-12 pr-14 py-4 bg-white border-2 border-slate-200 rounded-xl focus:ring-0 focus:border-amber-500 focus:shadow-[0_0_0_4px_rgba(245,158,11,0.1)] outline-none transition-all duration-200 text-slate-900 placeholder:text-slate-400 text-sm hover:border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-700">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-12 pr-14 py-4 bg-white border-2 border-slate-200 rounded-xl focus:ring-0 focus:border-amber-500 focus:shadow-[0_0_0_4px_rgba(245,158,11,0.1)] outline-none transition-all duration-200 text-slate-900 placeholder:text-slate-400 text-sm hover:border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start gap-3 py-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <label className="text-sm text-slate-500 cursor-pointer select-none leading-relaxed" htmlFor="terms">
                  Saya setuju dengan{' '}
                  <Link href="/terms" className="text-amber-500 hover:underline font-medium">
                    Syarat & Ketentuan
                  </Link>{' '}
                  dan{' '}
                  <Link href="/privacy" className="text-amber-500 hover:underline font-medium">
                    Kebijakan Privasi
                  </Link>.
                </label>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-amber-500 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group uppercase tracking-widest text-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <span>Daftar</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>


            {/* Footer */}
            <div className="pt-6 border-t border-slate-200 text-center">
              <p className="text-slate-500 text-sm">
                Sudah punya akun?{' '}
                <Link href="/login" className="text-amber-500 font-bold hover:text-amber-600 transition-colors">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
