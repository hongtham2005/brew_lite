// [TV1] Task 1
// TODO: Trang chủ / redirect /menu

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-amber-50/50 to-white p-6 text-center overflow-hidden">
      
      {/* Nội dung chính giữa trang chủ */}
      <div className="max-w-xl mx-auto space-y-6">
        <div className="inline-block p-4 bg-amber-100 rounded-3xl text-amber-800 mb-2 shadow-inner">
          <span className="text-4xl">☕</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-amber-950 tracking-tight">
          BrewLite Coffee & Tea
        </h1>

        <p className="text-gray-600 text-base md:text-lg leading-relaxed">
          Thưởng thức hương vị cà phê đậm đà cùng các loại trà trái cây tươi mát, được pha chế độc quyền. Đặt món nhanh chóng, thanh toán tiện lợi không tiền mặt.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Nút chính dẫn thẳng vào Menu cho khách xem thoải mái */}
          <Link
            href="/menu"
            className="w-full sm:w-auto rounded-xl bg-amber-800 px-8 py-4 font-bold text-white shadow-lg hover:bg-amber-900 transition transform hover:-translate-y-0.5 text-center"
          >
            Khám phá thực đơn ngay →
          </Link>
        </div>
      </div>

      {/* Footer nhỏ bên dưới */}
      <div className="absolute bottom-6 text-xs text-gray-400">
        Ứng dụng đặt đồ uống BrewLite • Đồ án Công nghệ phần mềm
      </div>
    </div>
  );
}
