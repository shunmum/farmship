import { useState, useCallback } from "react";

interface PostalResult {
  address: string;
  prefecture: string;
}

export function usePostalCode() {
  const [suggestion, setSuggestion] = useState<PostalResult | null>(null);
  const [looking, setLooking] = useState(false);

  const lookup = useCallback(async (postalCode: string): Promise<PostalResult | null> => {
    const digits = postalCode.replace(/[^0-9]/g, "");
    if (digits.length !== 7) {
      setSuggestion(null);
      return null;
    }
    setLooking(true);
    try {
      const res = await fetch(`/api/zipcode?zipcode=${digits}`);
      const json = await res.json();
      if (json.results && json.results[0]) {
        const r = json.results[0];
        const address = `${r.address1}${r.address2}${r.address3}`;
        const result = { address, prefecture: r.address1 };
        setSuggestion(result);
        return result;
      } else {
        setSuggestion(null);
        return null;
      }
    } catch {
      setSuggestion(null);
      return null;
    } finally {
      setLooking(false);
    }
  }, []);

  const clear = useCallback(() => setSuggestion(null), []);

  return { suggestion, looking, lookup, clear };
}
