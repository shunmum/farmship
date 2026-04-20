import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ProductVariant {
  id: string;
  parentProductId: string;
  name: string;
  price: number;
  size: string;
  weight: number;
  sku?: string;
  isActive?: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  isParent: boolean;
  price?: number;
  size?: string;
  weight?: number;
  isActive?: boolean;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const [{ data: productsData, error: productsError }, { data: variantsData, error: variantsError }] =
        await Promise.all([
          supabase.from("products").select("*").order("created_at", { ascending: false }),
          supabase.from("product_variants").select("*").order("created_at", { ascending: false }),
        ]);

      if (productsError) throw productsError;
      if (variantsError) throw variantsError;

      setProducts(
        (productsData ?? []).map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          isParent: (variantsData ?? []).some((v) => v.parent_product_id === p.id),
          price: p.price ? Number(p.price) : undefined,
          size: p.size_cm ? String(p.size_cm) : undefined,
          weight: p.weight_kg ? Number(p.weight_kg) : undefined,
        }))
      );

      setProductVariants(
        (variantsData ?? []).map((v) => ({
          id: v.id,
          parentProductId: v.parent_product_id,
          name: v.name,
          price: Number(v.price),
          size: v.size ?? "",
          weight: v.weight ? Number(v.weight) : 0,
          sku: v.sku ?? undefined,
          isActive: true,
        }))
      );
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err instanceof Error ? err.message : "商品データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (product: Omit<Product, "id">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("products")
        .insert({
          user_id: user?.id,
          name: product.name,
          category: product.category,
          price: product.price ?? 0,
          size_cm: product.size ? Number(product.size) : null,
          weight_kg: product.weight ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchProducts();
      return { data, error: null };
    } catch (err) {
      console.error("Error adding product:", err);
      return { data: null, error: err as Error };
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.size !== undefined) dbUpdates.size_cm = updates.size ? Number(updates.size) : null;
      if (updates.weight !== undefined) dbUpdates.weight_kg = updates.weight;

      const { data, error } = await supabase
        .from("products")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      await fetchProducts();
      return { data, error: null };
    } catch (err) {
      console.error("Error updating product:", err);
      return { data: null, error: err as Error };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      await fetchProducts();
      return { error: null };
    } catch (err) {
      console.error("Error deleting product:", err);
      return { error: err as Error };
    }
  };

  const addProductVariant = async (variant: Omit<ProductVariant, "id">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("product_variants")
        .insert({
          user_id: user?.id,
          parent_product_id: variant.parentProductId,
          name: variant.name,
          price: variant.price,
          size: variant.size || null,
          weight: variant.weight || null,
          sku: variant.sku || null,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchProducts();
      return { data, error: null };
    } catch (err) {
      console.error("Error adding product variant:", err);
      return { data: null, error: err as Error };
    }
  };

  const updateProductVariant = async (id: string, updates: Partial<ProductVariant>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.size !== undefined) dbUpdates.size = updates.size || null;
      if (updates.weight !== undefined) dbUpdates.weight = updates.weight || null;
      if (updates.sku !== undefined) dbUpdates.sku = updates.sku || null;

      const { data, error } = await supabase
        .from("product_variants")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      await fetchProducts();
      return { data, error: null };
    } catch (err) {
      console.error("Error updating product variant:", err);
      return { data: null, error: err as Error };
    }
  };

  const deleteProductVariant = async (id: string) => {
    try {
      const { error } = await supabase.from("product_variants").delete().eq("id", id);
      if (error) throw error;
      await fetchProducts();
      return { error: null };
    } catch (err) {
      console.error("Error deleting product variant:", err);
      return { error: err as Error };
    }
  };

  return {
    products,
    productVariants,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    addProductVariant,
    updateProductVariant,
    deleteProductVariant,
    refetch: fetchProducts,
  };
}
