// [TV2] Task 3
//productcardgrid
'use client';

import React from 'react';
import { Product } from '@/services/products.service';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-50/50 py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-800">
          ☕
        </div>
        <h3 className="text-lg font-semibold text-stone-800">
          Không tìm thấy đồ uống phù hợp
        </h3>
        <p className="mt-1 text-sm text-stone-500">
          Vui lòng thử tìm kiếm với từ khóa khác hoặc quay lại sau.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
