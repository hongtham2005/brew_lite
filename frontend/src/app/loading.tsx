export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50" role="status" aria-live="polite">
      <div className="space-y-2 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" aria-hidden="true" />
        <p className="text-sm font-medium text-gray-600">Đang tải dữ liệu...</p>
      </div>
    </div>
  );
}
