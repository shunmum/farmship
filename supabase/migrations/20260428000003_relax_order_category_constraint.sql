-- 種別の自由入力対応のため CHECK 制約を解除
-- お中元/のし/お供えだけでなく、お歳暮や任意のテキストも許可

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_category_check;
