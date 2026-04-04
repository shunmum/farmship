import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FileDown, Calendar, Printer, Eye, Settings } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMockData } from "@/contexts/MockDataContext";
import { useFarmInfo, type FarmInfo } from "@/hooks/useFarmInfo";
import type { Order } from "@/data/mockData";
import type { Customer, ProductVariant } from "@/types";
import { useNavigate } from "react-router-dom";

// ---- 請求書HTML生成 ----
function generateInvoiceHTML(params: {
  farmInfo: FarmInfo;
  customer: Customer;
  orders: Order[];
  productVariants: ProductVariant[];
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
}): string {
  const { farmInfo, customer, orders, productVariants, invoiceNumber, issueDate, dueDate } = params;

  // 明細行を組み立て
  interface LineItem {
    orderDate: string;
    name: string;
    recipient: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    isShipping?: boolean;
  }
  const lineItems: LineItem[] = [];

  for (const order of orders) {
    let productTotal = 0;
    for (const item of order.products) {
      const variant = productVariants.find((v) => v.id === item.productId);
      const unitPrice = variant?.price ?? 0;
      const amount = unitPrice * item.quantity;
      productTotal += amount;
      lineItems.push({
        orderDate: order.orderDate,
        name: item.productName,
        recipient: order.recipientName || order.customerName,
        quantity: item.quantity,
        unitPrice,
        amount,
      });
    }
    // 送料 = 注文合計 - 商品合計（差分がある場合のみ表示）
    const shipping = order.amount - productTotal;
    if (shipping > 0) {
      lineItems.push({
        orderDate: order.orderDate,
        name: `送料（${order.shippingCompany || "配送"}）`,
        recipient: order.recipientName || order.customerName,
        quantity: 1,
        unitPrice: shipping,
        amount: shipping,
        isShipping: true,
      });
    }
  }

  const subtotal = lineItems.reduce((s, i) => s + i.amount, 0);
  const tax = Math.floor(subtotal * farmInfo.taxRate / 100);
  const total = subtotal + tax;

  const fmt = (n: number) => `¥ ${n.toLocaleString()}`;

  const itemRows = lineItems.map((item, idx) => `
    <tr>
      <td class="center">${idx + 1}</td>
      <td>${item.name}</td>
      <td>${item.recipient}</td>
      <td class="right">${item.isShipping ? "1 式" : `${item.quantity} 個`}</td>
      <td class="right">${item.isShipping ? "-" : fmt(item.unitPrice)}</td>
      <td class="right">${fmt(item.amount)}</td>
    </tr>
  `).join("");

  const bankInfo = [
    farmInfo.bankName && farmInfo.bankBranch
      ? `${farmInfo.bankName} ${farmInfo.bankBranch}`
      : "（振込先未設定）",
    farmInfo.bankNumber ? `${farmInfo.bankType} ${farmInfo.bankNumber}` : "",
    farmInfo.bankHolder ? `口座名義：${farmInfo.bankHolder}` : "",
  ].filter(Boolean).join("<br>");

  const noteLines = farmInfo.invoiceNote
    ? farmInfo.invoiceNote.replace(/\n/g, "<br>")
    : "";

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<title>請求書 ${invoiceNumber}</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, "Yu Gothic", "メイリオ", sans-serif;
  font-size: 13px;
  color: #111827;
  background: #f3f4f6;
  padding: 24px;
}
.page {
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  padding: 40px 48px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}
/* ---- ヘッダー ---- */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 2px solid #2d6a4f;
}
.farm-block { line-height: 1.7; }
.farm-name { font-size: 17px; font-weight: 700; color: #111; }
.farm-sub { font-size: 11.5px; color: #6b7280; margin-top: 2px; }
.title-block { text-align: right; }
.title-block h1 {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0.25em;
  color: #2d6a4f;
}
.title-block .meta { font-size: 11.5px; color: #6b7280; margin-top: 6px; line-height: 1.8; }
/* ---- ご請求先 / 振込先 ---- */
.info-row {
  display: flex;
  gap: 32px;
  margin-bottom: 24px;
}
.bill-to { flex: 1.2; }
.bill-to .label {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
}
.bill-to .customer-name {
  font-size: 18px;
  font-weight: 700;
  color: #111;
  margin-bottom: 4px;
}
.bill-to .customer-sub { font-size: 12px; color: #4b5563; line-height: 1.8; }
.bank-block { flex: 1; }
.bank-block .label {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
}
.bank-block .bank-info { font-size: 12px; color: #374151; line-height: 1.8; }
.bank-block .due {
  margin-top: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #dc2626;
}
/* ---- 請求金額ハイライト ---- */
.amount-highlight {
  background: #f0fdf4;
  border: 1.5px solid #bbf7d0;
  border-radius: 8px;
  padding: 14px 20px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.amount-highlight .ah-label { font-size: 13px; color: #374151; font-weight: 500; }
.amount-highlight .ah-total { font-size: 26px; font-weight: 800; color: #2d6a4f; }
/* ---- 明細テーブル ---- */
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}
thead tr { background: #2d6a4f; }
thead th {
  padding: 9px 10px;
  font-size: 11.5px;
  font-weight: 600;
  color: #fff;
  text-align: left;
}
tbody tr { border-bottom: 1px solid #e5e7eb; }
tbody tr:hover { background: #f9fafb; }
td { padding: 9px 10px; color: #111827; font-size: 12.5px; }
td.center { text-align: center; color: #9ca3af; }
td.right { text-align: right; }
/* ---- 小計・税・合計 ---- */
.summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  margin-bottom: 24px;
}
.summary-row {
  display: flex;
  gap: 40px;
  font-size: 12.5px;
}
.summary-row .s-label { color: #6b7280; min-width: 140px; text-align: right; }
.summary-row .s-val { min-width: 100px; text-align: right; font-weight: 600; }
.summary-row.total-row {
  margin-top: 6px;
  padding-top: 8px;
  border-top: 2px solid #2d6a4f;
  font-size: 15px;
}
.summary-row.total-row .s-label { color: #111; font-weight: 700; }
.summary-row.total-row .s-val { color: #2d6a4f; font-weight: 800; }
/* ---- 備考 ---- */
.note-block {
  background: #f9fafb;
  border-left: 3px solid #d1fae5;
  padding: 10px 14px;
  font-size: 12px;
  color: #4b5563;
  line-height: 1.8;
  margin-bottom: 24px;
}
/* ---- フッター ---- */
.footer {
  border-top: 1px solid #e5e7eb;
  padding-top: 10px;
  font-size: 11px;
  color: #9ca3af;
  display: flex;
  justify-content: space-between;
}
@media print {
  body { background: #fff; padding: 0; }
  .page { box-shadow: none; border-radius: 0; max-width: 100%; }
}
</style>
</head>
<body>
<div class="page">
  <!-- ヘッダー -->
  <div class="header">
    <div class="farm-block">
      <div class="farm-name">${farmInfo.name}</div>
      <div class="farm-sub">
        ${farmInfo.postalCode ? `〒${farmInfo.postalCode}　` : ""}${farmInfo.address || ""}
        ${farmInfo.phone ? `<br>TEL: ${farmInfo.phone}` : ""}
        ${farmInfo.email ? `　MAIL: ${farmInfo.email}` : ""}
      </div>
    </div>
    <div class="title-block">
      <h1>請　求　書</h1>
      <div class="meta">
        発行日：${issueDate}<br>
        請求書番号：${invoiceNumber}
      </div>
    </div>
  </div>

  <!-- 請求先 / 振込先 -->
  <div class="info-row">
    <div class="bill-to">
      <div class="label">ご請求先</div>
      <div class="customer-name">${customer.name} 様</div>
      <div class="customer-sub">
        ${customer.postalCode ? `〒${customer.postalCode}<br>` : ""}
        ${customer.address || ""}
        ${customer.phone ? `<br>TEL: ${customer.phone}` : ""}
      </div>
    </div>
    <div class="bank-block">
      <div class="label">お振込先</div>
      <div class="bank-info">${bankInfo}</div>
      <div class="due">お支払期日：${dueDate}</div>
    </div>
  </div>

  <!-- 請求金額ハイライト -->
  <div class="amount-highlight">
    <div class="ah-label">ご請求金額（税込）</div>
    <div class="ah-total">${fmt(total)}</div>
  </div>

  <!-- 明細テーブル -->
  <table>
    <thead>
      <tr>
        <th style="width:4%">No.</th>
        <th style="width:30%">品目</th>
        <th style="width:22%">送り先</th>
        <th style="width:10%;text-align:right">数量</th>
        <th style="width:14%;text-align:right">単価（税込）</th>
        <th style="width:14%;text-align:right">金額（税込）</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <!-- 小計・税・合計 -->
  <div class="summary">
    <div class="summary-row">
      <span class="s-label">小計</span>
      <span class="s-val">${fmt(subtotal)}</span>
    </div>
    <div class="summary-row">
      <span class="s-label">消費税（${farmInfo.taxRate}%）</span>
      <span class="s-val">${fmt(tax)}</span>
    </div>
    <div class="summary-row total-row">
      <span class="s-label">合計請求額</span>
      <span class="s-val">${fmt(total)}</span>
    </div>
  </div>

  <!-- 備考 -->
  ${noteLines ? `<div class="note-block">${noteLines}</div>` : ""}

  <!-- フッター -->
  <div class="footer">
    <div>${farmInfo.name}</div>
    <div>${invoiceNumber}</div>
  </div>
</div>
</body>
</html>`;
}

// ---- ページ本体 ----
const InvoiceBatchPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { customers, orders, productVariants } = useMockData();
  const { farmInfo } = useFarmInfo();

  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [startDate, setStartDate] = useState("2026-03-01");
  const [endDate, setEndDate] = useState("2026-03-31");
  const [filteredOrders, setFilteredOrders] = useState<typeof orders>([]);
  const [searched, setSearched] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const handleSearch = () => {
    if (!selectedCustomerId || !startDate || !endDate) {
      toast({ title: "入力エラー", description: "すべての項目を選択してください", variant: "destructive" });
      return;
    }
    const results = orders.filter((o) => {
      const orderDate = new Date(o.orderDate);
      return (
        o.customerId === selectedCustomerId &&
        orderDate >= new Date(startDate) &&
        orderDate <= new Date(endDate)
      );
    });
    setFilteredOrders(results);
    setSearched(true);
    if (results.length === 0) {
      toast({ title: "データなし", description: "指定期間のデータがありません" });
    }
  };

  const totalAmount = filteredOrders.reduce((sum, o) => sum + o.amount, 0);

  const buildInvoiceParams = () => {
    const today = new Date();
    const issueDate = today.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
    const dueDate = new Date(today.getTime() + farmInfo.paymentDueDays * 86400000)
      .toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
    const invoiceNumber = `${farmInfo.invoicePrefix}-${today.toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 900) + 100)}`;
    return { issueDate, dueDate, invoiceNumber };
  };

  const handlePrint = () => {
    if (!selectedCustomer || filteredOrders.length === 0) return;
    const { issueDate, dueDate, invoiceNumber } = buildInvoiceParams();
    const html = generateInvoiceHTML({
      farmInfo,
      customer: selectedCustomer,
      orders: filteredOrders,
      productVariants,
      invoiceNumber,
      issueDate,
      dueDate,
    });
    const win = window.open("", "_blank", "width=900,height=750");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 600);
    }
  };

  const previewParams = searched && filteredOrders.length > 0 && selectedCustomer
    ? buildInvoiceParams()
    : null;

  const previewHTML = previewParams && selectedCustomer
    ? generateInvoiceHTML({
        farmInfo,
        customer: selectedCustomer,
        orders: filteredOrders,
        productVariants,
        ...previewParams,
      })
    : "";

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">請求書発行</h1>
            <p className="text-muted-foreground text-sm">同一送り主の注文をまとめて請求書を発行</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => navigate("/settings")}
          >
            <Settings className="h-4 w-4" />
            農園情報設定
          </Button>
        </div>

        {/* 農園情報が未設定の場合の警告 */}
        {(!farmInfo.bankName || !farmInfo.address) && (
          <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <span className="font-medium">農園情報が未設定です。</span>
            <button
              className="underline hover:no-underline"
              onClick={() => navigate("/settings")}
            >
              設定ページで農園情報・振込先を入力してください
            </button>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>検索条件</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label>送り主</Label>
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="顧客を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />開始日
                </Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />終了日
                </Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleSearch} className="bg-[#2d6a4f] hover:bg-[#1b4332]">
              検索
            </Button>
          </CardContent>
        </Card>

        {searched && filteredOrders.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>注文明細（{filteredOrders.length}件）</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(true)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  プレビュー
                </Button>
                <Button onClick={handlePrint} className="bg-[#2d6a4f] hover:bg-[#1b4332] gap-2">
                  <Printer className="h-4 w-4" />
                  印刷・PDF保存
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>注文日</TableHead>
                      <TableHead>注文番号</TableHead>
                      <TableHead>商品</TableHead>
                      <TableHead>配送先</TableHead>
                      <TableHead className="text-right">金額</TableHead>
                      <TableHead>入金</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="text-sm">{order.orderDate}</TableCell>
                        <TableCell className="text-sm font-medium">{order.orderNumber}</TableCell>
                        <TableCell className="text-sm">
                          {order.products.map((p) => `${p.productName}×${p.quantity}`).join(", ")}
                        </TableCell>
                        <TableCell className="text-sm">{order.recipientName || "-"}</TableCell>
                        <TableCell className="text-right font-semibold">¥{order.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            order.paymentStatus === "入金済み"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-[#2d6a4f]/5 font-bold">
                      <TableCell colSpan={4} className="text-right">合計</TableCell>
                      <TableCell className="text-right text-[#2d6a4f] text-lg">
                        ¥{totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 請求書プレビューダイアログ */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[92vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-3 border-b flex flex-row items-center justify-between">
            <DialogTitle>請求書プレビュー</DialogTitle>
            <Button
              onClick={() => { setShowPreview(false); handlePrint(); }}
              className="bg-[#2d6a4f] hover:bg-[#1b4332] gap-2 mr-8"
              size="sm"
            >
              <FileDown className="h-4 w-4" />
              印刷・PDF保存
            </Button>
          </DialogHeader>
          <div className="overflow-y-auto" style={{ maxHeight: "calc(92vh - 80px)" }}>
            <iframe
              srcDoc={previewHTML}
              className="w-full border-0"
              style={{ height: "900px" }}
              title="請求書プレビュー"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceBatchPage;
