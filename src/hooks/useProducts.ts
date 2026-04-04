import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { MOCK_PRODUCTS, MOCK_PRODUCT_VARIANTS } from '@/data/mockData';

export interface ProductVariant {
  id: string;
  parentProductId: string;
  name: string;
  price: number;
  size: string;
  weight: number;
  sku?: string;
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
}

type ProductRow = Tables<'products'>;

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // 商品マスタを取得
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      if (productsData && productsData.length > 0) {
        setProducts(
          productsData.map((p: ProductRow) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            description: undefined,
            isParent: false,
            price: p.price ? Number(p.price) : undefined,
            size: p.size_cm ? String(p.size_cm) : undefined,
            weight: p.weight_kg ? Number(p.weight_kg) : undefined,
          }))
        );
        setProductVariants([]);
      } else {
        // Supabaseにデータがない場合はモックデータを使用
        setProducts(MOCK_PRODUCTS.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          description: p.description,
          isParent: p.isParent,
          price: p.price,
          size: p.size,
          weight: p.weight,
        })));
        setProductVariants(MOCK_PRODUCT_VARIANTS.map(v => ({
          id: v.id,
          parentProductId: v.parentProductId,
          name: v.name,
          price: v.price,
          size: v.size,
          weight: v.weight / 1000, // g→kg変換
        })));
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          category: product.category,
          price: product.price || 0,
          size_cm: product.size ? Number(product.size) : null,
          weight_kg: product.weight || null,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchProducts();
      return { data, error: null };
    } catch (err) {
      console.error('Error adding product:', err);
      return { data: null, error: err as Error };
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: updates.name,
          category: updates.category,
          price: updates.price,
          size_cm: updates.size ? Number(updates.size) : null,
          weight_kg: updates.weight,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchProducts();
      return { data, error: null };
    } catch (err) {
      console.error('Error updating product:', err);
      return { data: null, error: err as Error };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchProducts();
      return { error: null };
    } catch (err) {
      console.error('Error deleting product:', err);
      return { error: err as Error };
    }
  };

  const addProductVariant = async (_variant: Omit<ProductVariant, 'id'>) => {
    // product_variantsテーブルがないためダミー実装
    return { data: null, error: new Error('Product variants not supported') };
  };

  const updateProductVariant = async (_id: string, _updates: Partial<ProductVariant>) => {
    return { data: null, error: new Error('Product variants not supported') };
  };

  const deleteProductVariant = async (_id: string) => {
    return { error: new Error('Product variants not supported') };
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
