'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '@/firebase';
import { collection, addDoc, getDocs, query, orderBy, Timestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import AdminGuard from '@/components/auth/AdminGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Upload, CheckCircle, XCircle, Image as ImageIcon, Search, Package, AlertCircle, Filter, Pencil, Trash2, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  gender: string; // Changed from category to gender/category split
  category: string;
  image: string;
  description: string;
  createdAt: any;
}

export default function AdminProductsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // --- STATE FORM ---
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    gender: 'Unisex', // Default
    category: '',     // Specific type (e.g. Pakaian)
    description: '',
  });
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  // --- STATE EDITING ---
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // --- STATE LOADING & DATA ---
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // --- STATE MODAL FEEDBACK ---
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStatus, setDialogStatus] = useState<'success' | 'error'>('success');
  const [dialogMessage, setDialogMessage] = useState('');

  // Fetch Produk saat halaman dimuat
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          // Backward compatibility if gender field missing
          gender: d.gender || 'Unisex',
          category: d.category || 'Uncategorized'
        };
      }) as Product[];
      setProducts(data);
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

  // Handler for Select components
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 700 * 1024) {
        setDialogStatus('error');
        setDialogMessage("Ukuran file terlalu besar! Harap upload gambar di bawah 700KB.");
        setDialogOpen(true);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
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
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteDoc(doc(db, 'products', id));
        fetchProducts();
        setDialogStatus('success');
        setDialogMessage(`Product "${name}" deleted successfully.`);
        setDialogOpen(true);
      } catch (error: any) {
        console.error("Error deleting product:", error);
        setDialogStatus('error');
        setDialogMessage("Failed to delete product.");
        setDialogOpen(true);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!imageBase64) throw new Error("Gambar produk wajib diupload!");

      const productData = {
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock),
        gender: formData.gender,
        category: formData.category,
        description: formData.description,
        image: imageBase64,
        updatedAt: Timestamp.now(),
      };

      if (isEditing && editId) {
        await updateDoc(doc(db, 'products', editId), productData);
        setDialogMessage('Product updated successfully!');
      } else {
        await addDoc(collection(db, 'products'), { ...productData, createdAt: Timestamp.now() });
        setDialogMessage('Product added to catalog!');
      }

      handleCancelEdit();
      fetchProducts();
      setDialogStatus('success');
      setDialogOpen(true);
    } catch (error: any) {
      console.error("Error saving product:", error);
      setDialogStatus('error');
      setDialogMessage(error.message || 'Failed to save product.');
      setDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Out of Stock</span>;
    if (stock < 5) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Low Stock ({stock})</span>;
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">In Stock ({stock})</span>;
  };

  return (
    <AdminGuard>
      <div className="mx-auto p-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Products</h1>
            <p className="text-slate-500 font-medium">Manage your inventory, prices, and categories</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 lg:sticky lg:top-24" ref={formRef}>
            <Card className={`rounded-2xl border-slate-100 shadow-sm overflow-hidden bg-white transition-all ${isEditing ? 'ring-2 ring-amber-500 shadow-md' : ''}`}>
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  {isEditing ? <><Pencil className="w-5 h-5 text-amber-600" /> Edit Product</> : <><Plus className="w-5 h-5 text-amber-600" /> New Product</>}
                </CardTitle>
                <CardDescription>{isEditing ? 'Update existing product details' : 'Add a new item to your catalog'}</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700">Product Image <span className="text-red-500">*</span></Label>
                    <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative overflow-hidden group ${imageBase64 ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200 hover:border-amber-400 hover:bg-slate-50'}`}>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" required={!imageBase64} />
                      {imageBase64 ? (
                        <div className="relative h-48 w-full flex items-center justify-center">
                          <img src={imageBase64} alt="Preview" className="h-full object-contain rounded-lg shadow-sm" />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg backdrop-blur-sm">
                            <div className="bg-white/20 p-2 rounded-full backdrop-blur-md"><p className="text-white text-xs font-bold px-3 py-1">Change Image</p></div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-2">
                          <div className="w-14 h-14 rounded-full bg-slate-100 items-center justify-center flex mb-3 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                            <Upload className="w-6 h-6 text-slate-400 group-hover:text-amber-600" />
                          </div>
                          <span className="text-sm font-bold text-slate-700 group-hover:text-amber-700">Click to upload image</span>
                          <span className="text-xs text-slate-400 mt-1">PNG, JPG (Max 700KB)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Product Name <span className="text-red-500">*</span></Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g. Premium Cotton Shirt" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-amber-500 focus-visible:border-amber-500 transition-all focus:bg-white" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price" className="text-sm font-semibold text-slate-700">Price (Rp) <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">Rp</span>
                          <Input id="price" name="price" type="number" value={formData.price} onChange={handleInputChange} required placeholder="0" className="pl-9 h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-amber-500 focus-visible:border-amber-500 transition-all focus:bg-white" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stock" className="text-sm font-semibold text-slate-700">Stock <span className="text-red-500">*</span></Label>
                        <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleInputChange} required placeholder="0" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-amber-500 focus-visible:border-amber-500 transition-all focus:bg-white" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gender" className="text-sm font-semibold text-slate-700">Gender <span className="text-red-500">*</span></Label>
                        <Select onValueChange={(val) => handleSelectChange('gender', val)} value={formData.gender}>
                          <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:ring-amber-500 focus:border-amber-500">
                            <SelectValue placeholder="Select Gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pria">Pria</SelectItem>
                            <SelectItem value="Wanita">Wanita</SelectItem>
                            <SelectItem value="Unisex">Unisex</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-sm font-semibold text-slate-700">Category <span className="text-red-500">*</span></Label>
                        <Select onValueChange={(val) => handleSelectChange('category', val)} value={formData.category}>
                          <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:ring-amber-500 focus:border-amber-500">
                            <SelectValue placeholder="Select Category" />
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
                        <Label htmlFor="description" className="text-sm font-semibold text-slate-700">Description</Label>
                        <span className="text-xs text-slate-400">Optional</span>
                      </div>
                      <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Describe your product..." className="min-h-[120px] rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-amber-500 focus-visible:border-amber-500 transition-all focus:bg-white resize-y" />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    {isEditing && (
                      <Button type="button" variant="outline" className="w-1/3 h-12 rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    )}
                    <Button type="submit" className={`flex-1 h-12 ${isEditing ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-900 hover:bg-slate-800'} text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]`} disabled={loading}>
                      {loading ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {isEditing ? 'Updating...' : 'Saving...'}</>) : (isEditing ? 'Update Product' : 'Save Product')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Search products..." className="pl-10 bg-white border-slate-200 rounded-xl focus-visible:ring-amber-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>

            <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest w-[80px]">Image</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Details</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Category</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Price</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.length === 0 ? (
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No products found.</td></tr>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xs text-center p-6 rounded-3xl bg-white border border-slate-100 shadow-xl">
          <DialogHeader>
            <div className="mx-auto mb-4 flex items-center justify-center relative">
              <div className={`absolute w-16 h-16 rounded-full blur-xl opacity-20 ${dialogStatus === 'success' ? 'bg-green-400' : 'bg-red-400'}`}></div>
              {dialogStatus === 'success' ? (
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10"><CheckCircle className="w-8 h-8 text-green-500" /></div>
              ) : (
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10"><XCircle className="w-8 h-8 text-red-500" /></div>
              )}
            </div>
            <DialogTitle className="text-center text-xl font-black text-slate-900 tracking-tight">{dialogStatus === 'success' ? 'Success!' : 'Error!'}</DialogTitle>
            <DialogDescription className="text-center text-slate-500 mt-2 font-medium">{dialogMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-6">
            <Button type="button" className="w-full rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-6 shadow-lg shadow-neutral-900/20 active:scale-[0.98] transition-all" onClick={() => setDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminGuard>
  );
}