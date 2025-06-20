import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AccessibilityProvider } from "@/components/providers/AccessibilityProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ballarat Tool Library",
    template: "%s | Ballarat Tool Library",
  },
  description: "Community tool lending library in Ballarat. Borrow tools with annual membership starting at $55. Perfect for aging community members with accessible design.",
  keywords: ["tool library", "Ballarat", "community", "tool lending", "membership", "accessible", "aging"],
  authors: [{ name: "Ballarat Tool Library" }],
  creator: "Ballarat Tool Library",
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "https://ballarattoollibrary.org.au",
    title: "Ballarat Tool Library",
    description: "Community tool lending library in Ballarat. Accessible design for all ages.",
    siteName: "Ballarat Tool Library",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ballarat Tool Library",
    description: "Community tool lending library in Ballarat. Accessible design for all ages.",
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Allow zooming for accessibility
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)", color: "#3b82f6" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="color-scheme" content="light dark" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="font-sans">
        <AccessibilityProvider>
          {children}
        </AccessibilityProvider>
      </body>
    </html>
  );
}
