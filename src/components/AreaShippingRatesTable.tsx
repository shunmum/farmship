import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAreaShipping } from "@/hooks/useAreaShipping";
import { WEIGHT_TIERS } from "@/data/areaShippingRates";

const fmt = (n: number | null) =>
  n == null ? <span className="text-gray-300">—</span> : `¥${n.toLocaleString()}`;

const AreaShippingRatesTable = () => {
  const { rates } = useAreaShipping();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">エリア別配送料</CardTitle>
          <CardDescription className="text-sm">配達所要日数：3〜5営業日（全エリア共通）</CardDescription>
        </CardHeader>
        <CardContent className="p-0">

          {/* ============================================
              モバイル表示: エリアごとカード
          ============================================ */}
          <div className="md:hidden divide-y">
            {rates.map((area) => (
              <div key={area.areaId} className="p-4 space-y-3">
                {/* エリア名 */}
                <h3 className="font-semibold text-sm text-gray-800 leading-snug">
                  {area.areaName}
                </h3>

                {/* 重量別料金テーブル（3列：重量 / 通常 / クール） */}
                <div className="rounded-lg overflow-hidden border border-gray-200 text-xs">
                  {/* ヘッダー */}
                  <div className="grid grid-cols-3 bg-gray-100 font-medium text-gray-600">
                    <div className="px-2 py-2">重量</div>
                    <div className="px-2 py-2 text-right border-l border-gray-200">通常</div>
                    <div className="px-2 py-2 text-right border-l border-gray-200 text-blue-700">クール</div>
                  </div>
                  {/* 各行 */}
                  {WEIGHT_TIERS.map((tier, i) => (
                    <div
                      key={tier.label}
                      className={`grid grid-cols-3 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <div className="px-2 py-2 font-medium text-gray-700">{tier.label}</div>
                      <div className="px-2 py-2 text-right border-l border-gray-100 tabular-nums">
                        {fmt(area.normalRates[i])}
                      </div>
                      <div className="px-2 py-2 text-right border-l border-gray-100 tabular-nums text-blue-700">
                        {fmt(area.coolRates[i])}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 都道府県リスト */}
                <p className="text-xs text-gray-400 leading-relaxed">
                  {area.prefectures.join("・")}
                </p>
              </div>
            ))}
          </div>

          {/* ============================================
              PC表示: 横並びテーブル（2テーブル: 通常 / クール）
          ============================================ */}
          <div className="hidden md:block">
            {/* 通常配送 */}
            <div className="px-6 pt-4 pb-2">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">通常配送</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-[640px]">
                <thead>
                  <tr className="bg-[#2d6a4f] text-white">
                    <th className="py-2.5 px-3 text-left font-medium">重量区分</th>
                    {rates.map((area) => (
                      <th key={area.areaId} className="py-2.5 px-3 text-right font-medium whitespace-nowrap">
                        {area.areaName.replace("エリア", "").replace("・", "\n・")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {WEIGHT_TIERS.map((tier, i) => (
                    <tr key={tier.label} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="py-2 px-3 font-medium text-gray-700 border-b border-gray-100">{tier.label}</td>
                      {rates.map((area) => (
                        <td key={area.areaId} className="py-2 px-3 text-right border-b border-gray-100 tabular-nums">
                          {fmt(area.normalRates[i])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* クール便 */}
            <div className="px-6 pt-6 pb-2">
              <h3 className="text-sm font-semibold text-blue-700 mb-3">クール便</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-[640px]">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="py-2.5 px-3 text-left font-medium">重量区分</th>
                    {rates.map((area) => (
                      <th key={area.areaId} className="py-2.5 px-3 text-right font-medium whitespace-nowrap">
                        {area.areaName.replace("エリア", "").replace("・", "\n・")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {WEIGHT_TIERS.map((tier, i) => (
                    <tr key={tier.label} className={i % 2 === 0 ? "bg-white" : "bg-blue-50/40"}>
                      <td className="py-2 px-3 font-medium text-gray-700 border-b border-gray-100">{tier.label}</td>
                      {rates.map((area) => (
                        <td key={area.areaId} className="py-2 px-3 text-right border-b border-gray-100 tabular-nums text-blue-700">
                          {fmt(area.coolRates[i])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* エリア内訳 */}
            <div className="px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">エリア内訳（都道府県）</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {rates.map((area) => (
                  <div key={area.areaId} className="bg-gray-50 rounded-lg p-3 text-xs">
                    <p className="font-semibold text-gray-800 mb-1">{area.areaName}</p>
                    <p className="text-gray-500 leading-relaxed">{area.prefectures.join("・")}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default AreaShippingRatesTable;
