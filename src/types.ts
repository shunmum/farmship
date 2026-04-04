export interface Recipient {
  id: string;
  customerId?: string;
  name: string;
  phone: string;
  postalCode: string;
  address: string;
  email?: string;
  relation?: string;
}

export type InvoiceType = "箱に入れる" | "郵送する" | "メールで送る";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  postalCode: string;
  address: string;
  lastPurchaseDate?: string;
  totalSpent?: number;
  recipients?: Recipient[];
  memo?: string;
  invoiceType?: InvoiceType;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  isParent: boolean;
  is_active?: boolean;
  price?: number;
  size?: string;
  weight?: number;
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
}
