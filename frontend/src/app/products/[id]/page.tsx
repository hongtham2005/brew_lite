//product
'use client';

import React, { useEffect, useState } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useParams, useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
}

const SIZE_OPTIONS = [
  { code: 'S', label: 'Size S (Nhỏ)', extraPrice: 0 },
  { code: 'M', label: 'Size M (Vừa)', extraPrice: 5000 },
  { code: 'L', label: 'Size L (Lớn)', extraPrice: 10000 },
];

const TOPPING_OPTIONS = [
  { id: 'tranchau', label: 'Trân châu đen', price: 5000 },
  { id: 'thachdua', label: 'Thạch dừa', price: 5000 },
  { id: 'kemcheese', label: 'Kem Cheese', price: 10000 },
  { id: 'pudding', label: 'Pudding Trứng', price: 8000 },
];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSize, setSelectedSize] = useState<string>('S');
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    if (!id) return;

    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:3001/products/${id}`);
        if (!res.ok) throw new Error('Không thể tải thông tin sản phẩm!');

        const data = await res.json();
        setProduct(data);
      } catch (err: any) {
        setError(err.message || 'Đã có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [id]);

  const handleToppingToggle = (toppingId: string) => {
    setSelectedToppings((prev) =>
      prev.includes(toppingId)
        ? prev.filter((t) => t !== toppingId)
        : [...prev, toppingId]
    );
  };

  const calculateUnitPrice = () => {
    if (!product) return 0;
    const sizeExtra = SIZE_OPTIONS.find((s) => s.code === selectedSize)?.extraPrice || 0;
    const toppingExtra = selectedToppings.reduce((total, toppingId) => {
      const topping = TOPPING_OPTIONS.find((t) => t.id === toppingId);
      return total + (topping ? topping.price : 0);
    }, 0);
    return product.price + sizeExtra + toppingExtra;
  };

  const unitPrice = calculateUnitPrice();
  const totalPrice = unitPrice * quantity;

  // Thêm vào giỏ hàng và lưu vào localStorage để chuyển sang trang giỏ hàng
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (!product) return;

    const newItem = {
      id: `${product.id}-${selectedSize}-${selectedToppings.sort().join('-')}`,
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      size: selectedSize,
      toppings: selectedToppings.map(
        (tId) => TOPPING_OPTIONS.find((t) => t.id === tId)?.label || tId,
      ),
      quantity,
      unitPrice,
    };

    addItem(newItem);
    alert(`Đã thêm ${quantity} x "${product.name}" vào giỏ hàng!`);
    router.push('/cart');
  };

  if (loading) return <div className="p-10 text-center text-gray-600 font-medium">Đang tải chi tiết món...</div>;
  if (error || !product) return <div className="p-10 text-center text-red-500 font-medium">Sản phẩm không tồn tại!</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => router.back()}
        className="mb-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
      >
        ← Quay lại thực đơn
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <div>
          <img
            src={product.imageUrl ? product.imageUrl : '/images/default-coffee.jpg'}
            alt={product.name}
            className="w-full h-80 object-cover rounded-xl shadow-inner"
          />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
            <p className="text-xl font-bold text-amber-600 mb-4">
              {product.price.toLocaleString('vi-VN')} đ
              <span className="text-xs text-gray-400 font-normal ml-2">(Giá gốc)</span>
            </p>
            <div className="mb-6">
              {product.stock === 0 ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-700">
                  🚫 Tạm thời hết hàng
                </span>
              ) : product.stock < 20 ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">
                  🔥 Chỉ còn lại {product.stock} ly!
                </span>
              ) : (
                <span className="text-xs text-gray-500 font-medium">
                  Kho còn lại: <strong className="text-gray-700">{product.stock}</strong> sản phẩm
                </span>
              )}
            </div>

            {/* Chọn Size */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Chọn Size <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {SIZE_OPTIONS.map((size) => (
                  <button
                    key={size.code}
                    type="button"
                    onClick={() => setSelectedSize(size.code)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                      selectedSize === size.code
                        ? 'border-amber-600 bg-amber-50 text-amber-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <div>{size.label}</div>
                    {size.extraPrice > 0 && (
                      <div className="text-[10px] text-amber-600 font-normal">
                        +{size.extraPrice.toLocaleString('vi-VN')} đ
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Chọn Topping */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Chọn Topping kèm theo
              </label>
              <div className="space-y-2">
                {TOPPING_OPTIONS.map((topping) => {
                  const isChecked = selectedToppings.includes(topping.id);
                  return (
                    <label
                      key={topping.id}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                        isChecked ? 'border-amber-500 bg-amber-50/50' : 'border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToppingToggle(topping.id)}
                          className="accent-amber-600 rounded"
                        />
                        <span className="font-medium text-gray-700">{topping.label}</span>
                      </div>
                      <span className="text-gray-500">
                        +{topping.price.toLocaleString('vi-VN')} đ
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Số lượng */}
            <div className="mb-6 flex items-center justify-between border-t pt-4">
              <span className="text-sm font-semibold text-gray-700">Số lượng:</span>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold"
                >
                  -
                </button>
                <span className="px-4 py-1 font-semibold text-sm">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 mt-2">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">Tổng cộng:</span>
              <span className="text-2xl font-extrabold text-amber-700">
                {totalPrice.toLocaleString('vi-VN')} đ
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full py-3 bg-[#8B4513] hover:bg-[#703610] text-white font-bold rounded-xl shadow transition"
            >
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}