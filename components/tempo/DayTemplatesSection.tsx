'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, ChevronRight, Sparkles, Clock, Book, Heart, Sprout, Palette, PlusCircle } from 'lucide-react';
import { useDayTemplatesDB } from '@/hooks/useDayTemplatesDB';
import { cn } from '@/lib/utils';
import type { DayTemplate, TempoActivity } from '@/lib/types';

interface DayTemplatesSectionProps {
  onApplyTemplate: (template: DayTemplate, date: string) => void;
  onOpenLibrary: () => void;
}

export function DayTemplatesSection({ onApplyTemplate, onOpenLibrary }: DayTemplatesSectionProps) {
  const router = useRouter();
  const { templates, isLoading } = useDayTemplatesDB();
  const [selectedTemplate, setSelectedTemplate] = useState<DayTemplate | null>(null);

  // Get up to 3 most recent templates for preview (matches our 3-column grid)
  const recentTemplates = templates.slice(0, 3);

  if (isLoading) {
    return null; // Don't show section while loading
  }

  if (templates.length === 0) {
    return (
      <div className="mt-12 mb-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Day Templates
          </h3>
        </div>
        <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-4 left-4 text-purple-300 dark:text-purple-700 opacity-30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="absolute bottom-4 right-4 text-pink-300 dark:text-pink-700 opacity-30 rotate-12">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="absolute top-8 right-8 text-blue-300 dark:text-blue-700 opacity-30 -rotate-12">
            <Sparkles className="w-4 h-4" />
          </div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 dark:from-purple-600 dark:to-pink-600 mx-auto mb-4 flex items-center justify-center shadow-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Start with Day Templates
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Create reusable day templates to quickly plan your ideal days with meaningful activities
            </p>
            <button
              onClick={() => router.push('/tempo/day-template/new')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white hover:text-white rounded-lg transition-all hover:shadow-lg hover:scale-105 font-medium"
              style={{ color: 'white' }}
            >
              <Plus className="w-5 h-5 text-white" />
              Create Your First Template
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Day Templates
        </h3>
        <button
          onClick={onOpenLibrary}
          className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
        >
          View all
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentTemplates.map((template) => (
          <TemplatePreviewCard
            key={template.id}
            template={template}
            onApply={onApplyTemplate}
            onClick={() => router.push(`/tempo/day-template/${template.id}`)}
          />
        ))}
        
        {/* Create new template card */}
        <button
          onClick={() => router.push('/tempo/day-template/new')}
          className="group relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800/50 dark:to-gray-800/30 border-2 border-dashed border-purple-300 dark:border-purple-700/50 rounded-xl p-4 hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all text-center overflow-hidden hover:-translate-y-0.5"
        >
          {/* Decorative sparkles */}
          <div className="absolute top-2 right-2 text-purple-300 dark:text-purple-700 opacity-50 group-hover:opacity-100 transition-opacity">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="absolute bottom-2 left-2 text-pink-300 dark:text-pink-700 opacity-50 group-hover:opacity-100 transition-opacity rotate-12">
            <Sparkles className="w-3 h-3" />
          </div>
          
          <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 dark:from-purple-600 dark:to-pink-600 group-hover:scale-110 flex items-center justify-center transition-all shadow-md group-hover:shadow-lg">
              <Plus className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                Create New Template
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Design your perfect day
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

interface TemplatePreviewCardProps {
  template: DayTemplate;
  onApply: (template: DayTemplate, date: string) => void;
  onClick: () => void;
}

function TemplatePreviewCard({ template, onApply, onClick }: TemplatePreviewCardProps) {
  const activityIcons = {
    enrichment: Book,
    connection: Heart,
    growth: Sprout,
    creative: Palette,
  };

  const activityColors = {
    enrichment: {
      bg: 'bg-blue-500 dark:bg-blue-400',
      light: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
    },
    connection: {
      bg: 'bg-pink-500 dark:bg-pink-400',
      light: 'bg-pink-100 dark:bg-pink-900/30',
      text: 'text-pink-600 dark:text-pink-400',
    },
    growth: {
      bg: 'bg-green-500 dark:bg-green-400',
      light: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-600 dark:text-green-400',
    },
    creative: {
      bg: 'bg-purple-500 dark:bg-purple-400',
      light: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-600 dark:text-purple-400',
    },
  };

  const activityEmojis = {
    enrichment: '📚',
    connection: '💝',
    growth: '🌱',
    creative: '🎨',
  };

  // Expand activities with instances
  const expandedActivities = template.activities.flatMap((activity) => {
    const instances = activity.instances || 1;
    return Array.from({ length: instances }, (_, i) => ({
      ...activity,
      instanceLabel: instances > 1 ? ` (${i + 1})` : '',
    }));
  });

  const totalDuration = expandedActivities.reduce((total, activity) => {
    const duration = activity.duration || '30 min';
    let minutes = 30; // default
    
    if (duration === '2+ hours') {
      minutes = 120; // Assume 2 hours for "2+ hours"
    } else if (duration.includes('hour')) {
      const hours = parseFloat(duration);
      minutes = hours * 60;
    } else if (duration.includes('min')) {
      minutes = parseInt(duration) || 30;
    }
    
    return total + minutes;
  }, 0);

  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;
  const durationText = hours > 0 
    ? `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`
    : `${minutes}m`;

  return (
    <div 
      className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer hover:-translate-y-0.5"
      onClick={onClick}
    >
      {/* Gradient header */}
      <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-80 group-hover:opacity-100 transition-opacity" />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              {template.name}
            </h4>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {durationText}
              </span>
              <span>
                {expandedActivities.length} activities
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40 transition-colors">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        {/* Activity timeline preview */}
        <div className="space-y-1.5 mb-4 max-h-40 overflow-hidden relative">
          {expandedActivities.slice(0, 5).map((activity, index) => {
            const Icon = activityIcons[activity.type];
            const colors = activityColors[activity.type];
            
            return (
              <div 
                key={`${activity.id}-${index}`}
                className={cn(
                  "relative flex items-center gap-2 px-2 py-1 rounded-md transition-all",
                  colors.light,
                  "before:absolute before:inset-0 before:rounded-md before:border-2 before:border-transparent",
                  "hover:before:border-opacity-30 before:transition-all before:duration-200",
                  activity.type === 'enrichment' && "hover:before:border-blue-400",
                  activity.type === 'connection' && "hover:before:border-pink-400", 
                  activity.type === 'growth' && "hover:before:border-green-400",
                  activity.type === 'creative' && "hover:before:border-purple-400"
                )}
                style={{ 
                  transitionDelay: `${index * 30}ms`,
                }}
              >
                <span className="text-sm relative z-10">{activityEmojis[activity.type]}</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate flex-1 relative z-10">
                  {activity.title}{activity.instanceLabel}
                </span>
                {activity.duration && (
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 relative z-10">
                    {activity.duration}
                  </span>
                )}
              </div>
            );
          })}
          
          {/* Fade overlay if more than 5 activities */}
          {expandedActivities.length > 5 && (
            <>
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none" />
              <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-1">
                +{expandedActivities.length - 5} more
              </div>
            </>
          )}
        </div>

        {/* Description if exists */}
        {template.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {template.description}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const today = new Date().toISOString().split('T')[0];
              onApply(template, today);
            }}
            className="flex-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-xs font-medium flex items-center justify-center gap-1.5 group-hover:shadow-md cursor-pointer"
          >
            <span className="text-xs" style={{ lineHeight: '1' }}>+</span>
            Add
          </button>
          <button
            onClick={onClick}
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-xs font-medium cursor-pointer"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}