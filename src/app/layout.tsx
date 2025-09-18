import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { Providers } from "./providers";
import { StructuredData } from "./_components/StructuredData";

export const metadata: Metadata = {
  title: "KayanLive Questionnaire - Project Brief Form",
  description: "Submit your booth and exhibition project requirements to KayanLive. We specialize in creating extraordinary booths that captivate audiences worldwide.",
  keywords: "KayanLive, exhibition booth, trade show, project brief, questionnaire, event booth design",
  authors: [{ name: "KayanLive" }],
  creator: "KayanLive",
  publisher: "KayanLive",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://questionnaire.kayanlive.com",
    siteName: "KayanLive Questionnaire",
    title: "KayanLive Questionnaire - Project Brief Form",
    description: "Submit your booth and exhibition project requirements to KayanLive",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KayanLive Questionnaire",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KayanLive Questionnaire",
    description: "Submit your booth project requirements",
    images: ["/og-image.png"],
  },
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "icon", type: "image/png", sizes: "16x16", url: "/favicon-16x16.png" },
    { rel: "icon", type: "image/png", sizes: "32x32", url: "/favicon-32x32.png" },
    { rel: "apple-touch-icon", sizes: "180x180", url: "/apple-touch-icon.png" },
    { rel: "manifest", url: "/site.webmanifest" },
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <head>
        <StructuredData />
      </head>
      <body>
        <Providers>{children}</Providers>
        <div id="date-picker-portal"></div>
      </body>
    </html>
  );
}
