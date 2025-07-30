'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot, collection, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  category?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { user } = useAuth(); // Ambil data user
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof id !== 'string') return;

    const docRef = doc(db, 'products', id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
      } else {
        setProduct(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu untuk menambahkan ke keranjang.');
      router.push('/login');
      return;
    }

    if (!product) return;

    try {
      const cartRef = collection(db, 'users', user.uid, 'cart');
      const q = query(cartRef, where('productId', '==', product.id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Jika produk sudah ada, update quantity
        const existingDoc = querySnapshot.docs[0];
        const newQuantity = existingDoc.data().quantity + 1;
        await updateDoc(existingDoc.ref, { quantity: newQuantity });
        toast.success(`Jumlah ${product.name} di keranjang diperbarui!`);
      } else {
        // Jika produk belum ada, tambahkan sebagai item baru
        await addDoc(cartRef, {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image || '',
          quantity: 1,
        });
        toast.success(`${product.name} telah ditambahkan ke keranjang!`);
      }
    } catch (error) {
      console.error("Error adding to cart: ", error);
      toast.error('Gagal menambahkan produk ke keranjang.');
    }
  };

  // ... (sisa kode tidak berubah)
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="w-full h-96 rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Produk Tidak Ditemukan</h2>
        <p className="text-gray-500 mt-2">Maaf, produk yang Anda cari tidak ada.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-2">
          <CardHeader className="p-0">
            <img
              src={product.image || '/placeholder.jpg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </CardHeader>
          <div className="p-6 flex flex-col justify-between">
            <div>
              {product.category && (
                <Badge variant="outline" className="mb-2">
                  {product.category}
                </Badge>
              )}
              <CardTitle className="text-3xl font-bold mb-2">{product.name}</CardTitle>
              <p className="text-3xl font-semibold text-indigo-600 mb-4">
                Rp {product.price.toLocaleString()}
              </p>
              <CardDescription className="text-base text-gray-700 mb-4">
                {product.description}
              </CardDescription>
              <p className="text-sm text-gray-500">
                Stok tersedia: <strong>{product.stock}</strong>
              </p>
            </div>
            <Button onClick={handleAddToCart} size="lg" className="w-full mt-6">
              🛒 Tambah ke Keranjang
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}