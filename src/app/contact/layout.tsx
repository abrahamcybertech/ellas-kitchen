import React from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Contact Us',
  description:
    "Contact Ella's Kitchen in Nyanya, Abuja for food orders, catering enquiries, corporate orders, and special requests. Call or WhatsApp +234 808 005 8907.",
  path: '/contact',
  keywords: ['contact Ella\'s Kitchen', 'food delivery contact Abuja', 'catering enquiry Abuja', 'Nyanya restaurant contact'],
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
