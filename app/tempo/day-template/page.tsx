'use client';

import { useRouter } from 'next/navigation';
import { DayTemplate } from '@/components/tempo/DayTemplate';
import { useDayTemplatesDB } from '@/hooks/useDayTemplatesDB';
import type { DayTemplate as DayTemplateType } from '@/lib/types';

export default function DayTemplatePage() {
  const router = useRouter();
  const { addTemplate } = useDayTemplatesDB();

  const handleSaveTemplate = async (templateData: Omit<DayTemplateType, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const savedTemplate = await addTemplate(templateData);
      console.log('Template saved:', savedTemplate);
      router.push('/tempo?message=template-saved');
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template. Please try again.');
    }
  };

  const handleCancel = () => {
    router.push('/tempo');
  };

  return (
    <DayTemplate 
      onSave={handleSaveTemplate}
      onCancel={handleCancel}
    />
  );
}