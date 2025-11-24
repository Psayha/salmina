import Script from 'next/script';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { ClientLayout } from '@/components/ClientLayout';
import { DebugPanel } from '@/components/DebugPanel';
import { Eruda } from '@/components/Eruda';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Telegram Shop - Интернет-магазин косметики',
  description: 'Профессиональный интернет-магазин косметики в формате Telegram Mini App',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <Script id="version-check" strategy="beforeInteractive">
          {`console.log('🔥🔥🔥 BUILD VERSION: ApL_RI-K4knv9K9AI_zyt - NEW CODE LOADED! 🔥🔥🔥');`}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <ClientLayout>{children}</ClientLayout>
          <DebugPanel />
          <Eruda />
        </Providers>
      </body>
    </html>
  );
}
