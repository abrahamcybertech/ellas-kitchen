'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '@/lib/types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'unit_total' | 'item_total'>) => void;
  updateQuantity: (index: number, quantity: number) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'ella_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // ignore parse errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        // ignore storage errors
      }
    }
  }, [items, isLoaded]);

  const addItem = (newItem: Omit<CartItem, 'unit_total' | 'item_total'>) => {
    let unitTotal = newItem.base_price;
    if (newItem.selected_variation) {
      unitTotal += newItem.selected_variation.price_modifier;
    }
    if (newItem.selected_extras && newItem.selected_extras.length > 0) {
      for (const extra of newItem.selected_extras) {
        unitTotal += extra.price * extra.quantity;
      }
    }

    const itemTotal = unitTotal * newItem.quantity;

    const fullItem: CartItem = {
      ...newItem,
      unit_total: unitTotal,
      item_total: itemTotal,
    };

    setItems((prev) => {
      // Check if identical item already exists (same product, variation, and extras)
      const existingIdx = prev.findIndex((item) => {
        if (item.product_id !== fullItem.product_id) return false;
        if (item.selected_variation?.id !== fullItem.selected_variation?.id) return false;
        if (item.selected_extras.length !== fullItem.selected_extras.length) return false;

        const sortedA = [...item.selected_extras].sort((a, b) => a.id.localeCompare(b.id));
        const sortedB = [...fullItem.selected_extras].sort((a, b) => a.id.localeCompare(b.id));

        return sortedA.every((extra, i) => extra.id === sortedB[i].id && extra.quantity === sortedB[i].quantity);
      });

      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + fullItem.quantity;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          item_total: updated[existingIdx].unit_total * newQty,
        };
        return updated;
      }

      return [...prev, fullItem];
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index);
      return;
    }
    setItems((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          quantity,
          item_total: updated[index].unit_total * quantity,
        };
      }
      return updated;
    });
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((sum, item) => sum + item.item_total, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        totalCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
