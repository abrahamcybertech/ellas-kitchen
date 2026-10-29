import React from 'react';
import { getOrderByReferenceAndToken, getOrderByReferenceAndPhone } from '@/lib/db';
import OrderTrackingClient from './OrderTrackingClient';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 0;

export const metadata = buildMetadata({
  title: 'Order Tracking',
  description: "Track your Ella's Kitchen food order preparation and delivery status in real time.",
  path: '/track',
  noIndex: true,
});

export default function OrderTrackPage({
  params,
  searchParams,
}: {
  params: { reference: string };
  searchParams?: { token?: string };
}) {
  const reference = params.reference.toUpperCase().trim();
  const token = searchParams?.token?.trim();

  let initialOrder = null;
  if (token) {
    initialOrder = getOrderByReferenceAndToken(reference, token);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <OrderTrackingClient
        reference={reference}
        token={token}
        initialOrder={initialOrder}
      />
    </div>
  );
}
