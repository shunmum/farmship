import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Minus, User, MapPin, Package, Truck, CheckCircle2, PartyPopper, UserPlus, ChevronDown, ChevronUp, Search } from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { useAreaShipping } from "@/hooks/useAreaShipping";
import type { Recipient, InvoiceType } from "@/types";
import type { OrderCategory } from "@/hooks/useOrders";

interface OrderItem {
  productVariantId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ALL_PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];

function extractPrefecture(address: string): string | null {
  return ALL_PREFECTURES.find((p) => address.includes(p)) ?? null;
}

export function CreateOrderDialog({ open, onOpenChange, onSuccess }: CreateOrderDialogProps) {
  const { toast } = useToast();
  const { customers, addCustomer, updateCustomer, addRecipient } = useCustomers();
  const { addOrder } = useOrders();
  const { products, productVariants } = useProducts();
  const { getShippingFee: getAreaShippingFee, getAreaByPrefecture } = useAreaShipping();

  const [step, setStep] = useState(1);

  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedRecipientId, setSelectedRecipientId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [carrier, setCarrier] = useState<"yamato" | "sagawa" | "yupack">("yamato");
  const [isCool, setIsCool] = useState(false);
  const [orderCategory, setOrderCategory] = useState<OrderCategory>("なし");
  const [invoiceType, setInvoiceType] = useState<InvoiceType | "">("");

  // 新規顧客登録フォーム
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", email: "", postalCode: "", address: "", memo: "" });

  // 新規送り先登録フォーム
  const [showNewRecipientForm, setShowNewRecipientForm] = useState(false);
  const [newRecipient, setNewRecipient] = useState({ name: "", phone: "", postalCode: "", address: "", relation: "", email: "" });

  // ダイアログを開くたびにリセット
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const recipients: Recipient[] = selectedCustomer?.recipients || [];
  const selectedRecipient = recipients.find((r) => r.id === selectedRecipientId);

  // バリアント名から重量(kg)を推測（例: "2kg(3~4房位)" → 2）
  const inferWeightFromName = (name: string): number => {
    const m = name.match(/(\d+(?:\.\d+)?)\s*kg/i);
    return m ? Number(m[1]) : 0;
  };

  // 商品ごとの送料を計算（送り先エリア＋重量＋クール便）
  const calcItemShippingFee = (variantId: string): number => {
    const variant = productVariants.find((v) => v.id === variantId);
    if (!variant || !selectedRecipient) return 0;
    // weight 未設定(0)のときはバリアント名から推測
    const weightKg = variant.weight && variant.weight > 0
      ? variant.weight
      : inferWeightFromName(variant.name);
    if (weightKg <= 0) return 0;
    const prefecture = extractPrefecture(selectedRecipient.address);
    if (!prefecture) return 0;
    const area = getAreaByPrefecture(prefecture);
    if (!area) return 0;
    return getAreaShippingFee(area.areaId, weightKg, isCool) ?? 0;
  };

  const addOrderItem = (variantId: string, name: string, price: number) => {
    const existing = orderItems.findIndex((i) => i.productVariantId === variantId);
    if (existing >= 0) {
      const updated = [...orderItems];
      updated[existing].quantity += 1;
      setOrderItems(updated);
    } else {
      setOrderItems([...orderItems, { productVariantId: variantId, productName: name, quantity: 1, unitPrice: price }]);
    }
  };

  const updateQuantity = (variantId: string, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((i) => i.productVariantId === variantId ? { ...i, quantity: i.quantity + delta } : i)
        .filter((i) => i.quantity > 0)
    );
  };

  const itemsTotal = orderItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  // 商品ごとの送料合計（数量に関わらず1商品ごとに1送料）
  const totalShippingFee = orderItems.reduce((sum, i) => sum + calcItemShippingFee(i.productVariantId), 0);
  const total = itemsTotal + totalShippingFee;

  const carrierLabel = carrier === "yamato" ? "ヤマト運輸" : carrier === "sagawa" ? "佐川急便" : "ゆうパック";

  // 注文を保存して注文番号を返す（共通処理）
  const submitOrder = (): string | null => {
    if (!selectedCustomer || !selectedRecipient || orderItems.length === 0 || !deliveryDate) return null;

    const orderDate = new Date().toISOString().split("T")[0];
    const orderNumber = `ORD-${orderDate.replace(/-/g, "")}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;

    addOrder({
      orderNumber,
      orderDate,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      recipientId: selectedRecipient.id,
      recipientName: selectedRecipient.name,
      products: orderItems.map((i) => ({
        productId: i.productVariantId,
        productName: i.productName,
        quantity: i.quantity,
        shippingFee: calcItemShippingFee(i.productVariantId),
      })),
      amount: total,
      deliveryDate,
      status: "配送前",
      paymentStatus: "未入金",
      shippingCompany: carrierLabel,
      orderCategory,
      isCoolDelivery: isCool,
      note: orderNote || undefined,
    });

    if (invoiceType && selectedCustomer.invoiceType !== invoiceType) {
      updateCustomer(selectedCustomer.id, { invoiceType });
    }

    onSuccess();
    return orderNumber;
  };

  // 確定して完了ステップへ
  const handleSubmit = () => {
    const orderNumber = submitOrder();
    if (!orderNumber) return;
    toast({ title: "✅ 注文を登録しました", description: `注文番号: ${orderNumber}` });
    setStep(6);
  };

  // 確定して続けて同じ顧客の次の送り先へ
  const handleSubmitAndContinue = () => {
    const orderNumber = submitOrder();
    if (!orderNumber) return;
    toast({ title: "✅ 注文を登録しました", description: `注文番号: ${orderNumber}` });
    continueWithSameCustomer();
  };

  const resetForm = () => {
    setStep(1);
    setSelectedCustomerId("");
    setSelectedRecipientId("");
    setOrderItems([]);
    setDeliveryDate("");
    setCarrier("yamato");
    setIsCool(false);
    setOrderCategory("なし");
    setInvoiceType("");
    setShowNewCustomerForm(false);
    setNewCustomer({ name: "", phone: "", email: "", postalCode: "", address: "", memo: "" });
    setShowNewRecipientForm(false);
    setNewRecipient({ name: "", phone: "", postalCode: "", address: "", relation: "", email: "" });
    setCustomerSearch("");
    setOrderNote("");
  };

  const handleAddNewCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) return;
    const { data, error } = await addCustomer({
      name: newCustomer.name,
      phone: newCustomer.phone,
      email: newCustomer.email,
      postalCode: newCustomer.postalCode,
      address: newCustomer.address,
      memo: newCustomer.memo,
    });
    if (error || !data) {
      toast({ title: "登録に失敗しました", description: error?.message, variant: "destructive" });
      return;
    }
    setSelectedCustomerId(data.id);
    setInvoiceType("");
    toast({ title: "✅ 顧客を登録しました", description: newCustomer.name });
    setShowNewCustomerForm(false);
    setNewCustomer({ name: "", phone: "", email: "", postalCode: "", address: "", memo: "" });
  };

  const handleAddNewRecipient = async () => {
    if (!newRecipient.name || !newRecipient.phone || !selectedCustomer) return;
    const { data, error } = await addRecipient({
      customerId: selectedCustomer.id,
      name: newRecipient.name,
      phone: newRecipient.phone,
      postalCode: newRecipient.postalCode,
      address: newRecipient.address,
      relation: newRecipient.relation || undefined,
      email: newRecipient.email || undefined,
    });
    if (error || !data) {
      toast({ title: "登録に失敗しました", description: error?.message, variant: "destructive" });
      return;
    }
    setSelectedRecipientId(data.id);
    toast({ title: "✅ 送り先を登録しました", description: newRecipient.name });
    setShowNewRecipientForm(false);
    setNewRecipient({ name: "", phone: "", postalCode: "", address: "", relation: "", email: "" });
  };

  // 同じ顧客で続けて入力（送り先・商品・配送情報をリセット）
  const continueWithSameCustomer = () => {
    setStep(2);
    setSelectedRecipientId("");
    setOrderItems([]);
    setDeliveryDate("");
    setCarrier("yamato");
    setIsCool(false);
    setOrderCategory("なし");
    setShowNewRecipientForm(false);
    setNewRecipient({ name: "", phone: "", postalCode: "", address: "", relation: "", email: "" });
  };

  // ステップ1: 顧客選択
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <User className="h-5 w-5 text-[#2d6a4f]" />
        <span>顧客を選択</span>
      </div>
      <div className="space-y-2">
        <Label>顧客（送り主）</Label>
        <Select value={selectedCustomerId} onValueChange={(v) => {
          setSelectedCustomerId(v);
          setSelectedRecipientId("");
          const c = customers.find((c) => c.id === v);
          setInvoiceType(c?.invoiceType || "");
        }}>
          <SelectTrigger>
            <SelectValue placeholder="顧客を選択してください" />
          </SelectTrigger>
          <SelectContent>
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  className="w-full pl-7 pr-2 py-1.5 text-sm border rounded outline-none focus:ring-1 focus:ring-[#2d6a4f]"
                  placeholder="名前・電話番号で検索..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            {customers
              .filter((c) =>
                customerSearch === "" ||
                c.name.includes(customerSearch) ||
                c.phone.includes(customerSearch)
              )
              .map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}（{c.phone}）</SelectItem>
              ))}
            {customers.filter((c) =>
              customerSearch === "" ||
              c.name.includes(customerSearch) ||
              c.phone.includes(customerSearch)
            ).length === 0 && (
              <div className="py-3 text-center text-sm text-gray-400">該当なし</div>
            )}
          </SelectContent>
        </Select>
      </div>
      {selectedCustomer && !showNewCustomerForm && (
        <div className="bg-[#2d6a4f]/5 p-4 rounded-lg text-sm space-y-1">
          <p className="font-medium">{selectedCustomer.name}</p>
          <p className="text-gray-500">{selectedCustomer.phone}</p>
          <p className="text-gray-500">{selectedCustomer.email}</p>
        </div>
      )}

      {/* 新規顧客登録フォーム */}
      <div className="border rounded-lg overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[#2d6a4f] bg-[#2d6a4f]/5 hover:bg-[#2d6a4f]/10 transition-colors"
          onClick={() => setShowNewCustomerForm((v) => !v)}
        >
          <span className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            新規顧客を登録する
          </span>
          {showNewCustomerForm ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showNewCustomerForm && (
          <div className="p-4 space-y-3 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">氏名 <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="山田 太郎"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">電話番号 <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="090-0000-0000"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">メールアドレス</Label>
              <Input
                placeholder="example@email.com"
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">郵便番号</Label>
                <Input
                  placeholder="000-0000"
                  value={newCustomer.postalCode}
                  onChange={(e) => setNewCustomer((p) => ({ ...p, postalCode: e.target.value }))}
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">住所</Label>
                <Input
                  placeholder="東京都渋谷区..."
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer((p) => ({ ...p, address: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">メモ</Label>
              <Input
                placeholder="備考など"
                value={newCustomer.memo}
                onChange={(e) => setNewCustomer((p) => ({ ...p, memo: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowNewCustomerForm(false);
                  setNewCustomer({ name: "", phone: "", email: "", postalCode: "", address: "", memo: "" });
                }}
              >
                キャンセル
              </Button>
              <Button
                size="sm"
                className="bg-[#2d6a4f] hover:bg-[#1b4332]"
                onClick={handleAddNewCustomer}
                disabled={!newCustomer.name || !newCustomer.phone}
              >
                登録して選択
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>キャンセル</Button>
        <Button className="bg-[#2d6a4f] hover:bg-[#1b4332]" onClick={() => setStep(2)} disabled={!selectedCustomerId}>次へ</Button>
      </div>
    </div>
  );

  // ステップ2: 配送先選択
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <MapPin className="h-5 w-5 text-[#2d6a4f]" />
        <span>配送先を選択</span>
      </div>
      {selectedCustomer && (
        <div className="bg-[#2d6a4f]/5 px-4 py-2 rounded-lg text-sm">
          <span className="text-gray-500">送り主：</span>
          <span className="font-medium">{selectedCustomer.name}</span>
        </div>
      )}
      <div className="space-y-2">
        <Label>配送先（送り先）</Label>
        <Select value={selectedRecipientId} onValueChange={setSelectedRecipientId}>
          <SelectTrigger>
            <SelectValue placeholder="配送先を選択してください" />
          </SelectTrigger>
          <SelectContent>
            {recipients.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}{r.relation ? `（${r.relation}）` : ""} - {r.address}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selectedRecipient && !showNewRecipientForm && (
        <div className="bg-[#2d6a4f]/5 p-4 rounded-lg text-sm space-y-1">
          <p className="font-medium">{selectedRecipient.name}{selectedRecipient.relation ? `（${selectedRecipient.relation}）` : ""}</p>
          <p className="text-gray-500">〒{selectedRecipient.postalCode}</p>
          <p className="text-gray-500">{selectedRecipient.address}</p>
          <p className="text-gray-500">TEL: {selectedRecipient.phone}</p>
        </div>
      )}

      {/* 新規送り先登録フォーム */}
      <div className="border rounded-lg overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[#2d6a4f] bg-[#2d6a4f]/5 hover:bg-[#2d6a4f]/10 transition-colors"
          onClick={() => setShowNewRecipientForm((v) => !v)}
        >
          <span className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            新規送り先を登録する
          </span>
          {showNewRecipientForm ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showNewRecipientForm && (
          <div className="p-4 space-y-3 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">氏名 <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="鈴木 花子"
                  value={newRecipient.name}
                  onChange={(e) => setNewRecipient((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">電話番号 <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="090-0000-0000"
                  value={newRecipient.phone}
                  onChange={(e) => setNewRecipient((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">郵便番号</Label>
                <Input
                  placeholder="000-0000"
                  value={newRecipient.postalCode}
                  onChange={(e) => setNewRecipient((p) => ({ ...p, postalCode: e.target.value }))}
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">住所</Label>
                <Input
                  placeholder="東京都渋谷区..."
                  value={newRecipient.address}
                  onChange={(e) => setNewRecipient((p) => ({ ...p, address: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">続柄・関係</Label>
                <Input
                  placeholder="母、友人 など"
                  value={newRecipient.relation}
                  onChange={(e) => setNewRecipient((p) => ({ ...p, relation: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">メールアドレス</Label>
                <Input
                  placeholder="example@email.com"
                  type="email"
                  value={newRecipient.email}
                  onChange={(e) => setNewRecipient((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowNewRecipientForm(false);
                  setNewRecipient({ name: "", phone: "", postalCode: "", address: "", relation: "", email: "" });
                }}
              >
                キャンセル
              </Button>
              <Button
                size="sm"
                className="bg-[#2d6a4f] hover:bg-[#1b4332]"
                onClick={handleAddNewRecipient}
                disabled={!newRecipient.name || !newRecipient.phone}
              >
                登録して選択
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setStep(1)}>戻る</Button>
        <Button className="bg-[#2d6a4f] hover:bg-[#1b4332]" onClick={() => setStep(3)} disabled={!selectedRecipientId}>次へ</Button>
      </div>
    </div>
  );

  // ステップ3: 商品選択
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Package className="h-5 w-5 text-[#2d6a4f]" />
        <span>商品を選択</span>
      </div>
      <div className="space-y-4 max-h-[360px] overflow-y-auto">
        {products.map((product) => {
          const variants = productVariants.filter((v) => v.parentProductId === product.id);
          return (
            <div key={product.id}>
              <p className="text-sm font-semibold text-gray-700 mb-2">{product.name}</p>
              <div className="space-y-2">
                {variants.map((variant) => {
                  const selected = orderItems.find((i) => i.productVariantId === variant.id);
                  return (
                    <Card key={variant.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{variant.name}</p>
                          <p className="text-sm text-[#2d6a4f] font-semibold">¥{variant.price.toLocaleString()}</p>
                        </div>
                        {selected ? (
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => updateQuantity(variant.id, -1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center font-semibold">{selected.quantity}</span>
                            <Button size="sm" variant="outline" onClick={() => updateQuantity(variant.id, 1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" className="bg-[#2d6a4f] hover:bg-[#1b4332]" onClick={() => addOrderItem(variant.id, `${product.name} ${variant.name}`, variant.price)}>
                            追加
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {orderItems.length > 0 && (
        <div className="bg-[#2d6a4f]/5 p-3 rounded-lg space-y-1">
          <p className="text-sm font-semibold mb-2">選択中の商品</p>
          {orderItems.map((item) => (
            <div key={item.productVariantId} className="flex justify-between text-sm">
              <span>{item.productName} × {item.quantity}</span>
              <span className="font-semibold">¥{(item.unitPrice * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setStep(2)}>戻る</Button>
        <Button className="bg-[#2d6a4f] hover:bg-[#1b4332]" onClick={() => setStep(4)} disabled={orderItems.length === 0}>次へ</Button>
      </div>
    </div>
  );

  // ステップ4: 配送情報
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Truck className="h-5 w-5 text-[#2d6a4f]" />
        <span>配送情報を入力</span>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>配送予定日</Label>
          <Input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>配送業者</Label>
          <Select value={carrier} onValueChange={(v) => setCarrier(v as typeof carrier)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="yamato">ヤマト運輸</SelectItem>
              <SelectItem value="sagawa">佐川急便</SelectItem>
              <SelectItem value="yupack">ゆうパック</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="isCool" checked={isCool} onChange={(e) => setIsCool(e.target.checked)} className="h-4 w-4 accent-[#2d6a4f]" />
          <Label htmlFor="isCool" className="cursor-pointer">クール便</Label>
        </div>
        <div className="space-y-2">
          <Label>種別</Label>
          <Select value={orderCategory} onValueChange={(v) => setOrderCategory(v as OrderCategory)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="なし">なし</SelectItem>
              <SelectItem value="のし">のし</SelectItem>
              <SelectItem value="お中元">お中元</SelectItem>
              <SelectItem value="お供え">お供え</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>請求書種別</Label>
          <Select value={invoiceType || "未設定"} onValueChange={(v) => setInvoiceType(v === "未設定" ? "" : v as InvoiceType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="未設定">未設定</SelectItem>
              <SelectItem value="箱に入れる">箱に入れる</SelectItem>
              <SelectItem value="郵送する">郵送する</SelectItem>
              <SelectItem value="メールで送る">メールで送る</SelectItem>
            </SelectContent>
          </Select>
          {invoiceType && selectedCustomer?.invoiceType !== invoiceType && (
            <p className="text-xs text-[#2d6a4f]">※ 確定時にこの顧客の請求書種別が更新されます</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>備考</Label>
          <textarea
            className="w-full min-h-[72px] px-3 py-2 text-sm border rounded-md resize-none outline-none focus:ring-1 focus:ring-[#2d6a4f]"
            placeholder="配送上の注意・特記事項など"
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
          />
        </div>
        {/* 送料内訳（商品ごと） */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
          <p className="font-semibold text-gray-700 mb-2">金額内訳</p>
          {orderItems.map((item) => {
            const fee = calcItemShippingFee(item.productVariantId);
            return (
              <div key={item.productVariantId} className="space-y-0.5">
                <div className="flex justify-between text-gray-600">
                  <span className="truncate max-w-[220px]">{item.productName} × {item.quantity}</span>
                  <span>¥{(item.unitPrice * item.quantity).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-xs pl-3">
                  <span>└ 送料（{isCool ? "クール便" : "通常"}）</span>
                  <span>{fee > 0 ? `¥${fee.toLocaleString()}` : "—"}</span>
                </div>
              </div>
            );
          })}
          <div className="border-t pt-2 mt-2 space-y-1">
            <div className="flex justify-between text-gray-600">
              <span>商品合計</span>
              <span className="font-semibold">¥{itemsTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>送料合計</span>
              <span className="font-semibold">¥{totalShippingFee.toLocaleString()}</span>
            </div>
          </div>
          <div className="border-t pt-2 flex justify-between font-bold text-base">
            <span>合計</span><span className="text-[#2d6a4f]">¥{total.toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setStep(3)}>戻る</Button>
        <Button className="bg-[#2d6a4f] hover:bg-[#1b4332]" onClick={() => setStep(5)} disabled={!deliveryDate}>次へ</Button>
      </div>
    </div>
  );

  // ステップ5: 確認
  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <CheckCircle2 className="h-5 w-5 text-[#2d6a4f]" />
        <span>注文内容を確認</span>
      </div>
      <div className="space-y-3">
        <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-1">
          <p className="font-semibold mb-1">顧客（送り主）</p>
          <p>{selectedCustomer?.name}</p>
          <p className="text-gray-500">{selectedCustomer?.phone}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-1">
          <p className="font-semibold mb-1">配送先（送り先）</p>
          <p>{selectedRecipient?.name}{selectedRecipient?.relation ? `（${selectedRecipient?.relation}）` : ""}</p>
          <p className="text-gray-500">〒{selectedRecipient?.postalCode} {selectedRecipient?.address}</p>
          <p className="text-gray-500">TEL: {selectedRecipient?.phone}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-1">
          <p className="font-semibold mb-2">商品・送料内訳</p>
          {orderItems.map((item) => {
            const fee = calcItemShippingFee(item.productVariantId);
            return (
              <div key={item.productVariantId} className="mb-1">
                <div className="flex justify-between">
                  <span>{item.productName} × {item.quantity}</span>
                  <span>¥{(item.unitPrice * item.quantity).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-xs pl-3">
                  <span>└ 送料</span>
                  <span>{fee > 0 ? `¥${fee.toLocaleString()}` : "—"}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-1">
          <p className="font-semibold mb-1">配送情報</p>
          <p>配送日: {deliveryDate}</p>
          <p>配送業者: {carrierLabel}</p>
          <p>クール便: {isCool ? "あり" : "なし"}</p>
          <p>種別: {orderCategory}</p>
          <p>請求書種別: {invoiceType || "未設定"}</p>
        </div>
        <div className="bg-[#2d6a4f]/10 p-4 rounded-lg space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">商品合計</span>
            <span>¥{itemsTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">送料合計</span>
            <span>¥{totalShippingFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-1 border-t">
            <span>合計金額</span>
            <span className="text-[#2d6a4f]">¥{total.toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div className="flex justify-between gap-2">
        <Button variant="outline" onClick={() => setStep(4)}>戻る</Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-[#2d6a4f] text-[#2d6a4f] hover:bg-[#2d6a4f]/5"
            onClick={handleSubmitAndContinue}
          >
            続けて登録
          </Button>
          <Button className="bg-[#2d6a4f] hover:bg-[#1b4332]" onClick={handleSubmit}>注文を確定</Button>
        </div>
      </div>
    </div>
  );

  // ステップ6: 完了 / 連続入力
  const renderStep6 = () => (
    <div className="space-y-6 text-center">
      <div className="flex flex-col items-center gap-3 py-4">
        <PartyPopper className="h-12 w-12 text-[#2d6a4f]" />
        <p className="text-xl font-bold text-[#2d6a4f]">注文を登録しました！</p>
        <p className="text-gray-500 text-sm">同じ発注者で続けて別の送り先に注文しますか？</p>
      </div>
      <div className="bg-[#2d6a4f]/5 p-3 rounded-lg text-sm">
        <span className="text-gray-500">送り主：</span>
        <span className="font-medium">{selectedCustomer?.name}</span>
      </div>
      <div className="flex flex-col gap-3">
        <Button
          className="bg-[#2d6a4f] hover:bg-[#1b4332] w-full"
          onClick={continueWithSameCustomer}
        >
          続けて別の送り先に注文する
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => { resetForm(); onOpenChange(false); }}
        >
          完了（閉じる）
        </Button>
      </div>
    </div>
  );

  const stepLabels = ["顧客", "配送先", "商品", "配送", "確認"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#2d6a4f]">新規注文を入力する</DialogTitle>
        </DialogHeader>

        {/* ステップインジケーター（完了ステップは非表示） */}
        {step <= 5 && (
          <>
            <div className="flex items-center justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    step >= s ? "bg-[#2d6a4f] text-white" : "bg-gray-100 text-gray-400"
                  }`}>
                    {s}
                  </div>
                  {s < 5 && <div className={`w-6 h-1 ${step > s ? "bg-[#2d6a4f]" : "bg-gray-100"}`} />}
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 mb-4">{stepLabels[step - 1]}</p>
          </>
        )}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
        {step === 6 && renderStep6()}
      </DialogContent>
    </Dialog>
  );
}
