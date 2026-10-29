'use client';

import React, { useState } from 'react';
import { Product, ProductVariation, ProductExtra } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { X, Plus, Minus, Check, Clock, Sparkles } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const { addItem } = useCart();

  if (!product) return null;

  const defaultVariation =
    product.variations?.find((v) => v.is_default) ||
    (product.variations && product.variations.length > 0 ? product.variations[0] : null);

  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(defaultVariation);
  const [selectedExtras, setSelectedExtras] = useState<Record<string, number>>({});
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');

  const handleExtraToggle = (extra: ProductExtra) => {
    setSelectedExtras((prev) => {
      const current = prev[extra.id] || 0;
      if (current > 0) {
        const next = { ...prev };
        delete next[extra.id];
        return next;
      } else {
        return { ...prev, [extra.id]: 1 };
      }
    });
  };

  const handleExtraQtyChange = (extraId: string, delta: number, max: number) => {
    setSelectedExtras((prev) => {
      const current = prev[extraId] || 0;
      const nextVal = Math.max(0, Math.min(max, current + delta));
      if (nextVal === 0) {
        const next = { ...prev };
        delete next[extraId];
        return next;
      }
      return { ...prev, [extraId]: nextVal };
    });
  };

  // Compute live price
  let unitPrice = product.price;
  if (selectedVariation) {
    unitPrice += selectedVariation.price_modifier;
  }

  let extrasSum = 0;
  if (product.extras) {
    for (const extra of product.extras) {
      const qty = selectedExtras[extra.id] || 0;
      extrasSum += extra.price * qty;
    }
  }

  const singleTotal = unitPrice + extrasSum;
  const grandTotal = singleTotal * quantity;

  const handleAddToCart = () => {
    const formattedExtras = (product.extras || [])
      .filter((e) => (selectedExtras[e.id] || 0) > 0)
      .map((e) => ({
        id: e.id,
        name: e.name,
        price: e.price,
        quantity: selectedExtras[e.id],
      }));

    addItem({
      product_id: product.id,
      product_name: product.name,
      product_slug: product.slug,
      image_url: product.image_url,
      base_price: product.price,
      selected_variation: selectedVariation
        ? {
            id: selectedVariation.id,
            name: selectedVariation.name,
            price_modifier: selectedVariation.price_modifier,
          }
        : null,
      selected_extras: formattedExtras,
      quantity,
      special_instructions: instructions.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-brand-dark-950 border border-brand-gold-500/30 rounded-2xl max-w-lg w-full text-brand-cream-100 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-brand-dark-900/80 text-brand-cream-300 hover:text-white flex items-center justify-center border border-brand-brown-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Banner */}
        {product.image_url && (
          <div className="h-52 w-full relative overflow-hidden bg-brand-dark-900">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark-950 via-transparent to-black/30" />
            <div className="absolute bottom-3 left-4 flex gap-2">
              {product.dietary_tags &&
                product.dietary_tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-full bg-brand-gold-500/90 text-brand-dark-950 text-xs font-bold"
                  >
                    {tag}
                  </span>
                ))}
            </div>
          </div>
        )}

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Title & Price */}
          <div>
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-serif text-2xl font-bold text-brand-cream-50 leading-snug">
                {product.name}
              </h3>
            </div>
            {product.description && (
              <p className="text-sm text-brand-brown-300 mt-2 leading-relaxed">
                {product.description}
              </p>
            )}
            {product.prep_time && (
              <div className="flex items-center gap-1.5 text-xs text-brand-gold-400 mt-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Estimated preparation time: {product.prep_time}</span>
              </div>
            )}
          </div>

          {/* Variations Selection */}
          {product.variations && product.variations.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-gold-400 block">
                Choose Your Portion or Protein
              </label>
              <div className="space-y-2">
                {product.variations.map((v) => {
                  const isSelected = selectedVariation?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariation(v)}
                      className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition ${
                        isSelected
                          ? 'border-brand-gold-500 bg-brand-gold-500/10 text-brand-cream-50'
                          : 'border-brand-brown-800 bg-brand-brown-900/40 text-brand-brown-200 hover:border-brand-brown-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-brand-gold-500 bg-brand-gold-500'
                              : 'border-brand-brown-600'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-brand-dark-950" />}
                        </div>
                        <span className="text-sm font-medium">{v.name}</span>
                      </div>
                      <span className="text-xs font-bold text-brand-gold-400">
                        {v.price_modifier === 0
                          ? 'Included'
                          : `+₦${v.price_modifier.toLocaleString()}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Extras Selection */}
          {product.extras && product.extras.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-gold-400 block">
                Add Delicious Extras and Sides
              </label>
              <div className="space-y-2">
                {product.extras.map((extra) => {
                  const qty = selectedExtras[extra.id] || 0;
                  const isChecked = qty > 0;
                  return (
                    <div
                      key={extra.id}
                      className={`p-3 rounded-xl border flex items-center justify-between transition ${
                        isChecked
                          ? 'border-brand-gold-500/60 bg-brand-gold-500/5'
                          : 'border-brand-brown-800 bg-brand-brown-900/30'
                      }`}
                    >
                      <div
                        className="flex items-center gap-3 cursor-pointer flex-1"
                        onClick={() => handleExtraToggle(extra)}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isChecked
                              ? 'border-brand-gold-500 bg-brand-gold-500 text-brand-dark-950'
                              : 'border-brand-brown-600'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="text-sm font-medium block text-brand-cream-100">
                            {extra.name}
                          </span>
                          <span className="text-xs text-brand-gold-400 font-semibold">
                            +₦{extra.price.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {isChecked && (
                        <div className="flex items-center space-x-2 bg-brand-dark-900 rounded-lg p-1 border border-brand-brown-800">
                          <button
                            type="button"
                            onClick={() => handleExtraQtyChange(extra.id, -1, extra.max_quantity || 5)}
                            className="w-6 h-6 rounded flex items-center justify-center text-brand-cream-200 hover:bg-brand-brown-800"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{qty}</span>
                          <button
                            type="button"
                            onClick={() => handleExtraQtyChange(extra.id, 1, extra.max_quantity || 5)}
                            className="w-6 h-6 rounded flex items-center justify-center text-brand-cream-200 hover:bg-brand-brown-800"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-gold-400 block">
              Special Kitchen Notes (Optional)
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Example: Kindly add extra pepper sauce or keep chicken well crisped"
              className="w-full bg-brand-dark-900 border border-brand-brown-800 rounded-xl p-3 text-sm text-brand-cream-100 placeholder-brand-brown-500 focus:outline-none focus:border-brand-gold-500 transition resize-none h-20"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-brand-brown-800 bg-brand-dark-900 flex items-center justify-between gap-4">
          {/* Main Quantity Controller */}
          <div className="flex items-center space-x-3 bg-brand-brown-900/80 rounded-xl p-1.5 border border-brand-brown-800">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-cream-200 hover:bg-brand-brown-800 transition"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-base font-bold w-6 text-center text-brand-cream-50">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-cream-200 hover:bg-brand-brown-800 transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Tray CTA */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-gold-500 to-brand-gold-600 hover:from-brand-gold-400 hover:to-brand-gold-500 text-brand-dark-950 font-extrabold text-sm shadow-gold-glow flex items-center justify-between transition active:scale-[0.99]"
          >
            <span>Add to Tray</span>
            <span>₦{grandTotal.toLocaleString()}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
