'use client';

// [TV5] Task 7
// TODO: Form đăng ký
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  clearCartWhenChangingAccount,
  notifyAuthChanged,
} from '@/lib/auth-session';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp!');
      return;
    }

    setLoading(true);

    try {
      // 1. Đăng ký
      const res = await fetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Đăng ký thất bại');
      }

      // 2. Tự động đăng nhập ngay sau khi đăng ký thành công
      const loginRes = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        // Nếu login thất bại thì vẫn cho về trang login
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        router.push('/login');
        return;
      }

      // 3. Lưu token + user
      clearCartWhenChangingAccount(loginData.user);
      localStorage.setItem('access_token', loginData.access_token);
      localStorage.setItem('user', JSON.stringify(loginData.user));
      notifyAuthChanged();

      alert('Đăng ký tài khoản thành công!');
      router.push('/menu');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-center text-amber-900 mb-2">
          BrewLite ☕
        </h2>
        <p className="text-center text-gray-500 mb-6">Tạo tài khoản mới</p>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tên đăng nhập / tên hiển thị
            </label>
            <input
              type="text"
              required
              minLength={2}
              maxLength={30}
              autoComplete="nickname"
              className="mt-1 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800"
              placeholder="Tên bạn muốn mọi người nhìn thấy"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Tên này sẽ hiện ở thanh trên cùng sau khi bạn đăng nhập.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
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
            <label className="block text-sm font-medium text-gray-700">
              Mật khẩu (ít nhất 6 ký tự)
            </label>
            <input
              type="password"
              required
              minLength={6}
              className="mt-1 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber-800 py-3 font-semibold text-white transition hover:bg-amber-900 disabled:bg-gray-400"
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <Link
            href="/login"
            className="font-semibold text-amber-800 hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}