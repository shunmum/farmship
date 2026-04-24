import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProducts } from "@/hooks/useProducts";
import { Plus, Edit, Trash2, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
import { Checkbox } from "@/components/ui/checkbox";

const ProductManagement = () => {
  const { products, productVariants, addProduct, updateProduct, deleteProduct, addProductVariant, updateProductVariant, deleteProductVariant, loading } = useProducts();
  const { toast } = useToast();

  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingVariant, setEditingVariant] = useState<any>(null);
  const [selectedParentId, setSelectedParentId] = useState("");

  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    description: "",
    isParent: false,
    price: "",
    size: "60",
    weight: "",
  });

  const [variantForm, setVariantForm] = useState({
    name: "",
    price: "",
    size: "60",
    weight: "",
  });

  const resetProductForm = () => {
    setProductForm({
      name: "",
      category: "",
      description: "",
      isParent: false,
      price: "",
      size: "60",
      weight: "",
    });
    setEditingProduct(null);
  };

  const resetVariantForm = () => {
    setVariantForm({
      name: "",
      price: "",
      size: "60",
      weight: "",
    });
    setEditingVariant(null);
    setSelectedParentId("");
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.category) {
      toast({
        title: "入力エラー",
        description: "商品名とカテゴリは必須です",
        variant: "destructive",
      });
      return;
    }

    if (!productForm.isParent && (!productForm.price || !productForm.weight)) {
      toast({
        title: "入力エラー",
        description: "単品商品の場合、価格と重量は必須です",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      name: productForm.name,
      category: productForm.category,
      description: productForm.description,
      isParent: productForm.isParent,
      price: productForm.isParent ? undefined : parseFloat(productForm.price),
      size: productForm.isParent ? undefined : productForm.size,
      weight: productForm.isParent ? undefined : parseFloat(productForm.weight),
    };

    const { error } = editingProduct
      ? await updateProduct(editingProduct.id, productData)
      : await addProduct(productData);

    if (error) {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "成功",
        description: editingProduct ? "商品を更新しました" : "商品を追加しました",
      });
      setIsProductDialogOpen(false);
      resetProductForm();
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("この商品を削除してもよろしいですか？")) return;

    const { error } = await deleteProduct(id);
    if (error) {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "成功",
        description: "商品を削除しました",
      });
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      description: product.description || "",
      isParent: product.isParent,
      price: product.price?.toString() || "",
      size: product.size || "60",
      weight: product.weight?.toString() || "",
    });
    setIsProductDialogOpen(true);
  };

  const handleSaveVariant = async () => {
    if (!selectedParentId || !variantForm.name || !variantForm.price || !variantForm.weight) {
      toast({
        title: "入力エラー",
        description: "すべての項目を入力してください",
        variant: "destructive",
      });
      return;
    }

    const variantData = {
      parentProductId: selectedParentId,
      name: variantForm.name,
      price: parseFloat(variantForm.price),
      size: variantForm.size,
      weight: parseFloat(variantForm.weight),
    };

    const { error } = editingVariant
      ? await updateProductVariant(editingVariant.id, variantData)
      : await addProductVariant(variantData);

    if (error) {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "成功",
        description: editingVariant ? "バリエーションを更新しました" : "バリエーションを追加しました",
      });
      setIsVariantDialogOpen(false);
      resetVariantForm();
    }
  };

  const handleDeleteVariant = async (id: string) => {
    if (!confirm("このバリエーションを削除してもよろしいですか？")) return;

    const { error } = await deleteProductVariant(id);
    if (error) {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "成功",
        description: "バリエーションを削除しました",
      });
    }
  };

  const handleEditVariant = (variant: any) => {
    setEditingVariant(variant);
    setSelectedParentId(variant.parentProductId);
    setVariantForm({
      name: variant.name,
      price: variant.price.toString(),
      size: variant.size,
      weight: variant.weight.toString(),
    });
    setIsVariantDialogOpen(true);
  };

  const handleAddVariant = (parentId: string) => {
    setSelectedParentId(parentId);
    setIsVariantDialogOpen(true);
  };

  const parentProducts = products.filter(p => p.isParent);
  const singleProducts = products.filter(p => !p.isParent);

  // カテゴリ折りたたみ状態（デフォルトは全て閉じる）
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const toggleCategory = (key: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>商品マスタ</CardTitle>
              <CardDescription>販売する商品を管理します</CardDescription>
            </div>
            <Button onClick={() => {
              resetProductForm();
              setIsProductDialogOpen(true);
            }} className="gap-2">
              <Plus className="h-4 w-4" />
              商品を追加
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 親商品（バリエーションあり）— カテゴリ別にグルーピング */}
          {parentProducts.length > 0 && (() => {
            const byCategory = new Map<string, typeof parentProducts>();
            parentProducts.forEach((p) => {
              const cat = p.category || "その他";
              if (!byCategory.has(cat)) byCategory.set(cat, []);
              byCategory.get(cat)!.push(p);
            });
            return (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">バリエーション商品</h3>
                {Array.from(byCategory.entries()).map(([category, categoryProducts]) => {
                  const key = `parent:${category}`;
                  const isOpen = expandedCategories.has(key);
                  return (
                  <div key={category} className="border rounded-lg overflow-hidden">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                      onClick={() => toggleCategory(key)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#2d6a4f] border-l-4 border-[#2d6a4f] pl-2">{category}</span>
                        <span className="text-xs text-muted-foreground">（{categoryProducts.length}商品）</span>
                      </div>
                      {isOpen ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                    </button>
                    {isOpen && (
                    <div className="p-3 space-y-3 bg-white">
                    {categoryProducts.map((product) => {
                      const variants = productVariants.filter(v => v.parentProductId === product.id);
                      return (
                        <Card key={product.id} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-base">{product.name}</h4>
                                <p className="text-sm text-muted-foreground">{product.category}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={() => handleEditProduct(product)} variant="outline" size="sm">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button onClick={() => handleDeleteProduct(product.id)} variant="outline" size="sm">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2 pl-4 border-l-2">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">バリエーション</span>
                                <Button onClick={() => handleAddVariant(product.id)} variant="outline" size="sm">
                                  <Plus className="h-3 w-3 mr-1" />追加
                                </Button>
                              </div>
                              {variants.map((variant) => (
                                <div key={variant.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                  <div className="flex-1">
                                    <span className="text-sm">{variant.name}</span>
                                    <span className="text-sm text-muted-foreground ml-2">
                                      ¥{variant.price.toLocaleString()} / {variant.size}サイズ / {variant.weight}kg
                                    </span>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button onClick={() => handleEditVariant(variant)} variant="ghost" size="sm">
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button onClick={() => handleDeleteVariant(variant.id)} variant="ghost" size="sm">
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              {variants.length === 0 && (
                                <p className="text-sm text-muted-foreground">バリエーションがありません</p>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                    </div>
                    )}
                  </div>
                  );
                })}
              </div>
            );
          })()}

          {/* 単品商品 — カテゴリ別にグルーピング */}
          {singleProducts.length > 0 && (() => {
            const byCategory = new Map<string, typeof singleProducts>();
            singleProducts.forEach((p) => {
              const cat = p.category || "その他";
              if (!byCategory.has(cat)) byCategory.set(cat, []);
              byCategory.get(cat)!.push(p);
            });
            return (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">単品商品</h3>
                {Array.from(byCategory.entries()).map(([category, categoryProducts]) => {
                  const key = `single:${category}`;
                  const isOpen = expandedCategories.has(key);
                  return (
                  <div key={category} className="border rounded-lg overflow-hidden">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                      onClick={() => toggleCategory(key)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#2d6a4f] border-l-4 border-[#2d6a4f] pl-2">{category}</span>
                        <span className="text-xs text-muted-foreground">（{categoryProducts.length}商品）</span>
                      </div>
                      {isOpen ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                    </button>
                    {isOpen && (
                    <div className="p-3 space-y-3 bg-white">
                    {categoryProducts.map((product) => (
                      <Card key={product.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-base">{product.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {product.category} / ¥{product.price?.toLocaleString()} / {product.size}サイズ / {product.weight}kg
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => handleEditProduct(product)} variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button onClick={() => handleDeleteProduct(product.id)} variant="outline" size="sm">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                    </div>
                    )}
                  </div>
                  );
                })}
              </div>
            );
          })()}

          {products.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              商品が登録されていません
            </div>
          )}
        </CardContent>
      </Card>

      {/* 商品追加・編集ダイアログ */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? "商品を編集" : "商品を追加"}</DialogTitle>
            <DialogDescription>商品情報を入力してください</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productName">商品名 *</Label>
              <Input
                id="productName"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                placeholder="有機トマト"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">カテゴリ *</Label>
              <Input
                id="category"
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                placeholder="野菜"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">説明（任意）</Label>
              <Input
                id="description"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                placeholder="新鮮な有機栽培トマト"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isParent"
                checked={productForm.isParent}
                onCheckedChange={(checked) => setProductForm({ ...productForm, isParent: checked as boolean })}
              />
              <Label htmlFor="isParent" className="cursor-pointer">
                バリエーション商品（サイズ違いなど）
              </Label>
            </div>

            {!productForm.isParent && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="price">価格（円） *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="1200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">配送サイズ *</Label>
                  <Select value={productForm.size} onValueChange={(value) => setProductForm({ ...productForm, size: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">60サイズ</SelectItem>
                      <SelectItem value="80">80サイズ</SelectItem>
                      <SelectItem value="100">100サイズ</SelectItem>
                      <SelectItem value="120">120サイズ</SelectItem>
                      <SelectItem value="140">140サイズ</SelectItem>
                      <SelectItem value="160">160サイズ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">重量（kg） *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={productForm.weight}
                    onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                    placeholder="2.0"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsProductDialogOpen(false);
              resetProductForm();
            }}>
              キャンセル
            </Button>
            <Button onClick={handleSaveProduct}>
              {editingProduct ? "更新" : "追加"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* バリエーション追加・編集ダイアログ */}
      <Dialog open={isVariantDialogOpen} onOpenChange={setIsVariantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVariant ? "バリエーションを編集" : "バリエーションを追加"}</DialogTitle>
            <DialogDescription>バリエーション情報を入力してください</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!editingVariant && (
              <div className="space-y-2">
                <Label htmlFor="parentProduct">親商品 *</Label>
                <Select value={selectedParentId} onValueChange={setSelectedParentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="親商品を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {parentProducts.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="variantName">バリエーション名 *</Label>
              <Input
                id="variantName"
                value={variantForm.name}
                onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
                placeholder="2kg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="variantPrice">価格（円） *</Label>
              <Input
                id="variantPrice"
                type="number"
                value={variantForm.price}
                onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
                placeholder="1200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="variantSize">配送サイズ *</Label>
              <Select value={variantForm.size} onValueChange={(value) => setVariantForm({ ...variantForm, size: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">60サイズ</SelectItem>
                  <SelectItem value="80">80サイズ</SelectItem>
                  <SelectItem value="100">100サイズ</SelectItem>
                  <SelectItem value="120">120サイズ</SelectItem>
                  <SelectItem value="140">140サイズ</SelectItem>
                  <SelectItem value="160">160サイズ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="variantWeight">重量（kg） *</Label>
              <Input
                id="variantWeight"
                type="number"
                step="0.1"
                value={variantForm.weight}
                onChange={(e) => setVariantForm({ ...variantForm, weight: e.target.value })}
                placeholder="2.0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsVariantDialogOpen(false);
              resetVariantForm();
            }}>
              キャンセル
            </Button>
            <Button onClick={handleSaveVariant}>
              {editingVariant ? "更新" : "追加"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;
