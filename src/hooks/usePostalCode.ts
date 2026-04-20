import { useState, useCallback } from "react";

interface PostalResult {
  address: string;
  prefecture: string;
}

export function usePostalCode() {
  const [suggestion, setSuggestion] = useState<PostalResult | null>(null);
  const [looking, setLooking] = useState(false);

  const lookup = useCallback(async (postalCode: string) => {
    const digits = postalCode.replace(/[^0-9]/g, "");
    if (digits.length !== 7) {
      setSuggestion(null);
      return;
    }
    setLooking(true);
    try {
      const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${digits}`);
      const json = await res.json();
      if (json.results && json.results[0]) {
        const r = json.results[0];
        const address = `${r.address1}${r.address2}${r.address3}`;
        setSuggestion({ address, prefecture: r.address1 });
      } else {
        setSuggestion(null);
      }
    } catch {
      setSuggestion(null);
    } finally {
      setLooking(false);
    }
  }, []);

  const clear = useCallback(() => setSuggestion(null), []);

  return { suggestion, looking, lookup, clear };
}
