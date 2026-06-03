import { Product } from './product';
import type { ShirtSize } from '@/lib/shirtSizes';

export interface CartItem {
  product: Product;
  quantity: number;
  selected_size?: ShirtSize | null;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

