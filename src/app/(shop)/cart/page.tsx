'use client';

import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Shield,
  Truck,
  MessageCircle
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
}

export default function CartPage() {
  const { user } = useAuth();
  const { cartItems, loading } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  useEffect(() => {
    document.title = 'Keranjang Belanja | Toko Rizky';
  }, []);

  // Fetch recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const q = query(collection(db, 'products'), limit(4));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
        setRecommendations(data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    };
    fetchRecommendations();
  }, []);

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1 || !user) return;
    const itemRef = doc(db, 'users', user.uid, 'cart', id);
    try {
      await updateDoc(itemRef, { quantity: newQuantity });
    } catch (error) {
      toast.error('Gagal memperbarui jumlah item.');
    }
  };

  const removeItem = async (id: string) => {
    if (!user) return;
    const itemRef = doc(db, 'users', user.uid, 'cart', id);
    try {
      await deleteDoc(itemRef);
      toast.success('Item dihapus dari keranjang.');
    } catch (error) {
      toast.error('Gagal menghapus item.');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 500000 ? 0 : 15000; // Free shipping over 500k
  const tax = subtotal * 0.11; // 11% PPN
  const total = subtotal + shipping + tax;

  if (loading) {
    return (
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-6 text-sm">
          <span className="text-slate-400">Home</span>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <span className="text-slate-900 font-bold">Keranjang</span>
        </nav>

        <div className="mb-10">
          <div className="h-8 bg-slate-200 rounded w-64 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-slate-100 animate-pulse">
                <div className="flex gap-6">
                  <div className="w-24 h-32 bg-slate-200 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-slate-200 rounded w-2/3" />
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl p-6 border border-slate-100 h-80 animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/" className="text-slate-400 hover:text-amber-500 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <span className="text-slate-900 font-bold">Keranjang</span>
      </nav>

      {/* Page Heading */}
      <div className="mb-10">
        <h1 className="text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-tight">
          Keranjang Belanja ({cartItems.length} Item)
        </h1>
      </div>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Cart Items */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Items */}
            <div className="w-full border-t border-slate-200">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-start gap-4 lg:gap-6 py-6 border-b border-slate-200 group">
                  {/* Product Image */}
                  <Link
                    href={`/product/${item.productId || item.id}`}
                    className="w-20 lg:w-24 h-28 lg:h-32 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0"
                  >
                    <div
                      className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url("${item.image || '/placeholder.jpg'}")` }}
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="flex-grow flex flex-col gap-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <Link
                        href={`/product/${item.productId || item.id}`}
                        className="font-semibold text-slate-900 hover:text-amber-500 transition-colors truncate"
                      >
                        {item.name}
                      </Link>
                      <p className="font-bold text-slate-900 whitespace-nowrap">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500">
                      Harga satuan: Rp {item.price.toLocaleString('id-ID')}
                    </p>

                    {/* Quantity & Actions */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-slate-200 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:text-amber-500 transition-colors disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:text-amber-500 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-sm font-medium text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Hapus</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Shopping */}
            <Link
              href="/product"
              className="flex items-center gap-2 text-amber-500 font-bold text-sm uppercase tracking-widest w-fit hover:translate-x-[-4px] transition-transform"
            >
              <ArrowLeft className="w-4 h-4" />
              Lanjutkan Belanja
            </Link>
          </div>

          {/* Right Column: Order Summary (Sticky) */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold uppercase tracking-tight mb-6">Ringkasan Pesanan</h3>

              <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium text-slate-900">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Estimasi Pengiriman</span>
                  <span className="font-medium text-slate-900">
                    {shipping === 0 ? (
                      <span className="text-green-600">Gratis</span>
                    ) : (
                      `Rp ${shipping.toLocaleString('id-ID')}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">PPN (11%)</span>
                  <span className="font-medium text-slate-900">Rp {Math.round(tax).toLocaleString('id-ID')}</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                  <span className="font-bold">Total</span>
                  <span className="text-2xl font-black text-amber-500">Rp {Math.round(total).toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Free Shipping Notice */}
              {subtotal < 500000 && (
                <div className="mb-6 p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
                  <p className="font-medium">
                    🚚 Belanja Rp {(500000 - subtotal).toLocaleString('id-ID')} lagi untuk gratis ongkir!
                  </p>
                </div>
              )}

              {/* Promo Code */}
              <div className="mb-6">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">
                  Kode Promo
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Masukkan kode"
                    className="flex-grow text-sm border-2 border-slate-200 rounded-xl py-3 px-5 focus:ring-0 focus:border-amber-500 focus:shadow-[0_0_0_4px_rgba(245,158,11,0.1)] transition-all duration-200 hover:border-slate-300"
                  />
                  <button className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-colors">
                    Terapkan
                  </button>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="w-full bg-slate-900 hover:bg-amber-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
              >
                Lanjutkan ke Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Payment Icons */}
              <div className="mt-6 flex flex-col gap-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold text-center">
                  Pembayaran Aman
                </p>
                <div className="flex justify-center gap-4 text-slate-300">
                  <CreditCard className="w-6 h-6" />
                  <Shield className="w-6 h-6" />
                  <Truck className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="mt-4 p-6 rounded-xl border border-dashed border-slate-200 bg-slate-50">
              <p className="text-sm font-bold text-slate-900 mb-1">Butuh bantuan?</p>
              <p className="text-xs text-slate-500 mb-3">Tim support kami siap membantu 24/7.</p>
              <Link
                href="/contact"
                className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1"
              >
                <MessageCircle className="w-3 h-3" />
                Chat dengan tim kami
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Cart State */
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl bg-white">
          <ShoppingCart className="mx-auto h-16 w-16 text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Keranjang Anda Kosong</h3>
          <p className="text-slate-500 mb-6">Sepertinya Anda belum menambahkan produk apapun.</p>
          <Link
            href="/product"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-amber-500 text-white px-8 py-4 rounded-lg font-bold text-xs uppercase tracking-widest transition-colors"
          >
            Mulai Belanja
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <section className="mt-16 lg:mt-24 pt-12 border-t border-slate-200">
          <h3 className="text-xl font-bold uppercase tracking-tight mb-8">Mungkin Anda Suka</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {recommendations.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="flex flex-col gap-3 group"
              >
                <div className="aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url("${product.image || '/placeholder.jpg'}")` }}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                  <p className="text-sm text-amber-500 font-bold">Rp {product.price.toLocaleString('id-ID')}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}