import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "./lib/language";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://solariumenergy.org"
  ),
  title: "Solarium 2.18 kW Home Solar | ₹0 Under PM Surya Ghar",
  description:
    "A complete 2.18 kW rooftop solar system for Gujarat homes at an effective cost of ₹0 after central and state subsidy. 5-year insurance included. Book online. Pay & get 100% subsidy in return.",
  keywords: [
    "PM Surya Ghar",
    "free solar Gujarat",
    "2.18 kW solar system",
    "rooftop solar Ahmedabad",
    "Solarium solar",
    "solar subsidy Gujarat",
  ],
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Solar for your home at ₹0 | Solarium 2.18 kW Home Solar",
    description:
      "Complete 2.18 kW rooftop solar, installed by Solarium. Central and Gujarat state subsidy cover the system value for eligible homes. 5-year insurance included.",
    type: "website",
    locale: "en_IN",
    siteName: "Solarium Green Energy",
    images: [{ url: "/images/home-solar.png", width: 1024, height: 1024 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solar for your home at ₹0 | Solarium",
    description:
      "A complete 2.18 kW rooftop solar system for eligible Gujarat homes. Book online. Pay & get 100% subsidy in return.",
    images: ["/images/home-solar.png"],
  },
};

// Customer-facing pages use the light theme only.
export const viewport: Viewport = {
  colorScheme: "only light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,400&family=Hanken+Grotesk:wght@400;500;600;700&family=Noto+Sans+Gujarati:wght@400;600&family=Noto+Serif+Gujarati:wght@300;400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="sol web">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
