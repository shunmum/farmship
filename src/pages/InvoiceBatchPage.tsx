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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";
import { FileDown, Calendar, Printer, Eye, Settings, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCustomers } from "@/hooks/useCustomers";
import { useOrders, type Order } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { useFarmInfo, type FarmInfo } from "@/hooks/useFarmInfo";
import type { Customer } from "@/types";
import type { ProductVariant } from "@/hooks/useProducts";
import { useNavigate } from "react-router-dom";

export type DocumentType = "請求書" | "請求書兼納品書" | "領収書";

// ---- 共通スタイル ----
const COMMON_STYLE = `
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
.info-row { display: flex; gap: 32px; margin-bottom: 24px; }
.bill-to { flex: 1.2; }
.bill-to .label {
  font-size: 11px; font-weight: 600; color: #6b7280;
  text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;
}
.bill-to .customer-name { font-size: 18px; font-weight: 700; color: #111; margin-bottom: 4px; }
.bill-to .customer-sub { font-size: 12px; color: #4b5563; line-height: 1.8; }
.bank-block { flex: 1; }
.bank-block .label {
  font-size: 11px; font-weight: 600; color: #6b7280;
  text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;
}
.bank-block .bank-info { font-size: 12px; color: #374151; line-height: 1.8; }
.bank-block .due { margin-top: 8px; font-size: 12px; font-weight: 600; color: #dc2626; }
.amount-highlight {
  background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 8px;
  padding: 14px 20px; margin-bottom: 24px;
  display: flex; align-items: center; justify-content: space-between;
}
.amount-highlight .ah-label { font-size: 13px; color: #374151; font-weight: 500; }
.amount-highlight .ah-total { font-size: 26px; font-weight: 800; color: #2d6a4f; }
table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
thead tr { background: #2d6a4f; }
thead th { padding: 9px 10px; font-size: 11.5px; font-weight: 600; color: #fff; text-align: left; }
tbody tr { border-bottom: 1px solid #e5e7eb; }
tbody tr:hover { background: #f9fafb; }
td { padding: 9px 10px; color: #111827; font-size: 12.5px; }
td.center { text-align: center; color: #9ca3af; }
td.right { text-align: right; }
.summary { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; margin-bottom: 24px; }
.summary-row { display: flex; gap: 40px; font-size: 12.5px; }
.summary-row .s-label { color: #6b7280; min-width: 140px; text-align: right; }
.summary-row .s-val { min-width: 100px; text-align: right; font-weight: 600; }
.summary-row.total-row { margin-top: 6px; padding-top: 8px; border-top: 2px solid #2d6a4f; font-size: 15px; }
.summary-row.total-row .s-label { color: #111; font-weight: 700; }
.summary-row.total-row .s-val { color: #2d6a4f; font-weight: 800; }
.note-block {
  background: #f9fafb; border-left: 3px solid #d1fae5;
  padding: 10px 14px; font-size: 12px; color: #4b5563; line-height: 1.8; margin-bottom: 24px;
}
.footer {
  border-top: 1px solid #e5e7eb; padding-top: 10px;
  font-size: 11px; color: #9ca3af; display: flex; justify-content: space-between;
}
.invoice-reg { font-size: 11px; color: #6b7280; margin-top: 2px; }
.recipient-header td {
  background: #f0fdf4;
  color: #2d6a4f;
  font-weight: 700;
  font-size: 12.5px;
  padding: 7px 10px;
  border-bottom: 1px solid #bbf7d0;
}
@media print {
  body { background: #fff; padding: 0; }
  .page { box-shadow: none; border-radius: 0; max-width: 100%; }
}
`;

interface LineItem {
  orderDate: string;
  name: string;
  recipient: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  isShipping?: boolean;
  isCoolDelivery?: boolean;
}

