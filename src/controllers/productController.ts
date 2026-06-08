import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/firebase';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  stock: number;
  image?: string;
  secondaryImage?: string;
  images?: string[];
  description?: string;
  category?: string;
  gender?: string;
  colors?: string[];
  sizes?: string[];
  material?: string;
  fit?: string;
  isNewSeason?: boolean;
  discount?: number;
  createdAt?: Timestamp;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

export interface ProductFilters {
  category?: string;
  gender?: string;
  search?: string;
  priceRange?: [number, number];
  sizes?: string[];
  sortBy?: 'newest' | 'price-low' | 'price-high' | 'name';
  page?: number;
  perPage?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

// ─── Real-time listeners ─────────────────────────────────────────────────────

export function listenProducts(callback: (products: Product[]) => void): Unsubscribe {
  const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
    callback(data);
  });
}

export function listenProductById(id: string, callback: (product: Product | null) => void): Unsubscribe {
  const docRef = doc(db, 'products', id);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as Product);
    } else {
      callback(null);
    }
  });
}

export function listenCategories(callback: (categories: Category[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'categories'), (snapshot) => {
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Category));
    callback(data);
  });
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const docRef = doc(db, 'products', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Product;
}

export async function addProduct(
  data: Omit<Product, 'id' | 'createdAt'> & { image: string }
): Promise<string> {
  const docRef = await addDoc(collection(db, 'products'), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, 'id'>>
): Promise<void> {
  await updateDoc(doc(db, 'products', id), { ...data, updatedAt: Timestamp.now() });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, 'products', id));
}

// ─── Client-side filtering / sorting / pagination ────────────────────────────

export function applyFilters(
  products: Product[],
  filters: ProductFilters
): PaginatedResult<Product> {
  let result = [...products];

  // Category filter
  if (filters.category) {
    const cat = filters.category.toLowerCase();
    result = result.filter(
      (p) =>
        p.category?.toLowerCase() === cat ||
        p.gender?.toLowerCase() === cat
    );
  }

  // Gender filter
  if (filters.gender) {
    result = result.filter(
      (p) => p.gender?.toLowerCase() === filters.gender?.toLowerCase()
    );
  }

  // Search
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(q));
  }

  // Price range
  if (filters.priceRange) {
    const [min, max] = filters.priceRange;
    result = result.filter((p) => p.price >= min && p.price <= max);
  }

  // Sizes
  if (filters.sizes && filters.sizes.length > 0) {
    result = result.filter(
      (p) =>
        p.sizes &&
        filters.sizes!.some((s) => p.sizes!.includes(s))
    );
  }

  // Sort
  switch (filters.sortBy) {
    case 'price-low':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default: // 'newest' — keep Firestore order (desc by createdAt)
      break;
  }

  const total = result.length;
  const perPage = filters.perPage || 12;
  const page = filters.page || 1;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const items = result.slice(start, start + perPage);

  return { items, total, page, totalPages };
}
