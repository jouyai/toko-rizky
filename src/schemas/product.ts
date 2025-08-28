import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
  stock: z.coerce.number().int().min(0, "Stok minimal 0"),
  description: z.string().optional(),
  image: z.string().url("URL gambar tidak valid").optional(),
  category: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
