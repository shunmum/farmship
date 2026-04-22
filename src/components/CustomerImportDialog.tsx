import { useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Upload, Download, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCustomers } from "@/hooks/useCustomers";

const CSV_HEADERS = [
  "送り主名",
  "送り主電話",
  "送り主メール",
  "送り主郵便番号",
  "送り主住所",
  "送り主メモ",
  "送り先名",
  "続柄",
  "送り先電話",
  "送り先郵便番号",
  "送り先住所",
  "送り先メール",
  "送り先備考",
];

const TEMPLATE_CSV = [
  CSV_HEADERS.join(","),
  "田中太郎,090-1234-5678,tanaka@example.com,100-0001,東京都千代田区丸の内1-1-1,VIP顧客,山田花子,娘,080-9876-5432,150-0001,東京都渋谷区神宮前3-3-3,hanako@example.com,不在時は置き配",
  "田中太郎,090-1234-5678,tanaka@example.com,100-0001,東京都千代田区丸の内1-1-1,VIP顧客,佐藤次郎,友人,070-1111-2222,810-0001,福岡県福岡市中央区天神5-5-5,,",
  "鈴木一郎,03-1234-5678,,530-0001,大阪府大阪市北区梅田2-2-2,,,,,,,,",
].join("\n");

type Row = Record<string, string>;

interface ParsedGroup {
  customer: {
    name: string;
    phone: string;
    email: string;
    postalCode: string;
    address: string;
    memo: string;
  };
  recipients: Array<{
    name: string;
    relation: string;
    phone: string;
    postalCode: string;
    address: string;
    email: string;
    notes: string;
  }>;
}

