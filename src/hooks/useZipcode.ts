/**
 * 郵便番号 → 住所変換（zipcloud API）
 * 無料・登録不要・無制限
 * https://zipcloud.ibsnet.co.jp/
 */

export interface ZipcodeResult {
  address1: string; // 都道府県
  address2: string; // 市区町村
  address3: string; // 町域
}

/**
 * 郵便番号から住所文字列を返す
 * @param zip ハイフンあり・なし どちらでも可
 * @returns "都道府県市区町村町域" または null（見つからない・エラー時）
 */
export async function lookupZipcode(zip: string): Promise<string | null> {
  const cleaned = zip.replace(/-/g, "");
  if (cleaned.length !== 7 || !/^\d{7}$/.test(cleaned)) return null;

  try {
    const res = await fetch(
      `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleaned}`
    );
    if (!res.ok) return null;

    const data = await res.json();
    const result: ZipcodeResult | undefined = data.results?.[0];
    if (!result) return null;

    return `${result.address1}${result.address2}${result.address3}`;
  } catch {
    return null;
  }
}
