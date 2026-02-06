import { useEffect, useState, useCallback } from 'react';
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from '@/services/firebase/templates';
import type { Template, TemplateData } from '@/types/template';

export const useTemplates = (uid: string | undefined) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!uid) return;
    try {
      setLoading(true);
      const data = await getTemplates(uid);
      setTemplates(data);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load templates';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(
    async (data: TemplateData) => {
      if (!uid) return;
      await createTemplate(uid, data);
      await refresh();
    },
    [uid, refresh],
  );

  const update = useCallback(
    async (templateId: string, data: Partial<TemplateData>) => {
      if (!uid) return;
      await updateTemplate(uid, templateId, data);
      await refresh();
    },
    [uid, refresh],
  );

  const remove = useCallback(
    async (templateId: string) => {
      if (!uid) return;
      await deleteTemplate(uid, templateId);
      await refresh();
    },
    [uid, refresh],
  );

  return { templates, loading, error, create, update, remove, refresh };
};
