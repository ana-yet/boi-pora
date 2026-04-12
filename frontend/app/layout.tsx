import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "./providers/ToastProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { getSiteUrl } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();
const defaultTitle = "Boi Pora — বই পড়া";
const defaultDescription =
  "Boi Pora (বই পড়া) is your digital reading companion — discover books, read chapters with a focused reader, build your library, and track progress. Bengali and multilingual-friendly.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Boi Pora",
  title: {
    default: defaultTitle,
    template: "%s | Boi Pora",
  },
  description: defaultDescription,
  keywords: [
    "Boi Pora",
    "বই পড়া",
    "books",
    "reading",
    "digital library",
    "Bangla books",
    "Bengali books",
    "ebooks",
    "online reader",
  ],
  authors: [{ name: "Boi Pora" }],
  creator: "Boi Pora",
  publisher: "Boi Pora",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "bn_BD",
    alternateLocale: ["en_US"],
    siteName: "Boi Pora",
    title: defaultTitle,
    description: defaultDescription,
    url: "/",
    images: [
      {
        url: "/favicon.png",
        width: 512,
        height: 512,
        type: "image/png",
        alt: "Boi Pora",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/favicon.png"],
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
  category: "books",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfcfb" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Boi Pora",
  alternateName: "বই পড়া",
  description: defaultDescription,
  url: siteUrl,
  inLanguage: ["bn", "en"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
