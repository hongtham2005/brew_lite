import './globals.css';
import FloatingCart from '@/components/cart/FloatingCart';
import SiteHeader from '@/components/shared/SiteHeader';

export const metadata = {
  title: 'BrewLite',
  description: 'Ứng dụng đặt và thanh toán đồ uống không dùng tiền mặt',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head />
      <body className="bg-gray-50 text-gray-800 antialiased relative min-h-screen flex flex-col">
        
        <SiteHeader />

        {/* Nội dung các trang */}
        <main className="flex-1">
          {children}
        </main>
        
        {/* Giỏ hàng lơ lửng */}
        <FloatingCart />
      </body>
    </html>
  );
}