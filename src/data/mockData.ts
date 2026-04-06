import type { Customer, Recipient, Product, ProductVariant } from "@/types";

export type OrderStatus = "配送前" | "配送済み" | "キャンセル";
export type PaymentStatus = "未入金" | "入金済み";
export type OrderCategory = "のし" | "お中元" | "お供え" | "なし";

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  shippingFee?: number; // 商品ごとの送料
}

export interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  customerId: string;
  customerName: string;
  recipientId?: string;
  recipientName?: string;
  products: OrderItem[];
  amount: number;
  deliveryDate: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingCompany?: string;
  trackingNumber?: string;
  note?: string;
  orderCategory?: OrderCategory;
  isCoolDelivery?: boolean;
}

export const MOCK_PRODUCTS: Product[] = [
  // ぶどう（単品）
  { id: "P001", name: "シャインマスカット", category: "ぶどう", isParent: true },
  { id: "P002", name: "ナガノパープル", category: "ぶどう", isParent: true },
  { id: "P003", name: "スカーレット", category: "ぶどう", isParent: true },
  { id: "P004", name: "サンシャインレッド", category: "ぶどう", isParent: true },
  { id: "P005", name: "ピオーネ", category: "ぶどう", isParent: true },
  { id: "P006", name: "巨峰", category: "ぶどう", isParent: true },
  // ぶどう（セット）
  { id: "P007", name: "スカーレット＆ピオーネ＆シャインマスカット 豪華三色セット", category: "セット", isParent: true },
  { id: "P008", name: "ピオーネ＆シャインマスカット 食べ比べセット", category: "セット", isParent: true },
  { id: "P009", name: "巨峰＆シャインマスカット 食べ比べセット", category: "セット", isParent: true },
  // 桃
  { id: "P010", name: "白桃", category: "桃", isParent: true },
  { id: "P011", name: "白鳳", category: "桃", isParent: true },
  { id: "P012", name: "さくら（白桃系）", category: "桃", isParent: true },
  { id: "P013", name: "なつっこ（白桃系）", category: "桃", isParent: true },
  { id: "P014", name: "おどろき（白桃系）", category: "桃", isParent: true },
];

