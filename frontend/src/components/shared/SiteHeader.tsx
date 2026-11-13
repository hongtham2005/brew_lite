'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cartStore';
import { getStoredAuthUser, type AuthUser } from '@/lib/auth-session';

export default function SiteHeader() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);
  const userRef = useRef<AuthUser | null>(null);
  const clearCart = useCartStore((state) => state.clearCart);
  const totalQuantity = useCartStore((state) => state.totalQuantity());

  useEffect(() => {
    setMounted(true);
    const syncUser = () => {
      const nextUser = getStoredAuthUser();
      if (
        userRef.current &&
        (!nextUser || userRef.current.id !== nextUser.id)
      ) {
        clearCart();
      }
      userRef.current = nextUser;
      setUser(nextUser);
    };

    syncUser();
    window.addEventListener('storage', syncUser);
    window.addEventListener('brewlite-auth-change', syncUser);

    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('brewlite-auth-change', syncUser);
    };
  }, [clearCart]);

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    clearCart();
    userRef.current = null;
    setUser(null);
    router.push('/menu');
  };

  const displayName =
    user?.username?.trim() || user?.email.split('@')[0] || 'Tài khoản';

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-3 shadow-sm">
      <Link
        href="/menu"
        className="flex items-center space-x-2 text-lg font-extrabold text-amber-900"
      >
        <span>☕ BrewLite</span>
      </Link>

      <div className="flex items-center space-x-3">
        {/* Nút Giỏ hàng trên thanh Header */}
        <Link
          href="/cart"
          className="flex items-center space-x-1.5 rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-900 shadow-sm transition hover:bg-amber-100"
        >
          <span>🛒</span>
          <span>Giỏ hàng</span>
          <span className="rounded-full bg-amber-800 px-1.5 py-0.2 text-[11px] font-bold text-white">
            {mounted ? totalQuantity : 0}
          </span>
        </Link>

        {/* Nút Lịch sử đơn */}
        <Link
          href="/orders"
          className="flex items-center space-x-1 rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-900 shadow-sm transition hover:bg-amber-200"
        >
          <span>📦</span>
          <span>Lịch sử đơn</span>
        </Link>

        {user ? (
          <>
            <span className="text-sm font-semibold text-gray-700">
              Xin chào, {displayName}
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm font-semibold text-amber-900 hover:underline"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-amber-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-900"
            >
              Đăng ký
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
