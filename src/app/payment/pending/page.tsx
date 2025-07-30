'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Clock } from 'lucide-react';

export default function PaymentPendingPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <Clock className="mx-auto h-16 w-16 text-yellow-500" />
                    <CardTitle className="mt-4 text-2xl font-bold">Menunggu Pembayaran</CardTitle>
                    <CardDescription>Pesanan Anda telah kami terima dan menunggu konfirmasi pembayaran.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {orderId && (
                        <p className="text-sm text-muted-foreground">
                            Nomor Pesanan Anda: <strong>{orderId}</strong>
                        </p>
                    )}
                    <p>Silakan selesaikan pembayaran sesuai instruksi. Halaman ini akan diperbarui secara otomatis setelah pembayaran berhasil.</p>
                    <Link href="/">
                        <Button variant="outline" className="w-full">Kembali ke Beranda</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}