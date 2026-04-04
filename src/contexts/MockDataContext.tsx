import React, { createContext, useContext, useState } from "react";
import {
  MOCK_CUSTOMERS,
  MOCK_ORDERS,
  MOCK_PRODUCTS,
  MOCK_PRODUCT_VARIANTS,
  type Order,
} from "@/data/mockData";
import type { Customer, Recipient, Product, ProductVariant } from "@/types";

interface MockDataContextType {
  customers: Customer[];
  orders: Order[];
  products: Product[];
  productVariants: ProductVariant[];
  addCustomer: (customer: Omit<Customer, "id" | "recipients">) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addOrder: (order: Omit<Order, "id">) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
}

const MockDataContext = createContext<MockDataContextType | null>(null);

export function MockDataProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const products = MOCK_PRODUCTS;
  const productVariants = MOCK_PRODUCT_VARIANTS;

  const addCustomer = (customer: Omit<Customer, "id" | "recipients">) => {
    const newCustomer: Customer = {
      ...customer,
      id: `C${Date.now()}`,
      lastPurchaseDate: "",
      totalSpent: 0,
      recipients: [],
    };
    setCustomers((prev) => [newCustomer, ...prev]);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const addOrder = (order: Omit<Order, "id">) => {
    const newOrder: Order = { ...order, id: `O${Date.now()}` };
    setOrders((prev) => [newOrder, ...prev]);

    // 顧客の購入情報を更新
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === order.customerId) {
          return {
            ...c,
            totalSpent: (c.totalSpent || 0) + order.amount,
            lastPurchaseDate: order.orderDate,
          };
        }
        return c;
      })
    );
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o))
    );
  };

  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <MockDataContext.Provider
      value={{
        customers,
        orders,
        products,
        productVariants,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addOrder,
        updateOrder,
        deleteOrder,
      }}
    >
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData() {
  const ctx = useContext(MockDataContext);
  if (!ctx) throw new Error("useMockData must be used within MockDataProvider");
  return ctx;
}
