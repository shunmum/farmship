import { useState, useEffect } from "react";
import { DEFAULT_ORDER_CATEGORIES } from "./useOrders";

const STORAGE_KEY = "customOrderCategories";

/**
 * ユーザーが追加した「種別」（のし以外の自由入力）をlocalStorageで保持。
 * 既定値（なし/のし/お中元/お供え/お歳暮）と合わせて返す。
 */
export function useOrderCategories() {
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customCategories));
    } catch {
      // ignore
    }
  }, [customCategories]);

  /** 入力された値を履歴に追加（既存値や既定値と重複しないように） */
  const remember = (value: string) => {
    const v = value.trim();
    if (!v) return;
    if ((DEFAULT_ORDER_CATEGORIES as readonly string[]).includes(v)) return;
    if (customCategories.includes(v)) return;
    setCustomCategories((prev) => [...prev, v]);
  };

  const remove = (value: string) => {
    setCustomCategories((prev) => prev.filter((v) => v !== value));
  };

  const all = [...DEFAULT_ORDER_CATEGORIES, ...customCategories];

  return { all, customCategories, remember, remove };
}
