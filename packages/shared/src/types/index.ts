export interface WishlistItem {
  id: string;
  title: string;
  description?: string;
  url?: string;
  priority: 'low' | 'medium' | 'high';
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  provider: string;
  avatar: string | null;
  createdAt: Date;
}
