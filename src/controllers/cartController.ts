import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/firebase';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

// ─── Real-time listener ──────────────────────────────────────────────────────

export function listenCart(
  userId: string,
  callback: (items: CartItem[]) => void
): Unsubscribe {
  const cartRef = collection(db, 'users', userId, 'cart');
  const q = query(cartRef);

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CartItem[];
    callback(items);
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export async function addToCart(
  userId: string,
  product: { id: string; name: string; price: number; image?: string },
  quantity: number = 1,
  size?: string,
  color?: string
): Promise<{ action: 'added' | 'updated'; newQuantity: number }> {
  const cartRef = collection(db, 'users', userId, 'cart');
  const q = query(cartRef, where('productId', '==', product.id));
  const existing = await getDocs(q);

  if (!existing.empty) {
    const existingDoc = existing.docs[0];
    const newQty = existingDoc.data().quantity + quantity;
    await updateDoc(existingDoc.ref, {
      quantity: newQty,
      size: size ?? existingDoc.data().size,
      color: color ?? existingDoc.data().color,
    });
    return { action: 'updated', newQuantity: newQty };
  }

  await addDoc(cartRef, {
    productId: product.id,
    name: product.name,
    price: product.price,
    image: product.image || '',
    quantity,
    size: size || null,
    color: color || null,
  });

  return { action: 'added', newQuantity: quantity };
}

export async function updateCartItemQuantity(
  userId: string,
  itemId: string,
  newQuantity: number
): Promise<void> {
  if (newQuantity < 1) return;
  const itemRef = doc(db, 'users', userId, 'cart', itemId);
  await updateDoc(itemRef, { quantity: newQuantity });
}

export async function removeCartItem(
  userId: string,
  itemId: string
): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'cart', itemId));
}

export async function clearCart(userId: string): Promise<void> {
  const cartRef = collection(db, 'users', userId, 'cart');
  const snapshot = await getDocs(cartRef);

  if (snapshot.empty) return;

  const batch = writeBatch(db);
  snapshot.docs.forEach((cartDoc) => batch.delete(cartDoc.ref));
  await batch.commit();
}

// ─── Pure helpers ────────────────────────────────────────────────────────────

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function calculateItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
