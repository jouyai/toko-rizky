import { doc, setDoc, Timestamp, updateDoc, collection, query, onSnapshot, where, getDocs, Unsubscribe } from 'firebase/firestore';
import { db } from '@/firebase';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export type ShippingMethod = 'regular' | 'express' | 'sameday';

export interface ShippingOption {
  name: string;
  price: number;
  days: string;
  icon?: any;
  description: string;
}

export const SHIPPING_OPTIONS: Record<ShippingMethod, ShippingOption> = {
  regular: { name: 'Regular', price: 15000, days: '2-4 hari', description: 'Pilihan hemat untuk pengiriman standar.' },
  express: { name: 'Express', price: 35000, days: '1-2 hari', description: 'Lebih cepat sampai untuk kebutuhan mendesak.' },
  sameday: { name: 'Same Day', price: 75000, days: 'Hari ini', description: 'Dikirim di hari yang sama untuk area tertentu.' },
};

export interface CustomerDetails {
  first_name: string;
  email: string;
  phone: string;
  shipping_address: {
    first_name: string;
    phone: string;
    address: string;
    city: string;
    postal_code: string;
    country_code: string;
  };
}

export interface OrderTotals {
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
}

export interface CreateTransactionParams {
  orderId: string;
  userId: string;
  items: CartItem[];
  shippingMethod: ShippingMethod;
  shippingCost: number;
  customerDetails: CustomerDetails;
}

// ─── Totals calculation ──────────────────────────────────────────────────────

export function calculateTotals(
  items: CartItem[],
  shippingMethod: ShippingMethod
): OrderTotals {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = SHIPPING_OPTIONS[shippingMethod].price;
  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + shippingCost + tax;

  return { subtotal, shippingCost, tax, total };
}

export function buildMidtransItems(
  items: CartItem[],
  shippingCost: number,
  tax: number
): Array<{ id: string; price: number; quantity: number; name: string }> {
  const productItems = items.map((item) => ({
    id: String(item.productId).substring(0, 50),
    price: Math.round(item.price),
    quantity: item.quantity,
    name: item.name.substring(0, 50),
  }));

  productItems.push({ id: 'shipping', price: shippingCost, quantity: 1, name: 'Ongkos Kirim' });
  productItems.push({ id: 'tax', price: tax, quantity: 1, name: 'Pajak (11%)' });

  return productItems;
}

// ─── Transaction ─────────────────────────────────────────────────────────────

export async function createTransaction(
  params: CreateTransactionParams & { total: number; midtransItems: any[] }
): Promise<{ token: string; orderId: string }> {
  const res = await fetch('/api/create-transaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: params.orderId,
      userId: params.userId,
      total: params.total,
      items: params.items.map((item) => ({
        id: item.productId,
        price: item.price,
        quantity: item.quantity,
        name: item.name,
        image: item.image,
      })),
      midtransItems: params.midtransItems,
      customerDetails: params.customerDetails,
      shippingMethod: params.shippingMethod,
      shippingCost: params.shippingCost,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return { token: data.token, orderId: data.orderId };
}

// ─── Midtrans status mapping ─────────────────────────────────────────────────

export function mapMidtransStatus(
  transactionStatus?: string,
  fraudStatus?: string
): string {
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
}

// ─── Save order to Firestore (from server-side API) ──────────────────────────

export async function saveOrderToFirestore(orderData: {
  orderId: string;
  userId: string;
  items: any[];
  total: number;
  customerDetails: any;
  shippingMethod: string | null;
  shippingCost: number;
  paymentToken: string;
  paymentRedirectUrl: string | null;
}): Promise<void> {
  await setDoc(doc(db, 'orders', orderData.orderId), {
    ...orderData,
    status: 'pending',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  extraFields?: Record<string, any>
): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), {
    status,
    updatedAt: Timestamp.now(),
    ...extraFields,
  });
}

// ─── Order listing ────────────────────────────────────────────────────────────

export function listenOrders(
  callback: (orders: any[]) => void
): Unsubscribe {
  const q = query(collection(db, 'orders'));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });
    callback(orders);
  });
}

export function listenRecentOrders(
  limitCount: number,
  callback: (orders: any[]) => void
): Unsubscribe {
  const q = query(collection(db, 'orders'));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      })
      .slice(0, limitCount);
    callback(orders);
  });
}

export async function fetchUserOrders(userId: string): Promise<any[]> {
  const q = query(collection(db, 'orders'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a: any, b: any) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
}
