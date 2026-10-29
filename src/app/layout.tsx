import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import {
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  SOCIAL_HANDLE,
  absoluteUrl,
  restaurantJsonLd,
  serializeJsonLd,
  websiteJsonLd,
} from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: "Ella's Kitchen | Authentic Nigerian Food & Catering in Abuja",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'food and beverage',
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Ella's Kitchen | Authentic Nigerian Food & Catering in Abuja",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_NG',
    type: 'website',
    images: [
      {
        url: absoluteUrl(DEFAULT_OG_IMAGE),
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - ${SITE_TAGLINE}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: SOCIAL_HANDLE,
    creator: SOCIAL_HANDLE,
    title: "Ella's Kitchen | Authentic Nigerian Food & Catering in Abuja",
    description: SITE_DESCRIPTION,
    images: [absoluteUrl(DEFAULT_OG_IMAGE)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png', sizes: '64x64' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#C9972C',
  colorScheme: 'dark',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [websiteJsonLd(), restaurantJsonLd()],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-NG" className="scroll-smooth">
      <body className="bg-brand-dark-950 text-brand-cream-100 min-h-screen flex flex-col font-sans antialiased selection:bg-brand-gold-500 selection:text-brand-dark-950">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
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
