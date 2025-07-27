'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import ProductCard from '@/components/product/ProductCard';

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

  // Fetch products
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(data);
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

      // Inject image from one of the products if category image missing
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
    });

    return () => unsub();
  }, [products]);

  return (
    <div className="space-y-24">
      {/* Hero */}
      <section className="relative h-[600px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="text-5xl font-extrabold sm:text-7xl">Welcome to Toko Rizky</h1>
          <p className="mt-6 text-xl max-w-xl mx-auto">Discover our amazing collection of products and enjoy exclusive deals.</p>
          <a
            href="/products"
            className="mt-10 inline-block rounded-full bg-white text-indigo-600 px-10 py-4 font-semibold shadow-lg hover:bg-gray-100 transition"
          >
            Shop Now
          </a>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
        {products.length === 0 ? (
          <p className="text-gray-500">Loading products...</p>
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

      {/* Categories */}
      <section className="mt-20">
        <h2 className="text-3xl font-bold mb-8">Belanja Berdasarkan Kategori</h2>

        {categories.length === 0 ? (
          <p className="text-gray-500">Kategori belum tersedia</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <a
                key={category.id}
                href={`/product?category=${encodeURIComponent(category.name)}`} // 🔥 ganti ini
                className="group rounded-xl overflow-hidden border bg-white shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
