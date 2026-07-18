import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [toast, setToast] = useState(null);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [] });
      return;
    }
    try {
      const { cart } = await api.getCart();
      setCart(cart);
    } catch {
      setCart({ items: [] });
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  }

  async function addToCart(productId, quantity = 1) {
    const { cart } = await api.addToCart(productId, quantity);
    setCart(cart);
    showToast('Added to cart');
  }

  async function updateItem(productId, quantity) {
    const { cart } = await api.updateCartItem(productId, quantity);
    setCart(cart);
  }

  async function removeItem(productId) {
    const { cart } = await api.removeCartItem(productId);
    setCart(cart);
  }

  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const total = cart.items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, itemCount, total, addToCart, updateItem, removeItem, refreshCart, showToast }}
    >
      {children}
      {toast && <div className="toast">{toast}</div>}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
