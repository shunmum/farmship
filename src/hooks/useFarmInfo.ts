import { useState } from "react";

export interface FarmInfo {
  name: string;
  postalCode: string;
  address: string;
  phone: string;
  email: string;
  bankName: string;
  bankBranch: string;
  bankType: "普通" | "当座";
  bankNumber: string;
  bankHolder: string;
  paymentDueDays: number;
  taxRate: number;
  taxMode: "外税" | "内税"; // 外税 = 商品価格に消費税を加算 / 内税 = 商品価格に税込
  invoiceNote: string;
  invoicePrefix: string;
  invoiceRegistrationNumber: string;
}

const DEFAULT_FARM_INFO: FarmInfo = {
  name: (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_FARM_NAME) || "農園名",
  postalCode: "",
  address: "",
  phone: "",
  email: "",
  bankName: "",
  bankBranch: "",
  bankType: "普通",
  bankNumber: "",
  bankHolder: "",
  paymentDueDays: 30,
  taxRate: 10,
  taxMode: "外税",
  invoiceNote: "上記の通りご請求申し上げます。\nお手数ですが、期日までに上記口座へお振込みをお願いいたします。",
  invoicePrefix: "INV",
  invoiceRegistrationNumber: "",
};

const STORAGE_KEY = "farmInfo";

export function useFarmInfo() {
  const [farmInfo, setFarmInfo] = useState<FarmInfo>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_FARM_INFO, ...JSON.parse(stored) } : DEFAULT_FARM_INFO;
    } catch {
      return DEFAULT_FARM_INFO;
    }
  });

  const saveFarmInfo = (info: FarmInfo) => {
    setFarmInfo(info);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
  };

  return { farmInfo, saveFarmInfo };
}
