'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function PaymentErrorPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <XCircle className="mx-auto h-16 w-16 text-red-500" />
                    <CardTitle className="mt-4 text-2xl font-bold">Pembayaran Gagal</CardTitle>
                    <CardDescription>Maaf, terjadi masalah saat memproses pembayaran Anda.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {orderId && (
                        <p className="text-sm text-muted-foreground">
                            Nomor Pesanan yang Gagal: <strong>{orderId}</strong>
                        </p>
                    )}
                    <p>Jangan khawatir, Anda belum dikenakan biaya. Silakan coba lagi atau gunakan metode pembayaran lain.</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href="/checkout" className="w-full">
                            <Button className="w-full">Coba Lagi</Button>
                        </Link>
                        <Link href="/" className="w-full">
                            <Button variant="outline" className="w-full">Kembali ke Beranda</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}