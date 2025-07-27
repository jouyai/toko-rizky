'use client';

import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  category?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function ProductDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    image: '',
    category: '',
  });
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    const unsubProd = onSnapshot(collection(db, 'products'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(data);
    });

    const unsubCat = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      })) as Category[];
      setCategories(data);
    });

    return () => {
      unsubProd();
      unsubCat();
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value,
    }));
  };

  const ensureCategoryExists = async (categoryName: string) => {
    const q = query(collection(db, 'categories'), where('name', '==', categoryName));
    const snapshot = await getDocs(q);
    if (snapshot.empty && categoryName.trim() !== '') {
      await addDoc(collection(db, 'categories'), { name: categoryName });
      toast.success(`Kategori baru "${categoryName}" ditambahkan!`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, price, stock, category } = form;
    if (!name || price <= 0 || stock < 0) return toast.error('Isi data produk dengan benar');

    try {
      if (category) await ensureCategoryExists(category);

      if (editId) {
        await updateDoc(doc(db, 'products', editId), form);
        toast.success('Produk berhasil diupdate!');
        setEditId(null);
      } else {
        await addDoc(collection(db, 'products'), form);
        toast.success('Produk berhasil ditambahkan!');
      }

      setForm({ name: '', description: '', price: 0, stock: 0, image: '', category: '' });
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan produk');
    }
  };

  const handleEdit = (p: Product) => {
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      image: p.image || '',
      category: p.category || '',
    });
    setEditId(p.id);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'products', id));
    toast.success('Produk dihapus');
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">🛠️ Dashboard Produk</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-10 bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input name="name" placeholder="Nama Barang" value={form.name} onChange={handleChange} />
          <Input name="price" type="number" placeholder="Harga Barang" value={form.price} onChange={handleChange} />
          <Input name="stock" type="number" placeholder="Stok Barang" value={form.stock} onChange={handleChange} />
          <Input name="image" placeholder="URL Gambar Barang" value={form.image} onChange={handleChange} />
        </div>
        <Textarea name="description" placeholder="Deskripsi Barang" value={form.description} onChange={handleChange} />

        <div>
          <Label className="mb-1 block text-sm font-medium">Kategori Barang</Label>
          <Input name="category" placeholder="Misal: Jaket" value={form.category} onChange={handleChange} />
        </div>

        <Button type="submit" className="w-full">
          {editId ? '💾 Update Produk' : '➕ Tambah Produk'}
        </Button>
      </form>

      <div className="space-y-4">
        {products.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-bold text-lg">{p.name}</p>
                <p className="text-sm text-gray-600">{p.description}</p>
                <p className="text-indigo-700">Rp {p.price.toLocaleString()}</p>
                <p className="text-sm text-gray-700">Stok: {p.stock}</p>
                <p className="text-sm text-gray-500">Kategori: {p.category || '-'}</p>
                {p.image && (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="mt-2 w-24 h-24 object-cover rounded-md border"
                  />
                )}
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => handleEdit(p)}>
                  Edit
                </Button>
                <Button variant="outline" onClick={() => handleDelete(p.id)}>
                  Hapus
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
