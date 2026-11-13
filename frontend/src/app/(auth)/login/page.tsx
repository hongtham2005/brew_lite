'use client';

// [TV5] Task 7
// TODO: Form đăng nhập

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  clearCartWhenChangingAccount,
  notifyAuthChanged,
} from '@/lib/auth-session';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Lấy đường dẫn cần quay lại từ URL (ví dụ: ?redirect=/checkout), nếu không có mặc định về /menu
  const requestedRedirect = searchParams.get('redirect') || '/menu';
  const redirectTo =
    requestedRedirect.startsWith('/') &&
    !requestedRedirect.startsWith('//') &&
    !requestedRedirect.includes('\\')
      ? requestedRedirect
      : '/menu';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      // Lưu JWT Token và thông tin user vào localStorage
      clearCartWhenChangingAccount(data.user);
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      notifyAuthChanged();

      // Chuyển hướng thông minh dựa vào tham số redirect từ giỏ hàng hoặc về mặc định /menu
      router.push(redirectTo);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-center text-amber-900 mb-2">BrewLite ☕</h2>
        <p className="text-center text-gray-500 mb-6">Đăng nhập tài khoản của bạn</p>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800"
              placeholder="nhap@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              type="password"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber-800 py-3 font-semibold text-white transition hover:bg-amber-900 disabled:bg-gray-400"
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="font-semibold text-amber-800 hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}