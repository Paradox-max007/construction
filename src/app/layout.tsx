import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BuildCraft — India's Construction Ecosystem Marketplace",
  description:
    "Discover, compare and hire verified builders, architects, interior designers and contractors. Real portfolios, verified reviews and transparent pricing — all in one place.",
  keywords: [
    "construction marketplace",
    "find builders",
    "hire contractors",
    "interior designers India",
    "architects",
    "home renovation",
    "BuildCraft",
  ],
  authors: [{ name: "BuildCraft" }],
  openGraph: {
    title: "BuildCraft — Build your dream home with verified pros",
    description:
      "India's construction ecosystem where homeowners discover, compare, hire and manage verified building professionals.",
    siteName: "BuildCraft",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BuildCraft — Construction Ecosystem Marketplace",
    description: "Discover, compare and hire verified construction professionals.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  );
}
