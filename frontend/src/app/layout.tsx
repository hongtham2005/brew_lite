import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import FloatingCart from '@/components/cart/FloatingCart';
import SiteHeader from '@/components/shared/SiteHeader';

export const metadata: Metadata = {
  title: 'BrewLite',
  description: 'Ứng dụng đặt và thanh toán đồ uống không dùng tiền mặt',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="relative flex min-h-screen flex-col bg-gray-50 text-gray-800 antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <FloatingCart />
      </body>
    </html>
  );
}
