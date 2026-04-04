import type { Customer, Recipient, Product, ProductVariant } from "@/types";

export type OrderStatus = "配送前" | "配送済み" | "キャンセル";
export type PaymentStatus = "未入金" | "入金済み";
export type OrderCategory = "のし" | "お中元" | "お供え" | "なし";

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
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
}

export const MOCK_PRODUCTS: Product[] = [
  { id: "P001", name: "桃", category: "果物", isParent: true },
  { id: "P002", name: "ぶどう", category: "果物", isParent: true },
];

export const MOCK_PRODUCT_VARIANTS: ProductVariant[] = [
  { id: "PV001", parentProductId: "P001", product_id: "P001", name: "桃 2kg", price: 3500, size: "60", weight: 2000 },
  { id: "PV002", parentProductId: "P001", product_id: "P001", name: "桃 3kg", price: 5000, size: "80", weight: 3000 },
  { id: "PV003", parentProductId: "P002", product_id: "P002", name: "ぶどう 1房", price: 2500, size: "60", weight: 500 },
  { id: "PV004", parentProductId: "P002", product_id: "P002", name: "ぶどう 2房", price: 4500, size: "80", weight: 1000 },
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
