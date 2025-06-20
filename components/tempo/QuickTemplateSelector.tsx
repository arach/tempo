'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { useDayTemplatesDB } from '@/hooks/useDayTemplatesDB';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  X, 
  Sparkles, 
  Calendar,
  Clock,
  Loader2,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DayTemplate } from '@/lib/types';

interface QuickTemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (templateId: string, date: string) => Promise<void>;
  selectedDate: string;
  hasExistingActivities?: boolean;
}

export function QuickTemplateSelector({ 
  isOpen, 
  onClose, 
  onApplyTemplate, 
  selectedDate,
  hasExistingActivities = false
}: QuickTemplateSelectorProps) {
  const { templates, isLoading } = useDayTemplatesDB();
  const [applyingTemplate, setApplyingTemplate] = useState<string | null>(null);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const formattedDate = format(new Date(selectedDate), 'EEEE, MMMM d');

  const handleApplyTemplate = async (template: DayTemplate) => {
    // If day has existing activities, show confirmation
    if (hasExistingActivities && !showOverwriteConfirm) {
      setShowOverwriteConfirm(template.id);
      return;
    }

    try {
      setApplyingTemplate(template.id);
      setError(null);
      
      await onApplyTemplate(template.id, selectedDate);
      
      setSuccess(`"${template.name}" applied to ${formattedDate}`);
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
        setSuccess(null);
        setApplyingTemplate(null);
        setShowOverwriteConfirm(null);
      }, 1500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply template');
      setApplyingTemplate(null);
      setShowOverwriteConfirm(null);
    }
  };

  const handleCancelOverwrite = () => {
    setShowOverwriteConfirm(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Apply Template
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading templates...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 mx-6 mt-4 rounded">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Success State */}
        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 mx-6 mt-4 rounded">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
            </div>
          </div>
        )}

        {/* Overwrite Confirmation */}
        {showOverwriteConfirm && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 mx-6 mt-4 rounded">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  This day already has activities
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Applying this template will replace all existing activities. This action cannot be undone.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      const template = templates.find(t => t.id === showOverwriteConfirm);
                      if (template) handleApplyTemplate(template);
                    }}
                    disabled={applyingTemplate !== null}
                  >
                    Replace Activities
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelOverwrite}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Templates Grid */}
        {!isLoading && !showOverwriteConfirm && (
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {templates.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No templates yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create your first day template to get started
                </p>
                <Button onClick={onClose}>
                  Create Template
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <Card 
                    key={template.id} 
                    className={cn(
                      "p-4 cursor-pointer transition-all border-2 hover:shadow-md",
                      applyingTemplate === template.id 
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" 
                        : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
                    )}
                    onClick={() => handleApplyTemplate(template)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                          {template.name}
                        </h3>
                        {template.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {template.description}
                          </p>
                        )}
                      </div>
                      {applyingTemplate === template.id && (
                        <Loader2 className="h-4 w-4 animate-spin text-purple-600 dark:text-purple-400 ml-2" />
                      )}
                    </div>

                    <div className="space-y-1 mb-3">
                      {template.activities.slice(0, 3).map((activity, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            activity.type === 'enrichment' && "bg-blue-400",
                            activity.type === 'connection' && "bg-pink-400", 
                            activity.type === 'growth' && "bg-green-400",
                            activity.type === 'creative' && "bg-purple-400"
                          )} />
                          <span className="text-gray-600 dark:text-gray-400 truncate">
                            {activity.title}
                          </span>
                          {activity.duration && (
                            <span className="text-gray-500 dark:text-gray-500 flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              {activity.duration}
                            </span>
                          )}
                        </div>
                      ))}
                      {template.activities.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          +{template.activities.length - 3} more activities
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={applyingTemplate !== null}
                    >
                      {applyingTemplate === template.id ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-2" />
                          Applying...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3 mr-2" />
                          Apply to {format(new Date(selectedDate), 'MMM d')}
                        </>
                      )}
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}