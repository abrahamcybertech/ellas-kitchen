import React from 'react';
import AdminLayoutClient from './AdminLayoutClient';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Admin Dashboard',
  description: "Ella's Kitchen private administration dashboard.",
  path: '/admin',
  noIndex: true,
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
