import { useState } from 'react';
import { type ShippingCarrier } from './useShippingSettings';

export type ShippingMode = 'flat_rate' | 'prefecture' | 'zone';

export interface ShippingModeSetting {
  id: string;
  mode: ShippingMode;
}

export interface ShippingZone {
  id: string;
  name: string;
  displayOrder: number;
}

export interface PrefectureZone {
  id: string;
  prefecture: string;
  zoneId: string;
  zoneName?: string;
}

export interface ZoneShippingRate {
  id: string;
  zoneId: string;
  carrier: ShippingCarrier;
  size: string;
  basePrice: number;
  coolPrice: number;
}

export interface PrefectureShippingRate {
  id: string;
  prefecture: string;
  carrier: ShippingCarrier;
  size: string;
  basePrice: number;
  coolPrice: number;
}

// 47都道府県のリスト
export const PREFECTURES = [
  '北海道',
  '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
  '岐阜県', '静岡県', '愛知県', '三重県',
  '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

// テーブルがまだ存在しないため、ローカルステートで管理
export function useShippingCalculation() {
  const [modeSetting, setModeSetting] = useState<ShippingModeSetting>({
    id: '1',
    mode: 'flat_rate',
  });
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [prefectureZones, setPrefectureZones] = useState<PrefectureZone[]>([]);
  const [zoneRates, setZoneRates] = useState<ZoneShippingRate[]>([]);
  const [prefectureRates, setPrefectureRates] = useState<PrefectureShippingRate[]>([]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const fetchAll = async () => {
    // データベースにテーブルがないため何もしない
  };

  // モード変更
  const updateMode = async (mode: ShippingMode) => {
    setModeSetting({ ...modeSetting, mode });
    return { data: { mode }, error: null };
  };

  // ゾーンCRUD
  const addZone = async (zone: Omit<ShippingZone, 'id'>) => {
    const newZone = { ...zone, id: crypto.randomUUID() };
    setZones((prev) => [...prev, newZone]);
    return { data: newZone, error: null };
  };

  const updateZone = async (id: string, updates: Partial<ShippingZone>) => {
    setZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, ...updates } : z))
    );
    return { data: updates, error: null };
  };

  const deleteZone = async (id: string) => {
    setZones((prev) => prev.filter((z) => z.id !== id));
    return { error: null };
  };

  // 都道府県ゾーンマッピングCRUD
  const setPrefectureZone = async (prefecture: string, zoneId: string) => {
    const newPz = { id: crypto.randomUUID(), prefecture, zoneId };
    setPrefectureZones((prev) => {
      const filtered = prev.filter((pz) => pz.prefecture !== prefecture);
      return [...filtered, newPz];
    });
    return { data: newPz, error: null };
  };

  // ゾーン別送料CRUD
  const addZoneRate = async (rate: Omit<ZoneShippingRate, 'id'>) => {
    const newRate = { ...rate, id: crypto.randomUUID() };
    setZoneRates((prev) => [...prev, newRate]);
    return { data: newRate, error: null };
  };

  const updateZoneRate = async (id: string, updates: Partial<ZoneShippingRate>) => {
    setZoneRates((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
    return { data: updates, error: null };
  };

  const deleteZoneRate = async (id: string) => {
    setZoneRates((prev) => prev.filter((r) => r.id !== id));
    return { error: null };
  };

  // 都道府県別送料CRUD
  const addPrefectureRate = async (rate: Omit<PrefectureShippingRate, 'id'>) => {
    const newRate = { ...rate, id: crypto.randomUUID() };
    setPrefectureRates((prev) => [...prev, newRate]);
    return { data: newRate, error: null };
  };

  const updatePrefectureRate = async (id: string, updates: Partial<PrefectureShippingRate>) => {
    setPrefectureRates((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
    return { data: updates, error: null };
  };

  const deletePrefectureRate = async (id: string) => {
    setPrefectureRates((prev) => prev.filter((r) => r.id !== id));
    return { error: null };
  };

  return {
    modeSetting,
    zones,
    prefectureZones,
    zoneRates,
    prefectureRates,
    loading,
    error,
    updateMode,
    addZone,
    updateZone,
    deleteZone,
    setPrefectureZone,
    addZoneRate,
    updateZoneRate,
    deleteZoneRate,
    addPrefectureRate,
    updatePrefectureRate,
    deletePrefectureRate,
    refetch: fetchAll,
  };
}
