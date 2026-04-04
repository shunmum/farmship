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
import { useToast } from "@/hooks/use-toast";
import { FileDown, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMockData } from "@/contexts/MockDataContext";

const InvoiceBatchPage = () => {
  const { toast } = useToast();
  const { customers, orders } = useMockData();

  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [startDate, setStartDate] = useState("2026-03-01");
  const [endDate, setEndDate] = useState("2026-03-31");
  const [filteredOrders, setFilteredOrders] = useState<typeof orders>([]);
  const [searched, setSearched] = useState(false);

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

  const handleGeneratePDF = () => {
    toast({ title: "PDF生成", description: "請求書PDFを生成しています（実装予定）" });
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">請求書一括作成</h1>
          <p className="text-muted-foreground text-sm">同一送り主の複数注文をまとめて請求書を作成</p>
        </div>

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
            <Button
              onClick={handleSearch}
              className="bg-[#2d6a4f] hover:bg-[#1b4332]"
            >
              検索
            </Button>
          </CardContent>
        </Card>

        {searched && filteredOrders.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>注文明細（{filteredOrders.length}件）</CardTitle>
              <Button onClick={handleGeneratePDF} className="bg-[#2d6a4f] hover:bg-[#1b4332] gap-2">
                <FileDown className="h-4 w-4" />
                PDF出力
              </Button>
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
    </div>
  );
};

export default InvoiceBatchPage;
