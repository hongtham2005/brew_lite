'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCartStore } from '@/stores/cartStore';

export default function FloatingCart() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const totalQuantity = useCartStore((state) => state.totalQuantity());
  const totalAmount = useCartStore((state) => state.totalAmount());

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Chưa mount hoặc đang ở trang cart/checkout thì ẩn
  if (!isMounted || pathname === '/cart' || pathname === '/checkout') {
    return null;
  }

  return (
    <>
      {/* Icon giỏ hàng lơ lửng luôn hiển thị */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-[#8B4513] hover:bg-[#703610] text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition transform hover:scale-105"
          title="Xem giỏ hàng"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
            {totalQuantity}
          </span>
        </button>
      </div>

      {/* Drawer ngăn kéo giỏ hàng */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <h2 className="text-lg font-bold text-gray-800">
                  Giỏ hàng của bạn ({totalQuantity})
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 font-bold p-1 text-lg"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-16 text-center text-gray-400">
                    <span className="text-5xl mb-3">🛒</span>
                    <p className="text-base font-bold text-gray-700">Giỏ hàng đang trống</p>
                    <p className="text-xs text-gray-500 mt-1">Chưa có món nào được chọn</p>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        router.push('/menu');
                      }}
                      className="mt-4 px-4 py-2 bg-amber-800 text-white rounded-xl text-xs font-semibold hover:bg-amber-900 transition"
                    >
                      Chọn món ngay
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-gray-800">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          Size: {item.size}{' '}
                          {item.toppings?.length
                            ? `| ${item.toppings.join(', ')}`
                            : ''}
                        </p>
                        <p className="text-amber-700 font-bold text-xs mt-0.5">
                          {item.unitPrice.toLocaleString('vi-VN')} đ
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-600 text-[11px]"
                        >
                          Xóa
                        </button>
                        <div className="flex items-center border rounded bg-white">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="px-2 py-0.5 text-xs text-gray-600 font-bold hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="px-2 py-0.5 text-xs text-gray-600 font-bold hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t bg-gray-50 space-y-3">
                <div className="flex justify-between items-center text-sm font-bold text-gray-800">
                  <span>Tạm tính:</span>
                  <span className="text-amber-700 text-lg">
                    {totalAmount.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      router.push('/cart');
                    }}
                    className="py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl text-xs transition"
                  >
                    Xem chi tiết giỏ
                  </button>
                  <button
                    disabled={items.length === 0}
                    onClick={() => {
                      if (items.length === 0) return;
                      setIsOpen(false);
                      const token = localStorage.getItem('access_token');
                      if (!token) {
                        alert('Bạn cần đăng nhập trước khi thanh toán!');
                        router.push('/login?redirect=/checkout');
                      } else {
                        router.push('/checkout');
                      }
                    }}
                    className={`py-2.5 font-bold rounded-xl text-xs transition shadow ${
                      items.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#8B4513] hover:bg-[#703610] text-white'
                    }`}
                  >
                    Thanh toán ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
