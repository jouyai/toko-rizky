'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Truck, Zap, Clock, CreditCard, Wallet, Building, Shield, ChevronRight, Lock } from 'lucide-react';
import Link from 'next/link';

// Deklarasi tipe untuk window agar bisa mengenali `snap`
declare global {
    interface Window {
        snap: any;
    }
}

type ShippingMethod = 'regular' | 'express' | 'sameday';
type PaymentMethod = 'ewallet' | 'va' | 'card';

const shippingOptions = {
    regular: { name: 'Regular', price: 15000, days: '2-4 hari', icon: Truck },
    express: { name: 'Express', price: 35000, days: '1-2 hari', icon: Zap },
    sameday: { name: 'Same Day', price: 75000, days: 'Hari ini', icon: Clock },
};

export default function CheckoutPage() {
    const { user } = useAuth();
    const { cartItems, itemCount, loading } = useCart();
    const router = useRouter();

    const [isProcessing, setIsProcessing] = useState(false);
    const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('regular');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        province: '',
        postalCode: '',
    });

    // Calculate totals
    const subtotal = cartItems ? cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
    const shippingCost = shippingOptions[shippingMethod].price;
    const tax = Math.round(subtotal * 0.11);
    const total = subtotal + shippingCost + tax;

    // Load script Midtrans Snap
    useEffect(() => {
        const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
        const snapScriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';

        if (!clientKey) return;

        const script = document.createElement('script');
        script.src = snapScriptUrl;
        script.setAttribute('data-client-key', clientKey);
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // Auto-fill form if user is logged in
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.displayName || '',
                email: user.email || '',
            }));
        }
    }, [user]);

    // Redirect if cart is empty
    useEffect(() => {
        if (!loading && cartItems.length === 0) {
            router.push('/cart');
        }
    }, [loading, cartItems, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            router.push('/login');
            return;
        }

        // Validate form
        if (!formData.name || !formData.phone || !formData.address || !formData.city) {
            toast.error('Mohon lengkapi semua field yang diperlukan');
            return;
        }

        setIsProcessing(true);

        const orderDetails = {
            orderId: `TR-${Date.now()}`,
            userId: user.uid,
            total: total,
            items: cartItems.map(item => ({
                id: item.productId,
                price: item.price,
                quantity: item.quantity,
                name: item.name,
            })),
            customerDetails: {
                first_name: formData.name,
                email: formData.email,
                phone: formData.phone,
                shipping_address: {
                    address: formData.address,
                    city: formData.city,
                    postal_code: formData.postalCode,
                },
                billing_address: {
                    address: formData.address,
                    city: formData.city,
                    postal_code: formData.postalCode,
                }
            },
            shippingMethod: shippingMethod,
            shippingCost: shippingCost,
        };

        try {
            const response = await fetch('/api/create-transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderDetails),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal membuat transaksi.');
            }

            window.snap.pay(data.token, {
                onSuccess: function (result: any) {
                    router.push(`/payment/success?order_id=${data.orderId}`);
                },
                onPending: function (result: any) {
                    router.push(`/payment/pending?order_id=${data.orderId}`);
                },
                onError: function (result: any) {
                    router.push(`/payment/error?order_id=${data.orderId}`);
                },
                onClose: function () {
                    toast.info("Anda menutup popup tanpa menyelesaikan pembayaran.");
                }
            });

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Terjadi kesalahan sistem.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-10 w-10 text-slate-400 mx-auto mb-4" />
                    <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">Memuat...</p>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return null;
    }

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 mb-6 text-sm font-medium">
                <Link href="/cart" className="text-slate-400 hover:text-amber-500 transition-colors">
                    Keranjang
                </Link>
                <ChevronRight className="w-4 h-4 text-slate-300" />
                <span className="text-slate-900 font-bold">Checkout</span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
                <span className="text-slate-400">Pembayaran</span>
            </nav>

            {/* Page Heading */}
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 uppercase">Checkout</h1>
                <p className="text-slate-500 mt-1 text-sm">Lengkapi detail pengiriman dan pembayaran untuk menyelesaikan pesanan.</p>
            </div>

            <form onSubmit={handleCheckout} className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Shipping & Payment */}
                <div className="flex-1 space-y-6 lg:space-y-8">
                    {/* Shipping Address Section */}
                    <section className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-5 lg:p-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold flex items-center gap-2 uppercase tracking-tight">
                                <Truck className="w-5 h-5 text-amber-500" />
                                Informasi Pengiriman
                            </h2>
                        </div>
                        <div className="p-5 lg:p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-widest">Nama Lengkap</span>
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="rounded-xl border-2 border-slate-200 focus:ring-0 focus:border-amber-500 focus:shadow-[0_0_0_4px_rgba(245,158,11,0.1)] text-sm py-4 px-5 transition-all duration-200 hover:border-slate-300"
                                        placeholder="John Doe"
                                        required
                                    />
                                </label>
                                <label className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-widest">Nomor Telepon</span>
                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        type="tel"
                                        className="rounded-xl border-2 border-slate-200 focus:ring-0 focus:border-amber-500 focus:shadow-[0_0_0_4px_rgba(245,158,11,0.1)] text-sm py-4 px-5 transition-all duration-200 hover:border-slate-300"
                                        placeholder="+62 812 3456 7890"
                                        required
                                    />
                                </label>
                            </div>
                            <label className="flex flex-col">
                                <span className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-widest">Alamat Lengkap</span>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="rounded-xl border-2 border-slate-200 focus:ring-0 focus:border-amber-500 focus:shadow-[0_0_0_4px_rgba(245,158,11,0.1)] text-sm py-4 px-5 transition-all duration-200 hover:border-slate-300"
                                    placeholder="Jl. Sudirman No. 123, Jakarta Pusat"
                                    rows={2}
                                    required
                                />
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <label className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-widest">Kota</span>
                                    <input
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="rounded-xl border-2 border-slate-200 focus:ring-0 focus:border-amber-500 focus:shadow-[0_0_0_4px_rgba(245,158,11,0.1)] text-sm py-4 px-5 transition-all duration-200 hover:border-slate-300"
                                        placeholder="Jakarta"
                                        required
                                    />
                                </label>
                                <label className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-widest">Provinsi</span>
                                    <input
                                        name="province"
                                        value={formData.province}
                                        onChange={handleInputChange}
                                        className="rounded-xl border-2 border-slate-200 focus:ring-0 focus:border-amber-500 focus:shadow-[0_0_0_4px_rgba(245,158,11,0.1)] text-sm py-4 px-5 transition-all duration-200 hover:border-slate-300"
                                        placeholder="DKI Jakarta"
                                    />
                                </label>
                                <label className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-widest">Kode Pos</span>
                                    <input
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleInputChange}
                                        className="rounded-xl border-2 border-slate-200 focus:ring-0 focus:border-amber-500 focus:shadow-[0_0_0_4px_rgba(245,158,11,0.1)] text-sm py-4 px-5 transition-all duration-200 hover:border-slate-300"
                                        placeholder="10210"
                                    />
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Shipping Method Section */}
                    <section className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-5 lg:p-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold flex items-center gap-2 uppercase tracking-tight">
                                <Zap className="w-5 h-5 text-amber-500" />
                                Metode Pengiriman
                            </h2>
                        </div>
                        <div className="p-5 lg:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {(Object.keys(shippingOptions) as ShippingMethod[]).map((key) => {
                                const option = shippingOptions[key];
                                const Icon = option.icon;
                                const isSelected = shippingMethod === key;
                                return (
                                    <label
                                        key={key}
                                        className={`relative border-2 rounded-xl p-4 cursor-pointer flex flex-col gap-1 transition-all ${isSelected
                                            ? 'border-amber-500 bg-amber-50'
                                            : 'border-slate-100 hover:border-amber-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="shipping"
                                            checked={isSelected}
                                            onChange={() => setShippingMethod(key)}
                                            className="absolute top-3 right-3 text-amber-500 focus:ring-amber-500"
                                        />
                                        <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-amber-500' : 'text-slate-400'}`} />
                                        <span className="font-bold text-sm">{option.name}</span>
                                        <span className="text-xs text-slate-500">{option.days}</span>
                                        <span className={`font-bold mt-2 ${isSelected ? 'text-amber-600' : 'text-slate-900'}`}>
                                            Rp {option.price.toLocaleString('id-ID')}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </section>

                    {/* Payment Method Section - Midtrans */}
                    <section className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-5 lg:p-6 border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold flex items-center gap-2 uppercase tracking-tight">
                                    <CreditCard className="w-5 h-5 text-amber-500" />
                                    Metode Pembayaran
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Powered by</span>
                                    <span className="text-xs font-bold text-blue-600">Midtrans</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 lg:p-6 space-y-6">
                            {/* Info Banner */}
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-blue-900">Pembayaran Aman dengan Midtrans</p>
                                    <p className="text-xs text-blue-700 mt-1">Pilih metode pembayaran di popup Midtrans setelah klik &quot;Bayar Sekarang&quot;. Tersedia berbagai opsi pembayaran.</p>
                                </div>
                            </div>

                            {/* Available Payment Methods */}
                            <div className="space-y-4">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Metode Pembayaran Tersedia</p>

                                {/* E-Wallets */}
                                <div className="space-y-2">
                                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">E-Wallet</p>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { name: 'GoPay', color: 'bg-green-100 text-green-700' },
                                            { name: 'ShopeePay', color: 'bg-orange-100 text-orange-700' },
                                            { name: 'QRIS', color: 'bg-purple-100 text-purple-700' },
                                        ].map((wallet) => (
                                            <span key={wallet.name} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${wallet.color}`}>
                                                {wallet.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Virtual Account */}
                                <div className="space-y-2">
                                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Virtual Account / Bank Transfer</p>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { name: 'BCA', color: 'bg-blue-100 text-blue-700' },
                                            { name: 'BNI', color: 'bg-orange-100 text-orange-700' },
                                            { name: 'BRI', color: 'bg-blue-100 text-blue-700' },
                                            { name: 'Mandiri', color: 'bg-yellow-100 text-yellow-700' },
                                            { name: 'Permata', color: 'bg-teal-100 text-teal-700' },
                                            { name: 'CIMB', color: 'bg-red-100 text-red-700' },
                                        ].map((bank) => (
                                            <span key={bank.name} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${bank.color}`}>
                                                {bank.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Credit/Debit Card */}
                                <div className="space-y-2">
                                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Kartu Kredit / Debit</p>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { name: 'Visa', color: 'bg-indigo-100 text-indigo-700' },
                                            { name: 'Mastercard', color: 'bg-red-100 text-red-700' },
                                            { name: 'JCB', color: 'bg-green-100 text-green-700' },
                                            { name: 'Amex', color: 'bg-blue-100 text-blue-700' },
                                        ].map((card) => (
                                            <span key={card.name} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${card.color}`}>
                                                {card.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Other Methods */}
                                <div className="space-y-2">
                                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Lainnya</p>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { name: 'Alfamart', color: 'bg-red-100 text-red-700' },
                                            { name: 'Indomaret', color: 'bg-blue-100 text-blue-700' },
                                            { name: 'Akulaku', color: 'bg-purple-100 text-purple-700' },
                                            { name: 'Kredivo', color: 'bg-teal-100 text-teal-700' },
                                        ].map((method) => (
                                            <span key={method.name} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${method.color}`}>
                                                {method.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Security Note */}
                            <div className="pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Lock className="w-4 h-4" />
                                    <p className="text-xs">Transaksi dilindungi dengan enkripsi SSL 256-bit</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Order Summary (Sticky) */}
                <div className="lg:w-[400px]">
                    <div className="sticky top-24 space-y-6">
                        <section className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                            <div className="p-5 lg:p-6 border-b border-slate-100">
                                <h2 className="text-lg font-bold uppercase tracking-tight">Ringkasan Pesanan</h2>
                            </div>
                            <div className="p-5 lg:p-6 space-y-6">
                                {/* Items List */}
                                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="flex gap-4">
                                            <div
                                                className="h-20 w-20 bg-slate-100 rounded-lg flex-shrink-0 bg-cover bg-center border border-slate-100"
                                                style={{ backgroundImage: `url('${item.image || '/placeholder.jpg'}')` }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-sm leading-tight line-clamp-2">{item.name}</h3>
                                                <p className="text-xs text-slate-500 mt-1">Qty: {item.quantity}</p>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="font-bold text-sm">
                                                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Cost Breakdown */}
                                <div className="pt-6 border-t border-slate-100 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Subtotal</span>
                                        <span className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Pengiriman ({shippingOptions[shippingMethod].name})</span>
                                        <span className="font-medium">Rp {shippingCost.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Pajak (11%)</span>
                                        <span className="font-medium">Rp {tax.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-black pt-4 text-amber-600">
                                        <span>Total</span>
                                        <span>Rp {total.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>

                                {/* Pay Button */}
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full bg-slate-900 hover:bg-amber-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="animate-spin h-4 w-4" />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4" />
                                            Bayar Rp {total.toLocaleString('id-ID')}
                                        </>
                                    )}
                                </button>

                                <p className="text-[11px] text-center text-slate-400">
                                    Dengan melanjutkan, Anda menyetujui{' '}
                                    <Link href="/terms" className="underline hover:text-amber-500">Syarat & Ketentuan</Link>.
                                    Pembayaran aman oleh Midtrans.
                                </p>
                            </div>
                        </section>

                        {/* Trust Badges */}
                        <div className="flex items-center justify-center gap-6">
                            <div className="flex items-center gap-1 text-slate-400">
                                <Shield className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">SSL Secure</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-400">
                                <Lock className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </main>
    );
}