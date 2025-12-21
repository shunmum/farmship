import { useState } from 'react';

export interface PublicOrderForm {
  id: string;
  formUrlSlug: string;
  farmDisplayName: string;
  welcomeMessage?: string;
  isActive: boolean;
}

// public_order_formsテーブルがまだ存在しないため、ローカルステートで管理
export function usePublicOrderForm() {
  const [form, setForm] = useState<PublicOrderForm | null>(null);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const fetchForm = async () => {
    // データベースにテーブルがないため何もしない
  };

  const createForm = async (formData: Omit<PublicOrderForm, 'id'>) => {
    const newForm: PublicOrderForm = {
      ...formData,
      id: crypto.randomUUID(),
    };
    setForm(newForm);
    return { data: newForm, error: null };
  };

  const updateForm = async (updates: Partial<PublicOrderForm>) => {
    if (!form) return { error: new Error('No form to update') };
    const updatedForm = { ...form, ...updates };
    setForm(updatedForm);
    return { data: updatedForm, error: null };
  };

  const deleteForm = async () => {
    setForm(null);
    return { error: null };
  };

  const getFormUrl = () => {
    if (!form) return null;
    const baseUrl = window.location.origin;
    return `${baseUrl}/order/${form.formUrlSlug}`;
  };

  return {
    form,
    loading,
    error,
    createForm,
    updateForm,
    deleteForm,
    getFormUrl,
    refetch: fetchForm,
  };
}