export const MOCK_PRODUCT_VARIANTS: ProductVariant[] = [
  // シャインマスカット
  { id: "PV001", parentProductId: "P001", product_id: "P001", name: "シャインマスカット 2kg（3〜4房）", price: 4800, size: "60", weight: 2000 },
  { id: "PV002", parentProductId: "P001", product_id: "P001", name: "シャインマスカット 3kg（5〜6房）", price: 7200, size: "80", weight: 3000 },
  { id: "PV003", parentProductId: "P001", product_id: "P001", name: "シャインマスカット 4kg（7〜8房）", price: 9600, size: "80", weight: 4000 },
  { id: "PV004", parentProductId: "P001", product_id: "P001", name: "シャインマスカット 5kg（9〜10房）", price: 12000, size: "100", weight: 5000 },
  // ナガノパープル
  { id: "PV005", parentProductId: "P002", product_id: "P002", name: "ナガノパープル 2kg（3〜4房）", price: 4800, size: "60", weight: 2000 },
  { id: "PV006", parentProductId: "P002", product_id: "P002", name: "ナガノパープル 3kg（5〜6房）", price: 7200, size: "80", weight: 3000 },
  { id: "PV007", parentProductId: "P002", product_id: "P002", name: "ナガノパープル 4kg（7〜8房）", price: 9600, size: "80", weight: 4000 },
  { id: "PV008", parentProductId: "P002", product_id: "P002", name: "ナガノパープル 5kg（9〜10房）", price: 12000, size: "100", weight: 5000 },
  // スカーレット
  { id: "PV009", parentProductId: "P003", product_id: "P003", name: "スカーレット 2kg（3〜4房）", price: 4800, size: "60", weight: 2000 },
  { id: "PV010", parentProductId: "P003", product_id: "P003", name: "スカーレット 3kg（5〜6房）", price: 7200, size: "80", weight: 3000 },
  { id: "PV011", parentProductId: "P003", product_id: "P003", name: "スカーレット 4kg（7〜8房）", price: 9600, size: "80", weight: 4000 },
  { id: "PV012", parentProductId: "P003", product_id: "P003", name: "スカーレット 5kg（9〜10房）", price: 12000, size: "100", weight: 5000 },
  // サンシャインレッド
  { id: "PV013", parentProductId: "P004", product_id: "P004", name: "サンシャインレッド 2kg（3〜4房）", price: 6000, size: "60", weight: 2000 },
  { id: "PV014", parentProductId: "P004", product_id: "P004", name: "サンシャインレッド 3kg（5〜6房）", price: 9000, size: "80", weight: 3000 },
  { id: "PV015", parentProductId: "P004", product_id: "P004", name: "サンシャインレッド 4kg（7〜8房）", price: 12000, size: "80", weight: 4000 },
  { id: "PV016", parentProductId: "P004", product_id: "P004", name: "サンシャインレッド 5kg（9〜10房）", price: 15000, size: "100", weight: 5000 },
  // ピオーネ
  { id: "PV017", parentProductId: "P005", product_id: "P005", name: "ピオーネ 2kg（3〜4房）", price: 3600, size: "60", weight: 2000 },
  { id: "PV018", parentProductId: "P005", product_id: "P005", name: "ピオーネ 3kg（5〜6房）", price: 5400, size: "80", weight: 3000 },
  { id: "PV019", parentProductId: "P005", product_id: "P005", name: "ピオーネ 4kg（7〜8房）", price: 7200, size: "80", weight: 4000 },
  { id: "PV020", parentProductId: "P005", product_id: "P005", name: "ピオーネ 5kg（9〜10房）", price: 9000, size: "100", weight: 5000 },
  // 巨峰
  { id: "PV021", parentProductId: "P006", product_id: "P006", name: "巨峰 2kg（3〜4房）", price: 3600, size: "60", weight: 2000 },
  { id: "PV022", parentProductId: "P006", product_id: "P006", name: "巨峰 3kg（5〜6房）", price: 5400, size: "80", weight: 3000 },
  { id: "PV023", parentProductId: "P006", product_id: "P006", name: "巨峰 4kg（7〜8房）", price: 7200, size: "80", weight: 4000 },
  { id: "PV024", parentProductId: "P006", product_id: "P006", name: "巨峰 5kg（9〜10房）", price: 9000, size: "100", weight: 5000 },
  // 三色セット
  { id: "PV025", parentProductId: "P007", product_id: "P007", name: "三色セット 2kg（3〜4房）", price: 6000, size: "60", weight: 2000 },
  { id: "PV026", parentProductId: "P007", product_id: "P007", name: "三色セット 3kg（5〜6房）", price: 9000, size: "80", weight: 3000 },
  { id: "PV027", parentProductId: "P007", product_id: "P007", name: "三色セット 4kg（7〜8房）", price: 12000, size: "80", weight: 4000 },
  { id: "PV028", parentProductId: "P007", product_id: "P007", name: "三色セット 5kg（9〜10房）", price: 15000, size: "100", weight: 5000 },
  // ピオーネ＆シャインマスカット食べ比べセット
  { id: "PV029", parentProductId: "P008", product_id: "P008", name: "ピオーネ＆シャインマスカット 2kg（3〜4房）", price: 4200, size: "60", weight: 2000 },
  { id: "PV030", parentProductId: "P008", product_id: "P008", name: "ピオーネ＆シャインマスカット 3kg（5〜6房）", price: 6300, size: "80", weight: 3000 },
  { id: "PV031", parentProductId: "P008", product_id: "P008", name: "ピオーネ＆シャインマスカット 4kg（7〜8房）", price: 8400, size: "80", weight: 4000 },
  { id: "PV032", parentProductId: "P008", product_id: "P008", name: "ピオーネ＆シャインマスカット 5kg（9〜10房）", price: 10500, size: "100", weight: 5000 },
  // 巨峰＆シャインマスカット食べ比べセット
  { id: "PV033", parentProductId: "P009", product_id: "P009", name: "巨峰＆シャインマスカット 2kg（3〜4房）", price: 4200, size: "60", weight: 2000 },
  { id: "PV034", parentProductId: "P009", product_id: "P009", name: "巨峰＆シャインマスカット 3kg（5〜6房）", price: 6300, size: "80", weight: 3000 },
  { id: "PV035", parentProductId: "P009", product_id: "P009", name: "巨峰＆シャインマスカット 4kg（7〜8房）", price: 8400, size: "80", weight: 4000 },
  { id: "PV036", parentProductId: "P009", product_id: "P009", name: "巨峰＆シャインマスカット 5kg（9〜10房）", price: 10500, size: "100", weight: 5000 },
  // 白桃
  { id: "PV037", parentProductId: "P010", product_id: "P010", name: "白桃 2kg", price: 2800, size: "60", weight: 2000 },
  { id: "PV038", parentProductId: "P010", product_id: "P010", name: "白桃 3kg", price: 4200, size: "80", weight: 3000 },
  { id: "PV039", parentProductId: "P010", product_id: "P010", name: "白桃 4kg", price: 5600, size: "80", weight: 4000 },
  { id: "PV040", parentProductId: "P010", product_id: "P010", name: "白桃 5kg", price: 7000, size: "100", weight: 5000 },
  // 白鳳
  { id: "PV041", parentProductId: "P011", product_id: "P011", name: "白鳳 2kg", price: 2800, size: "60", weight: 2000 },
  { id: "PV042", parentProductId: "P011", product_id: "P011", name: "白鳳 3kg", price: 4200, size: "80", weight: 3000 },
  { id: "PV043", parentProductId: "P011", product_id: "P011", name: "白鳳 4kg", price: 5600, size: "80", weight: 4000 },
  { id: "PV044", parentProductId: "P011", product_id: "P011", name: "白鳳 5kg", price: 7000, size: "100", weight: 5000 },
  // さくら
  { id: "PV045", parentProductId: "P012", product_id: "P012", name: "さくら 2kg", price: 2800, size: "60", weight: 2000 },
  { id: "PV046", parentProductId: "P012", product_id: "P012", name: "さくら 3kg", price: 4200, size: "80", weight: 3000 },
  { id: "PV047", parentProductId: "P012", product_id: "P012", name: "さくら 4kg", price: 5600, size: "80", weight: 4000 },
  { id: "PV048", parentProductId: "P012", product_id: "P012", name: "さくら 5kg", price: 7000, size: "100", weight: 5000 },
  // なつっこ
  { id: "PV049", parentProductId: "P013", product_id: "P013", name: "なつっこ 2kg", price: 2800, size: "60", weight: 2000 },
  { id: "PV050", parentProductId: "P013", product_id: "P013", name: "なつっこ 3kg", price: 4200, size: "80", weight: 3000 },
  { id: "PV051", parentProductId: "P013", product_id: "P013", name: "なつっこ 4kg", price: 5600, size: "80", weight: 4000 },
  { id: "PV052", parentProductId: "P013", product_id: "P013", name: "なつっこ 5kg", price: 7000, size: "100", weight: 5000 },
  // おどろき
  { id: "PV053", parentProductId: "P014", product_id: "P014", name: "おどろき 2kg", price: 2800, size: "60", weight: 2000 },
  { id: "PV054", parentProductId: "P014", product_id: "P014", name: "おどろき 3kg", price: 4200, size: "80", weight: 3000 },
  { id: "PV055", parentProductId: "P014", product_id: "P014", name: "おどろき 4kg", price: 5600, size: "80", weight: 4000 },
  { id: "PV056", parentProductId: "P014", product_id: "P014", name: "おどろき 5kg", price: 7000, size: "100", weight: 5000 },
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "C001",
    name: "田中 義雄",
    phone: "090-1234-5678",
    email: "tanaka.yoshio@example.com",
    postalCode: "150-0001",
    address: "東京都渋谷区神宮前1-1-1",
    lastPurchaseDate: "2026-03-15",
    totalSpent: 45000,
    memo: "毎年桃の季節に注文あり。丁寧な対応を好まれる。",
    invoiceType: "箱に入れる",
    recipients: [
      {
        id: "R001",
        customerId: "C001",
        name: "田中 花子",
        relation: "娘",
        postalCode: "150-0043",
        address: "東京都渋谷区道玄坂2-1-1",
        phone: "03-1111-2222",
        email: "hanako@example.com",
      },
      {
        id: "R002",
        customerId: "C001",
        name: "佐藤 一郎",
        relation: "友人",
        postalCode: "530-0001",
        address: "大阪府大阪市北区梅田1-1-1",
        phone: "06-3333-4444",
      },
    ],
  },
  {
    id: "C002",
    name: "鈴木 幸子",
    phone: "090-9876-5432",
    email: "suzuki.sachiko@example.com",
    postalCode: "460-0001",
    address: "愛知県名古屋市中区錦1-2-3",
    lastPurchaseDate: "2026-03-12",
    totalSpent: 32500,
    invoiceType: "郵送する",
    recipients: [
      {
        id: "R003",
        customerId: "C002",
        name: "鈴木 太郎",
        relation: "息子",
        postalCode: "460-0008",
        address: "愛知県名古屋市中区栄3-5-1",
        phone: "052-111-2222",
      },
      {
        id: "R004",
        customerId: "C002",
        name: "山本 花",
        relation: "友人",
        postalCode: "220-0001",
        address: "神奈川県横浜市西区みなとみらい2-3-1",
        phone: "045-333-4444",
        email: "hana.yamamoto@example.com",
      },
      {
        id: "R005",
        customerId: "C002",
        name: "伊藤 健",
        relation: "取引先",
        postalCode: "810-0001",
        address: "福岡県福岡市中央区天神1-1-1",
        phone: "092-555-6666",
      },
    ],
  },
  {
    id: "C003",
    name: "山田 正一",
    phone: "080-2345-6789",
    email: "yamada.shoichi@example.com",
    postalCode: "600-8001",
    address: "京都府京都市下京区烏丸通1-1",
    lastPurchaseDate: "2026-03-10",
    totalSpent: 18500,
    invoiceType: "メールで送る",
    recipients: [
      {
        id: "R006",
        customerId: "C003",
        name: "山田 美穂",
        relation: "妻",
        postalCode: "600-8002",
        address: "京都府京都市下京区四条通2-2",
        phone: "075-111-3333",
      },
    ],
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: "O001",
    orderNumber: "ORD-20260301-001",
    orderDate: "2026-03-01",
    customerId: "C001",
    customerName: "田中 義雄",
    recipientId: "R001",
    recipientName: "田中 花子",
    products: [
      { productId: "PV001", productName: "桃 2kg", quantity: 2 },
    ],
    amount: 7000,
    deliveryDate: "2026-03-05",
    status: "配送済み",
    paymentStatus: "入金済み",
    shippingCompany: "ヤマト運輸",
    orderCategory: "のし",
  },
  {
    id: "O002",
    orderNumber: "ORD-20260305-001",
    orderDate: "2026-03-05",
    customerId: "C002",
    customerName: "鈴木 幸子",
    recipientId: "R003",
    recipientName: "鈴木 太郎",
    products: [
      { productId: "PV002", productName: "桃 3kg", quantity: 1 },
      { productId: "PV003", productName: "ぶどう 1房", quantity: 2 },
    ],
    amount: 10000,
    deliveryDate: "2026-03-10",
    status: "配送済み",
    paymentStatus: "未入金",
    shippingCompany: "佐川急便",
    orderCategory: "お供え",
  },
  {
    id: "O003",
    orderNumber: "ORD-20260310-001",
    orderDate: "2026-03-10",
    customerId: "C001",
    customerName: "田中 義雄",
    recipientId: "R002",
    recipientName: "佐藤 一郎",
    products: [
      { productId: "PV004", productName: "ぶどう 2房", quantity: 1 },
    ],
    amount: 4500,
    deliveryDate: "2026-03-18",
    status: "配送前",
    paymentStatus: "未入金",
    shippingCompany: "ヤマト運輸",
    orderCategory: "お中元",
  },
  {
    id: "O004",
    orderNumber: "ORD-20260312-001",
    orderDate: "2026-03-12",
    customerId: "C002",
    customerName: "鈴木 幸子",
    recipientId: "R004",
    recipientName: "山本 花",
    products: [
      { productId: "PV001", productName: "桃 2kg", quantity: 3 },
    ],
    amount: 10500,
    deliveryDate: "2026-03-20",
    status: "配送前",
    paymentStatus: "未入金",
    shippingCompany: "ゆうパック",
  },
  {
    id: "O005",
    orderNumber: "ORD-20260315-001",
    orderDate: "2026-03-15",
    customerId: "C003",
    customerName: "山田 正一",
    recipientId: "R006",
    recipientName: "山田 美穂",
    products: [
      { productId: "PV002", productName: "桃 3kg", quantity: 2 },
    ],
    amount: 10000,
    deliveryDate: "2026-03-22",
    status: "配送前",
    paymentStatus: "入金済み",
    shippingCompany: "ヤマト運輸",
  },
  {
    id: "O006",
    orderNumber: "ORD-20260316-001",
    orderDate: "2026-03-16",
    customerId: "C001",
    customerName: "田中 義雄",
    recipientId: "R001",
    recipientName: "田中 花子",
    products: [
      { productId: "PV003", productName: "ぶどう 1房", quantity: 3 },
    ],
    amount: 7500,
    deliveryDate: "2026-03-23",
    status: "配送前",
    paymentStatus: "未入金",
    shippingCompany: "ヤマト運輸",
  },
  {
    id: "O007",
    orderNumber: "ORD-20260318-001",
    orderDate: "2026-03-18",
    customerId: "C002",
    customerName: "鈴木 幸子",
    recipientId: "R005",
    recipientName: "伊藤 健",
    products: [
      { productId: "PV002", productName: "桃 3kg", quantity: 1 },
      { productId: "PV004", productName: "ぶどう 2房", quantity: 1 },
    ],
    amount: 9500,
    deliveryDate: "2026-03-25",
    status: "配送前",
    paymentStatus: "未入金",
    shippingCompany: "佐川急便",
  },
];
