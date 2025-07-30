'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, writeBatch, query, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const orderId = searchParams.get('order_id');

    // Effect to clear the cart after successful payment
    useEffect(() => {
        const clearCart = async () => {
            if (!user) return;

            try {
                const cartRef = collection(db, 'users', user.uid, 'cart');
                const q = query(cartRef);
                const querySnapshot = await getDocs(q);

                // Use a batch write for atomic deletion
                const batch = writeBatch(db);
                querySnapshot.forEach((doc) => {
                    batch.delete(doc.ref);
                });

                await batch.commit();
                console.log('Keranjang berhasil dikosongkan.');

            } catch (error) {
                console.error("Gagal mengosongkan keranjang: ", error);
                toast.error("Terjadi kesalahan saat mengosongkan keranjang Anda.");
            }
        };

        clearCart();
    }, [user]); // Run this effect only when the user object is available

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
                    <CardTitle className="mt-4 text-2xl font-bold">Pembayaran Berhasil!</CardTitle>
                    <CardDescription>Terima kasih telah menyelesaikan pembayaran Anda.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {orderId && (
                        <p className="text-sm text-muted-foreground">
                            Nomor Pesanan Anda: <strong>{orderId}</strong>
                        </p>
                    )}
                    <p>Pesanan Anda akan segera kami proses.</p>
                    <Link href="/product">
                        <Button className="w-full">Lanjut Belanja</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}