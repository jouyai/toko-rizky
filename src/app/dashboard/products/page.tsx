// src/app/dashboard/products/page.tsx
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// -----------------------------
// Schema & Types
// -----------------------------
const productSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  price: z.coerce.number().min(0, 'Harga tidak boleh negatif'),
  stock: z.coerce.number().int().min(0, 'Stok minimal 0'),
  description: z.string().optional(),
  image: z.string().url('URL gambar tidak valid').optional(),
  category: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

// -----------------------------
// Page Component
// -----------------------------
export default function ProductsPage() {
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: '',
      price: 0,
      stock: 0,
      description: '',
      image: '',
      category: '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = form;

  async function onSubmit(values: ProductFormValues) {
    // TODO: ganti ke API route kamu
    // await fetch('/api/products', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(values) });
    console.log('Submitting product:', values);

    reset({
      name: '',
      price: 0,
      stock: 0,
      description: '',
      image: '',
      category: '',
    });
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Tambah Produk</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name */}
        <div className="space-y-1">
          <label htmlFor="name" className="block text-sm font-medium">
            Nama
          </label>
          <input
            id="name"
            type="text"
            className="w-full rounded border px-3 py-2"
            placeholder="Contoh: Meja Belajar"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Price */}
        <div className="space-y-1">
          <label htmlFor="price" className="block text-sm font-medium">
            Harga
          </label>
          <input
            id="price"
            type="number"
            className="w-full rounded border px-3 py-2"
            placeholder="0"
            {...register('price', { valueAsNumber: true })}
            onChange={(e) => {
              const n = Number(e.currentTarget.value);
              setValue('price', Number.isNaN(n) ? 0 : n, { shouldValidate: true });
            }}
          />
          {errors.price && (
            <p className="text-sm text-red-600">{errors.price.message}</p>
          )}
        </div>

        {/* Stock */}
        <div className="space-y-1">
          <label htmlFor="stock" className="block text-sm font-medium">
            Stok
          </label>
          <input
            id="stock"
            type="number"
            className="w-full rounded border px-3 py-2"
            placeholder="0"
            {...register('stock', { valueAsNumber: true })}
            onChange={(e) => {
              const n = Number(e.currentTarget.value);
              setValue('stock', Number.isNaN(n) ? 0 : n, { shouldValidate: true });
            }}
          />
          {errors.stock && (
            <p className="text-sm text-red-600">{errors.stock.message}</p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label htmlFor="category" className="block text-sm font-medium">
            Kategori
          </label>
          <input
            id="category"
            type="text"
            className="w-full rounded border px-3 py-2"
            placeholder="Contoh: Furniture"
            {...register('category')}
          />
          {errors.category && (
            <p className="text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        {/* Image URL */}
        <div className="space-y-1">
          <label htmlFor="image" className="block text-sm font-medium">
            URL Gambar
          </label>
          <input
            id="image"
            type="url"
            className="w-full rounded border px-3 py-2"
            placeholder="https://example.com/image.jpg"
            {...register('image')}
          />
          {errors.image && (
            <p className="text-sm text-red-600">{errors.image.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label htmlFor="description" className="block text-sm font-medium">
            Deskripsi
          </label>
          <textarea
            id="description"
            className="min-h-[120px] w-full rounded border px-3 py-2"
            placeholder="Deskripsi singkat produk"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-60"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
          </button>
        </div>
      </form>
    </main>
  );
}
