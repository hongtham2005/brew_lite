// [TV1] Task 9
// TODO: Loading toàn cục
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-medium text-gray-600">Đang tải dữ liệu...</p>
      </div>
    </div>
  );
}
