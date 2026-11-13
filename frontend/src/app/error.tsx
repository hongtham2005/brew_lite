'use client';
// [TV1] Task 9
// TODO: Error boundary

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h2 className="text-xl font-bold text-red-600 mb-4">Đã có lỗi xảy ra!</h2>
      <button
        onClick={() => reset()}
        className="rounded-lg bg-amber-800 px-4 py-2 text-white hover:bg-amber-900"
      >
        Thử lại
      </button>
    </div>
  );
}
