'use client';

import { useState, useEffect } from 'react';
import { db } from '@/firebase'; 
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import AdminGuard from '@/components/auth/AdminGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Plus, Upload, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';

export default function AdminProductsPage() {
  // --- STATE FORM ---
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    description: '',
  });
  // State untuk menyimpan gambar dalam format Base64 (String panjang)
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  // --- STATE LOADING & DATA ---
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  
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
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // VALIDASI UKURAN FILE (Maksimal 700KB agar muat di Firestore)
      if (file.size > 700 * 1024) {
        alert("Ukuran file terlalu besar! Harap upload gambar di bawah 700KB.");
        e.target.value = ''; // Reset input
        return;
      }

      // Konversi File ke Base64 String
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImageBase64(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!imageBase64) {
        throw new Error("Gambar produk wajib diupload!");
      }

      // Simpan Data ke Firestore
      await addDoc(collection(db, 'products'), {
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: formData.category,
        description: formData.description,
        image: imageBase64, // Simpan string base64 langsung
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Reset Form
      setFormData({ name: '', price: '', stock: '', category: '', description: '' });
      setImageBase64(null);
      
      // Reset input file secara manual
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Refresh Data & Tampilkan Success Modal
      fetchProducts();
      setDialogStatus('success');
      setDialogMessage('Produk berhasil ditambahkan ke katalog!');
      setDialogOpen(true);

    } catch (error: any) {
      console.error("Error adding product:", error);
      setDialogStatus('error');
      setDialogMessage(error.message || 'Gagal menambahkan produk. Silakan coba lagi.');
      setDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminGuard>
      <div className="container mx-auto p-6 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Manajemen Produk</h1>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* --- BAGIAN KIRI: FORM TAMBAH PRODUK --- */}
          <Card className="md:col-span-1 h-fit shadow-md border-t-4 border-t-indigo-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" /> Tambah Produk Baru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Upload Gambar */}
                <div className="space-y-2">
                  <Label>Foto Produk</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer relative overflow-hidden">
                    <input 
                      id="fileInput"
                      type="file" 
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    {imageBase64 ? (
                      <img src={imageBase64} alt="Preview" className="mx-auto h-32 object-contain rounded" />
                    ) : (
                      <div className="text-gray-400">
                        <Upload className="w-8 h-8 mx-auto mb-2" />
                        <span className="text-xs">Klik untuk upload gambar</span>
                        <span className="block text-[10px] text-red-400 mt-1">(Max 700KB)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nama Produk</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Contoh: Kemeja Flanel" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Harga (Rp)</Label>
                    <Input id="price" name="price" type="number" value={formData.price} onChange={handleInputChange} required placeholder="150000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stok</Label>
                    <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleInputChange} required placeholder="10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Input id="category" name="category" value={formData.category} onChange={handleInputChange} required placeholder="Pakaian, Aksesoris, dll" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Deskripsi singkat produk..." />
                </div>

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    'Simpan Produk'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* --- BAGIAN KANAN: TABEL DAFTAR PRODUK --- */}
          <Card className="md:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle>Daftar Produk Aktif</CardTitle>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    Belum ada produk. Silakan tambah produk baru.
                </div>
              ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">Gambar</th>
                                <th className="px-4 py-3">Nama Produk</th>
                                <th className="px-4 py-3">Harga</th>
                                <th className="px-4 py-3">Stok</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-4 py-2">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded" />
                                        ) : (
                                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                                <ImageIcon className="w-4 h-4 text-gray-400" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-900">{product.name}</td>
                                    <td className="px-4 py-2">Rp {product.price?.toLocaleString('id-ID')}</td>
                                    <td className="px-4 py-2">{product.stock}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      {/* --- MODAL POPUP BERHASIL / GAGAL --- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md text-center">
            <DialogHeader>
                <div className="mx-auto mb-4">
                    {dialogStatus === 'success' ? (
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    ) : (
                        <XCircle className="w-12 h-12 text-red-500" />
                    )}
                </div>
                <DialogTitle className="text-center text-xl">
                    {dialogStatus === 'success' ? 'Berhasil!' : 'Gagal!'}
                </DialogTitle>
                <DialogDescription className="text-center">
                    {dialogMessage}
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center">
                <Button 
                    type="button" 
                    variant={dialogStatus === 'success' ? 'default' : 'destructive'}
                    onClick={() => setDialogOpen(false)}
                >
                    Tutup
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminGuard>
  );
}