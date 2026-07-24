import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Metin2AlSat",
  description: "Metin2 alim satim pazari",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        <div className="site-background" />
        <div className="site-dark-layer" />
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}