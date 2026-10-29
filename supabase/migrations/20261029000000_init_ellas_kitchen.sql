-- Supabase PostgreSQL Migration for Ella's Kitchen
-- Includes complete schema, indexes, RLS policies, and triggers

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price INT NOT NULL, -- Stored in whole Naira
  image_url TEXT,
  prep_time TEXT,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  dietary_tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Product Variations
CREATE TABLE IF NOT EXISTS public.product_variations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_modifier INT NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT NOT NULL DEFAULT 0
);

-- 4. Product Extras
CREATE TABLE IF NOT EXISTS public.product_extras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price INT NOT NULL DEFAULT 0,
  max_quantity INT NOT NULL DEFAULT 5,
  display_order INT NOT NULL DEFAULT 0
);

-- 5. Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference TEXT NOT NULL UNIQUE,
  tracking_token TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  fulfilment_type TEXT NOT NULL CHECK (fulfilment_type IN ('delivery', 'pickup')),
  delivery_address TEXT,
  delivery_zone TEXT,
  preferred_time TEXT,
  customer_notes TEXT,
  subtotal INT NOT NULL,
  delivery_fee INT NOT NULL DEFAULT 0,
  discount_amount INT NOT NULL DEFAULT 0,
  total_amount INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_confirmation' CHECK (status IN ('pending_confirmation', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'completed', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'manually_verified')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('paystack', 'bank_transfer', 'cash_on_delivery', 'cash_on_pickup')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Order Items (Immutable Historical Snapshot)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  unit_price INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  variation_snapshot JSONB,
  extras_snapshot JSONB,
  subtotal INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Order Status History
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  created_by TEXT NOT NULL DEFAULT 'System',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  reference TEXT NOT NULL UNIQUE,
  amount INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  provider_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Business Settings
CREATE TABLE IF NOT EXISTS public.business_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Staff Users
CREATE TABLE IF NOT EXISTS public.staff_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'order_manager' CHECK (role IN ('super_admin', 'order_manager', 'menu_manager')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Security Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  user_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  ip_address TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_cat ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_ref ON public.orders(reference);
CREATE INDEX IF NOT EXISTS idx_orders_token ON public.orders(tracking_token);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_ref ON public.payments(reference);

-- Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Public Read Policies (Anonymous customers can view active categories and available products)
CREATE POLICY "Public can view active categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view available products" ON public.products FOR SELECT USING (is_available = true);
CREATE POLICY "Public can view variations of available products" ON public.product_variations FOR SELECT USING (true);
CREATE POLICY "Public can view extras" ON public.product_extras FOR SELECT USING (true);
CREATE POLICY "Public can view business settings" ON public.business_settings FOR SELECT USING (true);

-- Order security policy: Public can only view an order if they provide the exact tracking token
CREATE POLICY "Public track order with valid token" ON public.orders FOR SELECT
USING (tracking_token = current_setting('request.headers', true)::json->>'x-tracking-token');

-- Public order creation policy
CREATE POLICY "Public create order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public create order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- Staff Full Access Policies (authenticated admin)
CREATE POLICY "Staff full access categories" ON public.categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff full access products" ON public.products FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff full access variations" ON public.product_variations FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff full access extras" ON public.product_extras FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff full access orders" ON public.orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff full access order_items" ON public.order_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff full access status history" ON public.order_status_history FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff full access payments" ON public.payments FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff full access settings" ON public.business_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff read staff_users" ON public.staff_users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff write audit_logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);
