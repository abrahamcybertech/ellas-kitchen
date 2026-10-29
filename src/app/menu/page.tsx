import React from 'react';
import { getCategories, getProducts } from '@/lib/db';
import MenuClient from './MenuClient';

export const revalidate = 0; // Fresh database query on request

export const metadata = {
  title: "Our Menu | Ella's Kitchen Nigerian Delicacies",
  description:
    'Browse the complete Ella\'s Kitchen menu. Authentic firewood jollof rice, assorted meat dishes, traditional soups, fresh puff puff, meat pies, birthday cakes, and chilled zobo.',
};

export default function MenuPage({
  searchParams,
}: {
  searchParams?: { category?: string; search?: string };
}) {
  const categories = getCategories(true);
  const selectedCategorySlug = searchParams?.category || '';
  const initialSearch = searchParams?.search || '';

  const products = getProducts({
    categorySlug: selectedCategorySlug || undefined,
    search: initialSearch || undefined,
    publishedOnly: true,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Page Title Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-gold-400">
          Freshly Prepared Everyday
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-brand-cream-50">
          Our Delicious Menu
        </h1>
        <p className="text-sm sm:text-base text-brand-brown-300">
          Select from our authentic Nigerian dishes, snacks, celebration cakes, and chilled drinks. All meals are prepared fresh upon order.
        </p>
      </div>

      <MenuClient
        initialCategories={categories}
        initialProducts={products}
        initialCategorySlug={selectedCategorySlug}
        initialSearch={initialSearch}
      />
    </div>
  );
}
