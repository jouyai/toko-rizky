'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  PackageCheck,
  Shield,
  ShoppingBag,
  Truck,
  UserRound,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';

declare global {
  interface Window {
    snap: any;
  }
}

type ShippingMethod = 'regular' | 'express' | 'sameday';

const shippingOptions = {
  regular: { name: 'Regular', price: 15000, days: '2-4 hari', icon: Truck, description: 'Pilihan hemat untuk pengiriman standar.' },
  express: { name: 'Express', price: 35000, days: '1-2 hari', icon: Zap, description: 'Lebih cepat sampai untuk kebutuhan mendesak.' },
  sameday: { name: 'Same Day', price: 75000, days: 'Hari ini', icon: Clock, description: 'Dikirim di hari yang sama untuk area tertentu.' },
};

const inputClassName =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cartItems, loading } = useCart();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('regular');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
  });

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = shippingOptions[shippingMethod].price;
  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + shippingCost + tax;
  const selectedShipping = shippingOptions[shippingMethod];

  useEffect(() => {
    document.title = 'Checkout | Toko Rizky';
  }, []);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return router.push('/login');

    if (cartItems.length === 0) {
      return toast.error('Keranjang belanja masih kosong.');
    }

    if (!formData.name || !formData.phone || !formData.address || !formData.city) {
      return toast.error('Mohon lengkapi semua field yang diperlukan');
    }

    setIsProcessing(true);

    // Menyiapkan item_details untuk Midtrans agar sinkron dengan gross_amount
    const midtransItems = cartItems.map((item) => ({
      id: String(item.productId).substring(0, 50),
      price: Math.round(item.price),
      quantity: item.quantity,
      name: item.name.substring(0, 50),
    }));

    midtransItems.push({ id: 'shipping', price: shippingCost, quantity: 1, name: 'Ongkos Kirim' });
    midtransItems.push({ id: 'tax', price: tax, quantity: 1, name: 'Pajak (11%)' });

    const orderDetails = {
      orderId: `TR-${Date.now()}`,
      userId: user.uid,
      total: Math.round(total),
      items: cartItems.map((item) => ({
        id: item.productId,
        price: item.price,
        quantity: item.quantity,
        name: item.name,
      })),
      midtransItems,
      shippingMethod,
      shippingCost,
      customerDetails: {
        first_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        shipping_address: {
          first_name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postalCode || '00000',
          country_code: 'IDN',
        },
        billing_address: {
          first_name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postalCode || '00000',
          country_code: 'IDN',
        },
      },
    };

    try {
      const res = await fetch('/api/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderDetails),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      window.snap.pay(data.token, {
        onSuccess: (result: any) =>
          router.push(`/payment/success?order_id=${data.orderId}&transaction_id=${result.transaction_id}`),
        onPending: (result: any) =>
          router.push(`/payment/pending?order_id=${data.orderId}&transaction_id=${result.transaction_id}`),
        onError: () => toast.error('Pembayaran gagal.'),
        onClose: () => toast.info('Popup ditutup.'),
      });
    } catch (err: any) {
      toast.error(err.message || 'Gagal membuat transaksi.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 flex items-center gap-2 text-sm">
          <div className="h-4 w-12 rounded bg-slate-200 animate-pulse" />
          <ChevronRight className="h-4 w-4 text-slate-200" />
          <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
        </div>

        <div className="mb-10 space-y-3">
          <div className="h-8 w-56 rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-80 max-w-full rounded bg-slate-100 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-96 rounded-2xl border border-slate-100 bg-white p-6 animate-pulse" />
            <div className="h-52 rounded-2xl border border-slate-100 bg-white p-6 animate-pulse" />
          </div>
          <div className="lg:col-span-4">
            <div className="h-[520px] rounded-2xl border border-slate-100 bg-white p-6 animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <nav className="flex items-center gap-2 mb-6 text-sm">
          <Link href="/" className="text-slate-400 hover:text-amber-500 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <span className="text-slate-900 font-bold">Checkout</span>
        </nav>

        <section className="min-h-[55vh] flex items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-900">
              <ShoppingBag className="h-9 w-9" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tight text-slate-900">
              Keranjang Kosong
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Tambahkan produk favorit Anda terlebih dahulu sebelum melanjutkan ke pembayaran.
            </p>
            <Link
              href="/product"
              className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 text-xs font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-amber-500"
            >
              Mulai Belanja
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      <nav className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/" className="text-slate-400 hover:text-amber-500 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <Link href="/cart" className="text-slate-400 hover:text-amber-500 transition-colors">
          Keranjang
        </Link>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <span className="text-slate-900 font-bold">Checkout</span>
      </nav>

      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
            <Lock className="h-3.5 w-3.5" />
            Secure Checkout
          </span>
          <h1 className="text-2xl lg:text-4xl font-black text-slate-900 uppercase tracking-tight">
            Selesaikan Pesanan
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Lengkapi detail pengiriman Anda. Pembayaran akan diproses secara aman melalui Midtrans.
          </p>
        </div>

        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-amber-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Keranjang
        </Link>
      </div>

      <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-8 space-y-6">
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <UserRound className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
                  Informasi Penerima
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Pastikan nomor telepon aktif agar kurir dapat menghubungi Anda.
                </p>
              </div>
              {user && (
                <div className="hidden rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 sm:inline-flex">
                  Login
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </span>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={inputClassName}
                  placeholder="Nama penerima"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Email
                </span>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={inputClassName}
                  placeholder="email@contoh.com"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Nomor Telepon <span className="text-rose-500">*</span>
                </span>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={inputClassName}
                  placeholder="08xxxxxxxxxx"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Kode Pos
                </span>
                <input
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className={inputClassName}
                  placeholder="12345"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
            <div className="mb-6">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                <MapPin className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
                Alamat Pengiriman
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Isi alamat lengkap untuk menghindari kendala pengiriman.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Alamat Lengkap <span className="text-rose-500">*</span>
                </span>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`${inputClassName} min-h-32 resize-none`}
                  placeholder="Nama jalan, nomor rumah, RT/RW, patokan, dan detail lainnya"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Kota/Kabupaten <span className="text-rose-500">*</span>
                </span>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={inputClassName}
                  placeholder="Contoh: Jakarta Selatan"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Provinsi
                </span>
                <input
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  className={inputClassName}
                  placeholder="Contoh: DKI Jakarta"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <Truck className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
                  Metode Pengiriman
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Pilih opsi pengiriman yang paling sesuai.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {(Object.entries(shippingOptions) as [ShippingMethod, typeof shippingOptions[ShippingMethod]][]).map(
                ([key, option]) => {
                  const Icon = option.icon;
                  const isSelected = shippingMethod === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setShippingMethod(key)}
                      className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition-all ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                          : 'border-slate-200 bg-white hover:border-slate-900 hover:shadow-sm'
                      }`}
                    >
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          isSelected ? 'bg-white/10 text-amber-400' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>

                      <span className="flex-1">
                        <span className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <span className="font-black uppercase tracking-tight">{option.name}</span>
                          <span className={isSelected ? 'font-black text-amber-400' : 'font-black text-slate-900'}>
                            Rp {option.price.toLocaleString('id-ID')}
                          </span>
                        </span>
                        <span className={`mt-1 block text-sm ${isSelected ? 'text-white/70' : 'text-slate-500'}`}>
                          Estimasi {option.days} · {option.description}
                        </span>
                      </span>

                      <span
                        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          isSelected ? 'border-amber-400 bg-amber-400 text-slate-900' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="h-4 w-4" />}
                      </span>
                    </button>
                  );
                },
              )}
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="bg-slate-900 p-6 text-white">
              <div className="mb-2 flex items-center justify-between gap-4">
                <h2 className="text-lg font-black uppercase tracking-tight">Ringkasan Pesanan</h2>
                <PackageCheck className="h-5 w-5 text-amber-400" />
              </div>
              <p className="text-sm text-white/60">
                {cartItems.length} produk · Pengiriman {selectedShipping.name}
              </p>
            </div>

            <div className="max-h-[340px] space-y-4 overflow-y-auto border-b border-slate-100 p-5">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <Link
                    href={`/product/${item.productId || item.id}`}
                    className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100"
                  >
                    <div
                      className="h-full w-full bg-cover bg-center transition-transform duration-500 hover:scale-105"
                      style={{ backgroundImage: `url("${item.image || '/placeholder.jpg'}")` }}
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${item.productId || item.id}`}
                      className="line-clamp-2 text-sm font-bold text-slate-900 transition-colors hover:text-amber-500"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.quantity} x Rp {item.price.toLocaleString('id-ID')}
                    </p>
                    <p className="mt-2 text-sm font-black text-slate-900">
                      Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-bold text-slate-900">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Pengiriman ({selectedShipping.name})</span>
                  <span className="font-bold text-slate-900">Rp {shippingCost.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">PPN (11%)</span>
                  <span className="font-bold text-slate-900">Rp {tax.toLocaleString('id-ID')}</span>
                </div>
                <div className="border-t border-dashed border-slate-200 pt-4">
                  <div className="flex items-end justify-between gap-4">
                    <span className="font-black uppercase tracking-tight text-slate-900">Total</span>
                    <span className="text-2xl font-black text-amber-500">
                      Rp {Math.round(total).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-slate-900 px-6 text-sm font-black uppercase tracking-[0.16em] text-white transition-all hover:bg-amber-500 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Memproses
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Bayar Sekarang
                  </>
                )}
              </button>

              <div className="mt-5 grid grid-cols-1 gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  Pembayaran aman dan terenkripsi via Midtrans.
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-amber-500" />
                  Estimasi tiba: {selectedShipping.days} setelah pembayaran.
                </div>
              </div>
            </div>
          </div>
        </aside>
      </form>
    </main>
  );
}