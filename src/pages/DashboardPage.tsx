import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOrders } from "@/hooks/useOrders";
import { useCustomers } from "@/hooks/useCustomers";
import { Plus, ShoppingBag, Banknote, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { CreateOrderDialog } from "@/components/CreateOrderDialog";
import type { OrderCategory } from "@/hooks/useOrders";
import type { InvoiceType } from "@/types";

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
    case "キャンセル":
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />キャンセル
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

const getPaymentBadge = (paymentStatus: string) => {
  const isPaid = paymentStatus === "入金済み";
  return (
    <Badge
      variant={isPaid ? "default" : "outline"}
      className={isPaid ? "bg-green-500" : "border-orange-500 text-orange-700 bg-orange-50"}
    >
      {paymentStatus}
    </Badge>
  );
};

const getCategoryBadge = (category?: OrderCategory) => {
  if (!category || category === "なし") return null;
  const config: Record<string, string> = {
    のし: "bg-blue-100 text-blue-700 border-blue-200",
    お中元: "bg-orange-100 text-orange-700 border-orange-200",
    お供え: "bg-purple-100 text-purple-700 border-purple-200",
  };
  return (
    <Badge variant="outline" className={config[category] || ""}>
      {category}
    </Badge>
  );
};

const getInvoiceBadge = (invoiceType?: InvoiceType) => {
  if (!invoiceType) return null;
  const config: Record<InvoiceType, { label: string; className: string }> = {
    "箱に入れる": { label: "箱", className: "bg-amber-100 text-amber-700 border-amber-200" },
    "郵送する": { label: "郵送", className: "bg-blue-100 text-blue-700 border-blue-200" },
    "メールで送る": { label: "メール", className: "bg-green-100 text-green-700 border-green-200" },
  };
  const { label, className } = config[invoiceType];
  return (
    <Badge variant="outline" className={className} title={invoiceType}>
      {label}
    </Badge>
  );
};

const DashboardPage = () => {
  const { orders } = useOrders();
  const { customers } = useCustomers();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const customerMap = useMemo(() => {
    const map = new Map<string, typeof customers[0]>();
    customers.forEach((c) => map.set(c.id, c));
    return map;
  }, [customers]);

  // 受注日順の連番マップ（受注一覧と共通）
  const orderNumberMap = useMemo(() => {
    const sorted = [...orders].sort((a, b) => a.orderDate.localeCompare(b.orderDate));
    const map = new Map<string, number>();
    sorted.forEach((o, i) => map.set(o.id, i + 1));
    return map;
  }, [orders]);

  // 今シーズン = 2026年（現在の年）
  const currentYear = new Date().getFullYear();
  const seasonOrders = orders.filter(
    (o) => new Date(o.orderDate).getFullYear() === currentYear
  );

  const totalSales = seasonOrders.reduce((sum, o) => sum + o.amount, 0);
  const unpaidCount = seasonOrders.filter((o) => o.paymentStatus === "未入金").length;
  const orderCount = seasonOrders.length;

  // 最新5件（orderDateの降順）
  const latestOrders = [...orders]
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-sm text-gray-500 mt-1">{import.meta.env.VITE_FARM_NAME} 受発注・配送管理</p>
        </div>
        <Button
          size="lg"
          className="w-full sm:w-auto bg-[#2d6a4f] hover:bg-[#1b4332] text-white shadow-lg gap-2 text-base px-6"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="h-5 w-5" />
          新規注文を入力する
        </Button>
      </div>

      {/* KPIカード */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-[#2d6a4f]/10 to-[#2d6a4f]/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">今シーズン注文件数</p>
              <div className="p-2 bg-[#2d6a4f]/10 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-[#2d6a4f]" />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900">{orderCount}<span className="text-lg font-normal text-gray-500 ml-1">件</span></p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">売上合計</p>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Banknote className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900">
              ¥{totalSales.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">未入金件数</p>
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900">{unpaidCount}<span className="text-lg font-normal text-gray-500 ml-1">件</span></p>
          </CardContent>
        </Card>
      </div>

      {/* 最新注文5件 */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">最新注文</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* デスクトップ */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold w-12">No.</th>
                  <th className="py-3 px-4 font-semibold">注文者名</th>
                  <th className="py-3 px-4 font-semibold">商品</th>
                  <th className="py-3 px-4 font-semibold">金額</th>
                  <th className="py-3 px-4 font-semibold">種別</th>
                  <th className="py-3 px-4 font-semibold">請求書</th>
                  <th className="py-3 px-4 font-semibold">入金</th>
                  <th className="py-3 px-4 font-semibold">配送</th>
                  <th className="py-3 px-4 font-semibold">注文日</th>
                </tr>
              </thead>
              <tbody>
                {latestOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-bold text-gray-400 text-sm">
                      No.{orderNumberMap.get(order.id)}
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-900">{order.customerName}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {order.products.map((p) => `${p.productName}×${p.quantity}`).join(", ")}
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#2d6a4f]">¥{order.amount.toLocaleString()}</td>
                    <td className="py-4 px-4">
                      {getCategoryBadge(order.orderCategory)}
                    </td>
                    <td className="py-4 px-4">
                      {getInvoiceBadge(customerMap.get(order.customerId)?.invoiceType)}
                    </td>
                    <td className="py-4 px-4">{getPaymentBadge(order.paymentStatus)}</td>
                    <td className="py-4 px-4">{getStatusBadge(order.status)}</td>
                    <td className="py-4 px-4 text-sm text-gray-500">{order.orderDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* モバイル */}
          <div className="md:hidden space-y-3 p-4">
            {latestOrders.map((order) => (
              <div key={order.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-xs font-bold text-gray-400">No.{orderNumberMap.get(order.id)}</span>
                      {getCategoryBadge(order.orderCategory)}
                      {getInvoiceBadge(customerMap.get(order.customerId)?.invoiceType)}
                    </div>
                    <p className="font-semibold text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{order.orderDate}</p>
                  </div>
                  <p className="font-bold text-[#2d6a4f]">¥{order.amount.toLocaleString()}</p>
                </div>
                <p className="text-sm text-gray-600">
                  {order.products.map((p) => `${p.productName}×${p.quantity}`).join(", ")}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {getPaymentBadge(order.paymentStatus)}
                  {getStatusBadge(order.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <CreateOrderDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {}}
      />
    </div>
  );
};

export default DashboardPage;