function buildLineItems(orders: Order[], productVariants: ProductVariant[]): LineItem[] {
  const lineItems: LineItem[] = [];
  for (const order of orders) {
    for (const item of order.products) {
      const variant = productVariants.find((v) => v.id === item.productId);
      const unitPrice = variant?.price ?? 0;
      const amount = unitPrice * item.quantity;
      lineItems.push({
        orderDate: order.orderDate,
        name: item.productName,
        recipient: order.recipientName || order.customerName,
        quantity: item.quantity,
        unitPrice,
        amount,
        isCoolDelivery: order.isCoolDelivery,
      });
      // 商品ごとの送料（品種ごとに発送時期が異なるため個別に設定）
      if (item.shippingFee && item.shippingFee > 0) {
        lineItems.push({
          orderDate: order.orderDate,
          name: `送料（${order.shippingCompany || "配送"}）`,
          recipient: order.recipientName || order.customerName,
          quantity: 1,
          unitPrice: item.shippingFee,
          amount: item.shippingFee,
          isShipping: true,
          isCoolDelivery: order.isCoolDelivery,
        });
      }
    }
    // shippingFee が未設定の旧データ向けフォールバック
    const hasPerItemFees = order.products.some((p) => p.shippingFee && p.shippingFee > 0);
    if (!hasPerItemFees) {
      const productTotal = order.products.reduce((s, item) => {
        const variant = productVariants.find((v) => v.id === item.productId);
        return s + (variant?.price ?? 0) * item.quantity;
      }, 0);
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
          isCoolDelivery: order.isCoolDelivery,
        });
      }
    }
  }
  return lineItems;
}

// 送り先ごとにグループ化したテーブル行HTML
function buildGroupedItemRows(lineItems: LineItem[], fmt: (n: number) => string): string {
  // 受取人の順序を保ちながらグループ化
  const groups: { recipient: string; items: LineItem[] }[] = [];
  for (const item of lineItems) {
    const last = groups[groups.length - 1];
    if (last && last.recipient === item.recipient) {
      last.items.push(item);
    } else {
      groups.push({ recipient: item.recipient, items: [item] });
    }
  }

  return groups.map((group) => {
    const headerRow = `
    <tr class="recipient-header">
      <td colspan="5">${group.recipient} 様宛て</td>
    </tr>`;
    const itemRows = group.items.map((item) => `
    <tr>
      <td style="padding-left:16px">${item.name}</td>
      <td class="center">${item.isCoolDelivery ? '<span style="color:#1d4ed8;font-weight:600">あり</span>' : '<span style="color:#9ca3af">なし</span>'}</td>
      <td class="right">${item.isShipping ? "1 式" : `${item.quantity} 個`}</td>
      <td class="right">${item.isShipping ? "-" : fmt(item.unitPrice)}</td>
      <td class="right">${fmt(item.amount)}</td>
    </tr>`).join("");
    return headerRow + itemRows;
  }).join("");
}


// ---- 共通パーツ ----
interface DocParams {
  farmInfo: FarmInfo;
  customer: Customer;
  orders: Order[];
  productVariants: ProductVariant[];
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
}

function buildBankInfo(farmInfo: FarmInfo) {
  return [
    farmInfo.bankName && farmInfo.bankBranch
      ? `${farmInfo.bankName} ${farmInfo.bankBranch}`
      : "（振込先未設定）",
    farmInfo.bankNumber ? `${farmInfo.bankType} ${farmInfo.bankNumber}` : "",
    farmInfo.bankHolder ? `口座名義：${farmInfo.bankHolder}` : "",
  ].filter(Boolean).join("<br>");
}

function buildSummaryHTML(subtotal: number, tax: number, total: number, taxRate: number, labelTotal: string) {
  const fmt = (n: number) => `¥ ${n.toLocaleString()}`;
  return `
  <div class="summary">
    <div class="summary-row">
      <span class="s-label">小計</span>
      <span class="s-val">${fmt(subtotal)}</span>
    </div>
    <div class="summary-row">
      <span class="s-label">消費税（${taxRate}%）</span>
      <span class="s-val">${fmt(tax)}</span>
    </div>
    <div class="summary-row total-row">
      <span class="s-label">${labelTotal}</span>
      <span class="s-val">${fmt(total)}</span>
    </div>
  </div>`;
}

