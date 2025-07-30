'use client';

import { db } from '@/firebase';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

// Skema validasi menggunakan Zod
const productSchema = z.object({
  name: z.string().min(3, { message: 'Nama produk minimal 3 karakter.' }),
  description: z.string().optional(),
  price: z.coerce.number().positive({ message: 'Harga harus lebih dari 0.' }),
  stock: z.coerce.number().min(0, { message: 'Stok tidak boleh negatif.' }),
  image: z.string().url({ message: 'URL gambar tidak valid.' }).optional().or(z.literal('')),
  category: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface Product extends ProductFormValues {
  id: string;
}

// Komponen Skeleton untuk form
const FormSkeleton = () => (
    <Card>
        <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
        </CardContent>
    </Card>
);


export default function ProductDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false); // <-- State baru untuk client-side render

  // Set isClient menjadi true hanya setelah komponen terpasang di browser
  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      image: '',
      category: '',
    },
  });

  useEffect(() => {
    const unsubProd = onSnapshot(collection(db, 'products'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(data);
    });

    return () => unsubProd();
  }, []);

  const ensureCategoryExists = async (categoryName: string) => {
    if (!categoryName || categoryName.trim() === '') return;
    const q = query(collection(db, 'categories'), where('name', '==', categoryName));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      await addDoc(collection(db, 'categories'), { name: categoryName });
      toast.info(`Kategori baru "${categoryName}" ditambahkan.`);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      if (data.category) await ensureCategoryExists(data.category);

      if (editId) {
        await updateDoc(doc(db, 'products', editId), data);
        toast.success('Produk berhasil diperbarui!');
        setEditId(null);
      } else {
        await addDoc(collection(db, 'products'), data);
        toast.success('Produk berhasil ditambahkan!');
      }
      form.reset();
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan produk.');
    }
  };

  const handleEdit = (product: Product) => {
    setEditId(product.id);
    form.reset(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      await deleteDoc(doc(db, 'products', id));
      toast.success('Produk berhasil dihapus.');
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    form.reset();
  }

  // Tampilkan skeleton jika bukan di client atau data belum siap
  if (!isClient) {
    return (
        <div className="max-w-4xl mx-auto py-10 px-4 space-y-10">
            <FormSkeleton />
            <div>
                <h2 className="text-2xl font-bold mb-4">Daftar Produk</h2>
                <div className="space-y-4">
                    <Skeleton className="h-28 w-full rounded-lg" />
                    <Skeleton className="h-28 w-full rounded-lg" />
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {editId ? '📝 Edit Produk' : '✨ Tambah Produk Baru'}
          </CardTitle>
          <CardDescription>
            {editId ? 'Perbarui detail produk di bawah ini.' : 'Isi detail produk baru untuk menambahkannya ke toko Anda.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Produk</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Topi Keren" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Aksesoris" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga (Rp)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="50000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stok</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Gambar</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Masukkan link URL gambar produk yang valid.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Jelaskan detail produk di sini..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <CardFooter className="flex justify-end gap-2 p-0 pt-6">
                {editId && (
                    <Button type="button" variant="outline" onClick={handleCancelEdit}>
                        Batal
                    </Button>
                )}
                <Button type="submit">
                  {editId ? '💾 Simpan Perubahan' : '➕ Tambah Produk'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-4">Daftar Produk</h2>
        <div className="space-y-4">
          {products.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  {p.image && <img src={p.image} alt={p.name} className="w-20 h-20 object-cover rounded-md border" />}
                  <div>
                    <p className="font-bold text-lg">{p.name}</p>
                    <p className="text-sm text-gray-500">{p.category || 'Tanpa Kategori'}</p>
                    <p className="text-indigo-700">Rp {p.price.toLocaleString()}</p>
                    <p className="text-sm">Stok: {p.stock}</p>
                  </div>
                </div>
                <div className="flex space-x-2 self-end sm:self-center">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(p)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}>
                    Hapus
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}