export type Role = 'super_admin' | 'order_manager' | 'menu_manager';

export type OrderStatus =
  | 'pending_confirmation'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'manually_verified';

export type PaymentMethod =
  | 'paystack'
  | 'bank_transfer'
  | 'cash_on_delivery'
  | 'cash_on_pickup';

export type FulfilmentType = 'delivery' | 'pickup';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: number | boolean;
  created_at?: string;
  updated_at?: string;
  product_count?: number;
}

export interface ProductVariation {
  id: string;
  product_id: string;
  name: string;
  price_modifier: number;
  is_default: number | boolean;
  display_order: number;
}

export interface ProductExtra {
  id: string;
  product_id: string | null;
  name: string;
  price: number;
  max_quantity: number;
  display_order: number;
}

export interface Product {
  id: string;
  category_id: string;
  category_name?: string;
  name: string;
  slug: string;
  description: string | null;
  price: number; // in NGN
  image_url: string | null;
  prep_time: string | null;
  is_available: number | boolean;
  is_featured: number | boolean;
  dietary_tags: string[]; // parsed array
  created_at?: string;
  updated_at?: string;
  variations?: ProductVariation[];
  extras?: ProductExtra[];
}

export interface OrderItemSnapshot {
  id?: string;
  order_id?: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  variation_snapshot?: {
    name: string;
    price_modifier: number;
  } | null;
  extras_snapshot?: Array<{
    name: string;
    price: number;
    quantity: number;
  }> | null;
  subtotal: number;
}

export interface OrderStatusHistoryItem {
  id: string;
  order_id: string;
  status: OrderStatus;
  note: string | null;
  created_by: string;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  order_id: string;
  provider: string;
  reference: string;
  amount: number;
  status: PaymentStatus;
  provider_metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  reference: string;
  tracking_token: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  fulfilment_type: FulfilmentType;
  delivery_address: string | null;
  delivery_zone: string | null;
  preferred_time: string | null;
  customer_notes: string | null;
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  metadata?: any;
  created_at: string;
  updated_at: string;
  items?: OrderItemSnapshot[];
  status_history?: OrderStatusHistoryItem[];
  payments?: PaymentRecord[];
}

export interface BusinessSettings {
  business_name: string;
  tagline: string;
  phone_number: string;
  whatsapp_number: string;
  business_address: string;
  opening_hours: string;
  delivery_zones: Array<{
    id: string;
    name: string;
    fee: number;
    estimated_minutes: string;
  }>;
  pickup_instructions: string;
  min_order_amount: number;
  currency: string;
  paystack_enabled: boolean;
  bank_transfer_enabled: boolean;
  cash_on_delivery_enabled: boolean;
  cash_on_pickup_enabled: boolean;
  bank_details: {
    bank_name: string;
    account_number: string;
    account_name: string;
  };
  social_links: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
  };
  announcement_banner: {
    enabled: boolean;
    text: string;
  };
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  is_active: number | boolean;
  last_login_at?: string | null;
  created_at?: string;
}

export interface AuditLogItem {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  ip_address: string | null;
  details: any;
  created_at: string;
}

export interface CartItem {
  product_id: string;
  product_name: string;
  product_slug: string;
  image_url: string | null;
  base_price: number;
  selected_variation?: {
    id: string;
    name: string;
    price_modifier: number;
  } | null;
  selected_extras: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  quantity: number;
  unit_total: number;
  item_total: number;
  special_instructions?: string;
}

export interface GuestCheckoutPayload {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  fulfilment_type: FulfilmentType;
  delivery_address?: string;
  delivery_zone?: string;
  preferred_time?: string;
  customer_notes?: string;
  payment_method: PaymentMethod;
  items: Array<{
    product_id: string;
    variation_id?: string;
    extras?: Array<{
      extra_id: string;
      quantity: number;
    }>;
    quantity: number;
    special_instructions?: string;
  }>;
}
