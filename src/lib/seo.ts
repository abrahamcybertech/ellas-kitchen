import type { Metadata } from 'next';
import type { Product } from '@/lib/types';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://ellaskitchen.ng').replace(/\/$/, '');
export const SITE_NAME = "Ella's Kitchen";
export const SITE_TAGLINE = 'Authentic Nigerian Cuisine, Pastries and Catering in Abuja';
export const SITE_DESCRIPTION =
  "Order authentic Nigerian food from Ella's Kitchen in Nyanya, Abuja. Smoky party jollof rice, assorted meats, puff puff, celebration cakes, small chops, zobo, and professional catering delivered fresh across Abuja.";
export const DEFAULT_OG_IMAGE = '/og-image.png';
export const SOCIAL_HANDLE = '@ellaskitchen_ng';

export const DEFAULT_KEYWORDS = [
  "Ella's Kitchen",
  'Nigerian food Abuja',
  'jollof rice delivery Abuja',
  'party jollof rice Nyanya',
  'Nigerian small chops Abuja',
  'catering services Abuja',
  'puff puff Abuja',
  'birthday cakes Abuja',
  'zobo drink Abuja',
  'food delivery Nyanya',
  'African food delivery Abuja',
];

export function absoluteUrl(pathname = ''): string {
  if (/^https?:\/\//i.test(pathname)) return pathname;
  if (!pathname) return SITE_URL;
  return `${SITE_URL}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

export function buildMetadata({
  title,
  description,
  path = '/',
  image = DEFAULT_OG_IMAGE,
  keywords = DEFAULT_KEYWORDS,
  noIndex = false,
  type = 'website',
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  keywords?: string[];
  noIndex?: boolean;
  type?: 'website' | 'article';
}): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);
  const fullTitle = `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'en_NG',
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${title} - ${SITE_NAME}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: SOCIAL_HANDLE,
      creator: SOCIAL_HANDLE,
      title: fullTitle,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
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
  };
}

export function websiteJsonLd() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: 'en-NG',
    publisher: { '@id': `${SITE_URL}/#restaurant` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/menu?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function restaurantJsonLd() {
  return {
    '@type': 'Restaurant',
    '@id': `${SITE_URL}/#restaurant`,
    name: SITE_NAME,
    alternateName: "Ella's Kitchen Abuja",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    logo: absoluteUrl('/ella.png'),
    image: [absoluteUrl(DEFAULT_OG_IMAGE)],
    telephone: '+2348080058907',
    priceRange: '₦₦',
    currenciesAccepted: 'NGN',
    paymentAccepted: 'Cash, Bank Transfer, Paystack',
    servesCuisine: ['Nigerian', 'West African'],
    foundingDate: '2022',
    hasMenu: absoluteUrl('/menu'),
    menu: absoluteUrl('/menu'),
    acceptsReservations: false,
    areaServed: {
      '@type': 'City',
      name: 'Abuja',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Nyanya',
      addressLocality: 'Abuja',
      addressRegion: 'Federal Capital Territory',
      addressCountry: 'NG',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '09:00',
        closes: '20:00',
      },
    ],
    sameAs: [
      'https://instagram.com/ellaskitchen_ng',
      'https://facebook.com/ellaskitchen_ng',
      'https://x.com/ellaskitchen_ng',
      'https://tiktok.com/@ellakitchen',
    ],
    potentialAction: {
      '@type': 'OrderAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: absoluteUrl('/menu'),
      },
    },
  };
}

export function menuJsonLd(products: Product[]) {
  return {
    '@type': 'ItemList',
    name: "Ella's Kitchen Menu",
    description: 'Nigerian rice dishes, soups, snacks, cakes, drinks, and catering trays available for delivery across Abuja.',
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.name,
        description: product.description || undefined,
        image: product.image_url || absoluteUrl(DEFAULT_OG_IMAGE),
        url: absoluteUrl(`/menu?search=${encodeURIComponent(product.slug)}`),
        category: product.category_name,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'NGN',
          availability:
            product.is_available === true || product.is_available === 1
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          url: absoluteUrl(`/menu?search=${encodeURIComponent(product.slug)}`),
        },
      },
    })),
  };
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
