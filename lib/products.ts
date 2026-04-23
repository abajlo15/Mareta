import type { Product } from '@/types/product';

export type Subcollection = {
  id: string;
  name: string;
};

export async function fetchProducts(filters?: {
  search?: string;
  category?: string;
}): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.category) {
      params.append('category', filters.category);
    }

    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/products?${params.toString()}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      // Return empty array instead of throwing to prevent app crash
      return [];
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return empty array instead of throwing
    return [];
  }
}

export async function fetchSubcollections(): Promise<Subcollection[]> {
  try {
    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/subcollections`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/products/${id}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

