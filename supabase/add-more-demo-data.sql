-- =============================================
-- FarmShip Additional Demo Data
-- =============================================
-- 追加受注データ10件 + 請求書データ10件
-- =============================================

DO $$
DECLARE
  demo_user_id UUID := 'b3953e6e-ff5a-4bbd-983d-843884bd4797';
  
  -- 顧客ID（既存データから取得）
  customer_ids UUID[];
  
  -- 商品ID（既存データから取得）
  product_tomato UUID;
  product_cucumber UUID;
  product_eggplant UUID;
  product_lettuce UUID;
  product_spinach UUID;
  product_potato UUID;
  product_carrot UUID;
  product_strawberry UUID;
  product_cabbage UUID;
  product_radish UUID;
  
  -- 一時変数
  temp_id UUID;
  
BEGIN

-- 既存の顧客IDを取得
SELECT array_agg(id ORDER BY created_at) INTO customer_ids
FROM public.customers
WHERE user_id = demo_user_id
LIMIT 10;

-- 既存の商品IDを取得
SELECT id INTO product_tomato FROM public.products WHERE user_id = demo_user_id AND name = 'トマト' LIMIT 1;
SELECT id INTO product_cucumber FROM public.products WHERE user_id = demo_user_id AND name = 'きゅうり' LIMIT 1;
SELECT id INTO product_eggplant FROM public.products WHERE user_id = demo_user_id AND name = 'なす' LIMIT 1;
SELECT id INTO product_lettuce FROM public.products WHERE user_id = demo_user_id AND name = 'レタス' LIMIT 1;
SELECT id INTO product_spinach FROM public.products WHERE user_id = demo_user_id AND name = 'ほうれん草' LIMIT 1;
SELECT id INTO product_potato FROM public.products WHERE user_id = demo_user_id AND name = 'じゃがいも' LIMIT 1;
SELECT id INTO product_carrot FROM public.products WHERE user_id = demo_user_id AND name = 'にんじん' LIMIT 1;
SELECT id INTO product_strawberry FROM public.products WHERE user_id = demo_user_id AND name = 'いちご' LIMIT 1;
SELECT id INTO product_cabbage FROM public.products WHERE user_id = demo_user_id AND name = 'キャベツ' LIMIT 1;
SELECT id INTO product_radish FROM public.products WHERE user_id = demo_user_id AND name = '大根' LIMIT 1;

-- =============================================
-- 追加受注データ (11〜20)
-- =============================================

