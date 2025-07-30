import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';

export async function POST(request: Request) {
  try {
    const { orderId, total, items, customer } = await request.json();

    let snap = new midtransClient.Snap({
        isProduction : false,
        serverKey : process.env.MIDTRANS_SERVER_KEY,
        clientKey : process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    });

    // Gunakan URL dari environment variable
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    let parameter = {
        "transaction_details": {
            "order_id": orderId,
            "gross_amount": total
        },
        "item_details": items,
        "customer_details": {
            "first_name": customer.name,
            "email": customer.email,
            "phone": customer.phone,
            "billing_address": {
                "address": customer.address
            }
        },
        "callbacks": {
            "finish": `${baseUrl}/payment/finish`,
            "error": `${baseUrl}/payment/error`,
        }
    };

    const token = await snap.createTransactionToken(parameter);

    return NextResponse.json({ token });

  } catch (error: any) {
    console.error("Midtrans API Error:", error.message);
    return new NextResponse(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}