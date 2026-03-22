import type { Metadata } from "next";
import React from "react";
import { Lexend } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ModalProvider from "@/components/ModalProvider";
import { getSiteSettings } from "@/lib/payload";
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  jsonLdScript,
} from "@/lib/structured-data";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: {
      default: settings.siteName || "Gaines Boxing Club",
      template: `%s | ${settings.siteName || "Gaines Boxing Club"}`,
    },
    description:
      settings.tagline ||
      "Experience the elite training of a 3-time Golden Gloves champion. Where your boxing journey truly begins.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  const orgSchema = generateOrganizationSchema(settings);
  const webSiteSchema = generateWebSiteSchema(settings);
  const globalJsonLd = jsonLdScript([orgSchema, webSiteSchema]);

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        {globalJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: globalJsonLd }}
          />
        )}
      </head>
      <body
        className={`${lexend.variable} bg-background-dark font-sans text-slate-100 antialiased`}
        suppressHydrationWarning
      >
        <ModalProvider>
          <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
            <Header />
            <main className="flex-1 pt-[104px]">{children}</main>
            <Footer />
          </div>
        </ModalProvider>
      </body>
    </html>
  );
}