-- 受注11: 山田青果 (18日前) - 配送前・未入金
INSERT INTO public.orders (id, user_id, order_number, customer_id, customer_name, recipient_name, recipient_postal_code, recipient_prefecture, recipient_city, recipient_address_line, recipient_phone, order_date, delivery_date, total_amount, shipping_fee, carrier, is_cool, status, payment_status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  demo_user_id,
  'ORD-' || TO_CHAR(NOW() - INTERVAL '18 days', 'YYYYMMDD') || '-011',
  customer_ids[2],
  (SELECT name FROM public.customers WHERE id = customer_ids[2]),
  (SELECT name || ' 本社' FROM public.customers WHERE id = customer_ids[2]),
  (SELECT postal_code FROM public.customers WHERE id = customer_ids[2]),
  (SELECT prefecture FROM public.customers WHERE id = customer_ids[2]),
  (SELECT city FROM public.customers WHERE id = customer_ids[2]),
  (SELECT address_line FROM public.customers WHERE id = customer_ids[2]),
  (SELECT phone FROM public.customers WHERE id = customer_ids[2]),
  (NOW() - INTERVAL '18 days')::DATE,
  (NOW() + INTERVAL '2 days')::DATE,
  3700,
  1000,
  'yamato',
  false,
  '配送前',
  '未入金',
  NOW() - INTERVAL '18 days',
  NOW() - INTERVAL '18 days'
RETURNING id INTO temp_id;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_potato, (SELECT id FROM public.product_variants WHERE product_id = product_potato ORDER BY price DESC LIMIT 1), 'じゃがいも', '5kg', 2, 950, 1900;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_radish, (SELECT id FROM public.product_variants WHERE product_id = product_radish LIMIT 1), '大根', '1本', 6, 150, 900;

-- 受注12: 佐藤太郎 (16日前) - 配送前・入金済み
INSERT INTO public.orders (id, user_id, order_number, customer_id, customer_name, recipient_name, recipient_postal_code, recipient_prefecture, recipient_city, recipient_address_line, recipient_phone, order_date, delivery_date, total_amount, shipping_fee, carrier, is_cool, status, payment_status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  demo_user_id,
  'ORD-' || TO_CHAR(NOW() - INTERVAL '16 days', 'YYYYMMDD') || '-012',
  customer_ids[3],
  (SELECT name FROM public.customers WHERE id = customer_ids[3]),
  (SELECT name || ' 本社' FROM public.customers WHERE id = customer_ids[3]),
  (SELECT postal_code FROM public.customers WHERE id = customer_ids[3]),
  (SELECT prefecture FROM public.customers WHERE id = customer_ids[3]),
  (SELECT city FROM public.customers WHERE id = customer_ids[3]),
  (SELECT address_line FROM public.customers WHERE id = customer_ids[3]),
  (SELECT phone FROM public.customers WHERE id = customer_ids[3]),
  (NOW() - INTERVAL '16 days')::DATE,
  NOW()::DATE,
  2050,
  800,
  'yamato',
  true,
  '配送前',
  '入金済み',
  NOW() - INTERVAL '16 days',
  NOW() - INTERVAL '16 days'
RETURNING id INTO temp_id;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_strawberry, (SELECT id FROM public.product_variants WHERE product_id = product_strawberry LIMIT 1), 'いちご', '300g', 1, 800, 800;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_lettuce, (SELECT id FROM public.product_variants WHERE product_id = product_lettuce LIMIT 1), 'レタス', '1個', 2, 250, 500;

-- 受注13: 高橋レストラン (14日前) - 配送済み・未入金
INSERT INTO public.orders (id, user_id, order_number, customer_id, customer_name, recipient_name, recipient_postal_code, recipient_prefecture, recipient_city, recipient_address_line, recipient_phone, order_date, delivery_date, total_amount, shipping_fee, carrier, is_cool, status, payment_status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  demo_user_id,
  'ORD-' || TO_CHAR(NOW() - INTERVAL '14 days', 'YYYYMMDD') || '-013',
  customer_ids[5],
  (SELECT name FROM public.customers WHERE id = customer_ids[5]),
  (SELECT name || ' 本社' FROM public.customers WHERE id = customer_ids[5]),
  (SELECT postal_code FROM public.customers WHERE id = customer_ids[5]),
  (SELECT prefecture FROM public.customers WHERE id = customer_ids[5]),
  (SELECT city FROM public.customers WHERE id = customer_ids[5]),
  (SELECT address_line FROM public.customers WHERE id = customer_ids[5]),
  (SELECT phone FROM public.customers WHERE id = customer_ids[5]),
  (NOW() - INTERVAL '14 days')::DATE,
  (NOW() - INTERVAL '12 days')::DATE,
  5200,
  1300,
  'yamato',
  false,
  '配送済み',
  '未入金',
  NOW() - INTERVAL '14 days',
  NOW() - INTERVAL '13 days'
RETURNING id INTO temp_id;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_cabbage, (SELECT id FROM public.product_variants WHERE product_id = product_cabbage ORDER BY price DESC LIMIT 1), 'キャベツ', '3個セット', 4, 550, 2200;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_eggplant, (SELECT id FROM public.product_variants WHERE product_id = product_eggplant ORDER BY price DESC LIMIT 1), 'なす', '2kg', 3, 750, 2250;

-- 受注14: 伊藤商事 (12日前) - 配送済み・入金済み
INSERT INTO public.orders (id, user_id, order_number, customer_id, customer_name, recipient_name, recipient_postal_code, recipient_prefecture, recipient_city, recipient_address_line, recipient_phone, order_date, delivery_date, total_amount, shipping_fee, carrier, is_cool, status, payment_status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  demo_user_id,
  'ORD-' || TO_CHAR(NOW() - INTERVAL '12 days', 'YYYYMMDD') || '-014',
  customer_ids[6],
  (SELECT name FROM public.customers WHERE id = customer_ids[6]),
  (SELECT name || ' 本社' FROM public.customers WHERE id = customer_ids[6]),
  (SELECT postal_code FROM public.customers WHERE id = customer_ids[6]),
  (SELECT prefecture FROM public.customers WHERE id = customer_ids[6]),
  (SELECT city FROM public.customers WHERE id = customer_ids[6]),
  (SELECT address_line FROM public.customers WHERE id = customer_ids[6]),
  (SELECT phone FROM public.customers WHERE id = customer_ids[6]),
  (NOW() - INTERVAL '12 days')::DATE,
  (NOW() - INTERVAL '10 days')::DATE,
  7750,
  900,
  'yamato',
  false,
  '配送済み',
  '入金済み',
  NOW() - INTERVAL '12 days',
  NOW() - INTERVAL '11 days'
RETURNING id INTO temp_id;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_cucumber, (SELECT id FROM public.product_variants WHERE product_id = product_cucumber ORDER BY price DESC LIMIT 1), 'きゅうり', '3kg', 5, 850, 4250;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_carrot, (SELECT id FROM public.product_variants WHERE product_id = product_carrot ORDER BY price DESC LIMIT 1), 'にんじん', '3kg', 4, 700, 2800;

-- 受注15: オーガニック市場 (9日前) - 配送済み・入金済み
INSERT INTO public.orders (id, user_id, order_number, customer_id, customer_name, recipient_name, recipient_postal_code, recipient_prefecture, recipient_city, recipient_address_line, recipient_phone, order_date, delivery_date, total_amount, shipping_fee, carrier, is_cool, status, payment_status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  demo_user_id,
  'ORD-' || TO_CHAR(NOW() - INTERVAL '9 days', 'YYYYMMDD') || '-015',
  customer_ids[8],
  (SELECT name FROM public.customers WHERE id = customer_ids[8]),
  (SELECT name || ' 本社' FROM public.customers WHERE id = customer_ids[8]),
  (SELECT postal_code FROM public.customers WHERE id = customer_ids[8]),
  (SELECT prefecture FROM public.customers WHERE id = customer_ids[8]),
  (SELECT city FROM public.customers WHERE id = customer_ids[8]),
  (SELECT address_line FROM public.customers WHERE id = customer_ids[8]),
  (SELECT phone FROM public.customers WHERE id = customer_ids[8]),
  (NOW() - INTERVAL '9 days')::DATE,
  (NOW() - INTERVAL '7 days')::DATE,
  4400,
  800,
  'yamato',
  false,
  '配送済み',
  '入金済み',
  NOW() - INTERVAL '9 days',
  NOW() - INTERVAL '8 days'
RETURNING id INTO temp_id;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_tomato, (SELECT id FROM public.product_variants WHERE product_id = product_tomato LIMIT 1), 'トマト', '1kg', 5, 500, 2500;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_spinach, (SELECT id FROM public.product_variants WHERE product_id = product_spinach ORDER BY price DESC LIMIT 1), 'ほうれん草', '1kg', 4, 350, 1400;

-- 受注16: 中村スーパー (7日前) - キャンセル
INSERT INTO public.orders (id, user_id, order_number, customer_id, customer_name, recipient_name, recipient_postal_code, recipient_prefecture, recipient_city, recipient_address_line, recipient_phone, order_date, delivery_date, total_amount, shipping_fee, carrier, is_cool, status, payment_status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  demo_user_id,
  'ORD-' || TO_CHAR(NOW() - INTERVAL '7 days', 'YYYYMMDD') || '-016',
  customer_ids[9],
  (SELECT name FROM public.customers WHERE id = customer_ids[9]),
  (SELECT name || ' 本社' FROM public.customers WHERE id = customer_ids[9]),
  (SELECT postal_code FROM public.customers WHERE id = customer_ids[9]),
  (SELECT prefecture FROM public.customers WHERE id = customer_ids[9]),
  (SELECT city FROM public.customers WHERE id = customer_ids[9]),
  (SELECT address_line FROM public.customers WHERE id = customer_ids[9]),
  (SELECT phone FROM public.customers WHERE id = customer_ids[9]),
  (NOW() - INTERVAL '7 days')::DATE,
  (NOW() - INTERVAL '5 days')::DATE,
  3300,
  1000,
  'yamato',
  false,
  'キャンセル',
  '未入金',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '6 days'
RETURNING id INTO temp_id;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_radish, (SELECT id FROM public.product_variants WHERE product_id = product_radish ORDER BY price DESC LIMIT 1), '大根', '3本セット', 5, 400, 2000;

-- 受注17: 小林健一 (6日前) - 配送済み・未入金
INSERT INTO public.orders (id, user_id, order_number, customer_id, customer_name, recipient_name, recipient_postal_code, recipient_prefecture, recipient_city, recipient_address_line, recipient_phone, order_date, delivery_date, total_amount, shipping_fee, carrier, is_cool, status, payment_status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  demo_user_id,
  'ORD-' || TO_CHAR(NOW() - INTERVAL '6 days', 'YYYYMMDD') || '-017',
  customer_ids[10],
  (SELECT name FROM public.customers WHERE id = customer_ids[10]),
  (SELECT name || ' 本社' FROM public.customers WHERE id = customer_ids[10]),
  (SELECT postal_code FROM public.customers WHERE id = customer_ids[10]),
  (SELECT prefecture FROM public.customers WHERE id = customer_ids[10]),
  (SELECT city FROM public.customers WHERE id = customer_ids[10]),
  (SELECT address_line FROM public.customers WHERE id = customer_ids[10]),
  (SELECT phone FROM public.customers WHERE id = customer_ids[10]),
  (NOW() - INTERVAL '6 days')::DATE,
  (NOW() - INTERVAL '4 days')::DATE,
  2850,
  1500,
  'yamato',
  true,
  '配送済み',
  '未入金',
  NOW() - INTERVAL '6 days',
  NOW() - INTERVAL '5 days'
RETURNING id INTO temp_id;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_strawberry, (SELECT id FROM public.product_variants WHERE product_id = product_strawberry LIMIT 1), 'いちご', '300g', 1, 800, 800;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_cabbage, (SELECT id FROM public.product_variants WHERE product_id = product_cabbage LIMIT 1), 'キャベツ', '1個', 3, 200, 600;

-- 受注18: 田中商店 (4日前) - 配送前・入金済み
INSERT INTO public.orders (id, user_id, order_number, customer_id, customer_name, recipient_name, recipient_postal_code, recipient_prefecture, recipient_city, recipient_address_line, recipient_phone, order_date, delivery_date, total_amount, shipping_fee, carrier, is_cool, status, payment_status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  demo_user_id,
  'ORD-' || TO_CHAR(NOW() - INTERVAL '4 days', 'YYYYMMDD') || '-018',
  customer_ids[1],
  (SELECT name FROM public.customers WHERE id = customer_ids[1]),
  (SELECT name || ' 第2倉庫' FROM public.customers WHERE id = customer_ids[1]),
  (SELECT postal_code FROM public.customers WHERE id = customer_ids[1]),
  (SELECT prefecture FROM public.customers WHERE id = customer_ids[1]),
  (SELECT city FROM public.customers WHERE id = customer_ids[1]),
  (SELECT address_line || ' 隣接倉庫' FROM public.customers WHERE id = customer_ids[1]),
  (SELECT phone FROM public.customers WHERE id = customer_ids[1]),
  (NOW() - INTERVAL '4 days')::DATE,
  (NOW() + INTERVAL '1 day')::DATE,
  4350,
  800,
  'yamato',
  false,
  '配送前',
  '入金済み',
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '4 days'
RETURNING id INTO temp_id;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_tomato, (SELECT id FROM public.product_variants WHERE product_id = product_tomato ORDER BY price DESC LIMIT 1), 'トマト', '2kg', 3, 950, 2850;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_lettuce, (SELECT id FROM public.product_variants WHERE product_id = product_lettuce LIMIT 1), 'レタス', '1個', 3, 250, 750;

-- 受注19: 渡辺花子 (3日前) - 配送前・未入金
INSERT INTO public.orders (id, user_id, order_number, customer_id, customer_name, recipient_name, recipient_postal_code, recipient_prefecture, recipient_city, recipient_address_line, recipient_phone, order_date, delivery_date, total_amount, shipping_fee, carrier, is_cool, status, payment_status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  demo_user_id,
  'ORD-' || TO_CHAR(NOW() - INTERVAL '3 days', 'YYYYMMDD') || '-019',
  customer_ids[7],
  (SELECT name FROM public.customers WHERE id = customer_ids[7]),
  (SELECT name || ' 本社' FROM public.customers WHERE id = customer_ids[7]),
  (SELECT postal_code FROM public.customers WHERE id = customer_ids[7]),
  (SELECT prefecture FROM public.customers WHERE id = customer_ids[7]),
  (SELECT city FROM public.customers WHERE id = customer_ids[7]),
  (SELECT address_line FROM public.customers WHERE id = customer_ids[7]),
  (SELECT phone FROM public.customers WHERE id = customer_ids[7]),
  (NOW() - INTERVAL '3 days')::DATE,
  (NOW() + INTERVAL '3 days')::DATE,
  1850,
  800,
  'yamato',
  false,
  '配送前',
  '未入金',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
RETURNING id INTO temp_id;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_potato, (SELECT id FROM public.product_variants WHERE product_id = product_potato LIMIT 1), 'じゃがいも', '2kg', 2, 400, 800;

-- 受注20: 山田青果 (1日前) - 配送前・入金済み
INSERT INTO public.orders (id, user_id, order_number, customer_id, customer_name, recipient_name, recipient_postal_code, recipient_prefecture, recipient_city, recipient_address_line, recipient_phone, order_date, delivery_date, total_amount, shipping_fee, carrier, is_cool, status, payment_status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  demo_user_id,
  'ORD-' || TO_CHAR(NOW() - INTERVAL '1 day', 'YYYYMMDD') || '-020',
  customer_ids[2],
  (SELECT name FROM public.customers WHERE id = customer_ids[2]),
  (SELECT name || ' 第2倉庫' FROM public.customers WHERE id = customer_ids[2]),
  (SELECT postal_code FROM public.customers WHERE id = customer_ids[2]),
  (SELECT prefecture FROM public.customers WHERE id = customer_ids[2]),
  (SELECT city FROM public.customers WHERE id = customer_ids[2]),
  (SELECT address_line || ' 隣接倉庫' FROM public.customers WHERE id = customer_ids[2]),
  (SELECT phone FROM public.customers WHERE id = customer_ids[2]),
  (NOW() - INTERVAL '1 day')::DATE,
  (NOW() + INTERVAL '4 days')::DATE,
  6550,
  1000,
  'yamato',
  true,
  '配送前',
  '入金済み',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
RETURNING id INTO temp_id;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_strawberry, (SELECT id FROM public.product_variants WHERE product_id = product_strawberry ORDER BY price DESC LIMIT 1), 'いちご', '1kg', 2, 2500, 5000;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_lettuce, (SELECT id FROM public.product_variants WHERE product_id = product_lettuce ORDER BY price DESC LIMIT 1), 'レタス', '5個セット', 1, 1100, 1100;

-- =============================================
-- 請求書データ (Shipping Labels) - 10件
-- =============================================

-- 先月のデータとして作成（30日前〜1日前）
INSERT INTO public.shipping_labels (user_id, customer_id, product_name, quantity, shipping_cost, shipping_date, service_type, shipping_company, created_at, updated_at)
VALUES
  (demo_user_id, customer_ids[1], 'トマト・きゅうり詰め合わせ', 5, 800, (NOW() - INTERVAL '30 days')::DATE, 'standard', 'yamato', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  (demo_user_id, customer_ids[2], 'なす・ピーマン詰め合わせ', 3, 1000, (NOW() - INTERVAL '27 days')::DATE, 'standard', 'yamato', NOW() - INTERVAL '27 days', NOW() - INTERVAL '27 days'),
  (demo_user_id, customer_ids[3], 'いちご', 2, 800, (NOW() - INTERVAL '25 days')::DATE, 'cool', 'yamato', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
  (demo_user_id, customer_ids[5], 'レタス・キャベツセット', 4, 1300, (NOW() - INTERVAL '22 days')::DATE, 'standard', 'yamato', NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days'),
  (demo_user_id, customer_ids[6], 'トマト・きゅうり大口', 10, 900, (NOW() - INTERVAL '20 days')::DATE, 'standard', 'yamato', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  (demo_user_id, customer_ids[7], 'じゃがいも・にんじん', 2, 800, (NOW() - INTERVAL '17 days')::DATE, 'standard', 'yamato', NOW() - INTERVAL '17 days', NOW() - INTERVAL '17 days'),
  (demo_user_id, customer_ids[8], 'オーガニック野菜セット', 6, 800, (NOW() - INTERVAL '15 days')::DATE, 'standard', 'yamato', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
  (demo_user_id, customer_ids[9], 'キャベツ・大根セット', 4, 1000, (NOW() - INTERVAL '10 days')::DATE, 'standard', 'yamato', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
  (demo_user_id, customer_ids[10], 'いちご・レタスギフト', 1, 1500, (NOW() - INTERVAL '8 days')::DATE, 'cool', 'yamato', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
  (demo_user_id, customer_ids[1], 'トマト定期便', 3, 800, (NOW() - INTERVAL '5 days')::DATE, 'standard', 'yamato', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days');

RAISE NOTICE '✅ Additional demo data insertion completed!';
RAISE NOTICE '📊 Summary:';
RAISE NOTICE '  - Additional Orders: 10 orders (11-20)';
RAISE NOTICE '  - Shipping Labels: 10 invoice items';
RAISE NOTICE '  - Total Orders: now 20';

END $$;
