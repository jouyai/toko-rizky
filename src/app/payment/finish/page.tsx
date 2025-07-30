'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function PaymentFinishPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const orderId = searchParams.get('order_id');
        const transactionStatus = searchParams.get('transaction_status');

        // Delay redirect to allow user to see the message
        setTimeout(() => {
            if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
                router.push(`/payment/success?order_id=${orderId}`);
            } else if (transactionStatus === 'pending') {
                router.push(`/payment/pending?order_id=${orderId}`);
            } else {
                router.push(`/payment/error?order_id=${orderId}`);
            }
        }, 1500); // 1.5 second delay

    }, [searchParams, router]);

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md p-8">
                <CardContent className="flex flex-col items-center justify-center text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                    <p className="mt-4 text-lg font-medium">
                        Memverifikasi status pembayaran...
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Mohon tunggu, Anda akan segera diarahkan.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}