-- デモデータ自動投入スクリプト
-- demo1@farmship.example アカウント用

DO $$
DECLARE
  demo_user_id UUID;
  zone_kanto UUID;
  zone_chubu UUID;
  zone_kansai UUID;
  zone_hokkaido UUID;
  zone_kyushu UUID;
BEGIN

-- ユーザーIDを取得
SELECT id INTO demo_user_id
FROM auth.users
WHERE email = 'demo1@farmship.example';

IF demo_user_id IS NULL THEN
  RAISE EXCEPTION 'ユーザー demo1@farmship.example が見つかりません';
END IF;

RAISE NOTICE 'ユーザーID: %', demo_user_id;

-- ===========================================
-- 1. Products (商品マスター)
-- ===========================================
INSERT INTO public.products (user_id, name, category, price, is_parent) VALUES
(demo_user_id, 'トマト', '野菜', 500, false),
(demo_user_id, 'きゅうり', '野菜', 300, false),
(demo_user_id, 'なす', '野菜', 400, false),
(demo_user_id, 'レタス', '野菜', 250, false),
(demo_user_id, 'ほうれん草', '野菜', 350, false),
(demo_user_id, 'じゃがいも', '野菜', 200, false),
(demo_user_id, 'にんじん', '野菜', 250, false),
(demo_user_id, 'いちご', '果物', 1200, false);

RAISE NOTICE '✅ 商品データを投入しました（8件）';

-- ===========================================
-- 2. Customers (顧客)
-- ===========================================
INSERT INTO public.customers (user_id, name, postal_code, address, phone, email) VALUES
(demo_user_id, '田中商店', '100-0001', '東京都千代田区丸の内1-1-1 オフィスビル3F', '03-1234-5678', 'tanaka@example.com'),
(demo_user_id, '山田青果', '530-0001', '大阪府大阪市北区梅田2-2-2', '06-2345-6789', 'yamada@example.com'),
(demo_user_id, '佐藤太郎', '150-0001', '東京都渋谷区神宮前3-3-3 マンション201', '090-1234-5678', 'sato@example.com'),
(demo_user_id, '鈴木農園', '060-0001', '北海道札幌市中央区北1条4-4-4', '011-3456-7890', 'suzuki@example.com'),
(demo_user_id, '高橋レストラン', '810-0001', '福岡県福岡市中央区天神5-5-5 レストラン棟', '092-4567-8901', 'takahashi@example.com');

RAISE NOTICE '✅ 顧客データを投入しました（5件）';

-- ===========================================
-- 3. Shipping Settings - Mode
-- ===========================================
INSERT INTO public.shipping_mode_settings (user_id, mode) VALUES
(demo_user_id, 'zone')
ON CONFLICT (user_id) DO UPDATE SET mode = 'zone';

RAISE NOTICE '✅ 送料モードを設定しました（ゾーン制）';

-- ===========================================
-- 4. Shipping Zones
-- ===========================================
INSERT INTO public.shipping_zones (user_id, name, display_order) VALUES
(demo_user_id, '関東', 1) RETURNING id INTO zone_kanto;

INSERT INTO public.shipping_zones (user_id, name, display_order) VALUES
(demo_user_id, '中部', 2) RETURNING id INTO zone_chubu;

INSERT INTO public.shipping_zones (user_id, name, display_order) VALUES
(demo_user_id, '関西', 3) RETURNING id INTO zone_kansai;

INSERT INTO public.shipping_zones (user_id, name, display_order) VALUES
(demo_user_id, '北海道・東北', 4) RETURNING id INTO zone_hokkaido;

INSERT INTO public.shipping_zones (user_id, name, display_order) VALUES
(demo_user_id, '九州・沖縄', 5) RETURNING id INTO zone_kyushu;

RAISE NOTICE '✅ 配送ゾーンを作成しました（5ゾーン）';

-- ===========================================
-- 5. Prefecture Zone Mappings
-- ===========================================

-- 関東
INSERT INTO public.prefecture_zones (user_id, zone_id, prefecture) VALUES
(demo_user_id, zone_kanto, '東京都'),
(demo_user_id, zone_kanto, '神奈川県'),
(demo_user_id, zone_kanto, '千葉県'),
(demo_user_id, zone_kanto, '埼玉県'),
(demo_user_id, zone_kanto, '茨城県'),
(demo_user_id, zone_kanto, '栃木県'),
(demo_user_id, zone_kanto, '群馬県');

-- 中部
INSERT INTO public.prefecture_zones (user_id, zone_id, prefecture) VALUES
(demo_user_id, zone_chubu, '愛知県'),
(demo_user_id, zone_chubu, '静岡県'),
(demo_user_id, zone_chubu, '岐阜県'),
(demo_user_id, zone_chubu, '三重県'),
(demo_user_id, zone_chubu, '長野県'),
(demo_user_id, zone_chubu, '新潟県'),
(demo_user_id, zone_chubu, '山梨県'),
(demo_user_id, zone_chubu, '富山県'),
(demo_user_id, zone_chubu, '石川県'),
(demo_user_id, zone_chubu, '福井県');

