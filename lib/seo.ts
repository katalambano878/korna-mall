import type { Metadata } from 'next';

export const SITE_NAME = 'KORNA MALL';
export const SITE_SHORT_NAME = 'KORNA MALL';
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005').replace(/\/+$/, '');
export const SITE_DESCRIPTION =
  'Shop online at KORNA MALL in Accra, Ghana. Discover everyday essentials, fashion, and more — with delivery across Ghana.';
export const SITE_PHONE = '0543832358';
export const SITE_PHONE_SECONDARY = '0248782778';
export const SITE_EMAIL = process.env.ADMIN_EMAIL || '';
export const SITE_LOCALE = 'en_GH';
export const DEFAULT_OG_IMAGE = '/og-image.png';

export const DEFAULT_KEYWORDS = [
  'KORNA MALL',
  'Korna Mall Ghana',
  'online shopping Accra',
  'online store Ghana',
  'shop online Accra',
  'ecommerce Ghana',
  'delivery Accra',
  'Korna Mall shop',
];

export const SOCIAL_PROFILES = {
  instagram: '',
  tiktok: '',
  facebook: '',
};

type PageSeoInput = {
  title: string;
  description?: string;
  path?: string;
  keywords?: readonly string[];
  ogImage?: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
  publishedTime?: string;
  author?: string;
};

export function absoluteUrl(path = ''): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function buildPageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = '/',
  keywords = [],
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  noindex = false,
  publishedTime,
  author,
}: PageSeoInput): Metadata {
  const canonical = absoluteUrl(path);
  const fullTitle = title.includes(SITE_SHORT_NAME) ? title : `${title} | ${SITE_SHORT_NAME}`;
  const resolvedOgImage = absoluteUrl(ogImage);
  const mergedKeywords = [...new Set([...keywords, ...DEFAULT_KEYWORDS])];

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: mergedKeywords,
    authors: author ? [{ name: author }] : [{ name: SITE_SHORT_NAME }],
    creator: SITE_SHORT_NAME,
    publisher: SITE_SHORT_NAME,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical },
    openGraph: {
      type: ogType,
      locale: SITE_LOCALE,
      url: canonical,
      title: fullTitle,
      description,
      siteName: SITE_SHORT_NAME,
      images: [{ url: resolvedOgImage, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [resolvedOgImage],
    },
    robots: noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
  };

  if (ogType === 'article' && publishedTime) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime,
    };
  }

  return metadata;
}

export const STATIC_PAGE_SEO = {
  home: {
    title: 'KORNA MALL — Online Shopping in Accra, Ghana',
    description: SITE_DESCRIPTION,
    path: '/',
    keywords: ['KORNA MALL Accra', 'shop online Ghana'],
  },
  shop: {
    title: 'Shop All Products',
    description:
      'Browse products at KORNA MALL. Quality goods at fair prices with delivery across Accra and Ghana.',
    path: '/shop',
    keywords: ['shop online Ghana', 'buy online Accra'],
  },
  categories: {
    title: 'Shop by Category',
    description:
      'Explore KORNA MALL categories and find what you need — from everyday essentials to seasonal picks.',
    path: '/categories',
    keywords: ['online store categories Ghana', 'KORNA MALL categories'],
  },
  about: {
    title: 'About KORNA MALL',
    description:
      'Learn about KORNA MALL — an online store based in Accra, Ghana, focused on convenient shopping and reliable delivery.',
    path: '/about',
    keywords: ['about KORNA MALL', 'online store Accra'],
  },
  contact: {
    title: 'Contact Us',
    description:
      'Get in touch with KORNA MALL. Questions about orders, products, or delivery? We are here to help customers across Ghana.',
    path: '/contact',
    keywords: ['contact KORNA MALL', 'KORNA MALL customer support'],
  },
  blog: {
    title: 'Blog & Updates',
    description:
      'Tips, product updates, and shopping guides from KORNA MALL.',
    path: '/blog',
    keywords: ['KORNA MALL blog', 'shopping tips Ghana'],
  },
  faqs: {
    title: 'Frequently Asked Questions',
    description:
      'Find quick answers about ordering, shipping, returns, payments, and more at KORNA MALL.',
    path: '/faqs',
    keywords: ['KORNA MALL FAQs', 'shipping Ghana'],
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'Read how KORNA MALL collects, uses, and protects your personal information.',
    path: '/privacy',
  },
  terms: {
    title: 'Terms & Conditions',
    description: 'Terms and conditions for shopping at KORNA MALL.',
    path: '/terms',
  },
  shipping: {
    title: 'Shipping Information',
    description: 'Delivery options, timelines, and shipping policies for KORNA MALL orders in Ghana.',
    path: '/shipping',
    keywords: ['delivery Ghana', 'KORNA MALL shipping'],
  },
  returns: {
    title: 'Returns & Refunds',
    description: 'Learn about returns, exchanges, and refund policies at KORNA MALL.',
    path: '/returns',
    keywords: ['KORNA MALL returns policy', 'refunds Ghana'],
  },
} as const;

export function organizationSchema() {
  const sameAs = Object.values(SOCIAL_PROFILES).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_SHORT_NAME,
    legalName: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/logo.svg'),
    description: SITE_DESCRIPTION,
    ...(SITE_EMAIL ? { email: SITE_EMAIL } : {}),
    telephone: `+233${SITE_PHONE.replace(/^0/, '')}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Accra',
      addressCountry: 'GH',
    },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_SHORT_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: { '@type': 'Organization', name: SITE_SHORT_NAME },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/shop?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function localBusinessSchema() {
  const sameAs = Object.values(SOCIAL_PROFILES).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: SITE_NAME,
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    url: SITE_URL,
    telephone: `+233${SITE_PHONE.replace(/^0/, '')}`,
    priceRange: 'GH₵',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Accra',
      addressCountry: 'GH',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '18:00',
    },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productSchema(product: {
  name: string;
  description: string;
  image: string;
  slug: string;
  price: number;
  currency?: string;
  sku?: string;
  inStock?: boolean;
  brand?: string;
  category?: string;
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku || product.slug,
    brand: { '@type': 'Brand', name: product.brand || SITE_SHORT_NAME },
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/product/${product.slug}`),
      priceCurrency: product.currency || 'GHS',
      price: product.price,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: SITE_SHORT_NAME },
    },
  };

  if (product.category) schema.category = product.category;
  return schema;
}
