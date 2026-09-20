import { Playfair_Display, Poppins, Allura } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

const script = Allura({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script-face",
  display: "swap",
});

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://aaurawell.com").replace(/\/$/, "");

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Aaurawell Nutra — Small Gummies. Big Wellness.",
    template: "%s | Aaurawell Nutra",
  },
  description:
    "Discover premium nutritional wellness gummies by Aaurawell Nutra. Gelatin-free, 100% vegetarian, formulated for daily wellness, iron boost, PMS care, and gut comfort.",
  keywords: [
    "wellness gummies",
    "nutritional gummies",
    "health gummies",
    "gelatin free gummies",
    "daily nutra gummy",
    "iron glow gummy",
    "pms care gummy",
    "gut comfort gummy",
    "biotin gummies",
    "herbal supplements India",
    "Aaurawell Nutra",
  ],
  authors: [{ name: "Aaurawell Nutra", url: siteUrl }],
  creator: "Aaurawell Nutra",
  publisher: "Aaurawell Nutra",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Aaurawell Nutra",
    title: "Aaurawell Nutra — Small Gummies. Big Wellness.",
    description:
      "Discover premium nutritional wellness gummies by Aaurawell Nutra. Gelatin-free, 100% vegetarian, formulated for daily wellness, iron boost, PMS care, and gut comfort.",
    images: [
      {
        url: "/images/banners/hero-background.webp",
        width: 1200,
        height: 630,
        alt: "Aaurawell Nutra Premium Wellness Gummies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aaurawell Nutra — Small Gummies. Big Wellness.",
    description:
      "Discover premium nutritional wellness gummies by Aaurawell Nutra. Gelatin-free, 100% vegetarian gummies.",
    images: ["/images/banners/hero-background.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Aaurawell Nutra",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        "@id": `${siteUrl}/#logo`,
        url: `${siteUrl}/icon.svg`,
        contentUrl: `${siteUrl}/icon.svg`,
        caption: "Aaurawell Nutra Logo",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: "support@aaurawell.com",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Aaurawell Nutra",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable} ${script.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

