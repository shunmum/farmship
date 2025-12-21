import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export interface Recipient {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  phone: string;
  email?: string;
  relation?: string;
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  phone: string;
  email: string;
  lastPurchaseDate: string;
  totalSpent: number;
  recipients?: Recipient[];
}

type CustomerRow = Tables<'customers'>;

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      // 顧客データを取得
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (customersError) throw customersError;

      const mappedCustomers: Customer[] = (customersData || []).map((customer: CustomerRow) => ({
        id: customer.id,
        name: customer.name,
        address: customer.address,
        postalCode: customer.postal_code,
        phone: customer.phone,
        email: customer.email || '',
        lastPurchaseDate: '',
        totalSpent: 0,
        recipients: [],
      }));

      setCustomers(mappedCustomers);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const addCustomer = async (customer: Omit<Customer, 'id' | 'lastPurchaseDate' | 'totalSpent' | 'recipients'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: customer.name,
          address: customer.address,
          postal_code: customer.postalCode,
          phone: customer.phone,
          email: customer.email,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchCustomers();
      return { data, error: null };
    } catch (err) {
      console.error('Error adding customer:', err);
      return { data: null, error: err as Error };
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          name: updates.name,
          address: updates.address,
          postal_code: updates.postalCode,
          phone: updates.phone,
          email: updates.email,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchCustomers();
      return { data, error: null };
    } catch (err) {
      console.error('Error updating customer:', err);
      return { data: null, error: err as Error };
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchCustomers();
      return { error: null };
    } catch (err) {
      console.error('Error deleting customer:', err);
      return { error: err as Error };
    }
  };

  return {
    customers,
    loading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    refetch: fetchCustomers,
  };
}
