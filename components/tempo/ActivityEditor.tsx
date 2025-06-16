'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ACTIVITY_TYPES, type ActivityType, type TempoActivity } from '@/lib/types';

interface ActivityEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: Omit<TempoActivity, 'id'>) => void;
  defaultDay?: string;
  editingActivity?: TempoActivity;
}

export function ActivityEditor({ 
  isOpen, 
  onClose, 
  onSave, 
  defaultDay,
  editingActivity 
}: ActivityEditorProps) {
  const [title, setTitle] = useState(editingActivity?.title || '');
  const [type, setType] = useState<ActivityType>(editingActivity?.type || 'enrichment');
  const [duration, setDuration] = useState(editingActivity?.duration || '30 min');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    
    onSave({
      title,
      type,
      duration
    });
    
    // Reset form
    setTitle('');
    setType('enrichment');
    setDuration('30 min');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">
            {editingActivity ? 'Edit Activity' : 'Add Activity'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Activity Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning Meditation"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-foreground"
              autoFocus
            />
          </div>

          {/* Activity Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Activity Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ACTIVITY_TYPES).map(([key, config]) => {
                const isSelected = type === key;
                const getButtonClasses = () => {
                  const base = 'p-3 rounded-lg border-2 transition-all';
                  if (!isSelected) return `${base} border-gray-200 dark:border-gray-600 hover:border-gray-300`;
                  
                  switch(key) {
                    case 'enrichment':
                      return `${base} border-blue-500 bg-blue-50 dark:bg-blue-900/20`;
                    case 'connection':
                      return `${base} border-pink-500 bg-pink-50 dark:bg-pink-900/20`;
                    case 'growth':
                      return `${base} border-green-500 bg-green-50 dark:bg-green-900/20`;
                    case 'creative':
                      return `${base} border-purple-500 bg-purple-50 dark:bg-purple-900/20`;
                    default:
                      return base;
                  }
                };
                
                return (
                  <button
                    key={key}
                    onClick={() => setType(key as ActivityType)}
                    className={getButtonClasses()}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{config.icon === 'Book' ? '📚' : config.icon === 'Heart' ? '💝' : config.icon === 'Sprout' ? '🌱' : '🎨'}</div>
                      <div className="text-sm font-medium">{config.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-foreground"
            >
              <option value="15 min">15 minutes</option>
              <option value="30 min">30 minutes</option>
              <option value="45 min">45 minutes</option>
              <option value="1 hour">1 hour</option>
              <option value="1.5 hours">1.5 hours</option>
              <option value="2 hours">2 hours</option>
              <option value="2+ hours">2+ hours</option>
            </select>
          </div>

          {/* Example suggestions */}
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Examples:</p>
            <p className="text-xs">
              {ACTIVITY_TYPES[type].examples.join(', ')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 justify-end p-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            {editingActivity ? 'Save Changes' : 'Add Activity'}
          </Button>
        </div>
      </div>
    </div>
  );
}