'use client';

import React, { useState, useMemo } from 'react';
import { Category, Product } from '@/lib/types';
import ProductCard from '@/components/menu/ProductCard';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface MenuClientProps {
  initialCategories: Category[];
  initialProducts: Product[];
  initialCategorySlug?: string;
  initialSearch?: string;
}

export default function MenuClient({
  initialCategories,
  initialProducts,
  initialCategorySlug = '',
  initialSearch = '',
}: MenuClientProps) {
  const [selectedSlug, setSelectedSlug] = useState<string>(initialCategorySlug);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);

  // Filter products based on selected category and search input
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // Category check
      if (selectedSlug) {
        const cat = initialCategories.find((c) => c.slug === selectedSlug);
        if (cat && product.category_id !== cat.id) {
          return false;
        }
      }

      // Search query check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = product.name.toLowerCase().includes(q);
        const matchDesc = product.description?.toLowerCase().includes(q);
        const matchDiet = product.dietary_tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchDiet) {
          return false;
        }
      }

      return true;
    });
  }, [initialProducts, initialCategories, selectedSlug, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Search and Category Filters Control Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-brand-dark-900 border border-brand-brown-800 p-4 rounded-2xl shadow-lg">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedSlug('')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap ${
              selectedSlug === ''
                ? 'bg-brand-gold-500 text-brand-dark-950 shadow-gold-glow'
                : 'bg-brand-brown-900/60 text-brand-cream-200 hover:bg-brand-brown-800 border border-brand-brown-700'
            }`}
          >
            All Delicacies
          </button>
          {initialCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedSlug(cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap ${
                selectedSlug === cat.slug
                  ? 'bg-brand-gold-500 text-brand-dark-950 shadow-gold-glow'
                  : 'bg-brand-brown-900/60 text-brand-cream-200 hover:bg-brand-brown-800 border border-brand-brown-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Input Box */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-brand-gold-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search delicious dishes or snacks"
            className="w-full bg-brand-dark-950 border border-brand-brown-800 rounded-full pl-9 pr-8 py-2 text-xs text-brand-cream-100 placeholder-brand-brown-400 focus:outline-none focus:border-brand-gold-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-brown-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Results Count Banner */}
      <div className="flex items-center justify-between text-xs text-brand-brown-300 px-1">
        <span>
          Showing {filteredProducts.length} delicious {filteredProducts.length === 1 ? 'option' : 'options'}
          {selectedSlug && ` in ${initialCategories.find((c) => c.slug === selectedSlug)?.name}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </span>
        {(selectedSlug || searchQuery) && (
          <button
            onClick={() => {
              setSelectedSlug('');
              setSearchQuery('');
            }}
            className="text-brand-gold-400 hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-brand-brown-900 mx-auto flex items-center justify-center text-brand-gold-500/50">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-brand-cream-50">No Dishes Found</h3>
          <p className="text-sm text-brand-brown-300 max-w-md mx-auto">
            We could not find any culinary items matching your selected criteria. Try adjusting your search term or browsing our other categories.
          </p>
          <button
            onClick={() => {
              setSelectedSlug('');
              setSearchQuery('');
            }}
            className="px-6 py-2.5 rounded-full bg-brand-gold-500 text-brand-dark-950 font-bold text-xs shadow-gold-glow"
          >
            Show All Dishes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