// ---- 請求書HTML生成 ----
function generateInvoiceHTML(params: DocParams): string {
  const { farmInfo, customer, orders, productVariants, invoiceNumber, issueDate, dueDate } = params;
  const fmt = (n: number) => `¥ ${n.toLocaleString()}`;

  const lineItems = buildLineItems(orders, productVariants);
  const subtotal = lineItems.reduce((s, i) => s + i.amount, 0);
  const tax = Math.floor(subtotal * farmInfo.taxRate / 100);
  const total = subtotal + tax;

  const itemRows = buildGroupedItemRows(lineItems, fmt);

  const regLine = farmInfo.invoiceRegistrationNumber
    ? `<div class="invoice-reg">適格請求書発行事業者 登録番号：${farmInfo.invoiceRegistrationNumber}</div>`
    : "";
  const noteLines = farmInfo.invoiceNote ? farmInfo.invoiceNote.replace(/\n/g, "<br>") : "";

  return `<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8" />
<title>請求書 ${invoiceNumber}</title>
<style>${COMMON_STYLE}</style></head>
<body><div class="page">
  <div class="header">
    <div class="farm-block">
      <div class="farm-name">${farmInfo.name}</div>
      <div class="farm-sub">
        ${farmInfo.postalCode ? `〒${farmInfo.postalCode}　` : ""}${farmInfo.address || ""}
        ${farmInfo.phone ? `<br>TEL: ${farmInfo.phone}` : ""}
        ${farmInfo.email ? `　MAIL: ${farmInfo.email}` : ""}
      </div>
      ${regLine}
    </div>
    <div class="title-block">
      <h1>請　求　書</h1>
      <div class="meta">発行日：${issueDate}<br>請求書番号：${invoiceNumber}</div>
    </div>
  </div>
  <div class="info-row">
    <div class="bill-to">
      <div class="label">ご請求先</div>
      <div class="customer-name">${customer.name} 様</div>
      <div class="customer-sub">
        ${customer.postalCode ? `〒${customer.postalCode}<br>` : ""}${customer.address || ""}
        ${customer.phone ? `<br>TEL: ${customer.phone}` : ""}
      </div>
    </div>
    <div class="bank-block">
      <div class="label">お振込先</div>
      <div class="bank-info">${buildBankInfo(farmInfo)}</div>
      <div class="due">お支払期日：${dueDate}</div>
    </div>
  </div>
  <div class="amount-highlight">
    <div class="ah-label">ご請求金額（税込）</div>
    <div class="ah-total">${fmt(total)}</div>
  </div>
  <table>
    <thead><tr>
      <th style="width:32%">品目</th>
      <th style="width:10%;text-align:center">クール便</th>
      <th style="width:10%;text-align:right">数量</th>
      <th style="width:22%;text-align:right">単価（税込）</th>
      <th style="width:22%;text-align:right">金額（税込）</th>
    </tr></thead>
    <tbody>${itemRows}</tbody>
  </table>
  ${buildSummaryHTML(subtotal, tax, total, farmInfo.taxRate, "合計請求額")}
  ${noteLines ? `<div class="note-block">${noteLines}</div>` : ""}
  <div class="footer"><div>${farmInfo.name}</div><div>${invoiceNumber}</div></div>
</div></body></html>`;
}

