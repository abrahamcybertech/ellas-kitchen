'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { Plus, Sparkles, Clock } from 'lucide-react';
import ProductModal from './ProductModal';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="group bg-brand-dark-900 border border-brand-brown-800/80 hover:border-brand-gold-500/50 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-rich">
        {/* Product Image */}
        <div className="relative h-52 w-full overflow-hidden bg-brand-dark-950">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-brand-brown-900 text-brand-gold-400 font-serif text-lg">
              Ella's Kitchen
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark-900/90 via-transparent to-black/20" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {Boolean(product.is_featured) && (
              <span className="px-2.5 py-1 rounded-full bg-brand-gold-500 text-brand-dark-950 font-bold text-xs flex items-center gap-1 shadow-md">
                <Sparkles className="w-3 h-3 fill-current" />
                Popular
              </span>
            )}
            {product.dietary_tags &&
              product.dietary_tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full bg-brand-dark-950/80 backdrop-blur-md text-brand-gold-300 border border-brand-gold-500/20 text-xs font-semibold"
                >
                  {tag}
                </span>
              ))}
          </div>

          {/* Preparation Time */}
          {product.prep_time && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 text-xs text-brand-cream-200 bg-brand-dark-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-brand-brown-800">
              <Clock className="w-3 h-3 text-brand-gold-400" />
              <span>{product.prep_time}</span>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-xl font-bold text-brand-cream-50 group-hover:text-brand-gold-300 transition-colors line-clamp-1">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-xs text-brand-brown-300 mt-2 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-brand-brown-800/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-brand-brown-400 block font-medium">Starting from</span>
              <span className="text-lg font-extrabold text-brand-gold-400">
                ₦{product.price.toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-brand-gold-500 hover:bg-brand-gold-400 text-brand-dark-950 font-bold text-xs flex items-center gap-1.5 shadow-gold-glow transition active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Select</span>
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ProductModal product={product} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}
