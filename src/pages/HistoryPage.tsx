import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrders } from "@/hooks/useOrders";
import { Printer, CheckCircle2, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HistoryPage = () => {
  const { orders } = useOrders();
  const [companyFilter, setCompanyFilter] = useState("全て");
  const [statusFilter, setStatusFilter] = useState("全て");

  const filteredOrders = orders.filter((order) => {
    const companyMatch =
      companyFilter === "全て" || order.shippingCompany === companyFilter;
    const statusMatch = statusFilter === "全て" || order.status === statusFilter;
    return companyMatch && statusMatch;
  });

  const companies = [...new Set(orders.map((o) => o.shippingCompany).filter(Boolean))];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "配送前":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-700 bg-yellow-50 gap-1">
            <Clock className="h-3 w-3" />配送前
          </Badge>
        );
      case "配送済み":
        return (
          <Badge className="bg-green-100 text-green-700 border border-green-200 gap-1">
            <CheckCircle2 className="h-3 w-3" />配送済み
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">配送履歴</h1>
          <p className="text-muted-foreground text-sm">過去の配送記録と追跡情報</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle>配送一覧（{filteredOrders.length}件）</CardTitle>
              <div className="flex gap-2 w-full sm:w-auto">
                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="配送業者" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全て">全て</SelectItem>
                    {companies.map((c) => (
                      <SelectItem key={c} value={c!}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="ステータス" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全て">全て</SelectItem>
                    <SelectItem value="配送前">配送前</SelectItem>
                    <SelectItem value="配送済み">配送済み</SelectItem>
                    <SelectItem value="キャンセル">キャンセル</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-6 font-semibold">注文番号</th>
                    <th className="py-3 px-6 font-semibold">顧客名</th>
                    <th className="py-3 px-6 font-semibold">商品</th>
                    <th className="py-3 px-6 font-semibold">配送業者</th>
                    <th className="py-3 px-6 font-semibold">配送予定日</th>
                    <th className="py-3 px-6 font-semibold">ステータス</th>
                    <th className="py-3 px-6 font-semibold">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-sm font-medium">{order.orderNumber}</td>
                      <td className="py-4 px-6 text-sm font-medium">{order.customerName}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {order.products.map((p) => `${p.productName}×${p.quantity}`).join(", ")}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">{order.shippingCompany || "-"}</td>
                      <td className="py-4 px-6 text-sm">{order.deliveryDate}</td>
                      <td className="py-4 px-6">{getStatusBadge(order.status)}</td>
                      <td className="py-4 px-6">
                        <Button variant="outline" size="sm">
                          <Printer className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredOrders.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p>配送データがありません</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HistoryPage;
