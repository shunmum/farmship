import { useState } from 'react';

export type ShippingCarrier = 'yamato' | 'sagawa' | 'yupack';

export interface ShippingRate {
  id: string;
  carrier: ShippingCarrier;
  size: string;
  basePrice: number;
  coolPrice: number;
}

export interface ConsolidationRule {
  id: string;
  name: string;
  fromSize: string;
  quantity: number;
  toSize: string;
  enabled: boolean;
}

// テーブルがまだ存在しないため、ローカルステートで管理
export function useShippingSettings() {
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [consolidationRules, setConsolidationRules] = useState<ConsolidationRule[]>([]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const fetchShippingSettings = async () => {
    // データベースにテーブルがないため何もしない
  };

  const addShippingRate = async (rate: Omit<ShippingRate, 'id'>) => {
    const newRate = { ...rate, id: crypto.randomUUID() };
    setShippingRates((prev) => [...prev, newRate]);
    return { data: newRate, error: null };
  };

  const updateShippingRate = async (id: string, updates: Partial<ShippingRate>) => {
    setShippingRates((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
    return { data: updates, error: null };
  };

  const deleteShippingRate = async (id: string) => {
    setShippingRates((prev) => prev.filter((r) => r.id !== id));
    return { error: null };
  };

  const addConsolidationRule = async (rule: Omit<ConsolidationRule, 'id'>) => {
    const newRule = { ...rule, id: crypto.randomUUID() };
    setConsolidationRules((prev) => [...prev, newRule]);
    return { data: newRule, error: null };
  };

  const updateConsolidationRule = async (id: string, updates: Partial<ConsolidationRule>) => {
    setConsolidationRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
    return { data: updates, error: null };
  };

  const deleteConsolidationRule = async (id: string) => {
    setConsolidationRules((prev) => prev.filter((r) => r.id !== id));
    return { error: null };
  };

  return {
    shippingRates,
    consolidationRules,
    loading,
    error,
    addShippingRate,
    updateShippingRate,
    deleteShippingRate,
    addConsolidationRule,
    updateConsolidationRule,
    deleteConsolidationRule,
    refetch: fetchShippingSettings,
  };
}
