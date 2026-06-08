'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';
import { Star, Heart, ShoppingBag, Ruler, ChevronRight } from 'lucide-react';
import { listenProductById, Product } from '@/controllers/productController';
import { addToCart } from '@/controllers/cartController';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Default sizes and colors if not specified
  const defaultSizes = ['S', 'M', 'L', 'XL'];
  const defaultColors = [
    { name: 'Navy', color: '#1e293b' },
    { name: 'Grey', color: '#a1a1aa' },
    { name: 'Black', color: '#18181b' },
    { name: 'White', color: '#fafafa' },
  ];

  useEffect(() => {
    if (typeof id !== 'string') return;

    const unsubscribe = listenProductById(id, (product) => {
      if (product) {
        setProduct(product);
        if (product.colors && product.colors.length > 0) {
          setSelectedColor(product.colors[0]);
        }
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
      await addToCart(
        user.uid,
        { id: product.id, name: product.name, price: product.price, image: product.image },
        quantity,
        selectedSize,
        selectedColor
      );
      toast.success(`${product.name} telah ditambahkan ke keranjang!`);
    } catch (error) {
      console.error("Error adding to cart: ", error);
      toast.error('Gagal menambahkan produk ke keranjang.');
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    if (!isWishlisted) {
      toast.success('Ditambahkan ke wishlist!');
    } else {
      toast.info('Dihapus dari wishlist');
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="max-w-[1280px] mx-auto px-4 sm:px-10 py-6">
        <div className="flex gap-2 py-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-4">
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="col-span-2 aspect-[3/4] rounded-xl" />
              <Skeleton className="aspect-[3/4] rounded-xl" />
              <Skeleton className="aspect-[3/4] rounded-xl" />
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-32" />
            <div className="space-y-4 pt-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Product not found
  if (!product) {
    return (
      <main className="max-w-[1280px] mx-auto px-4 sm:px-10 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Produk Tidak Ditemukan</h2>
          <p className="text-slate-500 mb-8">Maaf, produk yang Anda cari tidak tersedia.</p>
          <Link href="/product" className="bg-slate-900 text-white font-bold py-4 px-8 uppercase tracking-widest text-xs hover:bg-amber-500 transition-colors inline-flex items-center">
              Kembali ke Produk
          </Link>
        </div>
      </main>
    );
  }

  const productImages = product.images && product.images.length > 0
    ? product.images
    : [product.image || '/placeholder.jpg'];

  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : defaultSizes;

  return (
    <main className="max-w-[1280px] mx-auto px-4 sm:px-10 py-6">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-2 py-4">
        <Link href="/" className="text-slate-400 text-xs font-medium uppercase tracking-widest hover:text-amber-500 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <Link href="/product" className="text-slate-400 text-xs font-medium uppercase tracking-widest hover:text-amber-500 transition-colors">
          Produk
        </Link>
        {product.category && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <Link href={`/product?category=${product.category}`} className="text-slate-400 text-xs font-medium uppercase tracking-widest hover:text-amber-500 transition-colors">
              {product.category}
            </Link>
          </>
        )}
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-900 text-xs font-bold uppercase tracking-widest line-clamp-1">
          {product.name}
        </span>
      </nav>

      {/* Main Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-4">
        {/* Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:gap-4">
            {/* Main Image */}
            <div className="col-span-2 aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 group">
              <div
                className="w-full h-full bg-center bg-cover transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url("${productImages[0]}")` }}
              />
            </div>
            {/* Secondary Images */}
            {productImages.slice(1, 5).map((img, index) => (
              <div key={index} className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 group cursor-pointer">
                <div
                  className="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url("${img}")` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24 space-y-6 lg:space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                {product.category && (
                  <span className="text-xs font-bold tracking-widest uppercase py-1 border-b border-amber-500 text-amber-500">
                    {product.category}
                  </span>
                )}
                <div className="ml-auto flex items-center gap-1.5 text-xs font-bold uppercase">
                  {product.stock > 0 ? (
                    <>
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-green-600">Tersedia</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-red-500 rounded-full" />
                      <span className="text-red-500">Habis</span>
                    </>
                  )}
                </div>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold leading-tight tracking-tight uppercase">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-0.5 text-slate-900">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-4 h-4 ${star <= 4 ? 'fill-current' : ''}`} />
                  ))}
                </div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider underline cursor-pointer hover:text-amber-500">
                  4.8 (128 Ulasan)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="py-2">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl lg:text-3xl font-bold text-slate-900">
                  Rp {product.price.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-lg text-slate-400 line-through font-medium">
                    Rp {product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                Gratis ongkir untuk pembelian di atas Rp 500.000
              </p>
            </div>

            {/* Options */}
            <div className="space-y-6 lg:space-y-8 pt-4 border-t border-slate-100">
              {/* Color Selector */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest">
                    Warna: <span className="font-normal text-slate-500 ml-2">{selectedColor || defaultColors[0].name}</span>
                  </h3>
                </div>
                <div className="flex gap-4">
                  {defaultColors.map((colorOption) => (
                    <button
                      key={colorOption.name}
                      onClick={() => setSelectedColor(colorOption.name)}
                      className="group relative"
                    >
                      <div
                        className={`w-8 h-8 rounded-full border transition-all ${selectedColor === colorOption.name
                            ? 'ring-2 ring-slate-900 ring-offset-2'
                            : 'border-slate-200 hover:scale-110'
                          }`}
                        style={{ backgroundColor: colorOption.color }}
                      />
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity uppercase font-bold whitespace-nowrap">
                        {colorOption.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">Pilih Ukuran</h3>
                  <button className="text-[11px] font-bold text-amber-500 uppercase underline tracking-wider flex items-center gap-1 hover:text-amber-600">
                    <Ruler className="w-4 h-4" />
                    Panduan Ukuran
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 text-sm font-bold border transition-all uppercase ${selectedSize === size
                          ? 'border-2 border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 hover:border-slate-900'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-4">Jumlah</h3>
                <div className="flex items-center border border-slate-200 w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center text-lg font-bold hover:bg-slate-100 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-16 text-center font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center text-lg font-bold hover:bg-slate-100 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-slate-900 hover:bg-amber-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 lg:py-5 uppercase tracking-widest flex items-center justify-center gap-3 transition-all text-xs"
              >
                <ShoppingBag className="w-5 h-5" />
                Tambah ke Keranjang
              </button>
              <button
                onClick={handleWishlist}
                className={`w-full border font-bold py-4 lg:py-5 uppercase tracking-widest transition-all text-xs flex items-center justify-center gap-2 ${isWishlisted
                    ? 'bg-rose-50 border-rose-200 text-rose-500'
                    : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'
                  }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                {isWishlisted ? 'Di Wishlist' : 'Tambah ke Wishlist'}
              </button>
            </div>

            {/* Stock Info */}
            <p className="text-xs text-slate-500">
              Stok tersedia: <strong className="text-slate-900">{product.stock}</strong> item
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-16 lg:mt-24 border-t border-slate-100">
        <div className="flex justify-center gap-6 lg:gap-12 overflow-x-auto">
          {[
            { id: 'description', label: 'Deskripsi' },
            { id: 'material', label: 'Material & Perawatan' },
            { id: 'shipping', label: 'Pengiriman & Retur' },
            { id: 'reviews', label: 'Ulasan (128)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-6 border-b-2 font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-colors ${activeTab === tab.id
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-900'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 py-8 lg:py-12 max-w-5xl mx-auto">
          <div className="lg:col-span-7 space-y-6 lg:space-y-8">
            {activeTab === 'description' && (
              <>
                <h2 className="text-xl font-bold uppercase tracking-tight">{product.name}</h2>
                <p className="text-slate-600 leading-loose text-sm">
                  {product.description || 'Produk fashion berkualitas tinggi dengan desain modern dan nyaman dipakai. Dibuat dari bahan premium yang tahan lama dan mudah dirawat.'}
                </p>
                <div className="grid grid-cols-2 gap-8 text-sm">
                  <div>
                    <h4 className="font-bold uppercase tracking-widest text-xs mb-4">Detail Fit</h4>
                    <ul className="space-y-2 text-slate-500">
                      <li>• {product.fit || 'Regular fit'}</li>
                      <li>• Desain modern</li>
                      <li>• Nyaman untuk sehari-hari</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold uppercase tracking-widest text-xs mb-4">Material</h4>
                    <ul className="space-y-2 text-slate-500">
                      <li>• {product.material || '100% Cotton'}</li>
                      <li>• Premium quality</li>
                      <li>• Pre-shrunk</li>
                    </ul>
                  </div>
                </div>
              </>
            )}
            {activeTab === 'material' && (
              <>
                <h2 className="text-xl font-bold uppercase tracking-tight">Material & Perawatan</h2>
                <div className="space-y-4 text-sm text-slate-600">
                  <p><strong>Material:</strong> {product.material || '100% Cotton berkualitas tinggi'}</p>
                  <p><strong>Instruksi Cuci:</strong></p>
                  <ul className="space-y-2 text-slate-500">
                    <li>• Cuci dengan mesin pada suhu 30°C</li>
                    <li>• Jangan gunakan pemutih</li>
                    <li>• Setrika pada suhu rendah</li>
                    <li>• Jangan dry clean</li>
                  </ul>
                </div>
              </>
            )}
            {activeTab === 'shipping' && (
              <>
                <h2 className="text-xl font-bold uppercase tracking-tight">Pengiriman & Retur</h2>
                <div className="space-y-4 text-sm text-slate-600">
                  <p><strong>Pengiriman:</strong></p>
                  <ul className="space-y-2 text-slate-500">
                    <li>• Pengiriman 2-5 hari kerja</li>
                    <li>• Gratis ongkir untuk pembelian di atas Rp 500.000</li>
                    <li>• Tersedia same day delivery untuk area tertentu</li>
                  </ul>
                  <p><strong>Kebijakan Retur:</strong></p>
                  <ul className="space-y-2 text-slate-500">
                    <li>• Retur dalam 14 hari setelah pembelian</li>
                    <li>• Produk harus dalam kondisi asli dengan tag</li>
                    <li>• Pengembalian dana dalam 5-7 hari kerja</li>
                  </ul>
                </div>
              </>
            )}
            {activeTab === 'reviews' && (
              <>
                <h2 className="text-xl font-bold uppercase tracking-tight">Ulasan Pelanggan</h2>
                <p className="text-slate-500 text-sm">Fitur ulasan akan segera tersedia.</p>
              </>
            )}
          </div>

          {/* Rating Summary */}
          <div className="lg:col-span-5 bg-slate-50 p-6 lg:p-8 rounded-xl h-fit">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 lg:mb-8">Kepuasan Pelanggan</h3>
            <div className="flex items-center gap-6 mb-6 lg:mb-8">
              <p className="text-4xl lg:text-5xl font-black">4.8</p>
              <div className="space-y-1">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-4 h-4 text-slate-900 ${star <= 4 ? 'fill-current' : ''}`} />
                  ))}
                </div>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">128 Ulasan Terverifikasi</p>
              </div>
            </div>
            <div className="space-y-3 lg:space-y-4">
              {[
                { stars: 5, percentage: 80 },
                { stars: 4, percentage: 15 },
                { stars: 3, percentage: 5 },
              ].map((rating) => (
                <div key={rating.stars} className="grid grid-cols-[30px_1fr_40px] items-center gap-4">
                  <p className="text-xs font-bold uppercase">{rating.stars} ★</p>
                  <div className="h-1 bg-slate-200 rounded-full">
                    <div
                      className="h-full bg-slate-900 rounded-full"
                      style={{ width: `${rating.percentage}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-right">{rating.percentage}%</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 lg:mt-10 py-4 border border-slate-900 font-bold text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
              Tulis Ulasan
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}