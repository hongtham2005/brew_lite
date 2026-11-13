'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cartStore';

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const totalAmount = useCartStore((state) => state.totalAmount());

  const handleProceedToCheckout = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Bạn cần đăng nhập trước khi tiến hành thanh toán!');
      router.push('/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => router.push('/menu')}
        className="mb-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
      >
        ← Chọn thêm món khác
      </button>

      <h1 className="text-3xl font-extrabold text-gray-800 mb-6">
        Giỏ Hàng Của Bạn
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-4 text-lg">
            Giỏ hàng của bạn đang trống!
          </p>
          <button
            onClick={() => router.push('/menu')}
            className="px-6 py-3 bg-[#8B4513] text-white font-bold rounded-xl hover:bg-[#703610] transition"
          >
            Xem thực đơn ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{item.name}</h3>
                  <p className="text-xs text-gray-500">
                    Size:{' '}
                    <span className="font-semibold text-gray-700">
                      {item.size}
                    </span>
                    {item.toppings?.length > 0 &&
                      ` | Topping: ${item.toppings.join(', ')}`}
                  </p>
                  <p className="text-amber-600 font-semibold text-sm mt-1">
                    {item.unitPrice.toLocaleString('vi-VN')} đ
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-400 hover:text-red-600 text-xs font-medium"
                  >
                    Xóa
                  </button>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="px-2.5 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-0.5 font-semibold text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="px-2.5 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Cộng giỏ hàng
            </h2>
            <div className="flex justify-between mb-2 text-sm text-gray-600">
              <span>Tạm tính:</span>
              <span>{totalAmount.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between mb-4 text-sm text-gray-600">
              <span>Phí vận chuyển:</span>
              <span>Miễn phí tại quầy</span>
            </div>
            <div className="border-t pt-4 flex justify-between items-center mb-6">
              <span className="font-bold text-gray-800">Tổng cộng:</span>
              <span className="text-xl font-extrabold text-amber-700">
                {totalAmount.toLocaleString('vi-VN')} đ
              </span>
            </div>
            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3 bg-[#8B4513] hover:bg-[#703610] text-white font-bold rounded-xl shadow transition text-center"
            >
              Tiến hành thanh toán
            </button>
          </div>
        </div>
      )}
    </div>
  );
}