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
      </body>
    </html>
  );
}
