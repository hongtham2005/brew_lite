'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cartStore';

export default function CheckoutPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nickname, setNickname] = useState('');

  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  // Thêm state lưu chi tiết hóa đơn sau khi xác nhận email thành công
  const [confirmedInvoice, setConfirmedInvoice] = useState<{
    orderId: number;
    total: number;
    pointsEarned: number;
    customerName: string | null;
  } | null>(null);

  const [awaitingConfirmation, setAwaitingConfirmation] = useState<{
    orderId: number;
    emailStatus: string | null;
  } | null>(null);
  const [paymentReturnProcessing, setPaymentReturnProcessing] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  // 🌟 LẮNG NGHE TÍN HIỆU TỪ EMAIL ĐỂ XUẤT HÓA ĐƠN XANH TẠI TAB A
  useEffect(() => {
    const channel = new BroadcastChannel('brewlite_payment_channel');
    channel.onmessage = (event) => {
      if (event.data && event.data.type === 'PAYMENT_CONFIRMED') {
        // Cập nhật thông tin hóa đơn xanh ngay tại Tab A
        setConfirmedInvoice({
          orderId: Number(event.data.orderId),
          total: Number(event.data.total),
          pointsEarned: Number(event.data.pointsEarned),
          customerName: event.data.customerName,
        });
      }
    };
    return () => {
      channel.close();
    };
  }, []);

  // Mount + lấy user mặc định
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      const returnTo = `${window.location.pathname}${window.location.search}`;
      router.replace(`/login?redirect=${encodeURIComponent(returnTo)}`);
      return;
    }
    setPaymentReturnProcessing(new URLSearchParams(window.location.search).has('paymentReturn'));
    setIsMounted(true);
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (userData.email) {
          const defaultName = userData.email.split('@')[0];
          setNickname((prev) => (prev ? prev : defaultName));
        }
      }
    } catch (e) {
      console.error('Không thể đọc thông tin user', e);
    }
  }, [router]);

  // 🌟 TỰ ĐỘNG KIỂM TRA XÁC NHẬN EMAIL ĐỂ ĐỔI SANG HÓA ĐƠN XANH
  useEffect(() => {
    if (!awaitingConfirmation) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    let active = true;
    const checkInterval = setInterval(async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/orders/${encodeURIComponent(awaitingConfirmation.orderId)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!res.ok) return;

        const order = await res.json();
        
        // Khi payment đã có confirmedAt (tức là người dùng đã bấm xác nhận trong email)
        if (active && order.payment?.confirmedAt) {
          clearInterval(checkInterval);
          
          // Chuyển trực tiếp sang giao diện HÓA ĐƠN XANH
          setConfirmedInvoice({
            orderId: order.id,
            total: order.total,
            pointsEarned: Math.floor(order.total / 10000),
            customerName: order.customerName,
          });
          setAwaitingConfirmation(null);
        }
      } catch (err) {
        console.error('Lỗi kiểm tra xác nhận email:', err);
      }
    }, 2500); // Tự động kiểm tra mỗi 2.5 giây

    return () => {
      active = false;
      clearInterval(checkInterval);
    };
  }, [awaitingConfirmation]);

  // Xử lý kết quả trả về từ VNPay
  useEffect(() => {
    if (!isMounted) return;
    const params = new URLSearchParams(window.location.search);
    const paymentReturn = params.get('paymentReturn');
    const orderId = params.get('orderId');
    const emailStatus = params.get('email');
    const paymentReason = params.get('reason');
    if (!paymentReturn) return;
    setPaymentReturnProcessing(true);
    setIsCheckingPayment(true);
    window.history.replaceState(null, '', '/checkout');
    const token = localStorage.getItem('access_token');
    if (!orderId || !token || params.get('status') === 'invalid') {
      setIsCheckingPayment(false);
      setError('Không xác minh được giao dịch. Vui lòng kiểm tra trạng thái đơn hàng.');
      return;
    }
    let active = true;
    let attempts = 0;
    let pollTimer: ReturnType<typeof setTimeout> | undefined;

    const checkPayment = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/orders/${encodeURIComponent(orderId)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.status === 401) {
          setIsCheckingPayment(false);
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          router.replace('/login?redirect=%2Fcheckout');
          return;
        }
        if (!res.ok) throw new Error('Không thể kiểm tra trạng thái giao dịch.');
        const order = await res.json();
        if (!active) return;
        if (order.status === 'PAID') {
          setIsCheckingPayment(false);
          clearCart();
          setAwaitingConfirmation({
            orderId: Number(orderId),
            emailStatus,
          });
          return;
        }
        if (order.status === 'PAYMENT_FAILED' || params.get('status') === 'failed') {
          setIsCheckingPayment(false);
          setError(
            paymentReason ||
              'Giao dịch chưa hoàn tất. Bạn có thể tạo đơn mới và thử lại.',
          );
          return;
        }
        if (++attempts >= 40) {
          setIsCheckingPayment(false);
          setError('Thanh toán đang chờ xác nhận từ cổng. Hãy tải lại trang sau ít phút để kiểm tra.');
          return;
        }
        pollTimer = setTimeout(checkPayment, 3000);
      } catch (err) {
        console.error('Không kiểm tra được trạng thái thanh toán:', err);
        if (active) {
          setIsCheckingPayment(false);
          setError('Không kiểm tra được trạng thái thanh toán. Vui lòng tải lại trang.');
        }
      }
    };
    void checkPayment();
    return () => {
      active = false;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [isMounted, router, clearCart]);

  useEffect(() => {
    if (!isMounted || awaitingConfirmation || confirmedInvoice) return;
    if (cartItems.length === 0 && !paymentReturnProcessing) {
      router.push('/cart');
    }
  }, [
    isMounted,
    router,
    cartItems.length,
    awaitingConfirmation,
    confirmedInvoice,
    paymentReturnProcessing,
  ]);

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Đang tải trang thanh toán...
      </div>
    );
  }

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const finalAmount = totalAmount - (appliedPromo?.discountAmount || 0);
  const pointsPreview = Math.floor(finalAmount / 10000);

  const mapCartToOrderItems = () => {
    return cartItems.map((item) => ({
      productId: Number(item.productId),
      size: item.size,
      qty: item.quantity,
      topping: item.toppings?.length > 0 ? item.toppings.join(', ') : undefined,
    }));
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Vui lòng nhập mã giảm giá');
      return;
    }
    try {
      setPromoLoading(true);
      setPromoError('');
      const res = await fetch(
        `http://localhost:3001/orders/promo/check?code=${promoCode.trim()}&amount=${totalAmount}`,
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Mã giảm giá không hợp lệ');
      }
      setAppliedPromo({
        code: data.code,
        discountAmount: data.discountAmount,
      });
    } catch (err: any) {
      setAppliedPromo(null);
      setPromoError(err.message);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleInitialPayment = async () => {
    try {
      setLoading(true);
      setError('');
      if (!nickname.trim()) {
        throw new Error('Vui lòng nhập tên gọi hoặc nickname để nhận đơn hàng!');
      }
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.replace('/login?redirect=%2Fcheckout');
        return;
      }
      const orderRes = await fetch('http://localhost:3001/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: mapCartToOrderItems(),
          customerName: nickname.trim(),
          promoCode: appliedPromo?.code || promoCode.trim() || undefined,
        }),
      });
      if (orderRes.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        router.replace('/login?redirect=%2Fcheckout');
        return;
      }
      if (!orderRes.ok) {
        const errData = await orderRes.json();
        throw new Error(errData.message || 'Không thể tạo đơn hàng');
      }
      const orderData = await orderRes.json();
      const orderId = orderData.orderId || orderData.id;
      const amount = orderData.total || finalAmount;

      const idempotencyKey =
        'key-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);

      const paymentRes = await fetch('http://localhost:3001/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: Number(orderId),
          amount: Number(amount),
          method: 'VNPAY_QR',
          customerName: nickname.trim(),
          idempotencyKey,
        }),
      });
      if (!paymentRes.ok) {
        if (paymentRes.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          router.replace('/login?redirect=%2Fcheckout');
          return;
        }
        const errData = await paymentRes.json();
        throw new Error(errData.message || 'Không thể khởi tạo thanh toán');
      }
      const paymentData = await paymentRes.json();
      if (typeof paymentData.paymentUrl !== 'string') {
        throw new Error('Payment provider did not return a checkout URL.');
      }
      window.location.assign(paymentData.paymentUrl);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 border border-gray-100 relative">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Thanh toán & Tích điểm
        </h1>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            ⚠️ {error}
          </div>
        )}
        {isCheckingPayment && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm">
            Đang chờ cổng thanh toán xác nhận giao dịch...
          </div>
        )}

        {/* 🌟 1. HIỂN THỊ HÓA ĐƠN XANH THÀNH CÔNG NGAY TRÊN TAB A KHI ĐÃ BẤM EMAIL */}
        {confirmedInvoice ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <h2 className="text-lg font-bold text-emerald-800">
              Đặt hàng thành công!
            </h2>
            <p className="text-sm text-gray-600">
              Mã đơn hàng: <strong className="text-amber-900">#{confirmedInvoice.orderId}</strong>
            </p>
            {confirmedInvoice.customerName && (
              <p className="text-xs text-gray-500">
                Tên nhận đơn: <span className="font-semibold text-gray-700">{confirmedInvoice.customerName}</span>
              </p>
            )}
            <div className="bg-white p-3 rounded-lg border border-emerald-100 text-center">
              <span className="text-xs text-gray-500 block">Tổng thanh toán:</span>
              <span className="text-lg font-bold text-amber-700">
                {confirmedInvoice.total.toLocaleString('vi-VN')} đ
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-emerald-100 text-center">
              <span className="text-xs text-gray-500 block">Điểm tích lũy Loyalty nhận được:</span>
              <span className="text-2xl font-extrabold text-amber-600">
                +{confirmedInvoice.pointsEarned} điểm
              </span>
              <span className="text-[11px] text-gray-400 block mt-1">
                (Quy định: 10.000đ = 1 điểm)
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Email đã xác nhận đơn hàng của bạn. BrewLite sẽ bắt đầu chuẩn bị đơn hàng.
            </p>
            <button
              onClick={() => router.push('/orders')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl transition text-sm"
            >
              Xem lịch sử đơn hàng
            </button>
          </div>
        ) : awaitingConfirmation ? (
          /* 2. HIỂN THỊ BẢNG VÀNG ĐANG CHỜ XÁC NHẬN EMAIL */
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center space-y-3">
            <h2 className="text-lg font-bold text-amber-900">
              VNPay đã xác nhận thanh toán
            </h2>
            <p className="text-sm text-gray-700">
              Đơn hàng #{awaitingConfirmation.orderId} đã được thanh toán.
              Vui lòng mở email và bấm “Xác nhận đơn hàng” để hoàn tất.
            </p>
            <p className="text-xs text-gray-500">
              Trang web sẽ tự động xuất hóa đơn tại đây ngay khi bạn bấm xác nhận qua email.
            </p>
            <button
              onClick={() => router.push('/orders')}
              className="w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold py-2.5 rounded-xl transition text-sm"
            >
              Xem lịch sử đơn hàng
            </button>
          </div>
        ) : (
          /* 3. FORM CHECKOUT BAN ĐẦU */
          <>
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1.5">
                Tên gọi / Nickname nhận đơn <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nhập tên để quán gọi khi xong nước..."
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
            </div>
            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1.5">
                Mã giảm giá
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập mã (vd: BREW10)"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    setPromoError('');
                    setAppliedPromo(null);
                  }}
                  className="flex-1 rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={promoLoading || !promoCode.trim()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition"
                >
                  {promoLoading ? '...' : 'Áp dụng'}
                </button>
              </div>
              {promoError && (
                <p className="text-xs text-red-500 mt-1.5">⚠️ {promoError}</p>
              )}
              {appliedPromo && (
                <p className="text-xs text-emerald-600 mt-1.5 font-medium">
                  ✓ Đã áp dụng mã <strong>{appliedPromo.code}</strong> — Giảm{' '}
                  {appliedPromo.discountAmount.toLocaleString('vi-VN')}đ
                </p>
              )}
            </div>
            <div className="bg-amber-50 rounded-xl p-4 mb-5 border border-amber-200/60 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-amber-800 font-medium">Tạm tính:</span>
                <span className="text-sm text-amber-900">{totalAmount.toLocaleString('vi-VN')} đ</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-emerald-700 font-medium">
                    Giảm giá ({appliedPromo.code}):
                  </span>
                  <span className="text-sm text-emerald-700 font-semibold">
                    -{appliedPromo.discountAmount.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1 border-t border-amber-200">
                <span className="text-sm font-bold text-amber-900">Tổng thanh toán:</span>
                <span className="text-xl font-bold text-amber-900">{finalAmount.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-amber-700">Tích lũy dự kiến: +{pointsPreview} điểm</span>
              </div>
            </div>
            <div className="mb-6 space-y-2.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
                Phương thức thanh toán:
              </label>
              <div className="flex items-center space-x-3 p-3 border rounded-xl border-amber-200">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                    VNPAY
                  </span>
                  <span className="font-medium text-gray-800 text-sm">
                    Thanh toán qua VNPay (QR / Thẻ)
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleInitialPayment}
              disabled={loading || isCheckingPayment}
              className="w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold py-3 rounded-xl shadow transition disabled:opacity-50 text-sm"
            >
              {isCheckingPayment
                ? 'Đang xác nhận giao dịch...'
                : loading
                ? 'Đang khởi tạo đơn hàng...'
                : 'Xác nhận thanh toán & Tích điểm'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}