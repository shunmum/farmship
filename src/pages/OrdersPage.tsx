import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Printer, Clock, CheckCircle2, XCircle, FileDown } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomers } from "@/hooks/useCustomers";
import Papa from "papaparse";
import { useToast } from "@/hooks/use-toast";
import { CreateOrderDialog } from "@/components/CreateOrderDialog";
import type { OrderCategory } from "@/hooks/useOrders";
import type { InvoiceType } from "@/types";

const ORDER_CATEGORIES: OrderCategory[] = ["のし", "お中元", "お供え", "なし"];

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

const OrdersPage = () => {
  const navigate = useNavigate();
  const { orders, updateOrder, refetch } = useOrders();
  const { customers } = useCustomers();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("全て");
  const [paymentFilter, setPaymentFilter] = useState("全て");
  const [categoryFilter, setCategoryFilter] = useState("全て");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const printOrder = (order: typeof orders[0]) => {
    const win = window.open("", "_blank");
    if (!win) return;
    const html = `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>注文票 ${order.orderNumber}</title>
<style>
  body { font-family: sans-serif; font-size: 13px; padding: 24px; color: #111; }
  h2 { font-size: 18px; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
  th { background: #f3f4f6; width: 120px; }
  .total { font-weight: bold; font-size: 15px; }
  @media print { body { padding: 0; } }
</style></head><body>
<h2>注文票</h2>
<table>
  <tr><th>注文番号</th><td>${order.orderNumber}</td><th>注文日</th><td>${order.orderDate}</td></tr>
  <tr><th>顧客名</th><td>${order.customerName}</td><th>配送先</th><td>${order.recipientName || order.customerName}</td></tr>
  <tr><th>配送予定日</th><td>${order.deliveryDate || "—"}</td><th>配送業者</th><td>${order.shippingCompany || "—"}</td></tr>
  <tr><th>ステータス</th><td>${order.status}</td><th>入金状況</th><td>${order.paymentStatus}</td></tr>
  ${order.note ? `<tr><th>備考</th><td colspan="3">${order.note}</td></tr>` : ""}
</table>
<table>
  <thead><tr><th>商品名</th><th>数量</th><th>送料</th></tr></thead>
  <tbody>
    ${order.products.map((p) => `<tr><td>${p.productName}</td><td>${p.quantity}</td><td>${p.shippingFee ? `¥${p.shippingFee.toLocaleString()}` : "—"}</td></tr>`).join("")}
  </tbody>
</table>
<p class="total">合計金額：¥${order.amount.toLocaleString()}</p>
<script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }<\/script>
</body></html>`;
    win.document.write(html);
    win.document.close();
  };

  const recipientMap = useMemo(() => {
    const map = new Map<string, { postalCode: string; address: string; phone: string }>();
    customers.forEach((c) => {
      (c.recipients || []).forEach((r) => {
        map.set(r.id, {
          postalCode: r.postalCode,
          address: r.address,
          phone: r.phone,
        });
      });
    });
    return map;
  }, [customers]);

  const customerMap = useMemo(() => {
    const map = new Map<string, typeof customers[0]>();
    customers.forEach((c) => map.set(c.id, c));
    return map;
  }, [customers]);

  // 受注日順の連番マップ
  const orderNumberMap = useMemo(() => {
    const sorted = [...orders].sort((a, b) => a.orderDate.localeCompare(b.orderDate));
    const map = new Map<string, number>();
    sorted.forEach((o, i) => map.set(o.id, i + 1));
    return map;
  }, [orders]);

  const filteredOrders = orders
    .filter((order) => {
      const statusMatch = statusFilter === "全て" || order.status === statusFilter;
      const paymentMatch = paymentFilter === "全て" || order.paymentStatus === paymentFilter;
      const categoryMatch =
        categoryFilter === "全て" ||
        (categoryFilter === "なし"
          ? !order.orderCategory || order.orderCategory === "なし"
          : order.orderCategory === categoryFilter);
      return statusMatch && paymentMatch && categoryMatch;
    })
    .sort((a, b) => (orderNumberMap.get(a.id) ?? 0) - (orderNumberMap.get(b.id) ?? 0));

  const handleExportB2Csv = () => {
    const targetOrders = filteredOrders.filter(
      (o) => o.shippingCompany === "ヤマト運輸"
    );

    if (targetOrders.length === 0) {
      toast({
        title: "エクスポート対象がありません",
        description: "ヤマト運輸の受注がフィルタ結果に含まれていません。",
      });
      return;
    }

    const rows = targetOrders.map((order) => {
      const recipientInfo = order.recipientId
        ? recipientMap.get(order.recipientId) || {
            postalCode: "",
            address: "",
            phone: "",
          }
        : {
            postalCode: "",
            address: "",
            phone: "",
          };

      return {
        注文番号: order.orderNumber,
        受注日: order.orderDate,
        送り主名: order.customerName,
        お届け先名: order.recipientName || "",
        お届け先郵便番号: recipientInfo.postalCode,
        お届け先住所: recipientInfo.address,
        お届け先電話番号: recipientInfo.phone,
        配送予定日: order.deliveryDate,
        商品情報: order.products
          .map((p) => `${p.productName}×${p.quantity}`)
          .join(" / "),
        合計金額: order.amount,
        配送会社: order.shippingCompany || "",
        種別: order.orderCategory || "",
        メモ: order.note || "",
      };
    });

    const csv = Papa.unparse(rows, { header: true });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `b2-export-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "B2クラウド用CSVを出力しました",
      description: `${targetOrders.length}件の受注をエクスポートしました。`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "配送前":
        return <Clock className="h-4 w-4" />;
      case "配送済み":
        return <CheckCircle2 className="h-4 w-4" />;
      case "キャンセル":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
      配送前: { variant: "outline", className: "border-yellow-500 text-yellow-700 bg-yellow-50" },
      配送済み: { variant: "secondary", className: "bg-green-100 text-green-700 border-green-200" },
      キャンセル: { variant: "destructive", className: "" },
    };
    const { variant, className } = config[status] || { variant: "default", className: "" };
    return (
      <Badge variant={variant} className={className}>
        <span className="flex items-center gap-1">
          {getStatusIcon(status)}
          {status}
        </span>
      </Badge>
    );
  };

  const getPaymentBadge = (paymentStatus: string) => {
    const isPaid = paymentStatus === '入金済み';
    return (
      <Badge variant={isPaid ? "default" : "outline"} className={isPaid ? "bg-green-500" : "border-orange-500 text-orange-700 bg-orange-50"}>
        {paymentStatus}
      </Badge>
    );
  };

  const statusGroups = [
    { status: "配送前", count: orders.filter(o => o.status === "配送前").length, color: "from-yellow-500/10 to-amber-500/10" },
    { status: "配送済み", count: orders.filter(o => o.status === "配送済み").length, color: "from-green-500/10 to-emerald-500/10" },
    { status: "キャンセル", count: orders.filter(o => o.status === "キャンセル").length, color: "from-red-500/10 to-rose-500/10" },
  ];

  const paymentGroups = [
    { status: "未入金", count: orders.filter(o => o.paymentStatus === "未入金").length, color: "from-orange-500/10 to-amber-500/10" },
    { status: "入金済み", count: orders.filter(o => o.paymentStatus === "入金済み").length, color: "from-blue-500/10 to-cyan-500/10" },
  ];

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6 lg:p-8 fade-in">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">受注管理</h1>
            <p className="text-sm sm:text-base text-muted-foreground">受注情報の管理</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="btn-hover gap-2 w-full sm:w-auto"
              onClick={handleExportB2Csv}
            >
              <FileDown className="h-5 w-5" />
              B2クラウドCSV
            </Button>
            <Button
              size="lg"
              className="btn-hover gap-2 shadow-lg w-full sm:w-auto"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-5 w-5" />
              新規受注登録
            </Button>
          </div>
        </div>

        {/* Status Summary Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
          {statusGroups.map((group) => (
            <Card key={group.status} className="card-hover overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className={`mb-3 inline-flex rounded-xl bg-gradient-to-br ${group.color} p-3`}>
                  {getStatusIcon(group.status)}
                </div>
                <div className="text-3xl font-bold">{group.count}</div>
                <div className="text-sm text-muted-foreground">{group.status}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Orders Table */}
        <Card className="card-hover">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg sm:text-xl">受注一覧</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">全ての受注情報（{filteredOrders.length}件）</p>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="配送ステータス" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全て">全て</SelectItem>
                    <SelectItem value="配送前">配送前</SelectItem>
                    <SelectItem value="配送済み">配送済み</SelectItem>
                    <SelectItem value="キャンセル">キャンセル</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="入金ステータス" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全て">全て</SelectItem>
                    <SelectItem value="未入金">未入金</SelectItem>
                    <SelectItem value="入金済み">入金済み</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[130px]">
                    <SelectValue placeholder="種別" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全て">全て（種別）</SelectItem>
                    {ORDER_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium w-12">No.</th>
                    <th className="pb-3 font-medium">受注日</th>
                    <th className="pb-3 font-medium">顧客名</th>
                    <th className="pb-3 font-medium">商品・数量</th>
                    <th className="pb-3 font-medium">金額</th>
                    <th className="pb-3 font-medium">配送予定日</th>
                    <th className="pb-3 font-medium">クール便</th>
                    <th className="pb-3 font-medium">種別</th>
                    <th className="pb-3 font-medium">請求書</th>
                    <th className="pb-3 font-medium">配送ステータス</th>
                    <th className="pb-3 font-medium">入金ステータス</th>
                    <th className="pb-3 font-medium">アクション</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b text-sm transition-colors hover:bg-muted/50">
                      <td className="py-4 font-bold text-muted-foreground">
                        No.{orderNumberMap.get(order.id)}
                      </td>
                      <td className="py-4">{order.orderDate}</td>
                      <td className="py-4 font-medium">{order.customerName}</td>
                      <td className="py-4">
                        {order.products.map((p, i) => (
                          <div key={i} className="text-muted-foreground">
                            {p.productName} × {p.quantity}
                          </div>
                        ))}
                      </td>
                      <td className="py-4 font-semibold text-primary">¥{order.amount.toLocaleString()}</td>
                      <td className="py-4">{order.deliveryDate}</td>
                      <td className="py-4">
                        {order.isCoolDelivery ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">クール</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">なし</span>
                        )}
                      </td>
                      <td className="py-4">
                        <Select
                          value={order.orderCategory || "なし"}
                          onValueChange={(v) =>
                            updateOrder(order.id, { orderCategory: v as OrderCategory })
                          }
                        >
                          <SelectTrigger className="h-7 w-[90px] text-xs border-0 bg-transparent p-1 focus:ring-0 hover:bg-muted/50 rounded">
                            <SelectValue>
                              {order.orderCategory && order.orderCategory !== "なし"
                                ? getCategoryBadge(order.orderCategory)
                                : <span className="text-muted-foreground text-xs">なし</span>
                              }
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {ORDER_CATEGORIES.map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-4">
                        {getInvoiceBadge(customerMap.get(order.customerId)?.invoiceType)}
                      </td>
                      <td className="py-4">{getStatusBadge(order.status)}</td>
                      <td className="py-4">{getPaymentBadge(order.paymentStatus)}</td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="btn-hover"
                            onClick={() => navigate(`/orders/${order.id}`)}
                          >
                            詳細
                          </Button>
                          <Button variant="outline" size="sm" className="btn-hover" onClick={() => printOrder(order)}>
                            <Printer className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 p-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-bold text-muted-foreground">No.{orderNumberMap.get(order.id)}</span>
                          {order.isCoolDelivery && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">クール</Badge>
                          )}
                          {order.orderCategory && order.orderCategory !== "なし" && getCategoryBadge(order.orderCategory)}
                          {getInvoiceBadge(customerMap.get(order.customerId)?.invoiceType)}
                        </div>
                        <div className="font-semibold text-base text-gray-900 mb-1.5">{order.customerName}</div>
                        <div className="text-sm text-gray-500 space-y-0.5">
                          <div>{order.orderDate}</div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {getStatusBadge(order.status)}
                        {getPaymentBadge(order.paymentStatus)}
                      </div>
                    </div>
                    <div className="space-y-1.5 py-2">
                      {order.products.map((p, i) => (
                        <div key={i} className="text-sm text-gray-700 leading-relaxed">
                          {p.productName} × {p.quantity}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500">種別を変更:</div>
                      <Select
                        value={order.orderCategory || "なし"}
                        onValueChange={(v) =>
                          updateOrder(order.id, { orderCategory: v as OrderCategory })
                        }
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t gap-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">配送予定日</div>
                        <div className="text-sm font-medium text-gray-900">{order.deliveryDate}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">金額</div>
                        <div className="text-xl font-bold text-primary">
                          ¥{order.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-3">
                      <Button
                        variant="outline"
                        size="default"
                        className="flex-1 btn-hover h-11"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        詳細
                      </Button>
                      <Button variant="outline" size="default" className="btn-hover h-11 px-4" onClick={() => printOrder(order)}>
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 注文登録ダイアログ */}
        <CreateOrderDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={refetch}
        />
      </div>
    </div>
  );
};

export default OrdersPage;
