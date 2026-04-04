-- =============================================
-- FarmShip Demo Data Insertion Script
-- =============================================
-- デモアカウント用のサンプルデータ投入スクリプト
-- Email: demo@farmship.example
-- UUID: b3953e6e-ff5a-4bbd-983d-843884bd4797
-- =============================================

DO $$
DECLARE
  demo_user_id UUID := 'b3953e6e-ff5a-4bbd-983d-843884bd4797';
  
  -- 商品ID
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
  
  -- 商品バリエーションID
  variant_ids UUID[];
  
  -- 顧客ID
  customer_ids UUID[];
  recipient_ids UUID[];
  
  -- 配送ゾーンID
  zone_kanto UUID;
  zone_chubu UUID;
  zone_kansai UUID;
  zone_hokkaido UUID;
  zone_kyushu UUID;
  
  -- 受注ID
  order_ids UUID[];
  
  -- 一時変数
  temp_id UUID;
  i INTEGER;
  
BEGIN

-- =============================================
-- 1. 商品マスタ (Products) - 10商品
-- =============================================
INSERT INTO public.products (id, user_id, name, description, category, is_active, created_at, updated_at)
VALUES 
  (gen_random_uuid(), demo_user_id, 'トマト', '甘みの強い完熟トマト。サラダや料理に最適。', '野菜', true, NOW(), NOW()),
  (gen_random_uuid(), demo_user_id, 'きゅうり', '新鮮な朝どりきゅうり。シャキシャキ食感。', '野菜', true, NOW(), NOW()),
  (gen_random_uuid(), demo_user_id, 'なす', '艶のある夏なす。焼きナス、煮物に。', '野菜', true, NOW(), NOW()),
  (gen_random_uuid(), demo_user_id, 'レタス', 'サラダ用フリルレタス。柔らかい葉。', '野菜', true, NOW(), NOW()),
  (gen_random_uuid(), demo_user_id, 'ほうれん草', '栄養たっぷりほうれん草。おひたしに。', '野菜', true, NOW(), NOW()),
  (gen_random_uuid(), demo_user_id, 'じゃがいも', 'メークイン。煮崩れしにくい品種。', '野菜', true, NOW(), NOW()),
  (gen_random_uuid(), demo_user_id, 'にんじん', '甘い春にんじん。βカロテン豊富。', '野菜', true, NOW(), NOW()),
  (gen_random_uuid(), demo_user_id, 'いちご', '甘くて大粒のいちご。ビタミンC豊富。', '果物', true, NOW(), NOW()),
  (gen_random_uuid(), demo_user_id, 'キャベツ', '柔らかくて甘いキャベツ。千切りに最適。', '野菜', true, NOW(), NOW()),
  (gen_random_uuid(), demo_user_id, '大根', '辛みが少なく甘い大根。煮物、サラダに。', '野菜', true, NOW(), NOW())
RETURNING id INTO product_tomato, product_cucumber, product_eggplant, product_lettuce, product_spinach, 
          product_potato, product_carrot, product_strawberry, product_cabbage, product_radish;

