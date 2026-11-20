import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_URL, TAGLINE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "SchoolYard · student classifieds",
  description: TAGLINE,
  openGraph: { siteName: "SchoolYard", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-white font-sans text-[#222]">{children}</body>
    </html>
  );
}
