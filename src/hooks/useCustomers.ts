// モック版: MockDataContextからデータを取得する
import { useMockData } from "@/contexts/MockDataContext";
import type { Customer, Recipient } from "@/types";

export type { Customer, Recipient };

export function useCustomers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useMockData();

  const handleAddCustomer = async (customer: Omit<Customer, "id" | "recipients">) => {
    addCustomer(customer);
    return { data: customer, error: null };
  };

  const handleUpdateCustomer = async (id: string, updates: Partial<Customer>) => {
    updateCustomer(id, updates);
    return { data: updates, error: null };
  };

  const handleDeleteCustomer = async (id: string) => {
    deleteCustomer(id);
    return { error: null };
  };

  return {
    customers,
    loading: false,
    error: null,
    addCustomer: handleAddCustomer,
    updateCustomer: handleUpdateCustomer,
    deleteCustomer: handleDeleteCustomer,
    refetch: () => {},
  };
}
