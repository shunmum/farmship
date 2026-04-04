/**
 * エリア別・重量別送料データ
 * 重量区分は全エリア共通（0-4, 4-8, 8-10, 10-14, 14-18, 18-24, 24+）
 * 配達所要日数も全エリア共通（3〜5営業日）
 */

export interface WeightTier {
  from: number;    // kg (以上)
  to: number | null; // kg (未満、null = 上限なし)
  label: string;
}

export const WEIGHT_TIERS: WeightTier[] = [
  { from: 0,  to: 4,    label: "〜4kg" },
  { from: 4,  to: 8,    label: "4〜8kg" },
  { from: 8,  to: 10,   label: "8〜10kg" },
  { from: 10, to: 14,   label: "10〜14kg" },
  { from: 14, to: 18,   label: "14〜18kg" },
  { from: 18, to: 24,   label: "18〜24kg" },
  { from: 24, to: null, label: "24kg〜" },
];

export interface AreaShippingRates {
  areaId: string;
  areaName: string;
  prefectures: string[];
  deliveryDays: string;
  /** 通常配送料（円）。WEIGHT_TIERSのインデックスと対応。null = 未設定 */
  normalRates: (number | null)[];
  /** クール便料金（円）。WEIGHT_TIERSのインデックスと対応。null = 未設定 */
  coolRates: (number | null)[];
}

export const DEFAULT_AREA_SHIPPING_RATES: AreaShippingRates[] = [
  {
    areaId: "area_tohoku_kanto",
    areaName: "南東北・関東・信越・北陸・中部エリア",
    prefectures: [
      "宮城県", "山形県", "福島県",
      "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
      "山梨県", "新潟県", "長野県", "富山県", "石川県", "福井県",
      "静岡県", "愛知県", "三重県", "岐阜県",
    ],
    deliveryDays: "3〜5営業日",
    // 通常: 〜4kg=1200, 4-8kg=1500, 8-10kg=1800, 10-14kg=3000, 14-18kg=3300, 18-24kg=3600, 24kg+=3600
    normalRates: [1200, 1500, 1800, 3000, 3300, 3600, 3600],
    // クール: 〜4kg=1530, 4-8kg=1940, 8-10kg=2515, 10-14kg=4045, 14-18kg=4455, 18-24kg=5030, 24kg+=5030
    coolRates:   [1530, 1940, 2515, 4045, 4455, 5030, 5030],
  },
  {
    areaId: "area_n_tohoku_kansai",
    areaName: "北東北・関西エリア",
    prefectures: [
      "青森県", "秋田県", "岩手県",
      "大阪府", "京都府", "滋賀県", "奈良県", "和歌山県", "兵庫県",
    ],
    deliveryDays: "3〜5営業日",
    // 通常: 〜4kg=1300, 4-8kg=1600, 8-10kg=1900, 10-14kg=3200, 14-18kg=3500, 18-24kg=3800, 24kg+=3800
    normalRates: [1300, 1600, 1900, 3200, 3500, 3800, 3800],
    // クール: 〜4kg=1630, 4-8kg=2040, 8-10kg=2615, 10-14kg=4245, 14-18kg=4655, 18-24kg=5230, 24kg+=5230
    coolRates:   [1630, 2040, 2615, 4245, 4655, 5230, 5230],
  },
  {
    areaId: "area_chugoku_shikoku",
    areaName: "中国・四国エリア",
    prefectures: [
      "岡山県", "広島県", "山口県", "鳥取県", "島根県",
      "香川県", "徳島県", "愛媛県", "高知県",
    ],
    deliveryDays: "3〜5営業日",
    // 通常: 〜4kg=1400, 4-8kg=1700, 8-10kg=2100, 10-14kg=3500, 14-18kg=3800, 18-24kg=4200, 24kg+=4200
    normalRates: [1400, 1700, 2100, 3500, 3800, 4200, 4200],
    // クール: 〜4kg=1730, 4-8kg=2140, 8-10kg=2815, 10-14kg=4545, 14-18kg=4955, 18-24kg=5630, 24kg+=5630
    coolRates:   [1730, 2140, 2815, 4545, 4955, 5630, 5630],
  },
  {
    areaId: "area_hokkaido_kyushu",
    areaName: "北海道・九州エリア",
    prefectures: [
      "北海道",
      "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県",
    ],
    deliveryDays: "3〜5営業日",
    // 通常: 〜4kg=1700, 4-8kg=2000, 8-10kg=2300, 10-14kg=4000, 14-18kg=4300, 18-24kg=4600, 24kg+=4600
    normalRates: [1700, 2000, 2300, 4000, 4300, 4600, 4600],
    // クール: 〜4kg=2030, 4-8kg=2440, 8-10kg=3015, 10-14kg=5045, 14-18kg=5455, 18-24kg=6030, 24kg+=6030
    coolRates:   [2030, 2440, 3015, 5045, 5455, 6030, 6030],
  },
  {
    areaId: "area_okinawa",
    areaName: "沖縄エリア",
    prefectures: ["沖縄県"],
    deliveryDays: "3〜5営業日",
    // 通常: 〜4kg=2000, 4-8kg=2700, 8-10kg=3300, 10-14kg=5300, 14-18kg=6000, 18-24kg=6600, 24kg+=6600
    normalRates: [2000, 2700, 3300, 5300, 6000, 6600, 6600],
    // クール: 〜4kg=2330, 4-8kg=3140, 8-10kg=4015, 10-14kg=6345, 14-18kg=7155, 18-24kg=8030, 24kg+=8030
    coolRates:   [2330, 3140, 4015, 6345, 7155, 8030, 8030],
  },
];
