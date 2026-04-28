import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Printer, Clock, CheckCircle2, XCircle, FileDown } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useOrderCategories } from "@/hooks/useOrderCategories";
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
import type { OrderCategory, OrderStatus, PaymentStatus } from "@/hooks/useOrders";
import type { InvoiceType } from "@/types";

// 既定の種別。useOrderCategoriesからユーザー追加分も合わせて使う
const ORDER_STATUSES: OrderStatus[] = ["配送前", "配送済み", "キャンセル"];
const PAYMENT_STATUSES: PaymentStatus[] = ["未入金", "入金済み"];

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
    のし: "bg-blue-50 text-blue-700 border-blue-200",
    お中元: "bg-orange-50 text-orange-700 border-orange-200",
    お歳暮: "bg-rose-50 text-rose-700 border-rose-200",
    お供え: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${config[category] || "bg-slate-50 text-slate-700 border-slate-200"}`}
    >
      {category}
    </span>
  );
};

const OrdersPage = () => {
  const navigate = useNavigate();
  const { orders, updateOrder, refetch } = useOrders();
  const { all: orderCategoriesAll, remember: rememberOrderCategory } = useOrderCategories();
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

    // B2クラウド公式フォーマット 95列
    const B2_HEADERS = [
      "お客様管理番号", "送り状種類", "クール区分", "伝票番号", "出荷予定日",
      "お届け予定日", "配達時間帯", "お届け先コード", "お届け先電話番号", "お届け先電話番号枝番",
      "お届け先郵便番号", "お届け先住所", "お届け先アパートマンション名", "お届け先会社・部門1", "お届け先会社・部門2",
      "お届け先名", "お届け先名(ｶﾅ)", "敬称", "ご依頼主コード", "ご依頼主電話番号",
      "ご依頼主電話番号枝番", "ご依頼主郵便番号", "ご依頼主住所", "ご依頼主アパートマンション", "ご依頼主名",
      "ご依頼主名(ｶﾅ)", "品名コード1", "品名1", "品名コード2", "品名2",
      "荷扱い1", "荷扱い2", "記事", "ｺﾚｸﾄ代金引換額（税込)", "内消費税額等",
      "止置き", "営業所コード", "発行枚数", "個数口表示フラグ", "請求先顧客コード",
      "請求先分類コード", "運賃管理番号", "クロネコwebコレクトデータ登録", "クロネコwebコレクト加盟店番号", "クロネコwebコレクト申込受付番号1",
      "クロネコwebコレクト申込受付番号2", "クロネコwebコレクト申込受付番号3", "お届け予定ｅメール利用区分", "お届け予定ｅメールe-mailアドレス", "入力機種",
      "お届け予定ｅメールメッセージ", "お届け完了ｅメール利用区分", "お届け完了ｅメールe-mailアドレス", "お届け完了ｅメールメッセージ", "クロネコ収納代行利用区分",
      "予備", "収納代行請求金額(税込)", "収納代行内消費税額等", "収納代行請求先郵便番号", "収納代行請求先住所",
      "収納代行請求先住所（アパートマンション名）", "収納代行請求先会社・部門名1", "収納代行請求先会社・部門名2", "収納代行請求先名(漢字)", "収納代行請求先名(カナ)",
      "収納代行問合せ先名(漢字)", "収納代行問合せ先郵便番号", "収納代行問合せ先住所", "収納代行問合せ先住所（アパートマンション名）", "収納代行問合せ先電話番号",
      "収納代行管理番号", "収納代行品名", "収納代行備考", "複数口くくりキー", "検索キータイトル1",
      "検索キー1", "検索キータイトル2", "検索キー2", "検索キータイトル3", "検索キー3",
      "検索キータイトル4", "検索キー4", "検索キータイトル5", "検索キー5", "予備_2",
      "予備_3", "投函予定メール利用区分", "投函予定メールe-mailアドレス", "投函予定メールメッセージ", "投函完了メール（お届け先宛）利用区分",
      "投函完了メール（お届け先宛）e-mailアドレス", "投函完了メール（お届け先宛）メールメッセージ", "投函完了メール（ご依頼主宛）利用区分", "投函完了メール（ご依頼主宛）e-mailアドレス", "投函完了メール（ご依頼主宛）メールメッセージ",
    ];

    // YYYY-MM-DD → YYYY/MM/DD
    const toSlashDate = (d?: string) => (d ? d.replace(/-/g, "/") : "");

    const rows = targetOrders.map((order) => {
      const recipientInfo = order.recipientId
        ? recipientMap.get(order.recipientId) || { postalCode: "", address: "", phone: "" }
        : { postalCode: "", address: "", phone: "" };
      const customer = customerMap.get(order.customerId);
      const deliveryDate = toSlashDate(order.deliveryDate);

      const product1 = order.products[0];
      const product2 = order.products[1];
      const itemName = (p?: typeof order.products[0]) =>
        p ? (p.quantity > 1 ? `${p.productName}×${p.quantity}` : p.productName) : "";

      const row: Record<string, string | number> = {};
      B2_HEADERS.forEach((h) => (row[h] = ""));

      row["お客様管理番号"] = order.orderNumber;
      row["送り状種類"] = "0"; // 発払い
      row["クール区分"] = order.isCoolDelivery ? "2" : "0";
      row["出荷予定日"] = deliveryDate;
      row["お届け予定日"] = deliveryDate;
      row["お届け先電話番号"] = recipientInfo.phone;
      row["お届け先郵便番号"] = recipientInfo.postalCode;
      row["お届け先住所"] = recipientInfo.address;
      row["お届け先名"] = order.recipientName || "";
      row["敬称"] = "様";
      row["ご依頼主電話番号"] = customer?.phone ?? "";
      row["ご依頼主郵便番号"] = customer?.postalCode ?? "";
      row["ご依頼主住所"] = customer?.address ?? "";
      row["ご依頼主名"] = order.customerName;
      row["品名1"] = itemName(product1);
      row["品名2"] = itemName(product2);
      row["荷扱い1"] = order.orderCategory && order.orderCategory !== "なし" ? order.orderCategory : "";
      row["記事"] = order.note || "";
      row["発行枚数"] = "1";

      return row;
    });

    const csv = Papa.unparse({ fields: B2_HEADERS, data: rows });
    // B2クラウドはShift_JIS前提だがUTF-8 BOMでExcelでも開ける
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
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
        return <Clock className="h-3 w-3" />;
      case "配送済み":
        return <CheckCircle2 className="h-3 w-3" />;
      case "キャンセル":
        return <XCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const cls: Record<string, string> = {
      配送前: "bg-amber-50 text-amber-700 border-amber-200",
      配送済み: "bg-emerald-50 text-emerald-700 border-emerald-200",
      キャンセル: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${cls[status] || ""}`}
      >
        {getStatusIcon(status)}
        {status}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus: string) => {
    const isPaid = paymentStatus === '入金済み';
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${
          isPaid
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-orange-50 text-orange-700 border-orange-200"
        }`}
      >
        {paymentStatus}
      </span>
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
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="配送ステータス" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全て">全て（配送）</SelectItem>
                    <SelectItem value="配送前">配送前</SelectItem>
                    <SelectItem value="配送済み">配送済み</SelectItem>
                    <SelectItem value="キャンセル">キャンセル</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="入金ステータス" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全て">全て（入金）</SelectItem>
                    <SelectItem value="未入金">未入金</SelectItem>
                    <SelectItem value="入金済み">入金済み</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="種別" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全て">全て（種別）</SelectItem>
                    {orderCategoriesAll.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-12" />{/* No. */}
                  <col className="w-24" />{/* 受注日 */}
                  <col className="w-28" />{/* 顧客名 */}
                  <col />{/* 商品・数量（可変） */}
                  <col className="w-24" />{/* 金額 */}
                  <col className="w-28" />{/* 配送（予定/完了/クール） */}
                  <col className="w-24" />{/* 種別 */}
                  <col className="w-32" />{/* 配送ステータス */}
                  <col className="w-28" />{/* 入金 */}
                  <col className="w-16" />{/* 詳細 */}
                </colgroup>
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-3 px-2 font-medium">No.</th>
                    <th className="pb-3 px-2 font-medium">受注日</th>
                    <th className="pb-3 px-2 font-medium">顧客</th>
                    <th className="pb-3 px-2 font-medium">商品・数量</th>
                    <th className="pb-3 px-2 font-medium text-right">金額</th>
                    <th className="pb-3 px-2 font-medium">配送日</th>
                    <th className="pb-3 px-2 font-medium">種別</th>
                    <th className="pb-3 px-2 font-medium">配送</th>
                    <th className="pb-3 px-2 font-medium">入金</th>
                    <th className="pb-3 px-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b text-sm transition-colors hover:bg-muted/50 align-top">
                      <td className="py-3 px-2 font-bold text-muted-foreground text-xs">
                        No.{orderNumberMap.get(order.id)}
                      </td>
                      <td className="py-3 px-2 text-xs">{order.orderDate}</td>
                      <td className="py-3 px-2 font-medium">
                        <div className="break-words">{order.customerName}</div>
                        <div className="mt-1">
                          {getInvoiceBadge(customerMap.get(order.customerId)?.invoiceType)}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        {order.products.map((p, i) => (
                          <div key={i} className="text-muted-foreground leading-snug break-words text-xs">
                            {p.productName} × {p.quantity}
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-2 font-semibold text-primary text-right whitespace-nowrap">¥{order.amount.toLocaleString()}</td>
                      <td className="py-3 px-2 text-xs">
                        <div className="whitespace-nowrap">
                          {order.deliveryDate || (order.status === "配送前"
                            ? <span className="text-muted-foreground">—</span>
                            : <span className="text-muted-foreground">指定なし</span>)}
                        </div>
                        {order.deliveredAt && (
                          <div className="text-green-600 whitespace-nowrap mt-0.5">
                            ✓ {new Date(order.deliveredAt).toLocaleDateString("ja-JP", { month: "2-digit", day: "2-digit" })}
                          </div>
                        )}
                        {order.isCoolDelivery && (
                          <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 border-blue-200 text-[10px] px-1.5 py-0">クール</Badge>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <Select
                          value={order.orderCategory || "なし"}
                          onValueChange={(v) =>
                            updateOrder(order.id, { orderCategory: v as OrderCategory })
                          }
                        >
                          <SelectTrigger className="h-8 w-full text-xs border border-transparent bg-transparent px-1.5 py-1 focus:ring-1 focus:ring-primary/30 hover:border-border hover:bg-muted/30 rounded-md transition-colors [&>svg]:opacity-50">
                            <SelectValue>
                              {order.orderCategory && order.orderCategory !== "なし"
                                ? getCategoryBadge(order.orderCategory)
                                : <span className="text-muted-foreground text-xs">なし</span>
                              }
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {orderCategoriesAll.map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-2">
                        <Select
                          value={order.status}
                          onValueChange={(v) =>
                            updateOrder(order.id, { status: v as OrderStatus })
                          }
                        >
                          <SelectTrigger className="h-8 w-full text-xs border border-transparent bg-transparent px-1.5 py-1 focus:ring-1 focus:ring-primary/30 hover:border-border hover:bg-muted/30 rounded-md transition-colors [&>svg]:opacity-50">
                            <SelectValue>{getStatusBadge(order.status)}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {ORDER_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-2">
                        <Select
                          value={order.paymentStatus}
                          onValueChange={(v) =>
                            updateOrder(order.id, { paymentStatus: v as PaymentStatus })
                          }
                        >
                          <SelectTrigger className="h-8 w-full text-xs border border-transparent bg-transparent px-1.5 py-1 focus:ring-1 focus:ring-primary/30 hover:border-border hover:bg-muted/30 rounded-md transition-colors [&>svg]:opacity-50">
                            <SelectValue>{getPaymentBadge(order.paymentStatus)}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {PAYMENT_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="btn-hover h-7 text-xs px-2"
                            onClick={() => navigate(`/orders/${order.id}`)}
                          >
                            詳細
                          </Button>
                          <Button variant="outline" size="sm" className="btn-hover h-7 px-2" onClick={() => printOrder(order)}>
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
                        <Select
                          value={order.status}
                          onValueChange={(v) =>
                            updateOrder(order.id, { status: v as OrderStatus })
                          }
                        >
                          <SelectTrigger className="h-auto w-auto border-0 bg-transparent p-0 focus:ring-0 gap-1">
                            <SelectValue>{getStatusBadge(order.status)}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {ORDER_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={order.paymentStatus}
                          onValueChange={(v) =>
                            updateOrder(order.id, { paymentStatus: v as PaymentStatus })
                          }
                        >
                          <SelectTrigger className="h-auto w-auto border-0 bg-transparent p-0 focus:ring-0 gap-1">
                            <SelectValue>{getPaymentBadge(order.paymentStatus)}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {PAYMENT_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                          {orderCategoriesAll.map((c) => (
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
