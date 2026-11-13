// [TV2] Task 3
//menu
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getProducts, Product } from '@/services/products.service';
import { ProductGrid } from '@/components/menu/ProductGrid';

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi tải thực đơn. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase().trim()),
    );
  }, [products, searchTerm]);

  return (
    <div className="min-h-screen bg-stone-50/60 pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Banner tiêu đề */}
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full bg-amber-100 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-900">
            BrewLite Coffee & Tea
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
            Thực Đơn Đồ Uống
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-base text-stone-600">
            Thưởng thức hương vị cà phê đậm đà cùng các loại trà trái cây tươi mát, được pha chế thủ công theo công thức độc quyền.
          </p>

          {/* Ô tìm kiếm đồ uống */}
          <div className="mx-auto mt-6 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm món đồ uống bạn yêu thích..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-white py-3 pl-11 pr-10 text-sm shadow-sm transition-all focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-stone-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 hover:text-stone-600"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Trạng thái Loading (Skeleton) */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
              >
                <div className="aspect-square w-full rounded-xl bg-stone-200" />
                <div className="mt-4 h-5 w-3/4 rounded bg-stone-200" />
                <div className="mt-2 h-5 w-1/3 rounded bg-stone-200" />
                <div className="mt-4 h-10 w-full rounded-xl bg-stone-200" />
              </div>
            ))}
          </div>
        )}

        {/* Trạng thái Lỗi */}
        {!loading && error && (
          <div className="mx-auto max-w-lg rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-center text-rose-800">
            <svg
              className="mx-auto h-12 w-12 text-rose-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="mt-3 text-lg font-bold">Không thể tải thực đơn</h3>
            <p className="mt-1 text-sm text-rose-700">{error}</p>
            <button
              onClick={fetchMenu}
              className="mt-4 inline-flex items-center rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 active:scale-95"
            >
              Thử lại ngay
            </button>
          </div>
        )}

        {/* Trạng thái dữ liệu đã tải xong */}
        {!loading && !error && (
          <div>
            <div className="mb-4 flex items-center justify-between text-sm text-stone-500">
              <span>
                Hiển thị <strong className="text-stone-900">{filteredProducts.length}</strong> món
              </span>
              {searchTerm && (
                <span>
                  Kết quả cho: &ldquo;<strong>{searchTerm}</strong>&rdquo;
                </span>
              )}
            </div>

            <ProductGrid products={filteredProducts} />
          </div>
        )}
      </div>
    </div>
  );
}
