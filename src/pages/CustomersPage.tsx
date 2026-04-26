import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  UserPlus,
  StickyNote,
  Package,
  Send,
  Upload,
} from "lucide-react";
import { CustomerImportDialog } from "@/components/CustomerImportDialog";
import { useCustomers } from "@/hooks/useCustomers";
import { useOrders, type Order } from "@/hooks/useOrders";
import { useToast } from "@/hooks/use-toast";
import { usePostalCode } from "@/hooks/usePostalCode";
import type { Customer, Recipient, InvoiceType } from "@/types";

function RecipientOrderHistory({ orders }: { orders: Order[] }) {
  if (orders.length === 0) return null;
  const statusClass = (s: string) =>
    s === "配送済み"
      ? "bg-green-100 text-green-700"
      : s === "キャンセル"
      ? "bg-gray-200 text-gray-600"
      : "bg-blue-100 text-blue-700";
  return (
    <div className="border-t pt-2 mt-2 space-y-1.5">
      <p className="text-xs font-semibold text-gray-500 flex items-center gap-1">
        <Package className="h-3 w-3" />発送履歴（{orders.length}件）
      </p>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {orders.map((o) => {
          const productNames = o.products.map((p) => p.productName).join("、") || "—";
          return (
            <div key={o.id} className="text-xs bg-white/70 rounded px-2 py-1.5 space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-500 flex-shrink-0">{o.orderDate}</span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-gray-700 font-medium">¥{o.amount.toLocaleString()}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${statusClass(o.status)}`}>{o.status}</span>
                </div>
              </div>
              <p className="text-gray-700 truncate" title={productNames}>{productNames}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const INVOICE_TYPES: InvoiceType[] = ["箱に入れる", "郵送する", "メールで送る"];

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

const EMPTY_CUSTOMER = { name: "", phone: "", email: "", postalCode: "", address: "", memo: "", invoiceType: "" as InvoiceType | "" };
const EMPTY_RECIPIENT = { name: "", phone: "", postalCode: "", address: "", relation: "", email: "", notes: "" };

function FormField({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

const CustomersPage = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, addRecipient, updateRecipient, deleteRecipient } = useCustomers();
  const { orders } = useOrders();
  const ordersByRecipient = orders.reduce<Record<string, Order[]>>((acc, o) => {
    if (!o.recipientId) return acc;
    (acc[o.recipientId] ||= []).push(o);
    return acc;
  }, {});
  const { toast } = useToast();
  const { lookup: lookupPostal } = usePostalCode();
  const { lookup: lookupRecipientPostal } = usePostalCode();

  const [searchQuery, setSearchQuery] = useState("");
  const [kanaFilter, setKanaFilter] = useState<string>("全て");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [expandedRecipientIds, setExpandedRecipientIds] = useState<Set<string>>(new Set());

  // 送り主追加
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [newCustomer, setNewCustomer] = useState(EMPTY_CUSTOMER);

  // 送り主編集
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // 送り先追加
  const [showAddRecipient, setShowAddRecipient] = useState(false);
  const [addRecipientForId, setAddRecipientForId] = useState("");
  const [newRecipient, setNewRecipient] = useState(EMPTY_RECIPIENT);

  // 送り先編集
  const [editingRecipient, setEditingRecipient] = useState<{
    recipient: Recipient;
    customerId: string;
  } | null>(null);

  // 削除確認
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null);

  // 五十音タブ
  const KANA_TABS: { label: string; chars: string }[] = [
    { label: "あ", chars: "あいうえおぁぃぅぇぉ" },
    { label: "か", chars: "かきくけこがぎぐげご" },
    { label: "さ", chars: "さしすせそざじずぜぞ" },
    { label: "た", chars: "たちつてとだぢづでどっ" },
    { label: "な", chars: "なにぬねの" },
    { label: "は", chars: "はひふへほばびぶべぼぱぴぷぺぽ" },
    { label: "ま", chars: "まみむめも" },
    { label: "や", chars: "やゆよゃゅょ" },
    { label: "ら", chars: "らりるれろ" },
    { label: "わ", chars: "わをんゎ" },
  ];

  // カタカナ→ひらがな変換
  const toHiragana = (s: string) =>
    s.replace(/[\u30a1-\u30f6]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));

  const matchesKanaTab = (name: string, tabLabel: string) => {
    if (tabLabel === "全て") return true;
    if (tabLabel === "他") {
      const first = toHiragana(name).charAt(0);
      return !KANA_TABS.some((t) => t.chars.includes(first));
    }
    const tab = KANA_TABS.find((t) => t.label === tabLabel);
    if (!tab) return true;
    const first = toHiragana(name).charAt(0);
    return tab.chars.includes(first);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      (c.name.includes(searchQuery) ||
        c.phone.includes(searchQuery) ||
        (c.email || "").includes(searchQuery)) &&
      matchesKanaTab(c.name, kanaFilter)
  );

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleRecipientExpand = (id: string) => {
    setExpandedRecipientIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // --- 送り主操作 ---
  const handleAddCustomer = () => {
    const { invoiceType, ...rest } = newCustomer;
    addCustomer({ ...rest, invoiceType: invoiceType || undefined });
    setNewCustomer(EMPTY_CUSTOMER);
    setShowAddCustomer(false);
    toast({ title: "✅ 送り主を追加しました" });
  };

  const handleUpdateCustomer = () => {
    if (!editingCustomer) return;
    updateCustomer(editingCustomer.id, editingCustomer);
    setEditingCustomer(null);
    toast({ title: "✅ 顧客情報を更新しました" });
  };

  const handleDeleteCustomer = () => {
    if (!deletingCustomerId) return;
    deleteCustomer(deletingCustomerId);
    setDeletingCustomerId(null);
    toast({ title: "✅ 削除しました" });
  };

  // --- 送り先操作 ---
  const handleAddRecipient = async () => {
    if (!addRecipientForId) return;
    const { error } = await addRecipient({ ...newRecipient, customerId: addRecipientForId });
    if (error) {
      toast({ title: "❌ 送り先の追加に失敗しました", variant: "destructive" });
      return;
    }
    setNewRecipient(EMPTY_RECIPIENT);
    setShowAddRecipient(false);
    toast({ title: "✅ 送り先を追加しました" });
  };

  const handleUpdateRecipient = async () => {
    if (!editingRecipient) return;
    const { error } = await updateRecipient(editingRecipient.recipient.id, editingRecipient.recipient);
    if (error) {
      toast({ title: "❌ 送り先の更新に失敗しました", variant: "destructive" });
      return;
    }
    setEditingRecipient(null);
    toast({ title: "✅ 送り先を更新しました" });
  };

  const handleDeleteRecipient = async (_customerId: string, recipientId: string) => {
    const { error } = await deleteRecipient(recipientId);
    if (error) {
      toast({ title: "❌ 送り先の削除に失敗しました", variant: "destructive" });
      return;
    }
    toast({ title: "✅ 送り先を削除しました" });
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">顧客管理</h1>
            <p className="text-sm text-muted-foreground">送り主と送り先の管理</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="flex-1 sm:flex-none gap-2"
              onClick={() => setShowImport(true)}
            >
              <Upload className="h-4 w-4" />
              CSVインポート
            </Button>
            <Button
              size="lg"
              className="flex-1 sm:flex-none bg-[#2d6a4f] hover:bg-[#1b4332] gap-2"
              onClick={() => setShowAddCustomer(true)}
            >
              <Plus className="h-5 w-5" />
              送り主を追加
            </Button>
          </div>
        </div>

        {/* 検索 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="名前・電話番号・メールアドレスで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        <p className="text-sm text-muted-foreground">{filteredCustomers.length}件の顧客</p>

        {/* 五十音タブ */}
        <div className="flex flex-wrap gap-1 border-b pb-2">
          {["全て", ...KANA_TABS.map((t) => t.label), "他"].map((label) => {
            const active = kanaFilter === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setKanaFilter(label)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  active
                    ? "bg-[#2d6a4f] text-white font-semibold"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* 送り主テーブル */}
        <Card>
          <CardContent className="p-0">
            {/* モバイル カードビュー */}
            <div className="md:hidden divide-y">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="p-4 space-y-3">
                  {/* タップで展開 */}
                  <div
                    className="flex items-start justify-between gap-2 cursor-pointer"
                    onClick={() => toggleExpand(customer.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">{customer.name}</p>
                        {customer.memo && <StickyNote className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />}
                        {getInvoiceBadge(customer.invoiceType)}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                        <Phone className="h-3.5 w-3.5" />
                        {customer.phone}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#2d6a4f]/10 text-[#2d6a4f] text-xs font-semibold">
                        {customer.recipients?.length || 0}
                      </span>
                      {expandedIds.has(customer.id)
                        ? <ChevronDown className="h-4 w-4 text-gray-400" />
                        : <ChevronRight className="h-4 w-4 text-gray-400" />}
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1 text-[#2d6a4f]"
                      onClick={() => { setAddRecipientForId(customer.id); setShowAddRecipient(true); }}
                    >
                      <UserPlus className="h-3.5 w-3.5" />送り先追加
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingCustomer({ ...customer })}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-400" onClick={() => setDeletingCustomerId(customer.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* 展開コンテンツ */}
                  {expandedIds.has(customer.id) && (
                    <div className="space-y-3 pt-1 border-t" onClick={(e) => e.stopPropagation()}>
                      {customer.memo && (
                        <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm mt-3">
                          <StickyNote className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-yellow-700 mb-0.5">メモ</p>
                            <p className="text-gray-700 whitespace-pre-wrap">{customer.memo}</p>
                          </div>
                        </div>
                      )}
                      {customer.recipients && customer.recipients.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">送り先一覧</p>
                          {customer.recipients.map((r) => (
                            <div key={r.id} className="bg-gray-50 rounded-lg p-3 text-sm space-y-1.5">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="font-semibold text-gray-900">{r.name}</p>
                                  {r.relation && (
                                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#2d6a4f]/10 text-[#2d6a4f] mt-0.5 inline-block">{r.relation}</span>
                                  )}
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  <button className="p-1.5 rounded hover:bg-gray-200" onClick={() => setEditingRecipient({ recipient: { ...r }, customerId: customer.id })}>
                                    <Edit className="h-3.5 w-3.5 text-gray-500" />
                                  </button>
                                  <button className="p-1.5 rounded hover:bg-red-50" onClick={() => handleDeleteRecipient(customer.id, r.id)}>
                                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                  </button>
                                </div>
                              </div>
                              <div className="text-gray-500 text-xs space-y-0.5">
                                <p>〒{r.postalCode}　{r.address}</p>
                                <p>TEL: {r.phone}</p>
                                {r.email && <p>{r.email}</p>}
                              </div>
                              <RecipientOrderHistory orders={ordersByRecipient[r.id] ?? []} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-gray-400 py-1">
                          <p>送り先が登録されていません</p>
                          <button
                            className="text-[#2d6a4f] hover:underline text-sm flex items-center gap-1"
                            onClick={() => { setAddRecipientForId(customer.id); setShowAddRecipient(true); }}
                          >
                            <UserPlus className="h-3.5 w-3.5" />追加する
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {filteredCustomers.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">顧客が見つかりません</div>
              )}
            </div>

            {/* デスクトップ テーブル */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4 w-8"></th>
                    <th className="py-3 px-4 font-semibold">名前</th>
                    <th className="py-3 px-4 font-semibold">電話番号</th>
                    <th className="py-3 px-4 font-semibold hidden md:table-cell">メールアドレス</th>
                    <th className="py-3 px-4 font-semibold text-center">請求書</th>
                    <th className="py-3 px-4 font-semibold text-center">送り先数</th>
                    <th className="py-3 px-4 font-semibold text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <>
                      <tr
                        key={customer.id}
                        className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => toggleExpand(customer.id)}
                      >
                        <td className="py-4 px-4 text-gray-400">
                          {expandedIds.has(customer.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{customer.name}</p>
                            {customer.memo && (
                              <StickyNote className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" title={customer.memo} />
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            {customer.phone}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600 hidden md:table-cell">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                            <span className="truncate max-w-[200px]">{customer.email}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {getInvoiceBadge(customer.invoiceType)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#2d6a4f]/10 text-[#2d6a4f] text-sm font-semibold">
                            {customer.recipients?.length || 0}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              title="送り先を追加"
                              onClick={() => {
                                setAddRecipientForId(customer.id);
                                setShowAddRecipient(true);
                              }}
                            >
                              <UserPlus className="h-3.5 w-3.5 text-[#2d6a4f]" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              title="編集"
                              onClick={() => setEditingCustomer({ ...customer })}
                            >
                              <Edit className="h-3.5 w-3.5 text-gray-500" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              title="削除"
                              onClick={() => setDeletingCustomerId(customer.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-400" />
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {/* 送り先展開行 */}
                      {expandedIds.has(customer.id) && (
                        <tr key={`${customer.id}-expanded`} className="bg-gray-50/70">
                          <td colSpan={7} className="px-8 py-4">
                            <div className="space-y-4">
                              {/* メモ表示 */}
                              {customer.memo && (
                                <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                                  <StickyNote className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-xs font-semibold text-yellow-700 mb-0.5">メモ</p>
                                    <p className="text-gray-700 whitespace-pre-wrap">{customer.memo}</p>
                                  </div>
                                </div>
                              )}

                              {/* 請求書種別 */}
                              {customer.invoiceType && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  {customer.invoiceType === "箱に入れる" && <Package className="h-4 w-4 text-amber-500" />}
                                  {customer.invoiceType === "郵送する" && <Send className="h-4 w-4 text-blue-500" />}
                                  {customer.invoiceType === "メールで送る" && <Mail className="h-4 w-4 text-green-500" />}
                                  <span>請求書: <strong>{customer.invoiceType}</strong></span>
                                </div>
                              )}

                              {/* 送り先一覧（横長行表示） */}
                              {customer.recipients && customer.recipients.length > 0 ? (
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    送り先一覧
                                  </p>
                                  <div className="space-y-2">
                                    {customer.recipients.map((r) => {
                                      const recipientOrders = ordersByRecipient[r.id] ?? [];
                                      const isOpen = expandedRecipientIds.has(r.id);
                                      return (
                                        <div key={r.id} className="bg-white border rounded-lg overflow-hidden">
                                          {/* 横長メイン行 */}
                                          <div className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50/60">
                                            {/* 名前 + 続柄 */}
                                            <div className="w-44 flex-shrink-0">
                                              <p className="font-semibold text-gray-900 truncate" title={r.name}>{r.name}</p>
                                              {r.relation && (
                                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#2d6a4f]/10 text-[#2d6a4f] mt-0.5 inline-block">
                                                  {r.relation}
                                                </span>
                                              )}
                                            </div>
                                            {/* 住所 */}
                                            <div className="flex items-start gap-1.5 text-gray-600 text-xs flex-1 min-w-0">
                                              <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
                                              <div className="min-w-0">
                                                <p className="text-gray-400">〒{r.postalCode}</p>
                                                <p className="truncate" title={r.address}>{r.address}</p>
                                              </div>
                                            </div>
                                            {/* 電話 / メール */}
                                            <div className="w-48 flex-shrink-0 text-gray-600 text-xs">
                                              <div className="flex items-center gap-1.5">
                                                <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                                <span className="truncate">{r.phone}</span>
                                              </div>
                                              {r.email && (
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                  <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                                  <span className="truncate text-gray-400" title={r.email}>{r.email}</span>
                                                </div>
                                              )}
                                            </div>
                                            {/* 発送履歴トグル */}
                                            <div className="w-24 flex-shrink-0 text-center">
                                              {recipientOrders.length > 0 ? (
                                                <button
                                                  className="inline-flex items-center gap-1 text-xs text-[#2d6a4f] hover:underline"
                                                  onClick={() => toggleRecipientExpand(r.id)}
                                                >
                                                  <Package className="h-3 w-3" />
                                                  {recipientOrders.length}件
                                                  {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                                </button>
                                              ) : (
                                                <span className="text-xs text-gray-300">履歴なし</span>
                                              )}
                                            </div>
                                            {/* 操作 */}
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                              <button
                                                className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                                                onClick={() =>
                                                  setEditingRecipient({
                                                    recipient: { ...r },
                                                    customerId: customer.id,
                                                  })
                                                }
                                              >
                                                <Edit className="h-3.5 w-3.5 text-gray-500" />
                                              </button>
                                              <button
                                                className="p-1.5 rounded hover:bg-red-50 transition-colors"
                                                onClick={() => handleDeleteRecipient(customer.id, r.id)}
                                              >
                                                <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                              </button>
                                            </div>
                                          </div>
                                          {/* 発送履歴展開 */}
                                          {isOpen && recipientOrders.length > 0 && (
                                            <div className="px-4 pb-3 bg-gray-50/60 border-t">
                                              <RecipientOrderHistory orders={recipientOrders} />
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-sm text-gray-400 py-1">
                                  <p>送り先が登録されていません</p>
                                  <button
                                    className="text-[#2d6a4f] hover:underline text-sm flex items-center gap-1"
                                    onClick={() => {
                                      setAddRecipientForId(customer.id);
                                      setShowAddRecipient(true);
                                    }}
                                  >
                                    <UserPlus className="h-3.5 w-3.5" />
                                    追加する
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>{/* end デスクトップテーブル */}
          </CardContent>
        </Card>
      </div>

      {/* ===== ダイアログ群 ===== */}

      {/* 送り主追加 */}
      <CustomerImportDialog open={showImport} onOpenChange={setShowImport} />

      <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>送り主を追加</DialogTitle>
            <DialogDescription>新しい注文顧客（送り主）を登録します</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <FormField
              label="氏名 *"
              value={newCustomer.name}
              onChange={(v) => setNewCustomer({ ...newCustomer, name: v })}
              placeholder="例: 田中 義雄"
            />
            <FormField
              label="電話番号 *"
              value={newCustomer.phone}
              onChange={(v) => setNewCustomer({ ...newCustomer, phone: v })}
              placeholder="例: 090-1234-5678"
            />
            <FormField
              label="メールアドレス"
              value={newCustomer.email}
              onChange={(v) => setNewCustomer({ ...newCustomer, email: v })}
              placeholder="例: tanaka@example.com"
              type="email"
            />
            <div className="grid gap-1.5">
              <Label>郵便番号</Label>
              <Input
                value={newCustomer.postalCode}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewCustomer((prev) => ({ ...prev, postalCode: val }));
                  lookupPostal(val).then((result) => {
                    if (result) setNewCustomer((prev) => ({ ...prev, address: result.address }));
                  });
                }}
                placeholder="例: 150-0001"
              />
            </div>
            <FormField
              label="住所"
              value={newCustomer.address}
              onChange={(v) => setNewCustomer({ ...newCustomer, address: v })}
              placeholder="例: 東京都渋谷区神宮前1-1-1"
            />
            <div className="grid gap-1.5">
              <Label>請求書種別</Label>
              <Select
                value={newCustomer.invoiceType || "未設定"}
                onValueChange={(v) =>
                  setNewCustomer({ ...newCustomer, invoiceType: v === "未設定" ? "" : v as InvoiceType })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="未設定">未設定</SelectItem>
                  {INVOICE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddCustomer(false); setNewCustomer(EMPTY_CUSTOMER); }}>
              キャンセル
            </Button>
            <Button
              className="bg-[#2d6a4f] hover:bg-[#1b4332]"
              onClick={handleAddCustomer}
              disabled={!newCustomer.name || !newCustomer.phone}
            >
              追加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 送り主編集 */}
      <Dialog open={!!editingCustomer} onOpenChange={(open) => !open && setEditingCustomer(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>顧客情報の編集</DialogTitle>
          </DialogHeader>
          {editingCustomer && (
            <div className="grid gap-4 py-4">
              <FormField label="氏名" value={editingCustomer.name} onChange={(v) => setEditingCustomer({ ...editingCustomer, name: v })} />
              <FormField label="電話番号" value={editingCustomer.phone} onChange={(v) => setEditingCustomer({ ...editingCustomer, phone: v })} />
              <FormField label="メールアドレス" value={editingCustomer.email} onChange={(v) => setEditingCustomer({ ...editingCustomer, email: v })} type="email" />
              <FormField label="郵便番号" value={editingCustomer.postalCode || ""} onChange={(v) => setEditingCustomer({ ...editingCustomer, postalCode: v })} />
              <FormField label="住所" value={editingCustomer.address || ""} onChange={(v) => setEditingCustomer({ ...editingCustomer, address: v })} />
              <div className="grid gap-1.5">
                <Label>請求書種別</Label>
                <Select
                  value={editingCustomer.invoiceType || "未設定"}
                  onValueChange={(v) =>
                    setEditingCustomer({
                      ...editingCustomer,
                      invoiceType: v === "未設定" ? undefined : v as InvoiceType,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="未設定">未設定</SelectItem>
                    {INVOICE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>メモ</Label>
                <Textarea
                  value={editingCustomer.memo || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, memo: e.target.value })}
                  placeholder="例: 去年こういうトラブルがあった、こういうお客さんです..."
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCustomer(null)}>キャンセル</Button>
            <Button className="bg-[#2d6a4f] hover:bg-[#1b4332]" onClick={handleUpdateCustomer}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 送り先追加 */}
      <Dialog open={showAddRecipient} onOpenChange={(open) => { setShowAddRecipient(open); if (!open) setNewRecipient(EMPTY_RECIPIENT); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>送り先を追加</DialogTitle>
            <DialogDescription>
              {customers.find((c) => c.id === addRecipientForId)?.name} の送り先を追加します
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <FormField label="氏名 *" value={newRecipient.name} onChange={(v) => setNewRecipient({ ...newRecipient, name: v })} placeholder="例: 田中 花子" />
            <FormField label="続柄・関係" value={newRecipient.relation} onChange={(v) => setNewRecipient({ ...newRecipient, relation: v })} placeholder="例: 娘、友人" />
            <div className="grid gap-1.5">
              <Label>郵便番号 *</Label>
              <Input
                value={newRecipient.postalCode}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewRecipient((prev) => ({ ...prev, postalCode: val }));
                  lookupRecipientPostal(val).then((result) => {
                    if (result) setNewRecipient((prev) => ({ ...prev, address: result.address }));
                  });
                }}
                placeholder="例: 150-0043"
              />
            </div>
            <FormField label="住所 *" value={newRecipient.address} onChange={(v) => setNewRecipient({ ...newRecipient, address: v })} placeholder="例: 東京都渋谷区道玄坂2-1-1" />
            <FormField label="電話番号 *" value={newRecipient.phone} onChange={(v) => setNewRecipient({ ...newRecipient, phone: v })} placeholder="例: 03-1111-2222" />
            <FormField label="メールアドレス" value={newRecipient.email} onChange={(v) => setNewRecipient({ ...newRecipient, email: v })} placeholder="例: hanako@example.com" type="email" />
            <FormField label="備考" value={newRecipient.notes || ""} onChange={(v) => setNewRecipient({ ...newRecipient, notes: v })} placeholder="例: 不在時は置き配可" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddRecipient(false); setNewRecipient(EMPTY_RECIPIENT); }}>
              キャンセル
            </Button>
            <Button
              className="bg-[#2d6a4f] hover:bg-[#1b4332]"
              onClick={handleAddRecipient}
              disabled={!newRecipient.name || !newRecipient.postalCode || !newRecipient.address || !newRecipient.phone}
            >
              追加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 送り先編集 */}
      <Dialog open={!!editingRecipient} onOpenChange={(open) => !open && setEditingRecipient(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>送り先を編集</DialogTitle>
          </DialogHeader>
          {editingRecipient && (
            <div className="grid gap-4 py-4">
              <FormField
                label="氏名 *"
                value={editingRecipient.recipient.name}
                onChange={(v) => setEditingRecipient({ ...editingRecipient, recipient: { ...editingRecipient.recipient, name: v } })}
              />
              <FormField
                label="続柄・関係"
                value={editingRecipient.recipient.relation || ""}
                onChange={(v) => setEditingRecipient({ ...editingRecipient, recipient: { ...editingRecipient.recipient, relation: v } })}
              />
              <FormField
                label="郵便番号 *"
                value={editingRecipient.recipient.postalCode}
                onChange={(v) => setEditingRecipient({ ...editingRecipient, recipient: { ...editingRecipient.recipient, postalCode: v } })}
              />
              <FormField
                label="住所 *"
                value={editingRecipient.recipient.address}
                onChange={(v) => setEditingRecipient({ ...editingRecipient, recipient: { ...editingRecipient.recipient, address: v } })}
              />
              <FormField
                label="電話番号 *"
                value={editingRecipient.recipient.phone}
                onChange={(v) => setEditingRecipient({ ...editingRecipient, recipient: { ...editingRecipient.recipient, phone: v } })}
              />
              <FormField
                label="メールアドレス"
                value={editingRecipient.recipient.email || ""}
                onChange={(v) => setEditingRecipient({ ...editingRecipient, recipient: { ...editingRecipient.recipient, email: v } })}
                type="email"
              />
              <FormField
                label="備考"
                value={editingRecipient.recipient.notes || ""}
                onChange={(v) => setEditingRecipient({ ...editingRecipient, recipient: { ...editingRecipient.recipient, notes: v } })}
                placeholder="例: 不在時は置き配可"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRecipient(null)}>キャンセル</Button>
            <Button className="bg-[#2d6a4f] hover:bg-[#1b4332]" onClick={handleUpdateRecipient}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 削除確認 */}
      <AlertDialog
        open={!!deletingCustomerId}
        onOpenChange={(open) => !open && setDeletingCustomerId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>顧客を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。顧客情報と関連する送り先がすべて削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCustomer}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomersPage;
