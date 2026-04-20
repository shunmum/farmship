import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Customer, Recipient } from "@/types";

export type { Customer, Recipient };

function toCustomer(row: Record<string, unknown>, recipients: Recipient[] = []): Customer {
  return {
    id: row.id as string,
    name: row.name as string,
    phone: row.phone as string,
    email: (row.email as string) ?? "",
    postalCode: row.postal_code as string,
    address: row.address as string,
    lastPurchaseDate: (row.last_purchase_date as string) ?? undefined,
    totalSpent: (row.total_spent as number) ?? 0,
    memo: (row.memo as string) ?? undefined,
    invoiceType: (row.invoice_type as Customer["invoiceType"]) ?? undefined,
    recipients,
  };
}

function toRecipient(row: Record<string, unknown>): Recipient {
  return {
    id: row.id as string,
    customerId: row.customer_id as string,
    name: row.name as string,
    phone: row.phone as string,
    postalCode: row.postal_code as string,
    address: row.address as string,
    email: (row.email as string) ?? undefined,
    relation: (row.relation as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
  };
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: customersData, error: customersError } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (customersError) throw customersError;

      const { data: recipientsData, error: recipientsError } = await supabase
        .from("recipients")
        .select("*");

      if (recipientsError) throw recipientsError;

      const recipientsByCustomer = (recipientsData ?? []).reduce<Record<string, Recipient[]>>(
        (acc, r) => {
          const cid = r.customer_id;
          if (!acc[cid]) acc[cid] = [];
          acc[cid].push(toRecipient(r as Record<string, unknown>));
          return acc;
        },
        {}
      );

      setCustomers(
        (customersData ?? []).map((c) =>
          toCustomer(c as Record<string, unknown>, recipientsByCustomer[c.id] ?? [])
        )
      );
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(err instanceof Error ? err.message : "顧客データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const addCustomer = async (customer: Omit<Customer, "id" | "recipients">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("customers")
        .insert({
          user_id: user?.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email || null,
          postal_code: customer.postalCode,
          address: customer.address,
          memo: customer.memo || null,
          invoice_type: customer.invoiceType || null,
          last_purchase_date: customer.lastPurchaseDate || null,
          total_spent: customer.totalSpent ?? 0,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchCustomers();
      return { data, error: null };
    } catch (err) {
      console.error("Error adding customer:", err);
      return { data: null, error: err as Error };
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.email !== undefined) dbUpdates.email = updates.email || null;
      if (updates.postalCode !== undefined) dbUpdates.postal_code = updates.postalCode;
      if (updates.address !== undefined) dbUpdates.address = updates.address;
      if (updates.memo !== undefined) dbUpdates.memo = updates.memo || null;
      if (updates.invoiceType !== undefined) dbUpdates.invoice_type = updates.invoiceType || null;
      if (updates.lastPurchaseDate !== undefined) dbUpdates.last_purchase_date = updates.lastPurchaseDate || null;
      if (updates.totalSpent !== undefined) dbUpdates.total_spent = updates.totalSpent;

      const { data, error } = await supabase
        .from("customers")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      await fetchCustomers();
      return { data, error: null };
    } catch (err) {
      console.error("Error updating customer:", err);
      return { data: null, error: err as Error };
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (error) throw error;
      await fetchCustomers();
      return { error: null };
    } catch (err) {
      console.error("Error deleting customer:", err);
      return { error: err as Error };
    }
  };

  const addRecipient = async (recipient: Omit<Recipient, "id">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("recipients")
        .insert({
          user_id: user?.id,
          customer_id: recipient.customerId!,
          name: recipient.name,
          phone: recipient.phone,
          postal_code: recipient.postalCode,
          address: recipient.address,
          email: recipient.email || null,
          relation: recipient.relation || null,
          notes: recipient.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchCustomers();
      return { data, error: null };
    } catch (err) {
      console.error("Error adding recipient:", err);
      return { data: null, error: err as Error };
    }
  };

  const updateRecipient = async (id: string, updates: Partial<Recipient>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.postalCode !== undefined) dbUpdates.postal_code = updates.postalCode;
      if (updates.address !== undefined) dbUpdates.address = updates.address;
      if (updates.email !== undefined) dbUpdates.email = updates.email || null;
      if (updates.relation !== undefined) dbUpdates.relation = updates.relation || null;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;

      const { data, error } = await supabase
        .from("recipients")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      await fetchCustomers();
      return { data, error: null };
    } catch (err) {
      console.error("Error updating recipient:", err);
      return { data: null, error: err as Error };
    }
  };

  const deleteRecipient = async (id: string) => {
    try {
      const { error } = await supabase.from("recipients").delete().eq("id", id);
      if (error) throw error;
      await fetchCustomers();
      return { error: null };
    } catch (err) {
      console.error("Error deleting recipient:", err);
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
    addRecipient,
    updateRecipient,
    deleteRecipient,
    refetch: fetchCustomers,
  };
}
