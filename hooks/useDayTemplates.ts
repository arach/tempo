'use client';

import { useState, useEffect } from 'react';
import type { DayTemplate } from '@/lib/types';

const STORAGE_KEY = 'tempo-day-templates';

export function useDayTemplates() {
  const [templates, setTemplates] = useState<DayTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load templates from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedTemplates = JSON.parse(stored) as DayTemplate[];
        setTemplates(parsedTemplates);
      }
    } catch (error) {
      console.error('Failed to load day templates:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save templates to localStorage whenever templates change
  const saveToStorage = (newTemplates: DayTemplate[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTemplates));
    } catch (error) {
      console.error('Failed to save day templates:', error);
    }
  };

  const addTemplate = (templateData: Omit<DayTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: DayTemplate = {
      ...templateData,
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newTemplates = [...templates, newTemplate];
    setTemplates(newTemplates);
    saveToStorage(newTemplates);
    return newTemplate;
  };

  const updateTemplate = (id: string, updates: Partial<Omit<DayTemplate, 'id' | 'createdAt'>>) => {
    const newTemplates = templates.map(template =>
      template.id === id
        ? { ...template, ...updates, updatedAt: new Date().toISOString() }
        : template
    );
    setTemplates(newTemplates);
    saveToStorage(newTemplates);
  };

  const deleteTemplate = (id: string) => {
    const newTemplates = templates.filter(template => template.id !== id);
    setTemplates(newTemplates);
    saveToStorage(newTemplates);
  };

  const getTemplate = (id: string) => {
    return templates.find(template => template.id === id);
  };


  const duplicateTemplate = (id: string, newName?: string) => {
    const template = getTemplate(id);
    if (!template) return null;

    const { id: templateId, createdAt, updatedAt, ...templateData } = template;
    return addTemplate({
      ...templateData,
      name: newName || `${template.name} (Copy)`,
    });
  };

  return {
    templates,
    isLoading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplate,
    duplicateTemplate,
  };
}