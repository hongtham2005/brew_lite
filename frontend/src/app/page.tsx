import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-amber-50/50 to-white p-6 text-center">
      
      {/* Nội dung chính giữa trang chủ */}
      <div className="max-w-xl mx-auto space-y-6">
        <div className="inline-block p-4 bg-amber-100 rounded-3xl text-amber-800 mb-2 shadow-inner">
          <span className="text-4xl" aria-hidden="true">☕</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-amber-950 tracking-tight">
          BrewLite Coffee &amp; Tea
        </h1>

        <p className="text-gray-600 text-base md:text-lg leading-relaxed">
          Thưởng thức hương vị cà phê đậm đà cùng các loại trà trái cây tươi mát,
          được pha chế độc quyền. Đặt món nhanh chóng, thanh toán tiện lợi không
          tiền mặt.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Nút chính dẫn thẳng vào Menu cho khách xem thoải mái */}
          <Link
            href="/menu"
            className="w-full sm:w-auto rounded-xl bg-amber-800 px-8 py-4 font-bold text-white shadow-lg hover:bg-amber-900 transition transform hover:-translate-y-0.5 text-center"
          >
            Khám phá thực đơn ngay <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      {/* Footer nhỏ bên dưới */}
      <footer className="absolute bottom-6 text-xs text-gray-400">
        Ứng dụng đặt đồ uống BrewLite • Đồ án Công nghệ phần mềm
      </footer>
    </div>
  );
}
