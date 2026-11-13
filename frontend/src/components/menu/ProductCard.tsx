// [TV2] Task 3
//ProductCard.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/services/products.service';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [imgSrc, setImgSrc] = useState(product.imageUrl);
  const isOutOfStock = product.stock <= 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        isOutOfStock ? 'opacity-80' : ''
      }`}
    >
      <div>
        {/* Hình ảnh sản phẩm */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-stone-100">
          <img
            src={imgSrc}
            alt={product.name}
            onError={() => {
              // Fallback khi URL ảnh lỗi
              setImgSrc(
                'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80',
              );
            }}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Badge trạng thái kho */}
          {isOutOfStock ? (
            <div className="absolute left-2.5 top-2.5 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white shadow">
              Hết hàng
            </div>
          ) : product.stock < 10 ? (
            <div className="absolute left-2.5 top-2.5 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white shadow">
              Sắp hết
            </div>
          ) : null}
        </div>

        {/* Thông tin sản phẩm */}
        <div className="mt-3.5">
          <h3 className="line-clamp-1 text-base font-semibold text-stone-900 group-hover:text-amber-800">
            {product.name}
          </h3>
          <p className="mt-1 text-lg font-bold text-amber-700">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="mt-4">
        {isOutOfStock ? (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-xl bg-stone-200 py-2.5 text-center text-sm font-medium text-stone-500"
          >
            Tạm hết hàng
          </button>
        ) : (
          <Link
            href={`/products/${product.id}`}
            className="block w-full rounded-xl bg-amber-700 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-amber-800 active:scale-[0.99]"
          >
            Chọn món & Tùy chỉnh
          </Link>
        )}
      </div>
    </div>
  );
};
