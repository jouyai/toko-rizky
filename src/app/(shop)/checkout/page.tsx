'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// Deklarasi tipe untuk window agar bisa mengenali `snap`
declare global {
    interface Window {
        snap: any;
    }
}

export default function CheckoutPage() {
    const { user } = useAuth();
    const { cartItems, itemCount, loading } = useCart();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.displayName || '',
        email: user?.email || '',
        phone: '',
        address: '',
    });

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Load script Midtrans Snap
    useEffect(() => {
        const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
        if (!clientKey) {
            console.error('Midtrans client key is not set.');
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', clientKey);
        script.async = true;

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // Redirect jika belum login atau keranjang kosong
    useEffect(() => {
        if (!loading && (!user || itemCount === 0)) {
            toast.info('Silakan login dan isi keranjang Anda terlebih dahulu.');
            router.push('/cart');
        }
    }, [user, itemCount, loading, router]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        const orderDetails = {
            orderId: `order-${Date.now()}`,
            total: subtotal,
            items: cartItems.map(item => ({
                id: item.productId,
                price: item.price,
                quantity: item.quantity,
                name: item.name,
            })),
            customer: {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
            }
        };

        try {
            // Panggil API back-end Anda untuk mendapatkan token transaksi
            const response = await fetch('/api/create-transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderDetails),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Gagal membuat transaksi.');
            }

            const { token } = data;

            // Buka popup pembayaran Midtrans
            // Buka popup pembayaran Midtrans
            window.snap.pay(token, {
                onSuccess: function (result: any) {
                    // Pengalihan sudah ditangani oleh Midtrans, cukup tampilkan toast
                    toast.success("Pembayaran berhasil diproses!");
                },
                onPending: function (result: any) {
                    toast.info("Menunggu pembayaran Anda.");
                },
                onError: function (result: any) {
                    toast.error("Pembayaran gagal.");
                    // Redirect ke halaman error jika ada masalah di dalam popup
                    router.push(`/payment/error?order_id=${orderDetails.orderId}`);
                },
                onClose: function () {
                    toast.info("Anda menutup popup tanpa menyelesaikan pembayaran.");
                }
            });

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading || !user || itemCount === 0) {
        return <div className="text-center py-10">Memuat...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>
            <form onSubmit={handleCheckout} className="grid md:grid-cols-2 gap-12">
                {/* Customer Details Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Detail Pengiriman</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <Label htmlFor="phone">Nomor Telepon</Label>
                            <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <Label htmlFor="address">Alamat Lengkap</Label>
                            <Input id="address" name="address" value={formData.address} onChange={handleInputChange} required />
                        </div>
                    </CardContent>
                </Card>

                {/* Order Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ringkasan Pesanan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                    <p>{item.name} <span className="text-muted-foreground">x{item.quantity}</span></p>
                                    <p>Rp {(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                        <div className="border-t mt-4 pt-4 space-y-2">
                            <div className="flex justify-between font-medium">
                                <p>Subtotal</p>
                                <p>Rp {subtotal.toLocaleString()}</p>
                            </div>
                        </div>
                        <Button type="submit" size="lg" className="w-full mt-6" disabled={isProcessing}>
                            {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}