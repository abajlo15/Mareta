export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  categories: string[];
  audience: "male" | "female" | "both";
  subcollection_id: string | null;
  stock: number;
  is_polarized: boolean;
  discount_percentage: number;
  instagram_url: string | null;
  created_at: string;
  updated_at: string;
  subcollection?:
    | {
        id: string;
        name: string;
        gender: "male" | "female";
        thumbnail_url: string | null;
      }
    | {
        id: string;
        name: string;
        gender: "male" | "female";
        thumbnail_url: string | null;
      }[]
    | null;
}

export interface ProductInsert {
  name: string;
  description?: string | null;
  price: number;
  images?: string[];
  categories?: string[];
  audience?: "male" | "female" | "both";
  subcollection_id?: string | null;
  stock?: number;
  is_polarized?: boolean;
  discount_percentage?: number;
  instagram_url?: string | null;
}

export interface ProductUpdate {
  name?: string;
  description?: string | null;
  price?: number;
  images?: string[];
  categories?: string[];
  audience?: "male" | "female" | "both";
  subcollection_id?: string | null;
  stock?: number;
  is_polarized?: boolean;
  discount_percentage?: number;
  instagram_url?: string | null;
}

