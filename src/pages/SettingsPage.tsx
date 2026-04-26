import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useShippingSettings, type ShippingRate, type ConsolidationRule, type ShippingCarrier } from "@/hooks/useShippingSettings";
import { useFarmInfo } from "@/hooks/useFarmInfo";
import { Edit, Trash2, Plus, Package, Truck, Settings2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import PublicFormSettings from "@/components/PublicFormSettings";
import ProductManagement from "@/components/ProductManagement";
import ShippingModeSettings from "@/components/ShippingModeSettings";
import AreaShippingRatesTable from "@/components/AreaShippingRatesTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SettingsPage = () => {
  const { shippingRates, consolidationRules } = useShippingSettings();
  const { farmInfo, saveFarmInfo } = useFarmInfo();
  const { toast } = useToast();

  const [editingShippingRate, setEditingShippingRate] = useState<ShippingRate | null>(null);
  const [editingConsolidationRule, setEditingConsolidationRule] = useState<ConsolidationRule | null>(null);
  const [isAddingConsolidationRule, setIsAddingConsolidationRule] = useState(false);

  // 農園基本情報フォーム
  const [farmForm, setFarmForm] = useState({ ...farmInfo });
  const handleSaveFarmInfo = () => {
    saveFarmInfo(farmForm);
    toast({ title: "✅ 農園情報を保存しました" });
  };

  const carrierNames: Record<ShippingCarrier, string> = {
    yamato: "ヤマト運輸",
    sagawa: "佐川急便",
    yupack: "ゆうパック",
  };

  const groupedShippingRates = shippingRates.reduce((acc, rate) => {
    if (!acc[rate.carrier]) {
      acc[rate.carrier] = [];
    }
    acc[rate.carrier].push(rate);
    return acc;
  }, {} as Record<ShippingCarrier, ShippingRate[]>);

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">設定</h1>
          <p className="text-sm sm:text-base text-muted-foreground">システムの各種設定</p>
        </div>

        <Tabs defaultValue="basic" className="space-y-4 sm:space-y-6">
          <TabsList className="flex flex-wrap gap-1 h-auto">
            <TabsTrigger value="basic">基本情報</TabsTrigger>
            <TabsTrigger value="invoice-settings">請求書設定</TabsTrigger>
            <TabsTrigger value="products">商品マスター</TabsTrigger>
            <TabsTrigger value="shipping">配送料金</TabsTrigger>
            <TabsTrigger value="public-form">公開フォーム</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">農園基本情報</CardTitle>
                <CardDescription className="text-sm">請求書・送り状に印刷される情報</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <div className="space-y-2">
                  <Label>農園名 *</Label>
                  <Input
                    value={farmForm.name}
                    onChange={(e) => setFarmForm({ ...farmForm, name: e.target.value })}
                    placeholder="例: 和田農園"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>郵便番号</Label>
                    <Input
                      value={farmForm.postalCode}
                      onChange={(e) => setFarmForm({ ...farmForm, postalCode: e.target.value })}
                      placeholder="例: 000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>電話番号</Label>
                    <Input
                      value={farmForm.phone}
                      onChange={(e) => setFarmForm({ ...farmForm, phone: e.target.value })}
                      placeholder="例: 090-1234-5678"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>住所</Label>
                  <Input
                    value={farmForm.address}
                    onChange={(e) => setFarmForm({ ...farmForm, address: e.target.value })}
                    placeholder="例: 山形県〇〇市〇〇町1-2-3"
                  />
                </div>
                <div className="space-y-2">
                  <Label>メールアドレス</Label>
                  <Input
                    type="email"
                    value={farmForm.email}
                    onChange={(e) => setFarmForm({ ...farmForm, email: e.target.value })}
                    placeholder="例: info@farm.com"
                  />
                </div>
                <Button size="lg" className="bg-[#2d6a4f] hover:bg-[#1b4332]" onClick={handleSaveFarmInfo}>
                  保存
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoice-settings" className="space-y-4">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">振込先情報</CardTitle>
                <CardDescription className="text-sm">請求書に記載する振込先</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>銀行名</Label>
                    <Input
                      value={farmForm.bankName}
                      onChange={(e) => setFarmForm({ ...farmForm, bankName: e.target.value })}
                      placeholder="例: ○○銀行"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>支店名</Label>
                    <Input
                      value={farmForm.bankBranch}
                      onChange={(e) => setFarmForm({ ...farmForm, bankBranch: e.target.value })}
                      placeholder="例: △△支店"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>口座種別</Label>
                    <select
                      value={farmForm.bankType}
                      onChange={(e) => setFarmForm({ ...farmForm, bankType: e.target.value as "普通" | "当座" })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="普通">普通</option>
                      <option value="当座">当座</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>口座番号</Label>
                    <Input
                      value={farmForm.bankNumber}
                      onChange={(e) => setFarmForm({ ...farmForm, bankNumber: e.target.value })}
                      placeholder="例: 1234567"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>口座名義（カタカナ）</Label>
                  <Input
                    value={farmForm.bankHolder}
                    onChange={(e) => setFarmForm({ ...farmForm, bankHolder: e.target.value })}
                    placeholder="例: ワダノウエン"
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">請求書オプション</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>消費税率（%）</Label>
                    <Input
                      type="number"
                      value={farmForm.taxRate}
                      onChange={(e) => setFarmForm({ ...farmForm, taxRate: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>支払期日（発行から何日後）</Label>
                    <Input
                      type="number"
                      value={farmForm.paymentDueDays}
                      onChange={(e) => setFarmForm({ ...farmForm, paymentDueDays: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>請求書番号プレフィックス</Label>
                    <Input
                      value={farmForm.invoicePrefix}
                      onChange={(e) => setFarmForm({ ...farmForm, invoicePrefix: e.target.value })}
                      placeholder="例: INV"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>インボイス登録番号（適格請求書発行事業者）</Label>
                  <Input
                    value={farmForm.invoiceRegistrationNumber}
                    onChange={(e) => setFarmForm({ ...farmForm, invoiceRegistrationNumber: e.target.value })}
                    placeholder="例: T1234567890123"
                  />
                  <p className="text-xs text-muted-foreground">登録番号を入力すると請求書・領収書に「適格請求書」として記載されます</p>
                </div>
                <div className="space-y-2">
                  <Label>請求書備考（定型文）</Label>
                  <Textarea
                    value={farmForm.invoiceNote}
                    onChange={(e) => setFarmForm({ ...farmForm, invoiceNote: e.target.value })}
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <Button size="lg" className="bg-[#2d6a4f] hover:bg-[#1b4332]" onClick={handleSaveFarmInfo}>
                  保存
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="shipping-mode" className="space-y-4">
            <ShippingModeSettings />
          </TabsContent>

          <TabsContent value="shipping" className="space-y-4">
            <AreaShippingRatesTable />
          </TabsContent>

          <TabsContent value="consolidation" className="space-y-4">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Settings2 className="h-5 w-5" />
                      荷合いルール設定
                    </CardTitle>
                    <CardDescription className="text-sm">
                      複数個口の商品を一つにまとめる際のサイズ変換ルール
                    </CardDescription>
                  </div>
                  <Button
                    className="gap-2 w-full sm:w-auto"
                    onClick={() => {
                      setIsAddingConsolidationRule(true);
                      setEditingConsolidationRule({
                        id: `CR${String(consolidationRules.length + 1).padStart(3, '0')}`,
                        name: "",
                        fromSize: "60",
                        quantity: 2,
                        toSize: "80",
                        enabled: true,
                      });
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    ルール追加
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-2">
                  {consolidationRules.map((rule) => (
                    <div
                      key={rule.id}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-3 ${
                        rule.enabled ? "bg-background" : "bg-muted/30 opacity-60"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <div className="flex items-center gap-2 font-mono text-sm">
                          <Badge variant="outline">{rule.fromSize}サイズ</Badge>
                          <span className="text-muted-foreground">×</span>
                          <Badge variant="outline">{rule.quantity}</Badge>
                          <span className="text-muted-foreground">→</span>
                          <Badge variant="secondary">{rule.toSize}サイズ</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{rule.name}</div>
                        <Badge variant={rule.enabled ? "default" : "secondary"}>
                          {rule.enabled ? "有効" : "無効"}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingConsolidationRule(rule);
                            setIsAddingConsolidationRule(false);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {consolidationRules.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>荷合いルールが登録されていません</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="public-form" className="space-y-4">
            <PublicFormSettings />
          </TabsContent>
        </Tabs>
      </div>

      {/* Shipping Rate Edit Dialog */}
      <Dialog open={!!editingShippingRate} onOpenChange={(open) => !open && setEditingShippingRate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>配送料金編集</DialogTitle>
            <DialogDescription>料金を編集してください</DialogDescription>
          </DialogHeader>
          {editingShippingRate && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>配送業者</Label>
                <div className="font-semibold">{carrierNames[editingShippingRate.carrier]}</div>
              </div>
              <div className="space-y-2">
                <Label>サイズ</Label>
                <div className="font-semibold">{editingShippingRate.size}サイズ</div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="basePrice">基本料金 *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={editingShippingRate.basePrice}
                  onChange={(e) =>
                    setEditingShippingRate({
                      ...editingShippingRate,
                      basePrice: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coolPrice">クール便追加料金 *</Label>
                <Input
                  id="coolPrice"
                  type="number"
                  value={editingShippingRate.coolPrice}
                  onChange={(e) =>
                    setEditingShippingRate({
                      ...editingShippingRate,
                      coolPrice: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <Separator />
              <div className="flex justify-between items-center p-3 bg-muted rounded">
                <span className="font-medium">合計（クール便使用時）</span>
                <span className="text-lg font-bold text-primary">
                  ¥{(editingShippingRate.basePrice + editingShippingRate.coolPrice).toLocaleString()}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingShippingRate(null)}>
              キャンセル
            </Button>
            <Button onClick={() => setEditingShippingRate(null)}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Consolidation Rule Edit Dialog */}
      <Dialog
        open={!!editingConsolidationRule}
        onOpenChange={(open) => {
          if (!open) {
            setEditingConsolidationRule(null);
            setIsAddingConsolidationRule(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isAddingConsolidationRule ? "荷合いルール追加" : "荷合いルール編集"}
            </DialogTitle>
            <DialogDescription>荷合いルールを設定してください</DialogDescription>
          </DialogHeader>
          {editingConsolidationRule && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ruleName">ルール名 *</Label>
                <Input
                  id="ruleName"
                  placeholder="例：60サイズ×2 → 80サイズ"
                  value={editingConsolidationRule.name}
                  onChange={(e) =>
                    setEditingConsolidationRule({ ...editingConsolidationRule, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromSize">元のサイズ *</Label>
                  <Select
                    value={editingConsolidationRule.fromSize}
                    onValueChange={(value) =>
                      setEditingConsolidationRule({ ...editingConsolidationRule, fromSize: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">60</SelectItem>
                      <SelectItem value="80">80</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="120">120</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">個数 *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="2"
                    value={editingConsolidationRule.quantity}
                    onChange={(e) =>
                      setEditingConsolidationRule({
                        ...editingConsolidationRule,
                        quantity: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="toSize">統合後のサイズ *</Label>
                <Select
                  value={editingConsolidationRule.toSize}
                  onValueChange={(value) =>
                    setEditingConsolidationRule({ ...editingConsolidationRule, toSize: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="80">80</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="120">120</SelectItem>
                    <SelectItem value="140">140</SelectItem>
                    <SelectItem value="160">160</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={editingConsolidationRule.enabled}
                  onChange={(e) =>
                    setEditingConsolidationRule({
                      ...editingConsolidationRule,
                      enabled: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <Label htmlFor="enabled" className="cursor-pointer">
                  このルールを有効にする
                </Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingConsolidationRule(null);
                setIsAddingConsolidationRule(false);
              }}
            >
              キャンセル
            </Button>
            <Button
              onClick={() => {
                setEditingConsolidationRule(null);
                setIsAddingConsolidationRule(false);
              }}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
