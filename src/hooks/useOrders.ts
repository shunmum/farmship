// モック版: MockDataContextからデータを取得する
import { useMockData } from "@/contexts/MockDataContext";
import type { Order, OrderStatus, PaymentStatus } from "@/data/mockData";

export type { Order, OrderStatus, PaymentStatus };

export function useOrders() {
  const { orders, addOrder, updateOrder, deleteOrder } = useMockData();

  const handleAddOrder = async (order: Omit<Order, "id">) => {
    addOrder(order);
    return { data: order, error: null };
  };

  const handleUpdateOrder = async (id: string, updates: Partial<Order>) => {
    updateOrder(id, updates);
    return { data: updates, error: null };
  };

  const handleDeleteOrder = async (id: string) => {
    deleteOrder(id);
    return { error: null };
  };

  return {
    orders,
    loading: false,
    error: null,
    addOrder: handleAddOrder,
    updateOrder: handleUpdateOrder,
    deleteOrder: handleDeleteOrder,
    refetch: () => {},
  };
}
