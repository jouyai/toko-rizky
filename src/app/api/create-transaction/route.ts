import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';
import { db } from '@/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

// Inisialisasi Snap Client (diluar handler agar tidak re-init setiap request)
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '',
});

export async function POST(request: Request) {
  try {
    // 1. Terima data dengan nama 'customerDetails' (sesuai yang dikirim frontend)
    const { orderId, total, items, customerDetails, userId } = await request.json();

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // 2. Siapkan Parameter Midtrans
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: total,
      },
      item_details: items,
      // Gunakan customerDetails langsung karena strukturnya sudah kita samakan di frontend
      customer_details: {
        first_name: customerDetails.first_name,
        email: customerDetails.email,
        phone: customerDetails.phone,
        billing_address: customerDetails.billing_address,
        shipping_address: customerDetails.shipping_address,
      },
      credit_card: {
        secure: true,
      },
      callbacks: {
        finish: `${baseUrl}/payment/finish`,
        error: `${baseUrl}/payment/error`,
        unfinish: `${baseUrl}/payment/pending`,
      },
    };

    // 3. Minta Token ke Midtrans
    const transaction = await snap.createTransaction(parameter);

    // 4. SIMPAN DATA ORDER KE FIRESTORE (Status: PENDING)
    // Penting: Simpan customerDetails agar alamat dan info pembeli terekam di database
    await setDoc(doc(db, 'orders', orderId), {
      orderId,
      userId: userId || 'guest',
      items,
      total,
      status: 'pending', // Status awal
      customerDetails,   // Simpan data pembeli lengkap
      paymentToken: transaction.token,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ 
      token: transaction.token,
      orderId: orderId 
    });

  } catch (error: any) {
    console.error("Midtrans API Error:", error.message);
    return new NextResponse(
      JSON.stringify({ message: error.message || "Terjadi kesalahan pada server pembayaran" }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}