import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrders } from "@/hooks/useOrders";
import { useMockData } from "@/contexts/MockDataContext";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  MapPin,
  Truck,
  Banknote,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, updateOrder } = useOrders();
  const { customers } = useMockData();
  const { toast } = useToast();

  const order = orders.find((o) => o.id === id);
  const customer = customers.find((c) => c.id === order?.customerId);

  if (!order) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-4xl">
          <Button variant="ghost" onClick={() => navigate("/orders")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            受注一覧へ戻る
          </Button>
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold">注文が見つかりません</h2>
          </div>
        </div>
      </div>
    );
  }

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

  const handleMarkShipped = async () => {
    await updateOrder(order.id, { status: "配送済み" });
    toast({ title: "✅ 配送済みに変更しました" });
  };

  const handleMarkPaid = async () => {
    await updateOrder(order.id, { paymentStatus: "入金済み" });
    toast({ title: "✅ 入金済みに変更しました" });
  };

  const handleCancel = async () => {
    await updateOrder(order.id, { status: "キャンセル" });
    toast({ title: "注文をキャンセルしました" });
  };

  // 送り先情報
  const recipientInfo = customer?.recipients?.find((r) => r.id === order.recipientId);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => navigate("/orders")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold truncate">注文番号: {order.orderNumber}</h1>
              <p className="text-sm text-gray-500">注文日: {order.orderDate}</p>
            </div>
            {getStatusBadge(order.status)}
          </div>
          <div className="flex flex-wrap gap-2">
            {order.paymentStatus === "未入金" && (
              <Button
                size="sm"
                className="bg-[#2d6a4f] hover:bg-[#1b4332] gap-1 flex-1 sm:flex-none"
                onClick={handleMarkPaid}
              >
                <Banknote className="h-4 w-4" />
                入金済みにする
              </Button>
            )}
            {order.status === "配送前" && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1 flex-1 sm:flex-none"
                onClick={handleMarkShipped}
              >
                <Truck className="h-4 w-4" />
                配送済みにする
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCancel} className="text-destructive">
                  注文をキャンセル
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* メインコンテンツ */}
          <div className="space-y-6 lg:col-span-2">
            {/* 商品情報 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  商品 ({order.products.length}件)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.products.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#2d6a4f]/10">
                      <Package className="h-7 w-7 text-[#2d6a4f]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{item.productName}</p>
                      <p className="text-sm text-gray-500">数量: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 支払い情報 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  お支払い情報
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">商品合計</span>
                    <span className="font-medium">¥{order.amount.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-semibold">合計金額</span>
                    <span className="text-xl font-bold text-[#2d6a4f]">¥{order.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-gray-500">入金ステータス</span>
                    <Badge
                      variant={order.paymentStatus === "入金済み" ? "default" : "outline"}
                      className={order.paymentStatus === "入金済み" ? "bg-green-500" : "border-orange-500 text-orange-700 bg-orange-50"}
                    >
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 注文者情報 */}
            <Card>
              <CardHeader>
                <CardTitle>注文者（送り主）</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                {customer ? (
                  <>
                    <p className="font-semibold text-base">{customer.name}</p>
                    <p className="text-gray-500">{customer.phone}</p>
                    <p className="text-gray-500">{customer.email}</p>
                  </>
                ) : (
                  <p className="text-gray-500">{order.customerName}</p>
                )}
              </CardContent>
            </Card>

            {/* 配送先 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  配送先（送り先）
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                {recipientInfo ? (
                  <>
                    <p className="font-semibold text-base">
                      {recipientInfo.name}
                      {recipientInfo.relation && (
                        <span className="text-xs font-normal text-gray-500 ml-1">（{recipientInfo.relation}）</span>
                      )}
                    </p>
                    <p className="text-gray-500">〒{recipientInfo.postalCode}</p>
                    <p className="text-gray-500">{recipientInfo.address}</p>
                    <p className="text-gray-500">{recipientInfo.phone}</p>
                  </>
                ) : (
                  <p className="text-gray-500">{order.recipientName || "配送先情報なし"}</p>
                )}
              </CardContent>
            </Card>

            {/* 配送情報 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  配送情報
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">配送業者</span>
                  <span className="font-medium">{order.shippingCompany || "未設定"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">配送予定日</span>
                  <span className="font-medium">{order.deliveryDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">配送ステータス</span>
                  {getStatusBadge(order.status)}
                </div>
                {order.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">追跡番号</span>
                    <span className="font-medium">{order.trackingNumber}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
