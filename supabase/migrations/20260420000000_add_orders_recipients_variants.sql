-- ============================================
-- orders, order_items, recipients, product_variants テーブルの追加
-- ============================================

-- ============================================
-- 1. customers テーブルへのカラム追加
-- ============================================
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS memo TEXT,
  ADD COLUMN IF NOT EXISTS invoice_type TEXT CHECK (invoice_type IN ('箱に入れる', '郵送する', 'メールで送る')),
  ADD COLUMN IF NOT EXISTS last_purchase_date DATE,
  ADD COLUMN IF NOT EXISTS total_spent DECIMAL(10, 2) DEFAULT 0;

-- ============================================
-- 2. recipients テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  relation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recipients_user_id ON public.recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_recipients_customer_id ON public.recipients(customer_id);

ALTER TABLE public.recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recipients" ON public.recipients
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recipients" ON public.recipients
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recipients" ON public.recipients
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recipients" ON public.recipients
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 3. product_variants テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  size TEXT,
  weight_kg DECIMAL(5, 2),
  sku TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_user_id ON public.product_variants(user_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own product_variants" ON public.product_variants
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own product_variants" ON public.product_variants
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own product_variants" ON public.product_variants
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own product_variants" ON public.product_variants
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. orders テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  order_date DATE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE RESTRICT NOT NULL,
  customer_name TEXT NOT NULL,
  recipient_id UUID REFERENCES public.recipients(id) ON DELETE SET NULL,
  recipient_name TEXT,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  delivery_date DATE,
  status TEXT NOT NULL DEFAULT '配送前' CHECK (status IN ('配送前', '配送済み', 'キャンセル')),
  payment_status TEXT NOT NULL DEFAULT '未入金' CHECK (payment_status IN ('未入金', '入金済み')),
  shipping_company TEXT,
  tracking_number TEXT,
  note TEXT,
  order_category TEXT CHECK (order_category IN ('のし', 'お中元', 'お供え', 'なし')),
  is_cool_delivery BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, order_number)
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON public.orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own orders" ON public.orders
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 5. order_items テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  shipping_fee DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_user_id ON public.order_items(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order_items" ON public.order_items
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own order_items" ON public.order_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own order_items" ON public.order_items
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own order_items" ON public.order_items
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 6. updated_at 自動更新トリガー
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recipients_updated_at
  BEFORE UPDATE ON public.recipients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
