import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";

const cairo = localFont({
  src: [
    {
      path: "./fonts/cairo-latin.woff2",
      style: "normal",
      weight: "200 1000",
    },
    {
      path: "./fonts/cairo-latin-ext.woff2",
      style: "normal",
      weight: "200 1000",
    },
    {
      path: "./fonts/cairo-arabic.woff2",
      style: "normal",
      weight: "200 1000",
    },
  ],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "Bites | Sign in",
  description:
    "Studybites-inspired authentication flow clone built with a mocked dashboard experience.",
  icons: {
    icon: "/seo/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cairo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>

        <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fstudybites9653back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.18" />
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" /></body>
    </html>
  );
}