-- 商品バリエーション追加
INSERT INTO public.product_variants (product_id, name, sku, price, stock, weight, size, created_at, updated_at)
VALUES
  -- トマト
  (product_tomato, '1kg', 'TOMATO-1KG', 500, 50, 1000, 60, NOW(), NOW()),
  (product_tomato, '2kg', 'TOMATO-2KG', 950, 30, 2000, 80, NOW(), NOW()),
  -- きゅうり
  (product_cucumber, '1kg', 'CUCUMBER-1KG', 300, 40, 1000, 60, NOW(), NOW()),
  (product_cucumber, '3kg', 'CUCUMBER-3KG', 850, 25, 3000, 80, NOW(), NOW()),
  -- なす
  (product_eggplant, '1kg', 'EGGPLANT-1KG', 400, 35, 1000, 60, NOW(), NOW()),
  (product_eggplant, '2kg', 'EGGPLANT-2KG', 750, 20, 2000, 80, NOW(), NOW()),
  -- レタス
  (product_lettuce, '1個', 'LETTUCE-1PC', 250, 60, 500, 60, NOW(), NOW()),
  (product_lettuce, '5個セット', 'LETTUCE-5PC', 1100, 15, 2500, 100, NOW(), NOW()),
  -- ほうれん草
  (product_spinach, '500g', 'SPINACH-500G', 200, 45, 500, 60, NOW(), NOW()),
  (product_spinach, '1kg', 'SPINACH-1KG', 350, 30, 1000, 60, NOW(), NOW()),
  -- じゃがいも
  (product_potato, '2kg', 'POTATO-2KG', 400, 50, 2000, 80, NOW(), NOW()),
  (product_potato, '5kg', 'POTATO-5KG', 950, 25, 5000, 100, NOW(), NOW()),
  -- にんじん
  (product_carrot, '1kg', 'CARROT-1KG', 250, 55, 1000, 60, NOW(), NOW()),
  (product_carrot, '3kg', 'CARROT-3KG', 700, 28, 3000, 80, NOW(), NOW()),
  -- いちご
  (product_strawberry, '300g', 'STRAWBERRY-300G', 800, 20, 300, 60, NOW(), NOW()),
  (product_strawberry, '1kg', 'STRAWBERRY-1KG', 2500, 10, 1000, 80, NOW(), NOW()),
  -- キャベツ
  (product_cabbage, '1個', 'CABBAGE-1PC', 200, 40, 1200, 80, NOW(), NOW()),
  (product_cabbage, '3個セット', 'CABBAGE-3PC', 550, 15, 3600, 120, NOW(), NOW()),
  -- 大根
  (product_radish, '1本', 'RADISH-1PC', 150, 50, 1000, 80, NOW(), NOW()),
  (product_radish, '3本セット', 'RADISH-3PC', 400, 20, 3000, 100, NOW(), NOW());

-- =============================================
-- 2. 顧客マスタ (Customers) - 10顧客
-- =============================================
WITH inserted_customers AS (
  INSERT INTO public.customers (id, user_id, name, email, phone, postal_code, prefecture, city, address_line, notes, total_purchased, created_at, updated_at)
  VALUES
    (gen_random_uuid(), demo_user_id, '田中商店', 'tanaka@example.com', '03-1234-5678', '100-0001', '東京都', '千代田区', '丸の内1-1-1 オフィスビル3F', '卸売業者。毎週火曜定期配送', 0, NOW() - INTERVAL '6 months', NOW()),
    (gen_random_uuid(), demo_user_id, '山田青果', 'yamada@example.com', '06-2345-6789', '530-0001', '大阪府', '大阪市北区', '梅田2-2-2', '関西の主要卸売先', 0, NOW() - INTERVAL '5 months', NOW()),
    (gen_random_uuid(), demo_user_id, '佐藤太郎', 'sato@example.com', '090-1234-5678', '150-0001', '東京都', '渋谷区', '神宮前3-3-3 マンション201', '個人顧客。リピーター', 0, NOW() - INTERVAL '4 months', NOW()),
    (gen_random_uuid(), demo_user_id, '鈴木農園', 'suzuki@example.com', '011-3456-7890', '060-0001', '北海道', '札幌市中央区', '北1条4-4-4', '農家仲間。物々交換あり', 0, NOW() - INTERVAL '8 months', NOW()),
    (gen_random_uuid(), demo_user_id, '高橋レストラン', 'takahashi@example.com', '092-4567-8901', '810-0001', '福岡県', '福岡市中央区', '天神5-5-5 レストラン棟', 'イタリアンレストラン。週2回配送', 0, NOW() - INTERVAL '3 months', NOW()),
    (gen_random_uuid(), demo_user_id, '伊藤商事株式会社', 'ito@example.com', '052-5678-9012', '460-0001', '愛知県', '名古屋市中区', '栄6-6-6 商社ビル10F', '大口顧客', 0, NOW() - INTERVAL '7 months', NOW()),
    (gen_random_uuid(), demo_user_id, '渡辺花子', 'watanabe@example.com', '080-2345-6789', '231-0001', '神奈川県', '横浜市中区', '関内7-7-7-305', '個人顧客。月1回注文', 0, NOW() - INTERVAL '2 months', NOW()),
    (gen_random_uuid(), demo_user_id, 'オーガニック市場', 'organic@example.com', '03-6789-0123', '107-0001', '東京都', '港区', '赤坂8-8-8', 'オーガニック専門店', 0, NOW() - INTERVAL '9 months', NOW()),
    (gen_random_uuid(), demo_user_id, '中村スーパー', 'nakamura@example.com', '078-7890-1234', '650-0001', '兵庫県', '神戸市中央区', '三宮9-9-9', '地域スーパー', 0, NOW() - INTERVAL '5 months', NOW()),
    (gen_random_uuid(), demo_user_id, '小林健一', 'kobayashi@example.com', '090-8901-2345', '980-0001', '宮城県', '仙台市青葉区', '一番町10-10-10', '個人顧客。ギフト用途多い', 0, NOW() - INTERVAL '3 months', NOW())
  RETURNING id
)
SELECT array_agg(id) INTO customer_ids FROM inserted_customers;

