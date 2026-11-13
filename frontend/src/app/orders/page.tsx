// Đường dẫn file: src/app/orders/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface OrderItem {
  id: number;
  product: { name: string; imageUrl: string };
  size: string;
  qty: number;
  topping?: string;
  lineTotal: number;
}

interface Order {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  customerName?: string;
  items: OrderItem[];
  payment?: {
    method: string;
    status?: string;
    confirmedAt?: string | null;
  };
}

export default function OrderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  const formatPaymentMethod = (method?: string) => {
    if (!method) return 'Chưa rõ';
    switch (method) {
      case 'CARD': 
        return 'ATM';
      default: 
        return method;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login?redirect=/orders');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch('http://localhost:3001/orders/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          router.replace('/login?redirect=%2Forders');
          throw new Error('Phiên đăng nhập đã hết hạn');
        }
        if (!res.ok) throw new Error('Không thể tải lịch sử đơn hàng');
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
        }
      } catch (err) {
        console.error('Lỗi tải lịch sử đơn hàng:', err);
      } finally {
        setLoading(false);
      }
    };

    // 🌟 Kiểm tra xem URL có chứa token xác nhận từ email gửi sang không
    const urlParams = new URLSearchParams(window.location.search);
    const emailToken = urlParams.get('token');

    const initPage = async () => {
      if (emailToken) {
        try {
          // Gọi API xác nhận đơn hàng từ email ngay tại trang orders
          const confirmRes = await fetch('http://localhost:3001/payments/email/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: emailToken }),
          });
          const confirmData = await confirmRes.json();
          if (confirmRes.ok) {
            setNotification(`Xác nhận thành công đơn hàng #${confirmData.orderId}! Bạn nhận được +${confirmData.pointsEarned} điểm Loyalty.`);
          }
        } catch (e) {
          console.error('Lỗi xác nhận token từ email:', e);
        }
        // Xóa token trên URL cho gọn thanh địa chỉ mà không cần load lại trang
        window.history.replaceState({}, '', '/orders');
      }
      await fetchOrders();
    };

    void initPage();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải lịch sử đơn hàng...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Thông báo xác nhận thành công từ email nếu có */}
        {notification && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-center font-medium shadow-sm">
            ✨ {notification}
          </div>
        )}

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">📦 Lịch sử đơn hàng của bạn</h1>
          <button
            onClick={() => router.push('/menu')}
            className="px-4 py-2 bg-amber-700 text-white rounded-xl text-sm font-semibold hover:bg-amber-800 transition"
          >
            ← Tiếp tục mua sắm
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào.</p>
            <button
              onClick={() => router.push('/menu')}
              className="px-6 py-2.5 bg-amber-600 text-white rounded-xl font-semibold text-sm"
            >
              Xem thực đơn ngay
            </button>
          </div>
        ) : (
          orders.map((order) => {
            const awaitingEmailConfirmation =
              order.status === 'PAID' && !order.payment?.confirmedAt;
            const statusLabel = awaitingEmailConfirmation
              ? 'CHỜ XÁC NHẬN EMAIL'
              : order.status;

            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <div>
                    <span className="font-bold text-gray-800 text-lg">Đơn hàng #{order.id}</span>
                    <span className="text-xs text-gray-400 block">
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'PAID' && !awaitingEmailConfirmation
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'PAYMENT_FAILED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-700">
                          {item.product?.name || 'Sản phẩm'} (Size {item.size}) x {item.qty}
                        </span>
                        {item.topping && <span className="text-xs text-gray-400">({item.topping})</span>}
                      </div>
                      <span className="font-semibold text-gray-800">
                        {item.lineTotal?.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 flex justify-between items-center text-xs text-gray-600">
                  <div>
                    <p>
                      Người nhận: <strong className="text-gray-700">{order.customerName || 'Khách hàng'}</strong>
                    </p>
                    <p className="mt-1">
                      Thanh toán qua:{' '}
                      <strong className="text-amber-800 uppercase bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {formatPaymentMethod(order.payment?.method)}
                      </strong>
                    </p>
                  </div>
                  <span className="text-base font-extrabold text-amber-900">
                    Tổng tiền: {order.total?.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}