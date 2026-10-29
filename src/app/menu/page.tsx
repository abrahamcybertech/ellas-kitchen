import React from 'react';
import { getCategories, getProducts } from '@/lib/db';
import MenuClient from './MenuClient';
import { buildMetadata, menuJsonLd, serializeJsonLd } from '@/lib/seo';

export const revalidate = 0; // Fresh database query on request

export const metadata = buildMetadata({
  title: 'Our Menu',
  description:
    "Browse the complete Ella's Kitchen menu: firewood party jollof rice, assorted meats, traditional soups, puff puff, meat pies, celebration cakes, small chops, and chilled zobo.",
  path: '/menu',
  keywords: ['Nigerian menu Abuja', 'jollof rice menu', 'puff puff Abuja', 'Nigerian food delivery menu', 'small chops Abuja'],
});

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

  const menuStructuredData = {
    '@context': 'https://schema.org',
    ...menuJsonLd(products),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(menuStructuredData) }}
      />
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
