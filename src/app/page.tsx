'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton'; // <-- Impor Skeleton
import CategoryCard from '@/components/category/CategoryCard';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch products
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(data);
      setLoadingProducts(false);
    });
    return () => unsub();
  }, []);

  // Fetch categories & auto-generate image if missing
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const categoryData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];

      // Inject image from one of the products if category image is missing
      const updated = categoryData.map((cat) => {
        if (cat.image) return cat;

        const productInCategory = products.find(
          (p) => p.category?.toLowerCase() === cat.name.toLowerCase() && p.image
        );

        return {
          ...cat,
          image: productInCategory?.image || '/placeholder.jpg',
        };
      });

      setCategories(updated);
      setLoadingCategories(false);
    });

    return () => unsub();
  }, [products]);
  
  // Skeleton component for loading state
  const CardSkeleton = () => (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[225px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
    </div>
  );

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative h-[500px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold sm:text-7xl">Selamat Datang di Toko Rizky</h1>
          <p className="mt-6 text-xl max-w-2xl mx-auto">Temukan koleksi produk kami yang menakjubkan dan nikmati penawaran eksklusif.</p>
          <Link href="/product">
            <Button size="lg" className="mt-10 bg-white text-indigo-600 hover:bg-gray-100 px-10 py-6 text-lg font-semibold shadow-lg">
              Shop Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Products Section */}
      <section>
        <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
        {loadingProducts ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image || ''}
                category={product.category || ''}
              />
            ))}
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section>
        <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
        {loadingCategories ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
             {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 4).map((category) => (
              <CategoryCard
                key={category.id}
                id={category.id}
                name={category.name}
                description={category.description}
                image={category.image}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}