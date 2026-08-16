import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import AuthBootstrap from "@/app/components/AuthBootstrap";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Pilah - Jemput Sampah Jadi Berkah",
  description: "Jemput sampah terpilah, dapatkan Karma, selamatkan bumi.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#047857",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthBootstrap />
        {children}
      </body>
    </html>
  );
}
