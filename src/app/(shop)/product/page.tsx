'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, ChevronRight, ChevronLeft, Heart, Eye, Star, SlidersHorizontal, Loader2 } from 'lucide-react';
import {
  listenProducts,
  listenCategories,
  applyFilters,
  Product,
  Category,
} from '@/controllers/productController';

const PRODUCTS_PER_PAGE = 12;

function ProductContent() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category') || '';
  const searchFromUrl = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'name'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // Set page title
  useEffect(() => {
    document.title = selectedCategory ? `${selectedCategory} | Toko Rizky` : 'Semua Produk | Toko Rizky';
  }, [selectedCategory]);

  // Fetch products via controller
  useEffect(() => {
    const unsub = listenProducts((data) => {
      setProducts(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Fetch categories via controller
  useEffect(() => {
    const unsub = listenCategories((data) => {
      const list = data.map((c) => ({ id: c.id, name: c.name }));
      setCategories(list);
    });
    return () => unsub();
  }, []);

  // Update category from URL
  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
    setSearchQuery(searchFromUrl);
    setCurrentPage(1);
  }, [categoryFromUrl, searchFromUrl]);

  // Filter / sort / paginate via controller
  const { items: paginatedProducts, total: filteredCount, totalPages } = applyFilters(products, {
    category: selectedCategory || undefined,
    search: searchQuery || undefined,
    priceRange,
    sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
    sortBy,
    page: currentPage,
    perPage: PRODUCTS_PER_PAGE,
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setPriceRange([0, 10000000]);
    setSelectedSizes([]);
    setCurrentPage(1);
  };

  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/" className="text-slate-400 hover:text-amber-500 transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <span className="text-slate-900 font-bold">{selectedCategory || 'Semua Produk'}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center justify-center gap-2 w-full py-3 bg-white border border-slate-200 rounded-lg font-bold text-sm uppercase tracking-widest"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filter
        </button>

        {/* Sidebar Filters */}
        <aside className={`w-full lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="sticky top-24 space-y-6 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 uppercase tracking-tight">Filter</h3>
              <button onClick={clearFilters} className="text-xs text-amber-500 font-bold hover:underline uppercase tracking-widest">Clear all</button>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-700">Pencarian</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Cari produk..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-700">Kategori</p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="category" checked={selectedCategory === ''} onChange={() => handleCategoryChange('')} className="rounded-full border-slate-300 text-amber-500 focus:ring-amber-500" />
                  <span className={`text-sm ${selectedCategory === '' ? 'text-amber-500 font-medium' : 'text-slate-600'} group-hover:text-amber-500 transition-colors`}>Semua</span>
                </label>
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="category" checked={selectedCategory === cat.name} onChange={() => handleCategoryChange(cat.name)} className="rounded-full border-slate-300 text-amber-500 focus:ring-amber-500" />
                    <span className={`text-sm ${selectedCategory === cat.name ? 'text-amber-500 font-medium' : 'text-slate-600'} group-hover:text-amber-500 transition-colors`}>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-700">Ukuran</p>
              <div className="flex flex-wrap gap-2">
                {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])}
                    className={`w-10 h-10 flex items-center justify-center border rounded text-xs font-bold transition-all ${selectedSizes.includes(size) ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-amber-500 hover:text-amber-500'}`}
                  >{size}</button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-700">Harga</p>
              <div className="space-y-2">
                {[
                  { label: 'Semua Harga', range: [0, 10000000] as [number, number] },
                  { label: 'Di bawah Rp 100.000', range: [0, 100000] as [number, number] },
                  { label: 'Rp 100.000 - Rp 500.000', range: [100000, 500000] as [number, number] },
                  { label: 'Di atas Rp 500.000', range: [500000, 10000000] as [number, number] },
                ].map((option) => (
                  <label key={option.label} className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="price" checked={priceRange[0] === option.range[0] && priceRange[1] === option.range[1]} onChange={() => { setPriceRange(option.range); setCurrentPage(1); }} className="rounded-full border-slate-300 text-amber-500 focus:ring-amber-500" />
                    <span className="text-sm text-slate-600 group-hover:text-amber-500 transition-colors">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button onClick={() => setShowFilters(false)} className="lg:hidden w-full py-3 bg-slate-900 text-white font-bold rounded-lg uppercase tracking-widest text-xs">Terapkan Filter</button>
          </div>
        </aside>

        {/* Product Grid Area */}
        <section className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-tight">{selectedCategory || 'Semua Produk'}</h1>
              <p className="text-sm text-slate-500 mt-1">Menampilkan {paginatedProducts.length} dari {filteredCount} produk</p>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 cursor-pointer"
            >
              <option value="newest">Terbaru</option>
              <option value="price-low">Harga: Rendah ke Tinggi</option>
              <option value="price-high">Harga: Tinggi ke Rendah</option>
              <option value="name">Nama A-Z</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-100 overflow-hidden animate-pulse">
                  <div className="aspect-[3/4] bg-slate-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-slate-100">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Produk tidak ditemukan</p>
              <button onClick={clearFilters} className="mt-4 px-6 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-amber-500 transition-colors rounded-lg">Reset Filter</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {paginatedProducts.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`} className="group bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                    <div className="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url("${product.image || '/placeholder.jpg'}")` }} />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                    <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 px-4">
                      <span className="px-6 py-2.5 bg-white text-slate-900 font-bold rounded-full shadow-xl text-xs uppercase tracking-widest flex items-center gap-2">
                        <Eye className="w-4 h-4" /> Lihat
                      </span>
                    </div>
                    <span onClick={(e) => { e.preventDefault(); }} className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-full text-slate-900 hover:text-red-500 transition-colors shadow-sm opacity-0 group-hover:opacity-100 cursor-pointer">
                      <Heart className="w-4 h-4" />
                    </span>
                    {product.stock === 0 && <span className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">Habis</span>}
                  </div>
                  <div className="p-4 space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{product.category || 'Uncategorized'}</p>
                    <h3 className="font-semibold text-slate-900 truncate text-sm lg:text-base">{product.name}</h3>
                    <div className="flex items-center justify-between pt-1">
                      <p className="text-amber-600 font-bold">Rp {product.price.toLocaleString('id-ID')}</p>
                      <div className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /><span className="text-xs text-slate-500">4.8</span></div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex flex-col items-center gap-6">
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-amber-500 hover:border-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="w-5 h-5" /></button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  return (
                    <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${currentPage === pageNum ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:text-amber-500 hover:border-amber-500'}`}>{pageNum}</button>
                  );
                })}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-amber-500 hover:border-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-slate-500">Halaman {currentPage} dari {totalPages}</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    }>
      <ProductContent />
    </Suspense>
  );
}
