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
      <head>
        <meta charSet="utf-8" />
      </head>
      <body>{children}</body>
    </html>
  );
}