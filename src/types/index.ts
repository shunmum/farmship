// 共通型定義

// ============================================
// 顧客関連
// ============================================

export interface Customer {
  id: string;
  name: string;
  furigana?: string;
  groupName?: string;
  address: string;
  postalCode: string;
  phone: string;
  mobilePhone?: string;
  email: string;
  lastPurchaseDate: string;
  totalSpent: number;
  recipients?: Recipient[];
}

export interface Recipient {
  id: string;
  customerId?: string;
  name: string;
  furigana?: string;
  address: string;
  postalCode: string;
  phone: string;
  mobilePhone?: string;
  email?: string;
  relation?: string;
  notes?: string;
}

// ============================================
// 商品関連
// ============================================

export interface Product {
  id: string;
  user_id?: string;
  name: string;
  category: string;
  description?: string;
  isParent: boolean;
  price?: number;
  size?: string;
  weight?: number;
  image_url?: string;
  is_active?: boolean;
}

export interface ProductVariant {
  id: string;
  parentProductId: string;
  product_id?: string;
  name: string;
  price: number;
  size: string;
  weight: number;
  sku?: string;
  stock?: number;
}

// ============================================
// 受注関連
// ============================================

export const ORDER_STATUSES = {
  unshipped: '未発送',
  shipped: '発送済み',
  delivered: '配達完了',
  cancelled: 'キャンセル',
} as const;

export type OrderStatusKey = keyof typeof ORDER_STATUSES;
export type OrderStatusValue = typeof ORDER_STATUSES[OrderStatusKey];

export interface OrderProduct {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  customerId: string;
  customerName: string;
  products: OrderProduct[];
  amount: number;
  deliveryDate: string;
  status: OrderStatusValue;
  shippingCompany?: string;
  trackingNumber?: string;
}

// ============================================
// 配送関連
// ============================================

export const CARRIERS = {
  yamato: 'ヤマト運輸',
  sagawa: '佐川急便',
  yupack: 'ゆうパック',
} as const;

export type CarrierKey = keyof typeof CARRIERS;
export type CarrierName = typeof CARRIERS[CarrierKey];

export const SHIPPING_SIZES = [60, 80, 100, 120, 140, 160] as const;
export type ShippingSize = typeof SHIPPING_SIZES[number];

export const SHIPPING_MODES = {
  flat_rate: '全国一律',
  prefecture: '都道府県別',
  zone: 'ゾーン制',
} as const;

export type ShippingModeKey = keyof typeof SHIPPING_MODES;
export type ShippingModeName = typeof SHIPPING_MODES[ShippingModeKey];

export interface ShippingRate {
  id: string;
  user_id: string;
  carrier: CarrierKey;
  size: ShippingSize;
  base_rate: number;
  cool_fee: number;
}

export interface PrefectureShippingRate extends ShippingRate {
  prefecture: string;
}

export interface ShippingZone {
  id: string;
  user_id: string;
  name: string;
  display_order: number;
}

export interface PrefectureZone {
  id: string;
  zone_id: string;
  prefecture: string;
}

export interface ZoneShippingRate {
  id: string;
  zone_id: string;
  carrier: CarrierKey;
  size: ShippingSize;
  base_rate: number;
  cool_fee: number;
}

export interface ConsolidationRule {
  id: string;
  user_id: string;
  from_size: ShippingSize;
  from_quantity: number;
  to_size: ShippingSize;
  to_quantity: number;
  priority: number;
}

export interface ShippingModeSettings {
  id: string;
  user_id: string;
  mode: ShippingModeKey;
}

// ============================================
// 公開注文フォーム関連
// ============================================

export interface PublicOrderForm {
  id: string;
  user_id: string;
  slug: string;
  display_name: string;
  description?: string;
  logo_url?: string;
  is_active: boolean;
}

export const PAYMENT_STATUSES = {
  pending: '未決済',
  completed: '決済完了',
  failed: '決済失敗',
} as const;

export type PaymentStatusKey = keyof typeof PAYMENT_STATUSES;
export type PaymentStatusValue = typeof PAYMENT_STATUSES[PaymentStatusKey];

export interface PublicOrder {
  id: string;
  form_id: string;
  user_id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  total_amount: number;
  shipping_fee: number;
  payment_status: PaymentStatusKey;
  payment_intent_id?: string;
  notes?: string;
  created_at: string;
}

export interface PublicOrderRecipient {
  id: string;
  public_order_id: string;
  name: string;
  phone?: string;
  postal_code?: string;
  prefecture: string;
  city: string;
  address_line: string;
}

export interface PublicOrderItem {
  id: string;
  public_order_id: string;
  recipient_id: string;
  product_id?: string;
  product_variant_id?: string;
  product_name: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

// ============================================
// 作業日誌関連
// ============================================

export const WORK_LOG_INPUT_TYPES = {
  manual: '手動入力',
  ai_chat: 'AI会話入力',
} as const;

export type WorkLogInputType = keyof typeof WORK_LOG_INPUT_TYPES;

export interface WorkLog {
  id: string;
  user_id: string;
  work_date: string;
  field: string;
  work_type: string;
  harvest?: string;
  materials?: string;
  notes?: string;
  photo_url?: string;
  input_type: WorkLogInputType;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// 認証関連
// ============================================

export interface UserProfile {
  id: string;
  farm_name: string;
  email: string;
  phone?: string;
  postal_code?: string;
  prefecture?: string;
  city?: string;
  address_line?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// API関連
// ============================================

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// フォーム関連
// ============================================

export interface FormFieldError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: FormFieldError[];
  isSubmitting: boolean;
  isDirty: boolean;
}
