'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Search } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  secondaryImage?: string;
  category?: string;
  isNewSeason?: boolean;
  discount?: number;
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
  const [activeFilter, setActiveFilter] = useState('all');

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

  // Fetch categories
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const categoryData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];
      setCategories(categoryData);
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
    <div className="flex flex-col space-y-3">
      <Skeleton className="aspect-[3/4] w-full" />
      <div className="space-y-2 text-center">
        <Skeleton className="h-3 w-16 mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
        <Skeleton className="h-4 w-20 mx-auto" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen -mt-6 -mx-4">
      {/* Hero Section */}
      <section className="py-6 px-6">
        <div className="relative overflow-hidden bg-slate-100 aspect-[21/9] flex items-center group rounded-lg">
          <div className="absolute inset-0 z-0">
            <div 
              className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1920&q=80")'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          </div>
          <div className="relative z-10 px-8 md:px-16 max-w-2xl text-white">
            <span className="inline-block text-xs font-black uppercase tracking-[0.3em] mb-4 text-amber-400">
              Koleksi 2026
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-none mb-6 uppercase italic">
              Koleksi<br/>Fashion Terbaru
            </h1>
            <p className="text-white/90 text-sm md:text-lg mb-8 md:mb-10 max-w-md font-medium">
              Temukan gaya kontemporer dengan pilihan pakaian premium kami yang dikurasi khusus untuk Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/product?category=wanita">
                <button className="bg-white text-black hover:bg-amber-500 hover:text-white font-bold h-12 md:h-14 px-8 md:px-10 transition-all duration-300 uppercase text-xs tracking-widest w-full sm:w-auto">
                  Koleksi Wanita
                </button>
              </Link>
              <Link href="/product?category=pria">
                <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black font-bold h-12 md:h-14 px-8 md:px-10 transition-all duration-300 uppercase text-xs tracking-widest w-full sm:w-auto">
                  Koleksi Pria
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter Buttons */}
      <section className="py-8 px-6">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`flex h-12 items-center gap-2 px-6 md:px-8 transition-all duration-300 ${
              activeFilter === 'all' 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'bg-white border border-slate-200 hover:border-slate-900 hover:shadow-md'
            }`}
          >
            <span className="text-xs font-black uppercase tracking-widest">Semua Koleksi</span>
          </button>
          {!loadingCategories && categories.slice(0, 4).map((cat) => (
            <button 
              key={cat.id}
              onClick={() => setActiveFilter(cat.name)}
              className={`flex h-12 items-center gap-2 px-6 md:px-8 transition-all duration-300 ${
                activeFilter.toLowerCase() === cat.name.toLowerCase()
                  ? 'bg-slate-900 text-white shadow-lg' 
                  : 'bg-white border border-slate-200 hover:border-slate-900 hover:shadow-md text-slate-600'
              }`}
            >
              <span className="text-xs font-black uppercase tracking-widest">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mt-8 lg:mt-12 px-6">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="lg:sticky lg:top-28 space-y-8 lg:space-y-10 bg-slate-50 p-6 rounded-lg lg:bg-transparent lg:p-0">
            {/* Price Filter */}
            <div>
              <h4 className="font-black text-slate-900 mb-6 uppercase text-[10px] tracking-[0.2em]">Filter Harga</h4>
              <div className="px-2">
                <input 
                  type="range" 
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                  min="0"
                  max="1000000"
                  step="50000"
                />
                <div className="flex justify-between mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <span>Rp 0</span>
                  <span>Rp 1.000.000+</span>
                </div>
              </div>
            </div>

            {/* Color Filter */}
            <div>
              <h4 className="font-black text-slate-900 mb-6 uppercase text-[10px] tracking-[0.2em]">Warna</h4>
              <div className="flex flex-wrap gap-3">
                <button className="w-6 h-6 rounded-full bg-black border-2 border-slate-200 hover:border-slate-900 transition-colors hover:scale-110" title="Hitam" />
                <button className="w-6 h-6 rounded-full bg-white border-2 border-slate-200 hover:border-slate-900 transition-colors hover:scale-110" title="Putih" />
                <button className="w-6 h-6 rounded-full bg-stone-400 border-2 border-slate-200 hover:border-slate-900 transition-colors hover:scale-110" title="Abu-abu" />
                <button className="w-6 h-6 rounded-full bg-blue-900 border-2 border-slate-200 hover:border-slate-900 transition-colors hover:scale-110" title="Navy" />
                <button className="w-6 h-6 rounded-full bg-amber-800 border-2 border-slate-200 hover:border-slate-900 transition-colors hover:scale-110" title="Coklat" />
                <button className="w-6 h-6 rounded-full bg-rose-500 border-2 border-slate-200 hover:border-slate-900 transition-colors hover:scale-110" title="Pink" />
              </div>
            </div>

            {/* Size Filter */}
            <div>
              <h4 className="font-black text-slate-900 mb-6 uppercase text-[10px] tracking-[0.2em]">Ukuran</h4>
              <div className="grid grid-cols-4 gap-2">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                  <button 
                    key={size}
                    className="h-10 border border-slate-200 text-[10px] font-bold hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-200"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 lg:mb-10 gap-4">
            <div>
              <h2 className="text-2xl lg:text-3xl font-black uppercase tracking-tight italic">Koleksi Pilihan</h2>
              <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">
                Menampilkan {filteredProducts.length} produk
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select className="bg-transparent border border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] focus:ring-2 focus:ring-slate-900 cursor-pointer px-4 py-2 rounded">
                <option>Urutkan: Terbaru</option>
                <option>Harga: Rendah ke Tinggi</option>
                <option>Harga: Tinggi ke Rendah</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
              {Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
              {filteredProducts.slice(0, 9).map((product, index) => (
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
                    {index < 3 && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-slate-900 text-white text-[9px] font-black px-3 py-1.5 uppercase tracking-widest rounded">
                          Baru
                        </span>
                      </div>
                    )}
                    {product.discount && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-rose-500 text-white text-[9px] font-black px-3 py-1.5 uppercase tracking-widest rounded">
                          Diskon -{product.discount}%
                        </span>
                      </div>
                    )}
                    
                    {/* Favorite Button */}
                    <button className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/90 rounded-full text-slate-900 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-slate-900 hover:text-white shadow-lg">
                      <Heart className="w-5 h-5" />
                    </button>
                    
                    {/* Quick Add Button */}
                    <button className="absolute bottom-0 left-0 right-0 bg-slate-900 text-white text-[10px] font-black py-4 uppercase tracking-[0.2em] translate-y-full group-hover:translate-y-0 transition-transform duration-300 hover:bg-amber-500">
                      Lihat Detail
                    </button>
                  </div>
                  
                  <div className="pt-6 flex flex-col items-center text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      {product.category || 'Fashion'}
                    </p>
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    {product.originalPrice && product.originalPrice > product.price ? (
                      <div className="flex gap-2 items-center">
                        <span className="text-sm font-bold text-slate-400 line-through">
                          Rp {product.originalPrice.toLocaleString()}
                        </span>
                        <span className="text-sm font-black text-rose-500">
                          Rp {product.price.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm font-black">
                        Rp {product.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredProducts.length > 9 && (
            <div className="mt-16 lg:mt-20 flex justify-center items-center gap-6">
              <button className="text-[10px] font-black uppercase tracking-widest hover:text-amber-500 transition-colors disabled:text-slate-300" disabled>
                Sebelumnya
              </button>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black h-8 w-8 flex items-center justify-center bg-slate-900 text-white rounded">01</span>
                <span className="text-[10px] font-black h-8 w-8 flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer rounded">02</span>
                <span className="text-[10px] font-black h-8 w-8 flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer rounded">03</span>
              </div>
              <button className="text-[10px] font-black uppercase tracking-widest hover:text-amber-500 transition-colors">
                Selanjutnya
              </button>
            </div>
          )}
        </div>
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

      {/* Newsletter Section */}
      <section className="mt-20 lg:mt-32 px-6 mb-12">
        <div className="bg-slate-900 text-white py-16 lg:py-20 px-8 lg:px-16 rounded-lg text-center">
          <span className="text-xs font-black uppercase tracking-[0.3em] text-amber-400 mb-4 block">
            Newsletter
          </span>
          <h2 className="text-2xl lg:text-4xl font-black uppercase tracking-tight italic mb-4">
            Dapatkan Update Terbaru
          </h2>
          <p className="text-white/70 text-sm lg:text-base mb-8 max-w-md mx-auto">
            Daftar untuk mendapatkan akses eksklusif ke koleksi terbaru dan promo spesial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Alamat Email Anda"
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-white/50 px-6 py-4 text-sm focus:outline-none focus:border-amber-400 transition-colors rounded"
            />
            <button className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-8 py-4 uppercase text-xs tracking-widest transition-all duration-300 rounded">
              Berlangganan
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}