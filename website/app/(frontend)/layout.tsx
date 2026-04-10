import type { Metadata } from "next";
import React, { Suspense } from "react";
import { Lexend } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ModalProvider from "@/components/ModalProvider";
import UtilityBar from "@/components/UtilityBar";
import { getSiteSettings } from "@/lib/payload";
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  jsonLdScript,
} from "@/lib/structured-data";
import { getForm } from "@/lib/payload";

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
  const joinForm = await getForm("Join the Club");
  const settings = await getSiteSettings();

  const orgSchema = generateOrganizationSchema(settings);
  const webSiteSchema = generateWebSiteSchema(settings);
  const globalJsonLd = jsonLdScript([orgSchema, webSiteSchema]);

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
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
            {/* Fixed top chrome: UtilityBar stacked above the main nav Header */}
            <div className="fixed top-0 left-0 right-0 z-50 flex flex-col bg-background-dark">
              <Suspense fallback={null}>
                <UtilityBar />
              </Suspense>
              <Header formData={joinForm} />
            </div>
            {/*
              Static offset: schedule bar (~32px) + at most 1-2 alert banners (~64px) + header (~72px)
              If the number of banners changes heavily, update this value.
            */}
            <main className="flex-1 pt-[160px]">{children}</main>
            <Footer />
          </div>
        </ModalProvider>
      </body>
    </html>
  );
}
