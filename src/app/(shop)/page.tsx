'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { listenProducts, listenCategories, Product, Category } from '@/controllers/productController';

export type { Product, Category };

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  // Fetch products
  useEffect(() => {
    const unsub = listenProducts((data) => {
      setProducts(data);
      setLoadingProducts(false);
    });
    return () => unsub();
  }, []);

  // Fetch categories
  useEffect(() => {
    const unsub = listenCategories((data) => {
      setCategories(data);
      setLoadingCategories(false);
    });
    return () => unsub();
  }, []);

  // Filter products based on active filter
  const filteredProducts = activeFilter === 'all' 
    ? products 
    : products.filter(p => p.category?.toLowerCase() === activeFilter.toLowerCase());

  // Skeleton component for loading state
  const ProductSkeleton = () => (
    <div className="flex flex-col space-y-2">
      <Skeleton className="aspect-[3/4] w-full rounded-lg" />
      <div className="space-y-1.5 pt-1">
        <Skeleton className="h-2.5 w-12" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-4 px-6">
        <div className="relative overflow-hidden bg-slate-100 h-[280px] md:h-[360px] flex items-center group rounded-xl">
          <div className="absolute inset-0 z-0">
            <div
              className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1920&q=80")'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          </div>
          <div className="relative z-10 px-8 md:px-14 max-w-xl text-white">
            <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] mb-3 text-amber-400">
              Koleksi 2026
            </span>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black leading-none mb-4 uppercase italic">
              Koleksi<br/>Fashion Terbaru
            </h1>
            <p className="text-white/90 text-xs md:text-sm mb-6 max-w-sm font-medium">
              Temukan gaya kontemporer dengan pilihan pakaian premium kami yang dikurasi khusus untuk Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/product?category=wanita" className="bg-white text-black hover:bg-amber-500 hover:text-white font-bold h-11 px-7 transition-all duration-300 uppercase text-[11px] tracking-widest w-full sm:w-auto inline-flex items-center justify-center rounded">
                Koleksi Wanita
              </Link>
              <Link href="/product?category=pria" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black font-bold h-11 px-7 transition-all duration-300 uppercase text-[11px] tracking-widest w-full sm:w-auto inline-flex items-center justify-center rounded">
                Koleksi Pria
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter Buttons */}
      <section className="py-6 px-6">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex h-9 items-center gap-2 px-5 rounded-full transition-all duration-300 ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white border border-slate-200 hover:border-slate-900'
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-widest">Semua Koleksi</span>
          </button>
          {!loadingCategories && categories.slice(0, 4).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.name)}
              className={`flex h-9 items-center gap-2 px-5 rounded-full transition-all duration-300 ${
                activeFilter.toLowerCase() === cat.name.toLowerCase()
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white border border-slate-200 hover:border-slate-900 text-slate-600'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mt-4 lg:mt-6 px-6">
        {/* Products Grid */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 lg:mb-8 gap-4">
            <div>
              <h2 className="text-xl lg:text-2xl font-black uppercase tracking-tight italic">Koleksi Pilihan</h2>
              <p className="text-slate-500 text-[11px] mt-1.5 uppercase tracking-widest">
                Menampilkan {filteredProducts.length} produk
              </p>
            </div>
            <Link href="/product" className="text-[10px] font-black uppercase tracking-[0.2em] border border-slate-200 hover:border-slate-900 px-4 py-2 rounded transition-colors">
              Lihat Semua
            </Link>
          </div>

          {/* Product Grid */}
          {loadingProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
              {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
              {filteredProducts.slice(0, 12).map((product, index) => (
                <Link href={`/product/${product.id}`} key={product.id} className="group product-card flex flex-col cursor-pointer">
                  <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 rounded-lg">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{
                        backgroundImage: `url("${product.image || '/placeholder.jpg'}")`
                      }}
                    />
                    {product.secondaryImage && (
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                        style={{
                          backgroundImage: `url("${product.secondaryImage}")`
                        }}
                      />
                    )}

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                      {index < 3 && (
                        <span className="bg-slate-900 text-white text-[8px] font-black px-2 py-1 uppercase tracking-widest rounded">
                          Baru
                        </span>
                      )}
                      {product.discount && (
                        <span className="bg-rose-500 text-white text-[8px] font-black px-2 py-1 uppercase tracking-widest rounded">
                          -{product.discount}%
                        </span>
                      )}
                    </div>

                    {/* Quick Add Overlay */}
                    <span className="absolute bottom-0 left-0 right-0 bg-slate-900 text-white text-[9px] font-black py-2.5 uppercase tracking-[0.2em] translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center">
                      Lihat Detail
                    </span>
                  </div>

                  <div className="pt-3 flex flex-col">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      {product.category || 'Fashion'}
                    </p>
                    <h3 className="text-xs font-bold uppercase tracking-wide mb-1.5 line-clamp-1">
                      {product.name}
                    </h3>
                    {product.originalPrice && product.originalPrice > product.price ? (
                      <div className="flex gap-2 items-center">
                        <span className="text-xs font-bold text-slate-400 line-through">
                          Rp {product.originalPrice.toLocaleString()}
                        </span>
                        <span className="text-xs font-black text-rose-500">
                          Rp {product.price.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-black">
                        Rp {product.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Lihat semua produk */}
          {filteredProducts.length > 12 && (
            <div className="mt-12 lg:mt-16 flex justify-center">
              <Link
                href="/product"
                className="bg-slate-900 text-white font-bold py-3.5 px-9 uppercase tracking-widest text-[11px] hover:bg-amber-500 transition-colors inline-flex items-center rounded"
              >
                Lihat Semua Produk
              </Link>
            </div>
          )}

      </div>

      {/* Featured Categories Section */}
      <section className="mt-20 lg:mt-32 px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-black uppercase tracking-[0.3em] text-amber-500 mb-4 block">
            Koleksi Unggulan
          </span>
          <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tight italic">
            Belanja Berdasarkan Kategori
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loadingCategories ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4]" />
            ))
          ) : (
            categories.slice(0, 4).map((category) => (
              <Link 
                href={`/product?category=${category.name.toLowerCase()}`} 
                key={category.id}
                className="group relative aspect-[3/4] overflow-hidden bg-slate-100 rounded-lg cursor-pointer"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{
                    backgroundImage: `url("${category.image || 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80'}")`
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-black uppercase tracking-wider mb-2">{category.name}</h3>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
                    Lihat Koleksi →
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}