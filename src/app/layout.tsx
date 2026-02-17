import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "Portrait Photography Portfolio",
  description:
    "Professional portrait photography portfolio showcasing studio, outdoor, and artistic portraits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${heading.variable} ${body.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
