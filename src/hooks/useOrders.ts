import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type OrderStatus = "配送前" | "配送済み" | "キャンセル";
export type PaymentStatus = "未入金" | "入金済み";
export type OrderCategory = "のし" | "お中元" | "お供え" | "なし";

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  shippingFee?: number;
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

function toOrder(row: Record<string, unknown>, items: OrderItem[] = []): Order {
  return {
    id: row.id as string,
    orderNumber: row.order_number as string,
    orderDate: row.order_date as string,
    customerId: row.customer_id as string,
    customerName: row.customer_name as string,
    recipientId: (row.recipient_id as string) ?? undefined,
    recipientName: (row.recipient_name as string) ?? undefined,
    products: items,
    amount: row.amount as number,
    deliveryDate: (row.delivery_date as string) ?? "",
    status: (row.status as OrderStatus) ?? "配送前",
    paymentStatus: (row.payment_status as PaymentStatus) ?? "未入金",
    shippingCompany: (row.shipping_company as string) ?? undefined,
    trackingNumber: (row.tracking_number as string) ?? undefined,
    note: (row.note as string) ?? undefined,
    orderCategory: (row.order_category as OrderCategory) ?? undefined,
    isCoolDelivery: (row.is_cool_delivery as boolean) ?? false,
  };
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("order_date", { ascending: false });

      if (ordersError) throw ordersError;

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        return;
      }

      const orderIds = ordersData.map((o) => o.id);
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);

      if (itemsError) throw itemsError;

      const itemsByOrder = (itemsData ?? []).reduce<Record<string, OrderItem[]>>((acc, item) => {
        const oid = item.order_id;
        if (!acc[oid]) acc[oid] = [];
        acc[oid].push({
          productId: item.product_id ?? item.product_variant_id ?? "",
          productName: item.product_name,
          quantity: item.quantity,
          shippingFee: item.shipping_fee ?? undefined,
        });
        return acc;
      }, {});

      setOrders(
        ordersData.map((o) =>
          toOrder(o as Record<string, unknown>, itemsByOrder[o.id] ?? [])
        )
      );
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err instanceof Error ? err.message : "受注データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const addOrder = async (order: Omit<Order, "id">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id,
          order_number: order.orderNumber,
          order_date: order.orderDate,
          customer_id: order.customerId,
          customer_name: order.customerName,
          recipient_id: order.recipientId || null,
          recipient_name: order.recipientName || null,
          amount: order.amount,
          delivery_date: order.deliveryDate || null,
          status: order.status,
          payment_status: order.paymentStatus,
          shipping_company: order.shippingCompany || null,
          tracking_number: order.trackingNumber || null,
          note: order.note || null,
          order_category: order.orderCategory || null,
          is_cool_delivery: order.isCoolDelivery ?? false,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      if (order.products && order.products.length > 0) {
        const { error: itemsError } = await supabase.from("order_items").insert(
          order.products.map((p) => ({
            user_id: user?.id,
            order_id: orderData.id,
            product_name: p.productName,
            quantity: p.quantity,
            shipping_fee: p.shippingFee ?? null,
          }))
        );
        if (itemsError) throw itemsError;
      }

      await fetchOrders();
      return { data: orderData, error: null };
    } catch (err) {
      console.error("Error adding order:", err);
      return { data: null, error: err as Error };
    }
  };

  const updateOrder = async (id: string, updates: Partial<Order>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.orderNumber !== undefined) dbUpdates.order_number = updates.orderNumber;
      if (updates.orderDate !== undefined) dbUpdates.order_date = updates.orderDate;
      if (updates.customerId !== undefined) dbUpdates.customer_id = updates.customerId;
      if (updates.customerName !== undefined) dbUpdates.customer_name = updates.customerName;
      if (updates.recipientId !== undefined) dbUpdates.recipient_id = updates.recipientId || null;
      if (updates.recipientName !== undefined) dbUpdates.recipient_name = updates.recipientName || null;
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
      if (updates.deliveryDate !== undefined) dbUpdates.delivery_date = updates.deliveryDate || null;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus;
      if (updates.shippingCompany !== undefined) dbUpdates.shipping_company = updates.shippingCompany || null;
      if (updates.trackingNumber !== undefined) dbUpdates.tracking_number = updates.trackingNumber || null;
      if (updates.note !== undefined) dbUpdates.note = updates.note || null;
      if (updates.orderCategory !== undefined) dbUpdates.order_category = updates.orderCategory || null;
      if (updates.isCoolDelivery !== undefined) dbUpdates.is_cool_delivery = updates.isCoolDelivery;

      const { data, error } = await supabase
        .from("orders")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      if (updates.products !== undefined) {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("order_items").delete().eq("order_id", id);
        if (updates.products.length > 0) {
          const { error: itemsError } = await supabase.from("order_items").insert(
            updates.products.map((p) => ({
              user_id: user?.id,
              order_id: id,
              product_name: p.productName,
              quantity: p.quantity,
              shipping_fee: p.shippingFee ?? null,
            }))
          );
          if (itemsError) throw itemsError;
        }
      }

      await fetchOrders();
      return { data, error: null };
    } catch (err) {
      console.error("Error updating order:", err);
      return { data: null, error: err as Error };
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (error) throw error;
      await fetchOrders();
      return { error: null };
    } catch (err) {
      console.error("Error deleting order:", err);
      return { error: err as Error };
    }
  };

  return {
    orders,
    loading,
    error,
    addOrder,
    updateOrder,
    deleteOrder,
    refetch: fetchOrders,
  };
}
