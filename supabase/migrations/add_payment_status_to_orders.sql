-- =============================================
-- Add Payment Status to Orders Table
-- =============================================
-- このマイグレーションは、ordersテーブルに入金ステータスカラムを追加します
-- 作成日: 2026-01-07

-- Add payment_status column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT '未入金';

-- Add comment for the column
COMMENT ON COLUMN public.orders.payment_status IS '入金ステータス: 未入金, 入金済み';

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_orders_payment_status 
ON public.orders(payment_status);

-- Update existing records to default status (if null)
UPDATE public.orders 
SET payment_status = '未入金' 
WHERE payment_status IS NULL;

-- ステータスの整理 (既存データの移行)
-- 既存の日本語ステータスを新しいステータスに変換
-- 未発送 → 配送前
-- 発送済み → 配送済み
-- 配達完了 → 配送済み
-- キャンセル → キャンセル

UPDATE public.orders 
SET status = CASE 
  WHEN status = '未発送' THEN '配送前'
  WHEN status = '発送済み' THEN '配送済み'
  WHEN status = '配達完了' THEN '配送済み'
  WHEN status = 'キャンセル' THEN 'キャンセル'
  -- 英語ステータスも対応
  WHEN status = 'pending' THEN '配送前'
  WHEN status = 'shipped' THEN '配送済み'
  WHEN status = 'delivered' THEN '配送済み'
  WHEN status = 'cancelled' THEN 'キャンセル'
  ELSE status
END
WHERE status IS NOT NULL;

-- Add check constraint for valid payment_status values
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS check_payment_status_valid;

ALTER TABLE public.orders
ADD CONSTRAINT check_payment_status_valid
CHECK (payment_status IN ('未入金', '入金済み'));

-- Add check constraint for valid status values (updated)
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS check_status_valid;

ALTER TABLE public.orders
ADD CONSTRAINT check_status_valid
CHECK (status IN ('配送前', '配送済み', 'キャンセル'));
