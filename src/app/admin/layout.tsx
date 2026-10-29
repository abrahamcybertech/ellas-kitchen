import React from 'react';
import AdminLayoutClient from './AdminLayoutClient';

export const metadata = {
  title: "Administration Portal | Ella's Kitchen Management",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
