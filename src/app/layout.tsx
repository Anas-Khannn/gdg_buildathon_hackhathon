import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  Atkinson_Hyperlegible,
  Noto_Naskh_Arabic,
} from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Providers } from "@/components/providers";
import { LanguageProvider } from "@/components/language-provider";
import { PwaRegister } from "@/components/pwa-register";

const bricolage = Bricolage_Grotesque({
  weight: ["700"],
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const atkinson = Atkinson_Hyperlegible({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-atkinson",
  display: "swap",
});

const notoArabic = Noto_Naskh_Arabic({
  weight: ["400", "700"],
  subsets: ["arabic"],
  variable: "--font-noto-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Naali Watch | Peshawar Drain & Flood Map",
  description:
    "Peshawar waterlogging, flooded roads, blocked drains and open manholes live citizen map. See it. Snap it. Make them fix it.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NaaliWatch",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0E6B73",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${atkinson.variable} ${notoArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#EAF0F2] text-[#12263A]">
        <Providers>
          <LanguageProvider>
            {children}
            <PwaRegister />
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
