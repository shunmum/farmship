// Supabase CRUD操作の共通フック

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from './useErrorHandler';
import type { Database } from '@/integrations/supabase/types';

type TableNames = keyof Database['public']['Tables'];

interface UseSupabaseCRUDOptions<T> {
  tableName: TableNames;
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
  transformer?: (data: any) => T;
  reverseTransformer?: (data: Partial<T>) => any;
  autoFetch?: boolean;
}

export function useSupabaseCRUD<T extends { id: string }>(
  options: UseSupabaseCRUDOptions<T>
) {
  const {
    tableName,
    orderBy = { column: 'created_at', ascending: false },
    transformer = (data) => data as T,
    reverseTransformer = (data) => data,
    autoFetch = true,
  } = options;

  const { handleError, handleSuccess } = useErrorHandler();

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  // データ取得
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .order(orderBy.column, { ascending: orderBy.ascending });

      if (fetchError) throw fetchError;

      setItems((data || []).map(transformer));
    } catch (err) {
      const errorMessage = `${tableName}データの取得`;
      handleError(err, errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [tableName, orderBy.column, orderBy.ascending, transformer, handleError]);

  // データ追加
  const addItem = useCallback(
    async (item: Omit<T, 'id'>) => {
      try {
        const { data, error: insertError } = await supabase
          .from(tableName)
          .insert(reverseTransformer(item as Partial<T>) as any)
          .select()
          .single();

        if (insertError) throw insertError;

        await fetchItems();
        handleSuccess(`${tableName}を追加しました`);
        return { data: transformer(data), error: null };
      } catch (err) {
        handleError(err, `${tableName}の追加`);
        return { data: null, error: err as Error };
      }
    },
    [tableName, reverseTransformer, transformer, fetchItems, handleError, handleSuccess]
  );

  // データ更新
  const updateItem = useCallback(
    async (id: string, updates: Partial<T>) => {
      try {
        const { data, error: updateError } = await supabase
          .from(tableName)
          .update(reverseTransformer(updates) as any)
          .eq('id', id)
          .select()
          .single();

        if (updateError) throw updateError;

        await fetchItems();
        handleSuccess(`${tableName}を更新しました`);
        return { data: transformer(data), error: null };
      } catch (err) {
        handleError(err, `${tableName}の更新`);
        return { data: null, error: err as Error };
      }
    },
    [tableName, reverseTransformer, transformer, fetchItems, handleError, handleSuccess]
  );

  // データ削除
  const deleteItem = useCallback(
    async (id: string) => {
      try {
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;

        await fetchItems();
        handleSuccess(`${tableName}を削除しました`);
        return { error: null };
      } catch (err) {
        handleError(err, `${tableName}の削除`);
        return { error: err as Error };
      }
    },
    [tableName, fetchItems, handleError, handleSuccess]
  );

  // 単一データ取得
  const getItem = useCallback(
    async (id: string) => {
      try {
        const { data, error: fetchError } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        return { data: transformer(data), error: null };
      } catch (err) {
        handleError(err, `${tableName}の取得`);
        return { data: null, error: err as Error };
      }
    },
    [tableName, transformer, handleError]
  );

  // 初回フェッチ
  useEffect(() => {
    if (autoFetch) {
      fetchItems();
    }
  }, [autoFetch, fetchItems]);

  return {
    items,
    loading,
    error,
    fetchItems,
    addItem,
    updateItem,
    deleteItem,
    getItem,
  };
}
