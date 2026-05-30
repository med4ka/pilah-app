// [+] FIX: Import Viewport ditambahkan di sini
import type { Metadata, Viewport } from "next"; 
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// [+] FIX: Konfigurasi Viewport untuk PWA
export const viewport: Viewport = {
  themeColor: '#10b981', 
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, 
}

// [+] FIX: Metadata digabung jadi SATU blok saja (Anti-Error)
export const metadata: Metadata = {
  title: 'Pilah App - Ubah Sampah Jadi Berkah',
  description: 'Aplikasi daur ulang sampah pintar dengan Web3.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Pilah App',
  },
  icons: {
    apple: '/sprout.png', 
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}