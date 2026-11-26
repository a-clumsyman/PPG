import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { LanguageProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "People's Priorities",
  description:
    "Constituency intelligence platform: turn citizen issues into ranked, evidence-backed development priorities.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="te">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Noto+Sans+Telugu:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LanguageProvider>
          <SiteNav />
          <main className="mx-auto w-full max-w-7xl px-4 py-6">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
