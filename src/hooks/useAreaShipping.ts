import { useState } from "react";
import { DEFAULT_AREA_SHIPPING_RATES, type AreaShippingRates, WEIGHT_TIERS } from "@/data/areaShippingRates";

const STORAGE_KEY = "areaShippingRates";

function loadFromStorage(): AreaShippingRates[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_AREA_SHIPPING_RATES;
    const parsed: AreaShippingRates[] = JSON.parse(stored);
    // デフォルトに存在するエリアがない場合は追加
    const merged = [...parsed];
    for (const def of DEFAULT_AREA_SHIPPING_RATES) {
      if (!merged.find((r) => r.areaId === def.areaId)) {
        merged.push(def);
      }
    }
    return merged;
  } catch {
    return DEFAULT_AREA_SHIPPING_RATES;
  }
}

export function useAreaShipping() {
  const [rates, setRates] = useState<AreaShippingRates[]>(() => loadFromStorage());

  const save = (updated: AreaShippingRates[]) => {
    setRates(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const updateAreaRates = (areaId: string, updates: Partial<Pick<AreaShippingRates, "normalRates" | "coolRates">>) => {
    const updated = rates.map((r) => (r.areaId === areaId ? { ...r, ...updates } : r));
    save(updated);
  };

  /**
   * 重量（kg）と配送タイプからエリアの送料を取得
   */
  const getShippingFee = (areaId: string, weightKg: number, isCool: boolean): number | null => {
    const area = rates.find((r) => r.areaId === areaId);
    if (!area) return null;
    const tierIndex = WEIGHT_TIERS.findIndex(
      (t) => weightKg >= t.from && (t.to === null || weightKg < t.to)
    );
    if (tierIndex < 0) return null;
    return isCool ? area.coolRates[tierIndex] : area.normalRates[tierIndex];
  };

  /**
   * 都道府県名からエリアIDを取得
   */
  const getAreaByPrefecture = (prefecture: string): AreaShippingRates | null => {
    return rates.find((r) => r.prefectures.includes(prefecture)) ?? null;
  };

  return { rates, updateAreaRates, getShippingFee, getAreaByPrefecture };
}
