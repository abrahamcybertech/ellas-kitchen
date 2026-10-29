'use client';

import React from 'react';
import Link from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeItem, subtotal, totalCount } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-brand-dark-950 border-l border-brand-gold-500/20 text-brand-cream-100 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-brand-brown-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-brand-gold-500/10 border border-brand-gold-500/30 flex items-center justify-center text-brand-gold-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-brand-cream-50">Your Tray</h2>
                <p className="text-xs text-brand-brown-300">
                  {totalCount} {totalCount === 1 ? 'delicious meal' : 'delicious meals'} selected
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-brand-brown-300 hover:text-brand-gold-400 hover:bg-brand-brown-900 rounded-lg transition"
              aria-label="Close tray"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-brand-brown-900 flex items-center justify-center text-brand-gold-500/40 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-brand-cream-100 mb-2">Your Tray is Empty</h3>
                <p className="text-sm text-brand-brown-300 max-w-xs mb-6">
                  Explore our authentic Nigerian delicacies, signature jollof rice, and fresh pastries to begin your order.
                </p>
                <a
                  href="/menu"
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-3 rounded-full bg-brand-gold-500 hover:bg-brand-gold-400 text-brand-dark-950 font-bold text-sm transition"
                >
                  Explore Delicious Menu
                </a>
              </div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={`${item.product_id}_${idx}`}
                  className="bg-brand-brown-900/60 border border-brand-brown-800 rounded-xl p-4 flex flex-col gap-3 relative"
                >
                  <div className="flex gap-3">
                    {item.image_url && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden relative flex-shrink-0 bg-brand-dark-900">
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-bold text-brand-cream-50 text-base leading-snug line-clamp-1">
                        {item.product_name}
                      </h4>
                      {item.selected_variation && (
                        <p className="text-xs text-brand-gold-400 font-medium mt-0.5">
                          {item.selected_variation.name}
                        </p>
                      )}
                      {item.selected_extras && item.selected_extras.length > 0 && (
                        <p className="text-xs text-brand-brown-300 mt-0.5 line-clamp-1">
                          Extras: {item.selected_extras.map((e) => `${e.name} (x${e.quantity})`).join(', ')}
                        </p>
                      )}
                      <p className="text-sm font-semibold text-brand-gold-400 mt-1">
                        ₦{item.unit_total.toLocaleString()} each
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(idx)}
                      className="text-brand-brown-400 hover:text-red-400 p-1 self-start transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity and Line Total */}
                  <div className="flex items-center justify-between pt-2 border-t border-brand-brown-800/60">
                    <div className="flex items-center space-x-2 bg-brand-dark-900 rounded-lg p-1 border border-brand-brown-800">
                      <button
                        onClick={() => updateQuantity(idx, item.quantity - 1)}
                        className="w-7 h-7 rounded flex items-center justify-center text-brand-cream-200 hover:bg-brand-brown-800 transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold w-6 text-center text-brand-cream-50">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(idx, item.quantity + 1)}
                        className="w-7 h-7 rounded flex items-center justify-center text-brand-cream-200 hover:bg-brand-brown-800 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-brand-brown-300 block">Total</span>
                      <span className="text-base font-bold text-brand-gold-300">
                        ₦{item.item_total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout CTA */}
          {items.length > 0 && (
            <div className="p-6 border-t border-brand-brown-800/80 bg-brand-dark-900/90 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm text-brand-brown-300">
                  <span>Subtotal</span>
                  <span className="font-semibold text-brand-cream-100">₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-brand-brown-400">
                  <span>Estimated Delivery</span>
                  <span>Calculated during checkout</span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold text-brand-gold-400 pt-2 border-t border-brand-brown-800">
                  <span>Order Total</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
              </div>

              <a
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-gold-500 to-brand-gold-600 hover:from-brand-gold-400 hover:to-brand-gold-500 text-brand-dark-950 font-extrabold text-base flex items-center justify-center gap-2 shadow-gold-glow transition active:scale-[0.99]"
              >
                <span>Proceed to Guest Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </a>

              <p className="text-center text-xs text-brand-brown-400">
                Zero registration required. Order directly to your doorstep.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
