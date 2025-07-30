'use client';

import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import Link from 'next/link';
import { ShoppingCart, Minus, Plus } from 'lucide-react';

export default function CartPage() {
  const { user } = useAuth();
  const { cartItems, loading } = useCart();

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1 || !user) return;
    const itemRef = doc(db, 'users', user.uid, 'cart', id);
    try {
      await updateDoc(itemRef, { quantity: newQuantity });
    } catch (error) {
      toast.error('Gagal memperbarui jumlah item.');
    }
  };

  const removeItem = async (id: string) => {
    if (!user) return;
    const itemRef = doc(db, 'users', user.uid, 'cart', id);
    try {
      await deleteDoc(itemRef);
      toast.success('Item dihapus dari keranjang.');
    } catch (error) {
      toast.error('Gagal menghapus item.');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  if (loading) {
    return (
       <div className="space-y-8">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
        <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-4">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
            </div>
            <div className="lg:col-span-4">
                <Skeleton className="h-64 w-full rounded-lg" />
            </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Shopping Cart</h1>
      {cartItems.length > 0 ? (
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="space-y-4">
              {cartItems.map(item => (
                <Card key={item.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="h-24 w-24 overflow-hidden rounded-md border">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Rp {item.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4"/>
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-16 text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        Rp {(item.price * item.quantity).toLocaleString()}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
            <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rp {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (10%)</span>
                    <span>Rp {tax.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total</span>
                      <span>Rp {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <Link href="/checkout" passHref>
                    <Button className="w-full mt-6" size="lg">
                    Proceed to Checkout
                    </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <ShoppingCart className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-xl font-semibold">Keranjang Anda Kosong</h3>
          <p className="text-muted-foreground mt-2">Sepertinya Anda belum menambahkan produk apapun.</p>
          <Link href="/product">
             <Button className="mt-6">Lanjutkan Belanja</Button>
          </Link>
        </div>
      )}
    </div>
  );
}