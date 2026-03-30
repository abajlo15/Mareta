export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: {
    street?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfileInsert {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  address?: {
    street?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  } | null;
}

export interface UserProfileUpdate {
  full_name?: string | null;
  phone?: string | null;
  address?: {
    street?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  } | null;
}

