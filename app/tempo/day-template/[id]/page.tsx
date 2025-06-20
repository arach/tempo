'use client';

import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { DayTemplate } from '@/components/tempo/DayTemplate';
import { useDayTemplatesDB } from '@/hooks/useDayTemplatesDB';
import type { DayTemplate as DayTemplateType } from '@/lib/types';

export default function DayTemplateViewPage() {
  const router = useRouter();
  const params = useParams();
  const { fetchTemplate, updateTemplate } = useDayTemplatesDB();
  const [template, setTemplate] = useState<DayTemplateType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const templateId = params.id as string;

  useEffect(() => {
    async function loadTemplate() {
      try {
        setLoading(true);
        const foundTemplate = await fetchTemplate(templateId);
        if (foundTemplate) {
          setTemplate(foundTemplate);
        } else {
          setError('Template not found');
        }
      } catch (err) {
        setError('Failed to load template');
        console.error('Error loading template:', err);
      } finally {
        setLoading(false);
      }
    }

    if (templateId) {
      loadTemplate();
    }
  }, [templateId]);

  const handleSaveTemplate = async (templateData: Omit<DayTemplateType, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!template) return;

    try {
      await updateTemplate(template.id, templateData);
      router.push('/tempo?message=template-updated');
    } catch (error) {
      console.error('Failed to update template:', error);
      alert('Failed to update template. Please try again.');
    }
  };

  const handleCancel = () => {
    router.push('/tempo');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading template...</p>
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 dark:text-red-400 text-2xl">!</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {error || 'Template not found'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The template you're looking for doesn't exist or couldn't be loaded.
          </p>
          <button
            onClick={() => router.push('/tempo')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Back to Calendar
          </button>
        </div>
      </div>
    );
  }

  return (
    <DayTemplate 
      template={template}
      onSave={handleSaveTemplate}
      onCancel={handleCancel}
    />
  );
}