'use client';

import { useState, useEffect } from 'react';
import type { DayTemplate } from '@/lib/types';

// Hook that uses the database API instead of localStorage
export function useDayTemplatesDB() {
  const [templates, setTemplates] = useState<DayTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load templates from database via API
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/day-templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      } else {
        console.error('Failed to load templates:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTemplate = async (templateData: Omit<DayTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/day-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      });

      if (response.ok) {
        const data = await response.json();
        const newTemplate = data.template;
        setTemplates(prev => [...prev, newTemplate]);
        return newTemplate;
      } else {
        throw new Error('Failed to create template');
      }
    } catch (error) {
      console.error('Failed to create template:', error);
      throw error;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<Omit<DayTemplate, 'id' | 'createdAt'>>) => {
    try {
      const response = await fetch('/api/day-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates })
      });

      if (response.ok) {
        const data = await response.json();
        const updatedTemplate = data.template;
        setTemplates(prev => prev.map(t => t.id === id ? updatedTemplate : t));
        return updatedTemplate;
      } else {
        throw new Error('Failed to update template');
      }
    } catch (error) {
      console.error('Failed to update template:', error);
      throw error;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const response = await fetch(`/api/day-templates?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTemplates(prev => prev.filter(t => t.id !== id));
        return true;
      } else {
        throw new Error('Failed to delete template');
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
      throw error;
    }
  };

  const getTemplate = (id: string) => {
    return templates.find(template => template.id === id);
  };

  const fetchTemplate = async (id: string): Promise<DayTemplate | null> => {
    try {
      const response = await fetch(`/api/day-templates?id=${id}`);
      if (response.ok) {
        const data = await response.json();
        return data.template || null;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Failed to fetch template:', error);
      return null;
    }
  };


  const duplicateTemplate = async (id: string, newName?: string) => {
    const template = getTemplate(id);
    if (!template) return null;

    const { id: templateId, createdAt, updatedAt, ...templateData } = template;
    return addTemplate({
      ...templateData,
      name: newName || `${template.name} (Copy)`,
    });
  };

  const applyTemplateToDate = async (templateId: string, date: string, overwrite = false) => {
    try {
      const response = await fetch('/api/day-templates/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, date, overwrite })
      });

      if (response.ok) {
        const data = await response.json();
        return data.appliedActivities;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to apply template');
      }
    } catch (error) {
      console.error('Failed to apply template:', error);
      throw error;
    }
  };

  return {
    templates,
    isLoading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplate,
    fetchTemplate,
    duplicateTemplate,
    applyTemplateToDate,
    refetch: loadTemplates,
  };
}