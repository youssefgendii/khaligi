export type OrderStatus =
  | "pending"
  | "confirmed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cash_on_delivery";
export type PaymentStatus = "unpaid" | "paid";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  category?: Category;
  brand: string;
  brand_ar: string;
  product_code: string;
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  image_url?: string;
  price: number;
  sale_price?: number | null;
  available_sizes: string[];
  available_colors: string[];
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_full_name: string;
  customer_phone: string;
  customer_email?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  notes?: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_code: string;
  brand: string;
  brand_ar: string;
  product_name: string;
  product_image_url?: string;
  selected_size: string;
  selected_color: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  created_at: string;
}

export interface SiteSettings {
  key: string;
  value: string;
}

export interface CartItem {
  product_id: string;
  product_code: string;
  brand: string;
  brand_ar: string;
  name: string;
  image_url?: string;
  selected_size: string;
  selected_color: string;
  price: number;
  quantity: number;
}

export interface CheckoutFormData {
  full_name: string;
  phone: string;
  email?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  notes?: string;
}

export interface AdminStats {
  total: number;
  pending: number;
  confirmed: number;
  out_for_delivery: number;
  delivered: number;
  cancelled: number;
  total_revenue: number;
}
