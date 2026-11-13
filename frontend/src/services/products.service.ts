// [TV2] Task 3

export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
  version?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const fallbackProducts: Product[] = [
  {
    id: 1,
    name: 'Cà phê sữa đá Sài Gòn',
    price: 35000,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    stock: 50,
  },
  {
    id: 2,
    name: 'Americano Đá',
    price: 40000,
    imageUrl: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=600&auto=format&fit=crop&q=80',
    stock: 35,
  },
  {
    id: 3,
    name: 'Cappuccino Bọt Mịn',
    price: 45000,
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop&q=80',
    stock: 25,
  },
  {
    id: 4,
    name: 'Trà đào cam sả thanh mát',
    price: 39000,
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80',
    stock: 40,
  },
  {
    id: 5,
    name: 'Matcha Latte Nhật Bản',
    price: 48000,
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80',
    stock: 18,
  },
  {
    id: 6,
    name: 'Bạc xỉu ba tầng',
    price: 38000,
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
    stock: 0, // Trạng thái hết hàng để kiểm thử UI
  },
];

export async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`Lỗi tải danh sách sản phẩm: HTTP ${res.status}`);
    }
    const data: Product[] = await res.json();
    return data;
  } catch (err) {
    console.warn('Không thể kết nối Backend API (/products), sử dụng dữ liệu mẫu fallback:', err);
    return fallbackProducts;
  }
}

export async function getProduct(id: number | string): Promise<Product | null> {
  const numericId = Number(id);
  try {
    const res = await fetch(`${API_BASE_URL}/products/${numericId}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      throw new Error(`Lỗi tải chi tiết sản phẩm: HTTP ${res.status}`);
    }
    const data: Product = await res.json();
    return data;
  } catch (err) {
    console.warn(`Không thể kết nối Backend API (/products/${numericId}), tìm trong dữ liệu mẫu:`, err);
    return fallbackProducts.find((p) => p.id === numericId) || null;
  }
}