function parseCsv(text: string): { groups: ParsedGroup[]; errors: string[] } {
  const errors: string[] = [];
  const { data } = Papa.parse<Row>(text, { header: true, skipEmptyLines: true });

  const groupMap = new Map<string, ParsedGroup>();

  data.forEach((row, idx) => {
    const customerName = (row["送り主名"] ?? "").trim();
    const customerPhone = (row["送り主電話"] ?? "").trim();
    const customerPostal = (row["送り主郵便番号"] ?? "").trim();
    const customerAddress = (row["送り主住所"] ?? "").trim();

    if (!customerName) {
      errors.push(`${idx + 2}行目: 送り主名が空です`);
      return;
    }
    if (!customerPhone) {
      errors.push(`${idx + 2}行目: 送り主電話が空です`);
      return;
    }
    if (!customerPostal || !customerAddress) {
      errors.push(`${idx + 2}行目: 送り主郵便番号/住所が空です`);
      return;
    }

    const key = `${customerName}__${customerPhone}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        customer: {
          name: customerName,
          phone: customerPhone,
          email: (row["送り主メール"] ?? "").trim(),
          postalCode: customerPostal,
          address: customerAddress,
          memo: (row["送り主メモ"] ?? "").trim(),
        },
        recipients: [],
      });
    }

    const recName = (row["送り先名"] ?? "").trim();
    if (recName) {
      const recPhone = (row["送り先電話"] ?? "").trim();
      const recPostal = (row["送り先郵便番号"] ?? "").trim();
      const recAddress = (row["送り先住所"] ?? "").trim();
      if (!recPhone || !recPostal || !recAddress) {
        errors.push(`${idx + 2}行目: 送り先の電話/郵便番号/住所が空です`);
        return;
      }
      groupMap.get(key)!.recipients.push({
        name: recName,
        relation: (row["続柄"] ?? "").trim(),
        phone: recPhone,
        postalCode: recPostal,
        address: recAddress,
        email: (row["送り先メール"] ?? "").trim(),
        notes: (row["送り先備考"] ?? "").trim(),
      });
    }
  });

  return { groups: Array.from(groupMap.values()), errors };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerImportDialog({ open, onOpenChange }: Props) {
  const { toast } = useToast();
  const { addCustomer, addRecipient } = useCustomers();
  const [groups, setGroups] = useState<ParsedGroup[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);

  const reset = () => {
    setGroups([]);
    setErrors([]);
    setFileName("");
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob(["\uFEFF" + TEMPLATE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customer_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { groups, errors } = parseCsv(text);
      setGroups(groups);
      setErrors(errors);
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleImport = async () => {
    setImporting(true);
    let customerCount = 0;
    let recipientCount = 0;
    let failCount = 0;

    for (const g of groups) {
      const { data: customerData, error } = await addCustomer({
        ...g.customer,
        invoiceType: undefined,
        recipients: [],
      });
      if (error || !customerData) {
        failCount++;
        continue;
      }
      customerCount++;

      for (const r of g.recipients) {
        const { error: rErr } = await addRecipient({
          ...r,
          customerId: customerData.id,
        });
        if (rErr) failCount++;
        else recipientCount++;
      }
    }

    setImporting(false);
    toast({
      title: "インポート完了",
      description: `顧客${customerCount}件・送り先${recipientCount}件を登録${failCount > 0 ? `（${failCount}件失敗）` : ""}`,
    });
    reset();
    onOpenChange(false);
  };

  const totalRecipients = groups.reduce((s, g) => s + g.recipients.length, 0);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>顧客データをCSVインポート</DialogTitle>
          <DialogDescription>
            送り主と送り先を1つのCSVでまとめてインポートできます
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* テンプレートDL */}
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-blue-900">CSVテンプレート</p>
                <p className="text-xs text-blue-700 mt-0.5">
                  フォーマットに合わせて入力してください。同じ送り主は自動でまとめられます
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={handleDownloadTemplate} className="flex-shrink-0 gap-1">
              <Download className="h-3.5 w-3.5" />
              DL
            </Button>
          </div>

          {/* ファイル選択 */}
          <div>
            <label
              htmlFor="csv-file-input"
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <Upload className="h-8 w-8 text-gray-400" />
              <div className="text-sm text-center">
                {fileName ? (
                  <span className="font-medium text-gray-900">{fileName}</span>
                ) : (
                  <>
                    <span className="font-medium text-[#2d6a4f]">CSVファイルを選択</span>
                    <p className="text-xs text-gray-500 mt-0.5">クリックしてファイルを選ぶ</p>
                  </>
                )}
              </div>
            </label>
            <input
              id="csv-file-input"
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>

          {/* プレビュー */}
          {groups.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  <strong>{groups.length}件</strong>の送り主と
                  <strong> {totalRecipients}件</strong>の送り先を検出
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto border rounded-lg divide-y text-sm">
                {groups.slice(0, 10).map((g, i) => (
                  <div key={i} className="p-2">
                    <p className="font-semibold">{g.customer.name}</p>
                    <p className="text-xs text-gray-500">
                      {g.customer.phone} / 送り先{g.recipients.length}件
                      {g.recipients.length > 0 && `: ${g.recipients.map((r) => r.name).join("、")}`}
                    </p>
                  </div>
                ))}
                {groups.length > 10 && (
                  <p className="p-2 text-xs text-gray-400 text-center">他 {groups.length - 10} 件...</p>
                )}
              </div>
            </div>
          )}

          {/* エラー表示 */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm space-y-0.5">
                  <p className="font-semibold text-red-900">エラー {errors.length}件（スキップされます）</p>
                  <div className="max-h-24 overflow-y-auto text-xs text-red-700">
                    {errors.slice(0, 10).map((e, i) => (
                      <p key={i}>・{e}</p>
                    ))}
                    {errors.length > 10 && <p>...他 {errors.length - 10}件</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={importing}>
            キャンセル
          </Button>
          <Button
            className="bg-[#2d6a4f] hover:bg-[#1b4332]"
            onClick={handleImport}
            disabled={groups.length === 0 || importing}
          >
            {importing ? "インポート中..." : `${groups.length}件をインポート`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
