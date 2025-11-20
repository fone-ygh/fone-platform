import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/shared/providers/Providers";
import "react-data-grid/lib/styles.css";

import "@/app/assets/global.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UI Platform",
  description: "UI Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="emotion-insertion-point" content="" />
        <link href="https://fonts.googleapis.com/css?family=Material+Icons" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{ width: "100%", height: "100vh" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
