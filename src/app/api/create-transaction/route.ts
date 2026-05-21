import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';
import { db } from '@/firebase';
import { doc, setDoc, Timestamp, updateDoc } from 'firebase/firestore';

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '',
});

const core = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '',
});

const mapMidtransStatusToOrderStatus = (transactionStatus?: string, fraudStatus?: string) => {
  if (transactionStatus === 'capture') {
    return fraudStatus === 'challenge' ? 'pending' : 'paid';
  }

  if (transactionStatus === 'settlement') return 'paid';
  if (transactionStatus === 'pending') return 'pending';
  if (transactionStatus === 'deny') return 'denied';
  if (transactionStatus === 'cancel') return 'cancelled';
  if (transactionStatus === 'expire') return 'expired';
  if (transactionStatus === 'failure') return 'failed';

  return transactionStatus || 'pending';
};

export async function POST(request: Request) {
  try {
    const { orderId, total, items, midtransItems, customerDetails, userId, shippingMethod, shippingCost } =
      await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const parameter = {
      transaction_details: { order_id: orderId, gross_amount: Math.round(total) },
      item_details: midtransItems,
      customer_details: customerDetails,
      credit_card: { secure: true },
      callbacks: {
        finish: `${baseUrl}/payment/success?order_id=${orderId}`,
        error: `${baseUrl}/payment/error?order_id=${orderId}`,
        unfinish: `${baseUrl}/payment/pending?order_id=${orderId}`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    await setDoc(doc(db, 'orders', orderId), {
      orderId,
      userId: userId || 'guest',
      items,
      total,
      status: 'pending',
      customerDetails,
      shippingMethod: shippingMethod || null,
      shippingCost: shippingCost || 0,
      paymentToken: transaction.token,
      paymentRedirectUrl: transaction.redirect_url || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ token: transaction.token, orderId });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json({ message: 'order_id wajib diisi.' }, { status: 400 });
    }

    const statusResponse = await core.transaction.status(orderId);
    const orderStatus = mapMidtransStatusToOrderStatus(
      statusResponse.transaction_status,
      statusResponse.fraud_status,
    );

    let firestoreUpdateError: string | null = null;

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: orderStatus,
        transactionId: statusResponse.transaction_id || null,
        paymentType: statusResponse.payment_type || null,
        transactionStatus: statusResponse.transaction_status || null,
        fraudStatus: statusResponse.fraud_status || null,
        settlementTime: statusResponse.settlement_time || null,
        updatedAt: Timestamp.now(),
      });
    } catch (firestoreError: any) {
      firestoreUpdateError = firestoreError.message || 'Gagal memperbarui order di Firestore.';
      console.error('Firestore order update failed:', firestoreError);
    }

    return NextResponse.json({
      orderId,
      status: orderStatus,
      transactionId: statusResponse.transaction_id || null,
      paymentType: statusResponse.payment_type || null,
      transactionStatus: statusResponse.transaction_status || null,
      fraudStatus: statusResponse.fraud_status || null,
      firestoreUpdateError,
      raw: statusResponse,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Gagal mengecek status transaksi.' }, { status: 500 });
  }
}