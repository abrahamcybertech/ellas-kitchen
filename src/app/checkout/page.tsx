import React from 'react';
import { getSettings } from '@/lib/db';
import CheckoutClient from './CheckoutClient';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 0;

export const metadata = buildMetadata({
  title: 'Guest Checkout',
  description: 'Complete your Nigerian food order quickly and securely without creating an account.',
  path: '/checkout',
  noIndex: true,
});

export default function CheckoutPage() {
  const settings = getSettings();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-cream-50">
          Fast Guest Checkout
        </h1>
        <p className="text-sm text-brand-brown-300 mt-1">
          Place your order in under one minute. No account creation or password required.
        </p>
      </div>

      <CheckoutClient settings={settings} />
    </div>
  );
}