-- 各顧客に配送先を追加
FOR i IN 1..10 LOOP
  -- 主配送先（顧客の住所と同じ）
  INSERT INTO public.recipients (customer_id, name, phone, postal_code, prefecture, city, address_line, created_at, updated_at)
  SELECT 
    customer_ids[i],
    c.name || ' 本社',
    c.phone,
    c.postal_code,
    c.prefecture,
    c.city,
    c.address_line,
    NOW(),
    NOW()
  FROM public.customers c WHERE c.id = customer_ids[i];
  
  -- 一部の顧客に配送先を追加
  IF i IN (1, 2, 5, 6, 9) THEN
    INSERT INTO public.recipients (customer_id, name, phone, postal_code, prefecture, city, address_line, created_at, updated_at)
    SELECT 
      customer_ids[i],
      c.name || ' 第2倉庫',
      c.phone,
      c.postal_code,
      c.prefecture,
      c.city,
      c.address_line || ' 隣接倉庫',
      NOW(),
      NOW()
    FROM public.customers c WHERE c.id = customer_ids[i];
  END IF;
END LOOP;

-- =============================================
-- 3. 受注データ (Orders) - 10件
-- =============================================
-- 過去3ヶ月の受注データを作成

-- 受注1: 田中商店 (2ヶ月前)
INSERT INTO public.orders (id, user_id, order_number, customer_id, customer_name, recipient_name, recipient_postal_code, recipient_prefecture, recipient_city, recipient_address_line, recipient_phone, order_date, delivery_date, total_amount, shipping_fee, carrier, is_cool, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  demo_user_id,
  'ORD-' || TO_CHAR(NOW() - INTERVAL '60 days', 'YYYYMMDD') || '-001',
  customer_ids[1],
  '田中商店',
  '田中商店 本社',
  '100-0001',
  '東京都',
  '千代田区',
  '丸の内1-1-1 オフィスビル3F',
  '03-1234-5678',
  (NOW() - INTERVAL '60 days')::DATE,
  (NOW() - INTERVAL '58 days')::DATE,
  3250,
  800,
  'yamato',
  false,
  'delivered',
  NOW() - INTERVAL '60 days',
  NOW() - INTERVAL '58 days'
RETURNING id INTO temp_id;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT 
  temp_id,
  product_tomato,
  (SELECT id FROM public.product_variants WHERE product_id = product_tomato LIMIT 1),
  'トマト',
  '1kg',
  3,
  500,
  1500;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT 
  temp_id,
  product_cucumber,
  (SELECT id FROM public.product_variants WHERE product_id = product_cucumber LIMIT 1),
  'きゅうり',
  '1kg',
  2,
  300,
  600;

-- 受注2: 山田青果 (55日前)
INSERT INTO public.orders (id, user_id, order_number, customer_id, customer_name, recipient_name, recipient_postal_code, recipient_prefecture, recipient_city, recipient_address_line, recipient_phone, order_date, delivery_date, total_amount, shipping_fee, carrier, is_cool, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  demo_user_id,
  'ORD-' || TO_CHAR(NOW() - INTERVAL '55 days', 'YYYYMMDD') || '-002',
  customer_ids[2],
  '山田青果',
  '山田青果 本社',
  '530-0001',
  '大阪府',
  '大阪市北区',
  '梅田2-2-2',
  '06-2345-6789',
  (NOW() - INTERVAL '55 days')::DATE,
  (NOW() - INTERVAL '53 days')::DATE,
  5150,
  1000,
  'yamato',
  false,
  'delivered',
  NOW() - INTERVAL '55 days',
  NOW() - INTERVAL '53 days'
RETURNING id INTO temp_id;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_eggplant, (SELECT id FROM public.product_variants WHERE product_id = product_eggplant LIMIT 1), 'なす', '1kg', 5, 400, 2000;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_spinach, (SELECT id FROM public.product_variants WHERE product_id = product_spinach ORDER BY price DESC LIMIT 1), 'ほうれん草', '1kg', 6, 350, 2100;

-- 受注3: 佐藤太郎 (45日前)
INSERT INTO public.orders (id, user_id, order_number, customer_id, customer_name, recipient_name, recipient_postal_code, recipient_prefecture, recipient_city, recipient_address_line, recipient_phone, order_date, delivery_date, total_amount, shipping_fee, carrier, is_cool, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  demo_user_id,
  'ORD-' || TO_CHAR(NOW() - INTERVAL '45 days', 'YYYYMMDD') || '-003',
  customer_ids[3],
  '佐藤太郎',
  '佐藤太郎 本社',
  '150-0001',
  '東京都',
  '渋谷区',
  '神宮前3-3-3 マンション201',
  '090-1234-5678',
  (NOW() - INTERVAL '45 days')::DATE,
  (NOW() - INTERVAL '43 days')::DATE,
  2550,
  800,
  'yamato',
  true,
  'delivered',
  NOW() - INTERVAL '45 days',
  NOW() - INTERVAL '43 days'
RETURNING id INTO temp_id;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_strawberry, (SELECT id FROM public.product_variants WHERE product_id = product_strawberry LIMIT 1), 'いちご', '300g', 2, 800, 1600;

-- 受注4: 高橋レストラン (35日前)
INSERT INTO public.orders (id, user_id, order_number, customer_id, customer_name, recipient_name, recipient_postal_code, recipient_prefecture, recipient_city, recipient_address_line, recipient_phone, order_date, delivery_date, total_amount, shipping_fee, carrier, is_cool, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  demo_user_id,
  'ORD-' || TO_CHAR(NOW() - INTERVAL '35 days', 'YYYYMMDD') || '-004',
  customer_ids[5],
  '高橋レストラン',
  '高橋レストラン 本社',
  '810-0001',
  '福岡県',
  '福岡市中央区',
  '天神5-5-5 レストラン棟',
  '092-4567-8901',
  (NOW() - INTERVAL '35 days')::DATE,
  (NOW() - INTERVAL '33 days')::DATE,
  4650,
  1300,
  'yamato',
  false,
  'delivered',
  NOW() - INTERVAL '35 days',
  NOW() - INTERVAL '33 days'
RETURNING id INTO temp_id;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_lettuce, (SELECT id FROM public.product_variants WHERE product_id = product_lettuce ORDER BY price DESC LIMIT 1), 'レタス', '5個セット', 3, 1100, 3300;

-- 受注5: 伊藤商事 (28日前)
INSERT INTO public.orders (id, user_id, order_number, customer_id, customer_name, recipient_name, recipient_postal_code, recipient_prefecture, recipient_city, recipient_address_line, recipient_phone, order_date, delivery_date, total_amount, shipping_fee, carrier, is_cool, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  demo_user_id,
  'ORD-' || TO_CHAR(NOW() - INTERVAL '28 days', 'YYYYMMDD') || '-005',
  customer_ids[6],
  '伊藤商事株式会社',
  '伊藤商事株式会社 本社',
  '460-0001',
  '愛知県',
  '名古屋市中区',
  '栄6-6-6 商社ビル10F',
  '052-5678-9012',
  (NOW() - INTERVAL '28 days')::DATE,
  (NOW() - INTERVAL '26 days')::DATE,
  6850,
  900,
  'yamato',
  false,
  'delivered',
  NOW() - INTERVAL '28 days',
  NOW() - INTERVAL '26 days'
RETURNING id INTO temp_id;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_tomato, (SELECT id FROM public.product_variants WHERE product_id = product_tomato ORDER BY price DESC LIMIT 1), 'トマト', '2kg', 4, 950, 3800;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_cucumber, (SELECT id FROM public.product_variants WHERE product_id = product_cucumber ORDER BY price DESC LIMIT 1), 'きゅうり', '3kg', 3, 850, 2550;

-- 受注6: 渡辺花子 (20日前)
INSERT INTO public.orders (id, user_id, order_number, customer_id, customer_name, recipient_name, recipient_postal_code, recipient_prefecture, recipient_city, recipient_address_line, recipient_phone, order_date, delivery_date, total_amount, shipping_fee, carrier, is_cool, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  demo_user_id,
  'ORD-' || TO_CHAR(NOW() - INTERVAL '20 days', 'YYYYMMDD') || '-006',
  customer_ids[7],
  '渡辺花子',
  '渡辺花子 本社',
  '231-0001',
  '神奈川県',
  '横浜市中区',
  '関内7-7-7-305',
  '080-2345-6789',
  (NOW() - INTERVAL '20 days')::DATE,
  (NOW() - INTERVAL '18 days')::DATE,
  1950,
  800,
  'yamato',
  false,
  'shipped',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '19 days'
RETURNING id INTO temp_id;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_carrot, (SELECT id FROM public.product_variants WHERE product_id = product_carrot LIMIT 1), 'にんじん', '1kg', 3, 250, 750;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_potato, (SELECT id FROM public.product_variants WHERE product_id = product_potato LIMIT 1), 'じゃがいも', '2kg', 1, 400, 400;

-- 受注7: オーガニック市場 (15日前)
INSERT INTO public.orders (id, user_id, order_number, customer_id, customer_name, recipient_name, recipient_postal_code, recipient_prefecture, recipient_city, recipient_address_line, recipient_phone, order_date, delivery_date, total_amount, shipping_fee, carrier, is_cool, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  demo_user_id,
  'ORD-' || TO_CHAR(NOW() - INTERVAL '15 days', 'YYYYMMDD') || '-007',
  customer_ids[8],
  'オーガニック市場',
  'オーガニック市場 本社',
  '107-0001',
  '東京都',
  '港区',
  '赤坂8-8-8',
  '03-6789-0123',
  (NOW() - INTERVAL '15 days')::DATE,
  (NOW() - INTERVAL '13 days')::DATE,
  5800,
  800,
  'yamato',
  false,
  'shipped',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '14 days'
RETURNING id INTO temp_id;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_cabbage, (SELECT id FROM public.product_variants WHERE product_id = product_cabbage ORDER BY price DESC LIMIT 1), 'キャベツ', '3個セット', 5, 550, 2750;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_radish, (SELECT id FROM public.product_variants WHERE product_id = product_radish ORDER BY price DESC LIMIT 1), '大根', '3本セット', 5, 400, 2000;

-- 受注8: 中村スーパー (10日前)
INSERT INTO public.orders (id, user_id, order_number, customer_id, customer_name, recipient_name, recipient_postal_code, recipient_prefecture, recipient_city, recipient_address_line, recipient_phone, order_date, delivery_date, total_amount, shipping_fee, carrier, is_cool, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  demo_user_id,
  'ORD-' || TO_CHAR(NOW() - INTERVAL '10 days', 'YYYYMMDD') || '-008',
  customer_ids[9],
  '中村スーパー',
  '中村スーパー 本社',
  '650-0001',
  '兵庫県',
  '神戸市中央区',
  '三宮9-9-9',
  '078-7890-1234',
  (NOW() - INTERVAL '10 days')::DATE,
  (NOW() - INTERVAL '8 days')::DATE,
  4000,
  1000,
  'yamato',
  false,
  'shipped',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '9 days'
RETURNING id INTO temp_id;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_tomato, (SELECT id FROM public.product_variants WHERE product_id = product_tomato LIMIT 1), 'トマト', '1kg', 4, 500, 2000;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_eggplant, (SELECT id FROM public.product_variants WHERE product_id = product_eggplant LIMIT 1), 'なす', '1kg', 3, 400, 1200;

-- 受注9: 小林健一 (5日前)
INSERT INTO public.orders (id, user_id, order_number, customer_id, customer_name, recipient_name, recipient_postal_code, recipient_prefecture, recipient_city, recipient_address_line, recipient_phone, order_date, delivery_date, total_amount, shipping_fee, carrier, is_cool, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  demo_user_id,
  'ORD-' || TO_CHAR(NOW() - INTERVAL '5 days', 'YYYYMMDD') || '-009',
  customer_ids[10],
  '小林健一',
  '小林健一 本社',
  '980-0001',
  '宮城県',
  '仙台市青葉区',
  '一番町10-10-10',
  '090-8901-2345',
  (NOW() - INTERVAL '5 days')::DATE,
  (NOW() - INTERVAL '3 days')::DATE,
  4320,
  1500,
  'yamato',
  true,
  'pending',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
RETURNING id INTO temp_id;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_strawberry, (SELECT id FROM public.product_variants WHERE product_id = product_strawberry ORDER BY price DESC LIMIT 1), 'いちご', '1kg', 1, 2500, 2500;

-- 受注10: 田中商店 (2日前) - リピート注文
INSERT INTO public.orders (id, user_id, order_number, customer_id, customer_name, recipient_name, recipient_postal_code, recipient_prefecture, recipient_city, recipient_address_line, recipient_phone, order_date, delivery_date, total_amount, shipping_fee, carrier, is_cool, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  demo_user_id,
  'ORD-' || TO_CHAR(NOW() - INTERVAL '2 days', 'YYYYMMDD') || '-010',
  customer_ids[1],
  '田中商店',
  '田中商店 本社',
  '100-0001',
  '東京都',
  '千代田区',
  '丸の内1-1-1 オフィスビル3F',
  '03-1234-5678',
  (NOW() - INTERVAL '2 days')::DATE,
  NOW()::DATE,
  3150,
  800,
  'yamato',
  false,
  'pending',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
RETURNING id INTO temp_id;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_lettuce, (SELECT id FROM public.product_variants WHERE product_id = product_lettuce LIMIT 1), 'レタス', '1個', 5, 250, 1250;

INSERT INTO public.order_items (order_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, subtotal)
SELECT temp_id, product_spinach, (SELECT id FROM public.product_variants WHERE product_id = product_spinach LIMIT 1), 'ほうれん草', '500g', 6, 200, 1200;

-- =============================================
-- 4. 配送ゾーン設定
-- =============================================

-- 送料計算モードをゾーン制に設定
INSERT INTO public.shipping_mode_settings (user_id, mode, created_at, updated_at)
VALUES (demo_user_id, 'zone', NOW(), NOW())
ON CONFLICT (user_id) DO UPDATE SET mode = 'zone', updated_at = NOW();

-- 配送ゾーン作成
INSERT INTO public.shipping_zones (user_id, name, display_order, created_at, updated_at)
VALUES (demo_user_id, '関東', 1, NOW(), NOW())
RETURNING id INTO zone_kanto;

INSERT INTO public.shipping_zones (user_id, name, display_order, created_at, updated_at)
VALUES (demo_user_id, '中部', 2, NOW(), NOW())
RETURNING id INTO zone_chubu;

INSERT INTO public.shipping_zones (user_id, name, display_order, created_at, updated_at)
VALUES (demo_user_id, '関西', 3, NOW(), NOW())
RETURNING id INTO zone_kansai;

INSERT INTO public.shipping_zones (user_id, name, display_order, created_at, updated_at)
VALUES (demo_user_id, '北海道・東北', 4, NOW(), NOW())
RETURNING id INTO zone_hokkaido;

INSERT INTO public.shipping_zones (user_id, name, display_order, created_at, updated_at)
VALUES (demo_user_id, '九州・沖縄', 5, NOW(), NOW())
RETURNING id INTO zone_kyushu;

-- 都道府県をゾーンに割り当て
INSERT INTO public.prefecture_zones (zone_id, prefecture, created_at) VALUES
(zone_kanto, '東京都', NOW()), (zone_kanto, '神奈川県', NOW()), (zone_kanto, '千葉県', NOW()),
(zone_kanto, '埼玉県', NOW()), (zone_kanto, '茨城県', NOW()), (zone_kanto, '栃木県', NOW()), (zone_kanto, '群馬県', NOW()),
(zone_chubu, '愛知県', NOW()), (zone_chubu, '静岡県', NOW()), (zone_chubu, '岐阜県', NOW()),
(zone_chubu, '三重県', NOW()), (zone_chubu, '長野県', NOW()), (zone_chubu, '新潟県', NOW()), (zone_chubu, '山梨県', NOW()),
(zone_kansai, '大阪府', NOW()), (zone_kansai, '京都府', NOW()), (zone_kansai, '兵庫県', NOW()),
(zone_kansai, '奈良県', NOW()), (zone_kansai, '滋賀県', NOW()), (zone_kansai, '和歌山県', NOW()),
(zone_hokkaido, '北海道', NOW()), (zone_hokkaido, '青森県', NOW()), (zone_hokkaido, '岩手県', NOW()),
(zone_hokkaido, '宮城県', NOW()), (zone_hokkaido, '秋田県', NOW()), (zone_hokkaido, '山形県', NOW()), (zone_hokkaido, '福島県', NOW()),
(zone_kyushu, '福岡県', NOW()), (zone_kyushu, '佐賀県', NOW()), (zone_kyushu, '長崎県', NOW()),
(zone_kyushu, '熊本県', NOW()), (zone_kyushu, '大分県', NOW()), (zone_kyushu, '宮崎県', NOW()),
(zone_kyushu, '鹿児島県', NOW()), (zone_kyushu, '沖縄県', NOW());

-- ゾーン別送料設定
INSERT INTO public.zone_shipping_rates (zone_id, carrier, size, base_rate, cool_fee, created_at, updated_at) VALUES
-- 関東
(zone_kanto, 'yamato', 60, 800, 220, NOW(), NOW()),
(zone_kanto, 'yamato', 80, 1000, 220, NOW(), NOW()),
(zone_kanto, 'yamato', 100, 1200, 220, NOW(), NOW()),
(zone_kanto, 'yamato', 120, 1400, 330, NOW(), NOW()),
(zone_kanto, 'yamato', 140, 1600, 330, NOW(), NOW()),
(zone_kanto, 'yamato', 160, 1800, 330, NOW(), NOW()),
-- 中部
(zone_chubu, 'yamato', 60, 900, 220, NOW(), NOW()),
(zone_chubu, 'yamato', 80, 1100, 220, NOW(), NOW()),
(zone_chubu, 'yamato', 100, 1300, 220, NOW(), NOW()),
(zone_chubu, 'yamato', 120, 1500, 330, NOW(), NOW()),
(zone_chubu, 'yamato', 140, 1700, 330, NOW(), NOW()),
(zone_chubu, 'yamato', 160, 1900, 330, NOW(), NOW()),
-- 関西
(zone_kansai, 'yamato', 60, 1000, 220, NOW(), NOW()),
(zone_kansai, 'yamato', 80, 1200, 220, NOW(), NOW()),
(zone_kansai, 'yamato', 100, 1400, 220, NOW(), NOW()),
(zone_kansai, 'yamato', 120, 1600, 330, NOW(), NOW()),
(zone_kansai, 'yamato', 140, 1800, 330, NOW(), NOW()),
(zone_kansai, 'yamato', 160, 2000, 330, NOW(), NOW()),
-- 北海道・東北
(zone_hokkaido, 'yamato', 60, 1500, 220, NOW(), NOW()),
(zone_hokkaido, 'yamato', 80, 1700, 220, NOW(), NOW()),
(zone_hokkaido, 'yamato', 100, 1900, 220, NOW(), NOW()),
(zone_hokkaido, 'yamato', 120, 2100, 330, NOW(), NOW()),
(zone_hokkaido, 'yamato', 140, 2300, 330, NOW(), NOW()),
(zone_hokkaido, 'yamato', 160, 2500, 330, NOW(), NOW()),
-- 九州・沖縄
(zone_kyushu, 'yamato', 60, 1300, 220, NOW(), NOW()),
(zone_kyushu, 'yamato', 80, 1500, 220, NOW(), NOW()),
(zone_kyushu, 'yamato', 100, 1700, 220, NOW(), NOW()),
(zone_kyushu, 'yamato', 120, 1900, 330, NOW(), NOW()),
(zone_kyushu, 'yamato', 140, 2100, 330, NOW(), NOW()),
(zone_kyushu, 'yamato', 160, 2300, 330, NOW(), NOW());

-- =============================================
-- 5. 作業日誌 (Work Logs) - 10件
-- =============================================
INSERT INTO public.work_logs (user_id, log_date, field, work_details, harvest_items, materials_used, input_type, created_at, updated_at)
VALUES
  (demo_user_id, (NOW() - INTERVAL '65 days')::DATE, '第1圃場', 'トマトの収穫作業。天候良好で品質◎', 'トマト 55kg', NULL, 'manual', NOW() - INTERVAL '65 days', NOW() - INTERVAL '65 days'),
  (demo_user_id, (NOW() - INTERVAL '58 days')::DATE, 'ハウス1', 'きゅうりの誘引作業と追肥を実施', 'きゅうり 28kg', '液肥 5L', 'ai_chat', NOW() - INTERVAL '58 days', NOW() - INTERVAL '58 days'),
  (demo_user_id, (NOW() - INTERVAL '50 days')::DATE, '第2圃場', 'ほうれん草の収穫。朝露で新鮮。', 'ほうれん草 22kg', NULL, 'manual', NOW() - INTERVAL '50 days', NOW() - INTERVAL '50 days'),
  (demo_user_id, (NOW() - INTERVAL '42 days')::DATE, 'いちごハウス', 'いちごの収穫ピーク。甘くて大粒。', 'いちご 12kg', NULL, 'ai_chat', NOW() - INTERVAL '42 days', NOW() - INTERVAL '42 days'),
  (demo_user_id, (NOW() - INTERVAL '35 days')::DATE, '第3圃場', 'じゃがいもの試し掘り実施。サイズ確認OK', 'じゃがいも 8kg（試し掘り）', NULL, 'manual', NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days'),
  (demo_user_id, (NOW() - INTERVAL '28 days')::DATE, '第1圃場', 'なすの追肥と病害虫チェック', 'なす 18kg', '化成肥料 30kg', 'manual', NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),
  (demo_user_id, (NOW() - INTERVAL '21 days')::DATE, 'ハウス2', 'レタスの定植作業。ポット苗300株', NULL, 'レタス苗 300株', 'ai_chat', NOW() - INTERVAL '21 days', NOW() - INTERVAL '21 days'),
  (demo_user_id, (NOW() - INTERVAL '14 days')::DATE, '第2圃場', 'にんじんの間引き作業と除草', NULL, NULL, 'manual', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
  (demo_user_id, (NOW() - INTERVAL '7 days')::DATE, '第1圃場', 'トマトの収穫と選果作業', 'トマト 62kg', NULL, 'ai_chat', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
(demo_user_id, (NOW() - INTERVAL '2 days')::DATE, 'ハウス1', 'きゅうりの収穫。出荷準備完了。', 'きゅうり 35kg', NULL, 'manual', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

RAISE NOTICE '✅ Demo data insertion completed successfully!';
RAISE NOTICE '📊 Summary:';
RAISE NOTICE '  - Products: 10 items with variants';
RAISE NOTICE '  - Customers: 10 customers with recipients';
RAISE NOTICE '  - Orders: 10 orders with line items';
RAISE NOTICE '  - Work Logs: 10 entries';
RAISE NOTICE '  - Shipping Zones: 5 zones configured';
RAISE NOTICE '  - Shipping Rates: Zone-based rates set';

END $$;
