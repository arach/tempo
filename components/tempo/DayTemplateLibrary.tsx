'use client';

import { useState } from 'react';
import { useDayTemplatesDB } from '@/hooks/useDayTemplatesDB';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Copy, 
  Calendar,
  Sparkles,
  Filter,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import type { DayTemplate } from '@/lib/types';

interface DayTemplateLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNew: () => void;
  onEdit: (template: DayTemplate) => void;
  onApplyToDate: (template: DayTemplate, date: string) => void;
  selectedDate?: string;
}

export function DayTemplateLibrary({ 
  isOpen, 
  onClose, 
  onCreateNew, 
  onEdit, 
  onApplyToDate,
  selectedDate 
}: DayTemplateLibraryProps) {
  const { templates, deleteTemplate, duplicateTemplate } = useDayTemplatesDB();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });


  const handleDelete = async (template: DayTemplate) => {
    if (confirm(`Delete "${template.name}"? This cannot be undone.`)) {
      try {
        await deleteTemplate(template.id);
      } catch (error) {
        console.error('Failed to delete template:', error);
        alert('Failed to delete template. Please try again.');
      }
    }
  };

  const handleDuplicate = async (template: DayTemplate) => {
    try {
      await duplicateTemplate(template.id);
    } catch (error) {
      console.error('Failed to duplicate template:', error);
      alert('Failed to duplicate template. Please try again.');
    }
  };

  const handleApplyToDate = (template: DayTemplate) => {
    if (selectedDate) {
      onApplyToDate(template, selectedDate);
    } else {
      // If no date selected, apply to today
      const today = format(new Date(), 'yyyy-MM-dd');
      onApplyToDate(template, today);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-500" />
                Day Templates
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Choose a prototypical day to apply or create a new one
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={onCreateNew} className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create New
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                {searchTerm ? 'No templates match your search' : 'No templates yet'}
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'Create your first day template to get started'
                }
              </p>
              {!searchTerm && (
                <Button onClick={onCreateNew} className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Template
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(template => (
                <Card key={template.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {template.name}
                      </h3>
                    </div>
                  </div>

                  {template.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  <div className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                    {template.activities.length} activities • Created {format(new Date(template.createdAt), 'MMM d, yyyy')}
                  </div>

                  {/* Template Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => handleApplyToDate(template)}
                    >
                      <Calendar className="w-3 h-3 mr-1" />
                      Apply
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(template)}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicate(template)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(template)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}