'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Pastikan Anda punya komponen ini atau ganti dengan Input biasa
import { toast } from 'sonner'; // Atau gunakan library toast yang Anda miliki
import { Loader2 } from 'lucide-react';

// Deklarasi tipe untuk window agar bisa mengenali `snap`
declare global {
    interface Window {
        snap: any;
    }
}

export default function CheckoutPage() {
    const { user } = useAuth();
    // PERBAIKAN: Menggunakan 'cartItems' sesuai dengan CartContext Anda
    const { cartItems, itemCount, loading } = useCart(); 
    const router = useRouter();
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
    });

    // Hitung subtotal secara manual karena CartContext tidak menyediakannya
    const subtotal = cartItems ? cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;

    // Load script Midtrans Snap
    useEffect(() => {
        const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
        const snapScriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js'; // Ganti ke production URL jika sudah live
        
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

    // Isi form otomatis jika user sudah login
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.displayName || '',
                email: user.email || '',
            }));
        }
    }, [user]);

    // Redirect jika keranjang kosong (setelah loading selesai)
    useEffect(() => {
        if (!loading && cartItems.length === 0) {
            // Opsional: Tampilkan pesan
            // toast.info('Keranjang Anda kosong.');
            router.push('/cart'); // Redirect kembali ke keranjang
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

        setIsProcessing(true);

        const orderDetails = {
            orderId: `TR-${Date.now()}`, // ID Unik
            userId: user.uid,
            total: subtotal,
            items: cartItems.map(item => ({
                id: item.productId, // Sesuaikan dengan field di CartItem (id vs productId)
                price: item.price,
                quantity: item.quantity,
                name: item.name,
            })),
            customerDetails: { // Sesuaikan nama field dengan API create-transaction
                first_name: formData.name,
                email: formData.email,
                phone: formData.phone,
                shipping_address: { address: formData.address }, 
                billing_address: { address: formData.address }
            }
        };

        try {
            // Panggil API back-end
            const response = await fetch('/api/create-transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderDetails),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Gagal membuat transaksi.');
            }

            // Buka popup pembayaran Midtrans
            window.snap.pay(data.token, {
                onSuccess: function (result: any) {
                    router.push(`/payment/success?order_id=${data.orderId}`);
                    // Catatan: CartContext Anda belum punya fungsi 'clearCart'.
                    // Anda mungkin perlu menambahkannya nanti untuk mengosongkan keranjang setelah sukses.
                },
                onPending: function (result: any) {
                    router.push(`/payment/pending?order_id=${data.orderId}`);
                },
                onError: function (result: any) {
                    router.push(`/payment/error?order_id=${data.orderId}`);
                },
                onClose: function () {
                    alert("Anda menutup popup tanpa menyelesaikan pembayaran.");
                }
            });

        } catch (error: any) {
            console.error(error);
            alert(error.message || "Terjadi kesalahan sistem.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
            </div>
        );
    }

    if (cartItems.length === 0) {
        return null; // Akan di-redirect oleh useEffect
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8 text-indigo-700">Checkout Pengiriman</h1>
            <form onSubmit={handleCheckout} className="grid md:grid-cols-2 gap-8">
                {/* Form Detail Pengiriman */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Alamat Pengiriman</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nama Penerima</Label>
                            <Input 
                                id="name" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleInputChange} 
                                required 
                                placeholder="Nama Lengkap"
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input 
                                id="email" 
                                name="email" 
                                type="email" 
                                value={formData.email} 
                                readOnly 
                                className="bg-gray-100 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <Label htmlFor="phone">Nomor Telepon</Label>
                            <Input 
                                id="phone" 
                                name="phone" 
                                value={formData.phone} 
                                onChange={handleInputChange} 
                                required 
                                type="tel"
                                placeholder="08xxxxxxxx"
                            />
                        </div>
                        <div>
                            <Label htmlFor="address">Alamat Lengkap</Label>
                            <Textarea 
                                id="address" 
                                name="address" 
                                value={formData.address} 
                                onChange={handleInputChange} 
                                required 
                                placeholder="Jalan, No. Rumah, Kecamatan, Kota"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Ringkasan Pesanan */}
                <Card className="h-fit bg-gray-50/50">
                    <CardHeader>
                        <CardTitle>Ringkasan Pesanan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 mb-6">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex justify-between items-start text-sm border-b border-dashed pb-3 last:border-0">
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-gray-500 text-xs">x{item.quantity}</p>
                                    </div>
                                    <p className="font-medium">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                                </div>
                            ))}
                        </div>
                        
                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between font-bold text-lg text-indigo-900">
                                <p>Total Bayar</p>
                                <p>Rp {subtotal.toLocaleString('id-ID')}</p>
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            size="lg" 
                            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700" 
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                'Bayar Sekarang'
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}