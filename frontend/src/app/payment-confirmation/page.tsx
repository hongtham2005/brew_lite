'use client';
import { useEffect, useState } from 'react';

export default function PaymentConfirmationPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setError('Liên kết xác nhận không hợp lệ hoặc đã bị thiếu.');
      setLoading(false);
      return;
    }

    const confirmOrder = async () => {
      try {
        const response = await fetch(
          'http://localhost:3001/payments/email/confirm',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          },
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.message || 'Không thể xác nhận đơn hàng. Vui lòng thử lại.',
          );
        }

        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token);
        }

        if (active) {
          // 🌟 BẮN TOÀN BỘ DỮ LIỆU HÓA ĐƠN SANG CHO TAB A
          const channel = new BroadcastChannel('brewlite_payment_channel');
          channel.postMessage({
            type: 'PAYMENT_CONFIRMED',
            orderId: Number(data.orderId),
            total: Number(data.total),
            pointsEarned: Number(data.pointsEarned),
            customerName: data.customerName,
          });
          channel.close();

          // 🌟 TỰ ĐỘNG ĐÓNG TAB B NÀY LẠI NGAY LẬP TỨC
          setTimeout(() => {
            window.close();
          }, 500);
        }
      } catch (confirmationError) {
        console.error('Không thể xác nhận đơn hàng từ email:', confirmationError);
        if (active) {
          setError(
            confirmationError instanceof Error
              ? confirmationError.message
              : 'Không thể xác nhận đơn hàng. Vui lòng tải lại trang.',
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void confirmOrder();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f7fc] flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-2xl shadow-lg text-center max-w-sm w-full space-y-3">
        {loading ? (
          <>
            <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-700 rounded-full animate-spin mx-auto" />
            <p className="text-gray-700 font-medium">Đang xác nhận đơn hàng & chuyển về tab cũ...</p>
          </>
        ) : error ? (
          <p className="text-red-600 text-sm">{error}</p>
        ) : (
          <p className="text-emerald-700 font-semibold">Đã xác nhận! Đang quay lại tab chính...</p>
        )}
      </div>
    </div>
  );
}