// ---- 請求書兼納品書HTML生成 ----
function generateInvoiceDeliveryNoteHTML(params: DocParams): string {
  const { farmInfo, customer, orders, productVariants, invoiceNumber, issueDate, dueDate } = params;
  const fmt = (n: number) => `¥ ${n.toLocaleString()}`;

  const lineItems = buildLineItems(orders, productVariants);
  const subtotal = lineItems.reduce((s, i) => s + i.amount, 0);
  const tax = Math.floor(subtotal * farmInfo.taxRate / 100);
  const total = subtotal + tax;

  const itemRows = buildGroupedItemRows(lineItems, fmt);

  const regLine = farmInfo.invoiceRegistrationNumber
    ? `<div class="invoice-reg">適格請求書発行事業者 登録番号：${farmInfo.invoiceRegistrationNumber}</div>`
    : "";
  const noteLines = farmInfo.invoiceNote ? farmInfo.invoiceNote.replace(/\n/g, "<br>") : "";

  // 納品情報：注文ごとの配送先と納品日
  const deliveryRows = orders.map((o) => `
    <tr>
      <td>${o.deliveryDate || "-"}</td>
      <td>${o.recipientName || o.customerName}</td>
      <td>${o.products.map((p) => `${p.productName}×${p.quantity}`).join("、")}</td>
      <td>${o.shippingCompany || "-"}${o.isCoolDelivery ? "（クール便）" : ""}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8" />
<title>請求書兼納品書 ${invoiceNumber}</title>
<style>${COMMON_STYLE}
.section-title { font-size: 13px; font-weight: 700; color: #2d6a4f; border-bottom: 1.5px solid #2d6a4f; padding-bottom: 4px; margin-bottom: 10px; margin-top: 20px; }
</style></head>
<body><div class="page">
  <div class="header">
    <div class="farm-block">
      <div class="farm-name">${farmInfo.name}</div>
      <div class="farm-sub">
        ${farmInfo.postalCode ? `〒${farmInfo.postalCode}　` : ""}${farmInfo.address || ""}
        ${farmInfo.phone ? `<br>TEL: ${farmInfo.phone}` : ""}
        ${farmInfo.email ? `　MAIL: ${farmInfo.email}` : ""}
      </div>
      ${regLine}
    </div>
    <div class="title-block">
      <h1>請求書兼納品書</h1>
      <div class="meta">発行日：${issueDate}<br>番号：${invoiceNumber}</div>
    </div>
  </div>
  <div class="info-row">
    <div class="bill-to">
      <div class="label">ご請求先 / 納品先</div>
      <div class="customer-name">${customer.name} 様</div>
      <div class="customer-sub">
        ${customer.postalCode ? `〒${customer.postalCode}<br>` : ""}${customer.address || ""}
        ${customer.phone ? `<br>TEL: ${customer.phone}` : ""}
      </div>
    </div>
    <div class="bank-block">
      <div class="label">お振込先</div>
      <div class="bank-info">${buildBankInfo(farmInfo)}</div>
      <div class="due">お支払期日：${dueDate}</div>
    </div>
  </div>
  <div class="amount-highlight">
    <div class="ah-label">ご請求金額（税込）</div>
    <div class="ah-total">${fmt(total)}</div>
  </div>

  <div class="section-title">納品明細</div>
  <table>
    <thead><tr>
      <th style="width:15%">納品日</th>
      <th style="width:25%">お届け先</th>
      <th style="width:40%">商品</th>
      <th style="width:20%">配送</th>
    </tr></thead>
    <tbody>${deliveryRows}</tbody>
  </table>

  <div class="section-title">請求明細</div>
  <table>
    <thead><tr>
      <th style="width:32%">品目</th>
      <th style="width:10%;text-align:center">クール便</th>
      <th style="width:10%;text-align:right">数量</th>
      <th style="width:22%;text-align:right">単価（税込）</th>
      <th style="width:22%;text-align:right">金額（税込）</th>
    </tr></thead>
    <tbody>${itemRows}</tbody>
  </table>
  ${buildSummaryHTML(subtotal, tax, total, farmInfo.taxRate, "合計請求額")}
  ${noteLines ? `<div class="note-block">${noteLines}</div>` : ""}
  <div class="footer"><div>${farmInfo.name}</div><div>${invoiceNumber}</div></div>
</div></body></html>`;
}

// ---- 領収書HTML生成 ----
function generateReceiptHTML(params: DocParams): string {
  const { farmInfo, customer, orders, productVariants, invoiceNumber, issueDate } = params;
  const fmt = (n: number) => `¥ ${n.toLocaleString()}`;

  const lineItems = buildLineItems(orders, productVariants);
  const subtotal = lineItems.reduce((s, i) => s + i.amount, 0);
  const tax = Math.floor(subtotal * farmInfo.taxRate / 100);
  const total = subtotal + tax;

  const regLine = farmInfo.invoiceRegistrationNumber
    ? `<div class="invoice-reg">適格請求書発行事業者 登録番号：${farmInfo.invoiceRegistrationNumber}</div>`
    : "";
  const purposeText = orders.map((o) => o.products.map((p) => p.productName).join("・")).join("、");

  const itemRows = buildGroupedItemRows(lineItems, fmt);

  return `<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8" />
<title>領収書 ${invoiceNumber}</title>
<style>${COMMON_STYLE}
.receipt-box {
  border: 2px solid #2d6a4f; border-radius: 8px; padding: 24px 28px;
  margin-bottom: 24px; text-align: center;
}
.receipt-box .r-amount { font-size: 36px; font-weight: 900; color: #2d6a4f; margin: 12px 0; }
.receipt-box .r-label { font-size: 12px; color: #6b7280; }
.receipt-box .r-purpose { font-size: 13px; font-weight: 600; color: #374151; margin-top: 8px; }
.stamp-area {
  float: right; width: 80px; height: 80px; border: 1px dashed #d1d5db;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 10px; color: #9ca3af; margin-top: -20px;
}
.clearfix::after { content: ""; display: block; clear: both; }
</style></head>
<body><div class="page">
  <div class="header">
    <div class="farm-block">
      <div class="farm-name">${farmInfo.name}</div>
      <div class="farm-sub">
        ${farmInfo.postalCode ? `〒${farmInfo.postalCode}　` : ""}${farmInfo.address || ""}
        ${farmInfo.phone ? `<br>TEL: ${farmInfo.phone}` : ""}
        ${farmInfo.email ? `　MAIL: ${farmInfo.email}` : ""}
      </div>
      ${regLine}
    </div>
    <div class="title-block">
      <h1>領　収　書</h1>
      <div class="meta">発行日：${issueDate}<br>番号：${invoiceNumber}</div>
    </div>
  </div>

  <div class="clearfix">
    <div class="stamp-area">印</div>
    <div style="margin-bottom:8px">
      <div class="bill-to">
        <div class="label" style="font-size:11px;font-weight:600;color:#6b7280;letter-spacing:0.08em;margin-bottom:4px">領収先</div>
        <div style="font-size:20px;font-weight:700;color:#111;border-bottom:2px solid #111;padding-bottom:4px;display:inline-block">${customer.name} 様</div>
      </div>
    </div>
  </div>

  <div class="receipt-box">
    <div class="r-label">お支払いいただいた金額（税込）</div>
    <div class="r-amount">${fmt(total)}</div>
    <div class="r-purpose">但：${purposeText} として</div>
    <div class="r-purpose" style="font-size:11px;color:#6b7280;margin-top:4px">上記正に領収いたしました</div>
  </div>

  <table>
    <thead><tr>
      <th style="width:32%">品目</th>
      <th style="width:10%;text-align:center">クール便</th>
      <th style="width:10%;text-align:right">数量</th>
      <th style="width:22%;text-align:right">単価（税込）</th>
      <th style="width:22%;text-align:right">金額（税込）</th>
    </tr></thead>
    <tbody>${itemRows}</tbody>
  </table>
  ${buildSummaryHTML(subtotal, tax, total, farmInfo.taxRate, "領収金額")}
  <div class="footer"><div>${farmInfo.name}</div><div>${invoiceNumber}</div></div>
</div></body></html>`;
}

// ---- ページ本体 ----
const InvoiceBatchPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { customers } = useCustomers();
  const { orders } = useOrders();
  const { productVariants } = useProducts();
  const { farmInfo } = useFarmInfo();

  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [filteredOrders, setFilteredOrders] = useState<typeof orders>([]);
  const [searched, setSearched] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [documentType, setDocumentType] = useState<DocumentType>("請求書");

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

  const generateHTML = (docParams: ReturnType<typeof buildInvoiceParams>) => {
    if (!selectedCustomer) return "";
    const base = { farmInfo, customer: selectedCustomer, orders: filteredOrders, productVariants, ...docParams };
    if (documentType === "請求書兼納品書") return generateInvoiceDeliveryNoteHTML(base);
    if (documentType === "領収書") return generateReceiptHTML(base);
    return generateInvoiceHTML(base);
  };

  const handlePrint = () => {
    if (!selectedCustomer || filteredOrders.length === 0) return;
    const html = generateHTML(buildInvoiceParams());
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

  const previewHTML = previewParams ? generateHTML(previewParams) : "";

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
            <div className="space-y-1.5">
              <Label>発行する書類の種類</Label>
              <div className="flex gap-2 flex-wrap">
                {(["請求書", "請求書兼納品書", "領収書"] as DocumentType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setDocumentType(t)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      documentType === t
                        ? "bg-[#2d6a4f] text-white border-[#2d6a4f]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-[#2d6a4f]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {documentType === "請求書兼納品書" && (
                <p className="text-xs text-muted-foreground">納品明細と請求明細を1枚にまとめた書類です。適格請求書の要件も満たします。</p>
              )}
              {documentType === "領収書" && (
                <p className="text-xs text-muted-foreground">入金済みの取引に発行してください。インボイス登録番号を設定すると適格領収書として発行されます。</p>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label>送り主</Label>
                <Popover open={customerPickerOpen} onOpenChange={setCustomerPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={customerPickerOpen}
                      className="w-full justify-between font-normal"
                    >
                      {selectedCustomerId
                        ? customers.find((c) => c.id === selectedCustomerId)?.name ?? "顧客を選択"
                        : "顧客を選択"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command
                      filter={(value, search) => {
                        // value には id が入る。検索対象は氏名・フリガナ・電話・グループ名
                        const c = customers.find((x) => x.id === value);
                        if (!c) return 0;
                        const haystack = [
                          c.name,
                          c.furigana ?? "",
                          c.groupName ?? "",
                          c.phone ?? "",
                          c.mobilePhone ?? "",
                        ].join(" ").toLowerCase();
                        return haystack.includes(search.toLowerCase()) ? 1 : 0;
                      }}
                    >
                      <CommandInput placeholder="氏名・フリガナで検索..." />
                      <CommandList className="max-h-72">
                        <CommandEmpty>該当する顧客がいません</CommandEmpty>
                        <CommandGroup>
                          {customers.map((c) => (
                            <CommandItem
                              key={c.id}
                              value={c.id}
                              onSelect={(currentValue) => {
                                setSelectedCustomerId(currentValue === selectedCustomerId ? "" : currentValue);
                                setCustomerPickerOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCustomerId === c.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="truncate">{c.name}</p>
                                {c.furigana && (
                                  <p className="text-xs text-muted-foreground truncate">{c.furigana}</p>
                                )}
                              </div>
                              {c.groupName && (
                                <span className="ml-2 text-xs text-pink-600 flex-shrink-0">{c.groupName}</span>
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle className="text-base sm:text-lg">注文明細（{filteredOrders.length}件）<span className="ml-2 text-sm font-normal text-muted-foreground">→ {documentType}</span></CardTitle>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(true)}
                  className="gap-2 flex-1 sm:flex-none"
                >
                  <Eye className="h-4 w-4" />
                  プレビュー
                </Button>
                <Button onClick={handlePrint} className="bg-[#2d6a4f] hover:bg-[#1b4332] gap-2 flex-1 sm:flex-none">
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
                      <TableHead>配送</TableHead>
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
                        <TableCell className="text-sm">
                          {order.shippingCompany || "-"}
                          {order.isCoolDelivery && (
                            <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">クール</span>
                          )}
                        </TableCell>
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
                      <TableCell colSpan={5} className="text-right">合計</TableCell>
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
            <DialogTitle>{documentType}プレビュー</DialogTitle>
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
