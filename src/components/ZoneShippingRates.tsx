import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useShippingCalculation } from "@/hooks/useShippingCalculation";
import { type ShippingCarrier } from "@/hooks/useShippingSettings";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Plus, Truck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
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

const ZoneShippingRates = () => {
  const {
    zones,
    zoneRates,
    addZoneRate,
    updateZoneRate,
    deleteZoneRate,
    loading,
  } = useShippingCalculation();

  const { toast } = useToast();

  const [editingRate, setEditingRate] = useState<{
    id?: string;
    zoneId: string;
    carrier: ShippingCarrier;
    size: string;
    basePrice: number;
    coolPrice: number;
  } | null>(null);

  const carrierNames: Record<ShippingCarrier, string> = {
    yamato: "ヤマト運輸",
    sagawa: "佐川急便",
    yupack: "ゆうパック",
  };

  const sizes = ["60", "80", "100", "120", "140", "160"];

  const getRatesForZone = (zoneId: string) => {
    return zoneRates.filter(r => r.zoneId === zoneId);
  };

  const groupRatesByCarrier = (rates: typeof zoneRates) => {
    return rates.reduce((acc, rate) => {
      if (!acc[rate.carrier]) {
        acc[rate.carrier] = [];
      }
      acc[rate.carrier].push(rate);
      return {};
    }, {} as Record<ShippingCarrier, typeof zoneRates>);
  };

  const handleSaveRate = async () => {
    if (!editingRate) return;

    if (!editingRate.zoneId || !editingRate.carrier || !editingRate.size) {
      toast({
        title: "入力エラー",
        description: "すべての項目を入力してください",
        variant: "destructive",
      });
      return;
    }

    const { error } = editingRate.id
      ? await updateZoneRate(editingRate.id, {
          zoneId: editingRate.zoneId,
          carrier: editingRate.carrier,
          size: editingRate.size,
          basePrice: editingRate.basePrice,
          coolPrice: editingRate.coolPrice,
        })
      : await addZoneRate({
          zoneId: editingRate.zoneId,
          carrier: editingRate.carrier,
          size: editingRate.size,
          basePrice: editingRate.basePrice,
          coolPrice: editingRate.coolPrice,
        });

    if (error) {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "成功",
        description: editingRate.id ? "料金を更新しました" : "料金を追加しました",
      });
      setEditingRate(null);
    }
  };

  const handleDeleteRate = async (id: string) => {
    if (!confirm("この料金設定を削除しますか?")) return;

    const { error } = await deleteZoneRate(id);

    if (error) {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "成功",
        description: "料金を削除しました",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ゾーン別送料設定</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        </CardContent>
      </Card>
    );
  }

  if (zones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            ゾーン別送料設定
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Truck className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>先にゾーンを作成してください</p>
            <p className="text-xs mt-1">「ゾーン管理」から配送ゾーンを追加できます</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Truck className="h-5 w-5" />
              ゾーン別送料設定
            </CardTitle>
            <CardDescription className="text-sm">
              各ゾーンの配送料金を業者・サイズごとに設定します
            </CardDescription>
          </div>
          <Button
            className="gap-2 w-full sm:w-auto"
            onClick={() =>
              setEditingRate({
                zoneId: zones[0]?.id || "",
                carrier: "yamato",
                size: "60",
                basePrice: 0,
                coolPrice: 0,
              })
            }
          >
            <Plus className="h-4 w-4" />
            新規料金追加
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-4 sm:p-6">
        {zones.map((zone) => {
          const zoneRatesList = getRatesForZone(zone.id);
          const groupedRates = groupRatesByCarrier(zoneRatesList);

          return (
            <div key={zone.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{zone.name}ゾーン</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditingRate({
                      zoneId: zone.id,
                      carrier: "yamato",
                      size: "60",
                      basePrice: 0,
                      coolPrice: 0,
                    })
                  }
                >
                  <Plus className="h-3 w-3 mr-1" />
                  このゾーンに追加
                </Button>
              </div>

              {zoneRatesList.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/20">
                  このゾーンの料金が未設定です
                </div>
              ) : (
                <>
                  {/* ============================================
                      モバイル表示: カードレイアウト
                  ============================================ */}
                  <div className="md:hidden space-y-2">
                    {zoneRatesList
                      .sort((a, b) => {
                        if (a.carrier !== b.carrier) return a.carrier.localeCompare(b.carrier);
                        return parseInt(a.size) - parseInt(b.size);
                      })
                      .map((rate) => (
                        <div key={rate.id} className="border rounded-lg p-3 bg-background">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm">{carrierNames[rate.carrier]}</span>
                                <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-medium">
                                  {rate.size}サイズ
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-muted-foreground mt-1">
                                <span>基本料金</span>
                                <span className="text-right tabular-nums text-foreground">
                                  ¥{rate.basePrice.toLocaleString()}
                                </span>
                                <span>クール便追加</span>
                                <span className="text-right tabular-nums text-foreground">
                                  ¥{rate.coolPrice.toLocaleString()}
                                </span>
                                <span className="font-medium text-foreground">クール便合計</span>
                                <span className="text-right tabular-nums font-semibold text-primary">
                                  ¥{(rate.basePrice + rate.coolPrice).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingRate(rate)}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleDeleteRate(rate.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* ============================================
                      PC表示: テーブルレイアウト
                  ============================================ */}
                  <div className="hidden md:block border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr className="text-left text-sm">
                          <th className="p-3 font-medium">配送業者</th>
                          <th className="p-3 font-medium">サイズ</th>
                          <th className="p-3 font-medium">基本料金</th>
                          <th className="p-3 font-medium">クール便追加料金</th>
                          <th className="p-3 font-medium">合計（クール便）</th>
                          <th className="p-3 font-medium">アクション</th>
                        </tr>
                      </thead>
                      <tbody>
                        {zoneRatesList
                          .sort((a, b) => {
                            if (a.carrier !== b.carrier) return a.carrier.localeCompare(b.carrier);
                            return parseInt(a.size) - parseInt(b.size);
                          })
                          .map((rate) => (
                            <tr key={rate.id} className="border-t text-sm hover:bg-muted/30">
                              <td className="p-3">{carrierNames[rate.carrier]}</td>
                              <td className="p-3 font-medium">{rate.size}サイズ</td>
                              <td className="p-3">¥{rate.basePrice.toLocaleString()}</td>
                              <td className="p-3">¥{rate.coolPrice.toLocaleString()}</td>
                              <td className="p-3 font-semibold text-primary">
                                ¥{(rate.basePrice + rate.coolPrice).toLocaleString()}
                              </td>
                              <td className="p-3">
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingRate(rate)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive"
                                    onClick={() => handleDeleteRate(rate.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </CardContent>

      {/* 料金編集ダイアログ */}
      <Dialog open={!!editingRate} onOpenChange={(open) => !open && setEditingRate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRate?.id ? "料金編集" : "新規料金追加"}</DialogTitle>
            <DialogDescription>ゾーン別の配送料金を設定してください</DialogDescription>
          </DialogHeader>
          {editingRate && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rateZone">ゾーン *</Label>
                <Select
                  value={editingRate.zoneId}
                  onValueChange={(value) => setEditingRate({ ...editingRate, zoneId: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rateCarrier">配送業者 *</Label>
                <Select
                  value={editingRate.carrier}
                  onValueChange={(value) =>
                    setEditingRate({ ...editingRate, carrier: value as ShippingCarrier })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yamato">ヤマト運輸</SelectItem>
                    <SelectItem value="sagawa">佐川急便</SelectItem>
                    <SelectItem value="yupack">ゆうパック</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rateSize">サイズ *</Label>
                <Select
                  value={editingRate.size}
                  onValueChange={(value) => setEditingRate({ ...editingRate, size: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}サイズ
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="basePrice">基本料金 *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  min="0"
                  value={editingRate.basePrice}
                  onChange={(e) =>
                    setEditingRate({
                      ...editingRate,
                      basePrice: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coolPrice">クール便追加料金 *</Label>
                <Input
                  id="coolPrice"
                  type="number"
                  min="0"
                  value={editingRate.coolPrice}
                  onChange={(e) =>
                    setEditingRate({
                      ...editingRate,
                      coolPrice: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex justify-between items-center p-3 bg-muted rounded">
                <span className="font-medium">合計（クール便使用時）</span>
                <span className="text-lg font-bold text-primary">
                  ¥{(editingRate.basePrice + editingRate.coolPrice).toLocaleString()}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRate(null)}>
              キャンセル
            </Button>
            <Button onClick={handleSaveRate}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ZoneShippingRates;
