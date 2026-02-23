import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import {
  SITE_URL,
  SITE_NAME,
  SITE_TITLE_DEFAULT,
  SITE_TITLE_TEMPLATE,
  SITE_DESCRIPTION,
} from "@/lib/metadata";
import { prisma } from "@/lib/db";

const heading = localFont({
  src: [
    {
      path: "../fonts/PlayfairDisplay-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/PlayfairDisplay-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/PlayfairDisplay-Italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-playfair",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const body = localFont({
  src: [
    {
      path: "../fonts/Inter-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Inter-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/Inter-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-inter",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

export async function generateMetadata(): Promise<Metadata> {
  // Fetch first album's cover photo for OG image
  let ogImageUrl: string | undefined;
  try {
    const firstAlbum = await prisma.album.findFirst({
      include: {
        coverPhoto: true,
        photos: {
          include: { photo: true },
          orderBy: { photo: { sortOrder: "asc" } },
          take: 1,
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    ogImageUrl =
      firstAlbum?.coverPhoto?.cloudinaryUrl ??
      firstAlbum?.photos[0]?.photo.cloudinaryUrl ??
      undefined;
  } catch {
    // DB unavailable at build time — skip OG image
  }

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_TITLE_DEFAULT,
      template: SITE_TITLE_TEMPLATE,
    },
    description: SITE_DESCRIPTION,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: SITE_URL,
      siteName: SITE_NAME,
      title: SITE_TITLE_DEFAULT,
      description: SITE_DESCRIPTION,
      ...(ogImageUrl && { images: [{ url: ogImageUrl }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE_DEFAULT,
      description: SITE_DESCRIPTION,
      ...(ogImageUrl && { images: [ogImageUrl] }),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${heading.variable} ${body.variable} antialiased grain-overlay`}>
        {children}
      </body>
    </html>
  );
}
