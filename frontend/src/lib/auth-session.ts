import { useCartStore } from '@/stores/cartStore';

export interface AuthUser {
  id: number;
  email: string;
  username?: string;
}

export function getStoredAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const serializedUser = localStorage.getItem('user');
  if (!serializedUser) return null;
  try {
    const user: unknown = JSON.parse(serializedUser);
    if (
      typeof user !== 'object' ||
      user === null ||
      !('id' in user) ||
      typeof user.id !== 'number' ||
      !('email' in user) ||
      typeof user.email !== 'string'
    ) {
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      username:
        'username' in user && typeof user.username === 'string'
          ? user.username
          : undefined,
    };
  } catch {
    return null;
  }
}

export function clearCartWhenChangingAccount(nextUser: AuthUser): void {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('user')) return;

  const currentUser = getStoredAuthUser();
  if (!currentUser || currentUser.id !== nextUser.id) {
    useCartStore.getState().clearCart();
  }
}

export function notifyAuthChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('brewlite-auth-change'));
}

/** Hàm logout chuẩn – xóa hết token + user + giỏ hàng */
export function logout(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  useCartStore.getState().clearCart(); // quan trọng!
  notifyAuthChanged();
}