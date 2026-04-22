export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  categories: string[];
  subcollection_id: string | null;
  stock: number;
  instagram_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductInsert {
  name: string;
  description?: string | null;
  price: number;
  images?: string[];
  categories?: string[];
  subcollection_id?: string | null;
  stock?: number;
  instagram_url?: string | null;
}

export interface ProductUpdate {
  name?: string;
  description?: string | null;
  price?: number;
  images?: string[];
  categories?: string[];
  subcollection_id?: string | null;
  stock?: number;
  instagram_url?: string | null;
}

