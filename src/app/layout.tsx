import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';

export const metadata: Metadata = {
  title: "Ella's Kitchen | Authentic Nigerian Cuisine, Pastries and Catering in Abuja",
  description:
    "Experience premier Nigerian food ordering from Ella's Kitchen in Nyanya, Abuja. Smoky party jollof rice, assorted meats, golden puff puff, celebration cakes, and chilled handcrafted zobo delivered fresh to your doorstep.",
  keywords: [
    "Ella's Kitchen",
    'Nigerian food Abuja',
    'Jollof rice delivery Nyanya',
    'Nigerian small chops',
    'Catering in Abuja',
    'Puff puff Abuja',
    'Birthday cakes Nyanya',
    'Zobo drink Abuja',
  ],
  metadataBase: new URL('https://ellaskitchen.ng'),
  openGraph: {
    title: "Ella's Kitchen | Premium Nigerian Cuisine and Catering",
    description:
      'Smoky firewood jollof rice, assorted meats, warm puff puff, celebration cakes, and refreshments delivered fast across Abuja.',
    url: 'https://ellaskitchen.ng',
    siteName: "Ella's Kitchen",
    images: [
      {
        url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: "Ella's Kitchen Signature Jollof Feast",
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/ella.png" />
      </head>
      <body className="bg-brand-dark-950 text-brand-cream-100 min-h-screen flex flex-col font-sans antialiased selection:bg-brand-gold-500 selection:text-brand-dark-950">
        <CartProvider>
          <Header />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
