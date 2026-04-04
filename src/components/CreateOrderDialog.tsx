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
import { Plus, Minus, User, MapPin, Package, Truck, CheckCircle2 } from "lucide-react";
import { useMockData } from "@/contexts/MockDataContext";
import type { Recipient, InvoiceType } from "@/types";
import type { OrderCategory } from "@/data/mockData";

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

export function CreateOrderDialog({ open, onOpenChange, onSuccess }: CreateOrderDialogProps) {
  const { toast } = useToast();
  const { customers, products, productVariants, addOrder, updateCustomer } = useMockData();

  const [step, setStep] = useState(1);

  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedRecipientId, setSelectedRecipientId] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [carrier, setCarrier] = useState<"yamato" | "sagawa" | "yupack">("yamato");
  const [isCool, setIsCool] = useState(false);
  const [orderCategory, setOrderCategory] = useState<OrderCategory>("なし");
  const [invoiceType, setInvoiceType] = useState<InvoiceType | "">("");

  // ダイアログを開くたびにリセット
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const recipients: Recipient[] = selectedCustomer?.recipients || [];
  const selectedRecipient = recipients.find((r) => r.id === selectedRecipientId);

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

  const getShippingFee = () => {
    const maxSize = Math.max(
      ...orderItems.map((item) => {
        const variant = productVariants.find((v) => v.id === item.productVariantId);
        return parseInt(variant?.size || "60");
      }),
      60
    );
    let base = maxSize <= 60 ? 800 : maxSize <= 80 ? 1000 : 1200;
    const cool = isCool ? (maxSize <= 100 ? 220 : 330) : 0;
    return base + cool;
  };

  const shippingFee = orderItems.length > 0 ? getShippingFee() : 0;
  const total = itemsTotal + shippingFee;

  const carrierLabel = carrier === "yamato" ? "ヤマト運輸" : carrier === "sagawa" ? "佐川急便" : "ゆうパック";

  const handleSubmit = () => {
    if (!selectedCustomer || !selectedRecipient || orderItems.length === 0 || !deliveryDate) return;

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
      })),
      amount: total,
      deliveryDate,
      status: "配送前",
      paymentStatus: "未入金",
      shippingCompany: carrierLabel,
      orderCategory,
      isCoolDelivery: isCool,
    });

    // 請求書種別が変更されていれば顧客情報を更新
    if (invoiceType && selectedCustomer.invoiceType !== invoiceType) {
      updateCustomer(selectedCustomer.id, { invoiceType });
    }

    toast({ title: "✅ 注文を登録しました", description: `注文番号: ${orderNumber}` });
    resetForm();
    onSuccess();
    onOpenChange(false);
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
            {customers.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}（{c.phone}）</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selectedCustomer && (
        <div className="bg-[#2d6a4f]/5 p-4 rounded-lg text-sm space-y-1">
          <p className="font-medium">{selectedCustomer.name}</p>
          <p className="text-gray-500">{selectedCustomer.phone}</p>
          <p className="text-gray-500">{selectedCustomer.email}</p>
        </div>
      )}
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
      {selectedRecipient && (
        <div className="bg-[#2d6a4f]/5 p-4 rounded-lg text-sm space-y-1">
          <p className="font-medium">{selectedRecipient.name}{selectedRecipient.relation ? `（${selectedRecipient.relation}）` : ""}</p>
          <p className="text-gray-500">〒{selectedRecipient.postalCode}</p>
          <p className="text-gray-500">{selectedRecipient.address}</p>
          <p className="text-gray-500">TEL: {selectedRecipient.phone}</p>
        </div>
      )}
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
                          <Button size="sm" className="bg-[#2d6a4f] hover:bg-[#1b4332]" onClick={() => addOrderItem(variant.id, variant.name, variant.price)}>
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
        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
          <div className="flex justify-between"><span>商品合計</span><span className="font-semibold">¥{itemsTotal.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>送料</span><span className="font-semibold">¥{shippingFee.toLocaleString()}</span></div>
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
          <p className="font-semibold mb-1">商品</p>
          {orderItems.map((item) => (
            <div key={item.productVariantId} className="flex justify-between">
              <span>{item.productName} × {item.quantity}</span>
              <span>¥{(item.unitPrice * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-1">
          <p className="font-semibold mb-1">配送情報</p>
          <p>配送日: {deliveryDate}</p>
          <p>配送業者: {carrierLabel}</p>
          <p>クール便: {isCool ? "あり" : "なし"}</p>
          <p>種別: {orderCategory}</p>
          <p>請求書種別: {invoiceType || "未設定"}</p>
        </div>
        <div className="bg-[#2d6a4f]/10 p-4 rounded-lg">
          <div className="flex justify-between font-bold text-lg">
            <span>合計金額</span>
            <span className="text-[#2d6a4f]">¥{total.toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setStep(4)}>戻る</Button>
        <Button className="bg-[#2d6a4f] hover:bg-[#1b4332]" onClick={handleSubmit}>注文を確定</Button>
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

        {/* ステップインジケーター */}
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

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </DialogContent>
    </Dialog>
  );
}
