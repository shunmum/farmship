import { useState, useEffect } from 'react';

export interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  customerId: string;
  customerName: string;
  products: { productId: string; productName: string; quantity: number }[];
  amount: number;
  deliveryDate: string;
  status: '未発送' | '発送済み' | '配達完了' | 'キャンセル';
  shippingCompany?: string;
  trackingNumber?: string;
}

// ordersテーブルがまだ存在しないため、ローカルステートで管理
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    // データベースにordersテーブルがないため、空配列を返す
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const addOrder = async (
    order: Omit<Order, 'id'>,
    _customerId: string
  ) => {
    const newOrder: Order = {
      ...order,
      id: crypto.randomUUID(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    return { data: newOrder, error: null };
  };

  const updateOrder = async (id: string, updates: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, ...updates } : order))
    );
    return { data: updates, error: null };
  };

  const deleteOrder = async (id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
    return { error: null };
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
