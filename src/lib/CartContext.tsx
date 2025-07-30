'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from './AuthContext';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  itemCount: number;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  loading: true,
  itemCount: 0,
});

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const cartRef = collection(db, 'users', user.uid, 'cart');
      const q = query(cartRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CartItem[];
        setCartItems(items);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Jika user logout, kosongkan keranjang
      setCartItems([]);
      setLoading(false);
    }
  }, [user]);

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, loading, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);