-- 関西
INSERT INTO public.prefecture_zones (user_id, zone_id, prefecture) VALUES
(demo_user_id, zone_kansai, '大阪府'),
(demo_user_id, zone_kansai, '京都府'),
(demo_user_id, zone_kansai, '兵庫県'),
(demo_user_id, zone_kansai, '奈良県'),
(demo_user_id, zone_kansai, '滋賀県'),
(demo_user_id, zone_kansai, '和歌山県');

-- 北海道・東北
INSERT INTO public.prefecture_zones (user_id, zone_id, prefecture) VALUES
(demo_user_id, zone_hokkaido, '北海道'),
(demo_user_id, zone_hokkaido, '青森県'),
(demo_user_id, zone_hokkaido, '岩手県'),
(demo_user_id, zone_hokkaido, '宮城県'),
(demo_user_id, zone_hokkaido, '秋田県'),
(demo_user_id, zone_hokkaido, '山形県'),
(demo_user_id, zone_hokkaido, '福島県');

-- 九州・沖縄
INSERT INTO public.prefecture_zones (user_id, zone_id, prefecture) VALUES
(demo_user_id, zone_kyushu, '福岡県'),
(demo_user_id, zone_kyushu, '佐賀県'),
(demo_user_id, zone_kyushu, '長崎県'),
(demo_user_id, zone_kyushu, '熊本県'),
(demo_user_id, zone_kyushu, '大分県'),
(demo_user_id, zone_kyushu, '宮崎県'),
(demo_user_id, zone_kyushu, '鹿児島県'),
(demo_user_id, zone_kyushu, '沖縄県');

RAISE NOTICE '✅ 都道府県をゾーンに割り当てました（47都道府県）';

-- ===========================================
-- 6. Zone Shipping Rates (ヤマト運輸)
-- ===========================================

-- 関東
INSERT INTO public.zone_shipping_rates (user_id, zone_id, carrier, size, base_price, cool_price) VALUES
(demo_user_id, zone_kanto, 'yamato', '60', 800, 220),
(demo_user_id, zone_kanto, 'yamato', '80', 1000, 220),
(demo_user_id, zone_kanto, 'yamato', '100', 1200, 220),
(demo_user_id, zone_kanto, 'yamato', '120', 1400, 330),
(demo_user_id, zone_kanto, 'yamato', '140', 1600, 330),
(demo_user_id, zone_kanto, 'yamato', '160', 1800, 330);

-- 中部
INSERT INTO public.zone_shipping_rates (user_id, zone_id, carrier, size, base_price, cool_price) VALUES
(demo_user_id, zone_chubu, 'yamato', '60', 900, 220),
(demo_user_id, zone_chubu, 'yamato', '80', 1100, 220),
(demo_user_id, zone_chubu, 'yamato', '100', 1300, 220),
(demo_user_id, zone_chubu, 'yamato', '120', 1500, 330),
(demo_user_id, zone_chubu, 'yamato', '140', 1700, 330),
(demo_user_id, zone_chubu, 'yamato', '160', 1900, 330);

-- 関西
INSERT INTO public.zone_shipping_rates (user_id, zone_id, carrier, size, base_price, cool_price) VALUES
(demo_user_id, zone_kansai, 'yamato', '60', 1000, 220),
(demo_user_id, zone_kansai, 'yamato', '80', 1200, 220),
(demo_user_id, zone_kansai, 'yamato', '100', 1400, 220),
(demo_user_id, zone_kansai, 'yamato', '120', 1600, 330),
(demo_user_id, zone_kansai, 'yamato', '140', 1800, 330),
(demo_user_id, zone_kansai, 'yamato', '160', 2000, 330);

-- 北海道・東北
INSERT INTO public.zone_shipping_rates (user_id, zone_id, carrier, size, base_price, cool_price) VALUES
(demo_user_id, zone_hokkaido, 'yamato', '60', 1500, 220),
(demo_user_id, zone_hokkaido, 'yamato', '80', 1700, 220),
(demo_user_id, zone_hokkaido, 'yamato', '100', 1900, 220),
(demo_user_id, zone_hokkaido, 'yamato', '120', 2100, 330),
(demo_user_id, zone_hokkaido, 'yamato', '140', 2300, 330),
(demo_user_id, zone_hokkaido, 'yamato', '160', 2500, 330);

-- 九州・沖縄
INSERT INTO public.zone_shipping_rates (user_id, zone_id, carrier, size, base_price, cool_price) VALUES
(demo_user_id, zone_kyushu, 'yamato', '60', 1300, 220),
(demo_user_id, zone_kyushu, 'yamato', '80', 1500, 220),
(demo_user_id, zone_kyushu, 'yamato', '100', 1700, 220),
(demo_user_id, zone_kyushu, 'yamato', '120', 1900, 330),
(demo_user_id, zone_kyushu, 'yamato', '140', 2100, 330),
(demo_user_id, zone_kyushu, 'yamato', '160', 2300, 330);

RAISE NOTICE '✅ ゾーン別送料を設定しました（5ゾーン × 6サイズ）';

-- ===========================================
-- 完了メッセージ
-- ===========================================
RAISE NOTICE '🎉 デモデータの投入が完了しました！';
RAISE NOTICE '   - 商品: 8件';
RAISE NOTICE '   - 顧客: 5件';
RAISE NOTICE '   - 配送ゾーン: 5ゾーン（47都道府県）';
RAISE NOTICE '   - 送料設定: 30件';

END $$;
