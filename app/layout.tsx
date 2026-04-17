import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Layout";
import { LanguageProvider } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "D'MBG | Dapur Kesayangan Anak MSID",
  description: "Deni MBG: Layanan katering spesial untuk anak MSID.",
  icons: {
    icon: "/dmbg_favicon.png", 
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <LanguageProvider>
          <Navbar />
          <main className="pb-20">
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
