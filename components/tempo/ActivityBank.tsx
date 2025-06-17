'use client';

import { useState } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { ACTIVITY_TYPES, type ActivityType, type TempoActivity } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ActivityTemplate {
  title: string;
  type: ActivityType;
  duration: string;
  emoji: string;
}

const ACTIVITY_TEMPLATES: Record<ActivityType, ActivityTemplate[]> = {
  enrichment: [
    { title: 'Morning Pages', type: 'enrichment', duration: '30 min', emoji: '✍️' },
    { title: 'Read Book', type: 'enrichment', duration: '45 min', emoji: '📖' },
    { title: 'Learn Language', type: 'enrichment', duration: '30 min', emoji: '🗣️' },
    { title: 'Watch Documentary', type: 'enrichment', duration: '1 hour', emoji: '🎬' },
    { title: 'Listen to Podcast', type: 'enrichment', duration: '45 min', emoji: '🎧' },
    { title: 'Practice Instrument', type: 'enrichment', duration: '30 min', emoji: '🎸' },
  ],
  connection: [
    { title: 'Call Family', type: 'connection', duration: '30 min', emoji: '📞' },
    { title: 'Coffee with Friend', type: 'connection', duration: '1 hour', emoji: '☕' },
    { title: 'Write Thank You Note', type: 'connection', duration: '15 min', emoji: '💌' },
    { title: 'Game Night', type: 'connection', duration: '2 hours', emoji: '🎲' },
    { title: 'Dinner Date', type: 'connection', duration: '2 hours', emoji: '🍽️' },
    { title: 'Video Call Catch-up', type: 'connection', duration: '45 min', emoji: '📹' },
  ],
  growth: [
    { title: 'Morning Meditation', type: 'growth', duration: '15 min', emoji: '🧘' },
    { title: 'Journaling', type: 'growth', duration: '30 min', emoji: '📔' },
    { title: 'Nature Walk', type: 'growth', duration: '45 min', emoji: '🌳' },
    { title: 'Yoga Session', type: 'growth', duration: '1 hour', emoji: '🧘‍♀️' },
    { title: 'Breathwork', type: 'growth', duration: '15 min', emoji: '🌬️' },
    { title: 'Gratitude Practice', type: 'growth', duration: '15 min', emoji: '🙏' },
  ],
  creative: [
    { title: 'Sketch or Draw', type: 'creative', duration: '45 min', emoji: '✏️' },
    { title: 'Write Poetry', type: 'creative', duration: '30 min', emoji: '🖋️' },
    { title: 'Photography Walk', type: 'creative', duration: '1 hour', emoji: '📸' },
    { title: 'Paint or Watercolor', type: 'creative', duration: '1.5 hours', emoji: '🎨' },
    { title: 'Creative Writing', type: 'creative', duration: '1 hour', emoji: '📝' },
    { title: 'Make Music', type: 'creative', duration: '1 hour', emoji: '🎵' },
  ],
};

interface ActivityBankProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectActivity: (activity: Omit<TempoActivity, 'id'>) => void;
}

export function ActivityBank({ isOpen, onClose, onSelectActivity }: ActivityBankProps) {
  const [selectedType, setSelectedType] = useState<ActivityType>('enrichment');

  if (!isOpen) return null;

  const handleSelectTemplate = (template: ActivityTemplate) => {
    onSelectActivity({
      title: template.title,
      type: template.type,
      duration: template.duration,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-[720px] h-[600px] animate-scale-up overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-[17px] font-semibold text-gray-900 dark:text-white tracking-tight">
                Activity Inspiration
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Choose from curated activities to enrich your week
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[13px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 bg-gray-50 dark:bg-gray-800/30 p-3 space-y-1">
            {Object.entries(ACTIVITY_TYPES).map(([key, config]) => {
              const isSelected = selectedType === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedType(key as ActivityType)}
                  className={cn(
                    "w-full px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all group",
                    isSelected
                      ? "bg-white dark:bg-gray-800 shadow-sm"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800/50"
                  )}
                >
                  <span className="text-[16px]">
                    {config.icon === 'Book' ? '📚' : 
                     config.icon === 'Heart' ? '💝' : 
                     config.icon === 'Sprout' ? '🌱' : '🎨'}
                  </span>
                  <span className={cn(
                    "text-[13px] font-medium flex-1 text-left",
                    isSelected 
                      ? "text-gray-900 dark:text-white" 
                      : "text-gray-600 dark:text-gray-300"
                  )}>
                    {config.label}
                  </span>
                  {isSelected && (
                    <ChevronRight className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Activity Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              {ACTIVITY_TEMPLATES[selectedType].map((template, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectTemplate(template)}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all group",
                    "hover:scale-[1.02] hover:shadow-md",
                    "border-gray-200 dark:border-gray-700",
                    "bg-gray-50/50 dark:bg-gray-800/30",
                    "hover:bg-white dark:hover:bg-gray-800/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-[24px] mt-0.5">{template.emoji}</span>
                    <div className="flex-1">
                      <h3 className="text-[14px] font-medium text-gray-900 dark:text-white">
                        {template.title}
                      </h3>
                      <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {template.duration}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}