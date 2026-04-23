import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mareta Webshop - Sunčane naočale",
  description: "Prodaja sunčanih naočala",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "Mareta Webshop - Sunčane naočale",
    description: "Prodaja sunčanih naočala",
    images: ["/logo.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Mareta Webshop - Sunčane naočale",
    description: "Prodaja sunčanih naočala",
    images: ["/logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hr">
      <body className={inter.className}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}

