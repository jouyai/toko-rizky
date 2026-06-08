'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { listenCart, clearCart as clearCartController, CartItem } from '@/controllers/cartController';

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  itemCount: number;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  loading: true,
  itemCount: 0,
  clearCart: async () => {},
});

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const unsubscribe = listenCart(user.uid, (items) => {
        setCartItems(items);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setCartItems([]);
      setLoading(false);
    }
  }, [user]);

  const clearCart = useCallback(async () => {
    if (!user) return;
    await clearCartController(user.uid);
    setCartItems([]);
  }, [user]);

  const itemCount = (cartItems || []).reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, loading, itemCount, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);