import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lookupZipcode } from "@/hooks/useZipcode";

interface PostalCodeInputProps {
  /** ラベルテキスト（省略時: "郵便番号"） */
  label?: string;
  value: string;
  onChange: (zip: string) => void;
  /** 住所が取得できたときに呼ばれる */
  onAddressFill: (address: string) => void;
  placeholder?: string;
}

/**
 * 郵便番号入力コンポーネント
 * 7桁入力されると zipcloud API を叩いて住所を自動入力する
 */
export function PostalCodeInput({
  label = "郵便番号",
  value,
  onChange,
  onAddressFill,
  placeholder = "例: 150-0001",
}: PostalCodeInputProps) {
  const [loading, setLoading] = useState(false);
  const [filled, setFilled] = useState(false);

  const handleChange = async (zip: string) => {
    onChange(zip);
    setFilled(false);

    const cleaned = zip.replace(/-/g, "");
    if (cleaned.length === 7 && /^\d{7}$/.test(cleaned)) {
      setLoading(true);
      const address = await lookupZipcode(cleaned);
      setLoading(false);
      if (address) {
        onAddressFill(address);
        setFilled(true);
        // 1.5秒後にフィード済みアイコンを消す
        setTimeout(() => setFilled(false), 1500);
      }
    }
  };

  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          maxLength={8}
          className="pr-8"
        />
        {/* ローディングスピナー */}
        {loading && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-3.5 w-3.5 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}
        {/* 入力完了チェック */}
        {filled && !loading && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-500 text-xs font-bold">
            ✓
          </div>
        )}
      </div>
    </div>
  );
}
