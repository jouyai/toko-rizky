'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Upload, CheckCircle, XCircle, Image as ImageIcon, Search, Package, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchProducts as fetchProductsCtrl, addProduct, updateProduct, deleteProduct } from '@/controllers/productController';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  gender: string;
  category: string;
  image: string;
  description: string;
  createdAt: any;
}

export default function AdminProductsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    gender: 'Unisex',
    category: '',
    description: '',
  });
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const data = await fetchProductsCtrl();
      const mapped = data.map(product => ({
        ...product,
        gender: product.gender || 'Unisex',
        category: product.category || 'Uncategorized'
      })) as Product[];
      setProducts(mapped);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.gender.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 700 * 1024) {
        toast.error('Ukuran file terlalu besar! Maksimal 700KB.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImageBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (product: Product) => {
    setIsEditing(true);
    setEditId(product.id);
    setFormData({
      name: product.name,
      price: String(product.price),
      stock: String(product.stock),
      gender: product.gender,
      category: product.category,
      description: product.description || '',
    });
    setImageBase64(product.image);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ name: '', price: '', stock: '', gender: 'Unisex', category: '', description: '' });
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus "${name}"?`)) return;
    try {
      await deleteProduct(id);
      fetchProducts();
      toast.success(`"${name}" berhasil dihapus.`);
    } catch (error: any) {
      toast.error('Gagal menghapus produk.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!imageBase64) throw new Error('Gambar produk wajib diupload!');

      const productData = {
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock),
        gender: formData.gender,
        category: formData.category,
        description: formData.description,
        image: imageBase64,
      };

      if (isEditing && editId) {
        await updateProduct(editId, productData);
        toast.success('Produk berhasil diperbarui!');
      } else {
        await addProduct(productData);
        toast.success('Produk berhasil ditambahkan!');
      }

      handleCancelEdit();
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan produk.');
    } finally {
      setLoading(false);
    }
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Habis</span>;
    if (stock < 5) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Sisa {stock}</span>;
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Tersedia ({stock})</span>;
  };

  return (
    <div className="mx-auto p-2 md:p-0 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Produk</h1>
          <p className="text-slate-500 font-medium">Kelola inventaris, harga, dan kategori produk.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 lg:sticky lg:top-24" ref={formRef}>
          <Card className={`rounded-2xl border-slate-100 shadow-sm overflow-hidden bg-white transition-all ${isEditing ? 'ring-2 ring-amber-500 shadow-md' : ''}`}>
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                {isEditing ? <><Pencil className="w-5 h-5 text-amber-600" /> Edit Produk</> : <><Plus className="w-5 h-5 text-amber-600" /> Produk Baru</>}
              </CardTitle>
              <CardDescription>{isEditing ? 'Perbarui detail produk yang sudah ada.' : 'Tambahkan item baru ke katalog.'}</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700">Gambar Produk <span className="text-red-500">*</span></Label>
                  <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative overflow-hidden group ${imageBase64 ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200 hover:border-amber-400 hover:bg-slate-50'}`}>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" required={!imageBase64} />
                    {imageBase64 ? (
                      <div className="relative h-48 w-full flex items-center justify-center">
                        <img src={imageBase64} alt="Preview" className="h-full object-contain rounded-lg shadow-sm" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg backdrop-blur-sm">
                          <span className="bg-white/20 px-3 py-1 rounded-full text-white text-xs font-bold">Ganti Gambar</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-2">
                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors">
                          <Upload className="w-6 h-6 text-slate-400 group-hover:text-amber-600" />
                        </div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-amber-700">Klik untuk upload</span>
                        <span className="text-xs text-slate-400 mt-1">PNG, JPG (Maks 700KB)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Nama Produk <span className="text-red-500">*</span></Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g. Premium Cotton Shirt" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-amber-500 focus-visible:border-amber-500 transition-all focus:bg-white" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-sm font-semibold text-slate-700">Harga (Rp) <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">Rp</span>
                        <Input id="price" name="price" type="number" value={formData.price} onChange={handleInputChange} required placeholder="0" className="pl-9 h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-amber-500 focus-visible:border-amber-500 transition-all focus:bg-white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock" className="text-sm font-semibold text-slate-700">Stok <span className="text-red-500">*</span></Label>
                      <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleInputChange} required placeholder="0" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-amber-500 focus-visible:border-amber-500 transition-all focus:bg-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-sm font-semibold text-slate-700">Gender <span className="text-red-500">*</span></Label>
                      <Select onValueChange={(val) => handleSelectChange('gender', val)} value={formData.gender}>
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:ring-amber-500 focus:border-amber-500">
                          <SelectValue placeholder="Pilih Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pria">Pria</SelectItem>
                          <SelectItem value="Wanita">Wanita</SelectItem>
                          <SelectItem value="Unisex">Unisex</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm font-semibold text-slate-700">Kategori <span className="text-red-500">*</span></Label>
                      <Select onValueChange={(val) => handleSelectChange('category', val)} value={formData.category}>
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:ring-amber-500 focus:border-amber-500">
                          <SelectValue placeholder="Pilih Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pakaian">Pakaian</SelectItem>
                          <SelectItem value="Celana">Celana</SelectItem>
                          <SelectItem value="Jaket">Jaket</SelectItem>
                          <SelectItem value="Sepatu">Sepatu</SelectItem>
                          <SelectItem value="Aksesoris">Aksesoris</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="description" className="text-sm font-semibold text-slate-700">Deskripsi</Label>
                      <span className="text-xs text-slate-400">Opsional</span>
                    </div>
                    <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Deskripsikan produk Anda..." className="min-h-[120px] rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-amber-500 focus-visible:border-amber-500 transition-all focus:bg-white resize-y" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  {isEditing && (
                    <Button type="button" variant="outline" className="w-1/3 h-12 rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold" onClick={handleCancelEdit}>
                      Batal
                    </Button>
                  )}
                  <Button type="submit" className={`flex-1 h-12 ${isEditing ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-900 hover:bg-slate-800'} text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]`} disabled={loading}>
                    {loading ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {isEditing ? 'Menyimpan...' : 'Menyimpan...'}</>) : (isEditing ? 'Perbarui' : 'Simpan Produk')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Cari produk..." className="pl-10 bg-white border-slate-200 rounded-xl focus-visible:ring-amber-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest w-[80px]">Gambar</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Detail</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Kategori</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Harga</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Tidak ada produk ditemukan.</td></tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border border-slate-100">
                            {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-slate-400" />}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-900">{product.name}</p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">{product.category}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                            {product.gender}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-black text-slate-900">Rp {product.price?.toLocaleString('id-ID')}</td>
                        <td className="px-6 py-4">{getStockBadge(product.stock)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50" onClick={() => handleEdit(product)}><Pencil className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(product.id, product.name)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
