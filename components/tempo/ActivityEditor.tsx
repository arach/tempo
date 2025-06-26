'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ACTIVITY_TYPES, type ActivityType, type TempoActivity } from '@/lib/types';

interface ActivityEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: Omit<TempoActivity, 'id'>) => void;
  editingActivity?: TempoActivity;
}

export function ActivityEditor({ 
  isOpen, 
  onClose, 
  onSave, 
  editingActivity 
}: ActivityEditorProps) {
  const [title, setTitle] = useState(editingActivity?.title || '');
  const [description, setDescription] = useState(editingActivity?.description || '');
  const [type, setType] = useState<ActivityType>(editingActivity?.type || 'enrichment');
  const [duration, setDuration] = useState(editingActivity?.duration || '30 min');

  useEffect(() => {
    if (editingActivity) {
      setTitle(editingActivity.title);
      setDescription(editingActivity.description || '');
      setType(editingActivity.type);
      setDuration(editingActivity.duration || '30 min');
    }
  }, [editingActivity]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) {
      // Focus the title input if empty
      const titleInput = document.querySelector('input[placeholder*="Meditation"]') as HTMLInputElement;
      titleInput?.focus();
      return;
    }
    
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      duration
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setType('enrichment');
    setDuration('30 min');
    onClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setType('enrichment');
    setDuration('30 min');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    } else if (/^[1-4]$/.test(e.key) && (e.metaKey || e.ctrlKey)) {
      // Cmd/Ctrl + 1-4: Quick select activity type
      e.preventDefault();
      const types: ActivityType[] = ['enrichment', 'connection', 'growth', 'creative'];
      const selectedType = types[parseInt(e.key) - 1];
      if (selectedType) {
        setType(selectedType);
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 z-50 animate-fade-in"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-2xl shadow-2xl w-full max-w-[460px] animate-scale-up overflow-hidden h-full sm:h-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h2 className="text-[17px] font-semibold text-gray-900 dark:text-white tracking-tight">
            {editingActivity ? 'Edit Activity' : 'Add Activity'}
          </h2>
          <button
            onClick={handleClose}
            className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-110"
          >
            <X className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4 flex-1 overflow-y-auto">
          {/* Title Input */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-[0.06em]">
              Activity Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning Meditation"
              className="w-full px-3.5 py-2.5 text-[14px] border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent hover:border-gray-300 dark:hover:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
              autoFocus
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-[0.06em]">
              Description <span className="text-gray-400 normal-case">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any notes or details about this activity..."
              rows={2}
              className="w-full px-3.5 py-2.5 text-[14px] border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent hover:border-gray-300 dark:hover:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Activity Type Selection */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-[0.06em]">
              Activity Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ACTIVITY_TYPES).map(([key, config]) => {
                const isSelected = type === key;
                const getButtonClasses = () => {
                  const base = 'group relative px-3.5 py-3 rounded-xl border transition-all duration-200 transform hover:scale-[1.02]';
                  if (!isSelected) return `${base} border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50`;
                  
                  switch(key) {
                    case 'enrichment':
                      return `${base} border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 shadow-sm shadow-blue-500/10`;
                    case 'connection':
                      return `${base} border-pink-200 dark:border-pink-500/30 bg-pink-50 dark:bg-pink-500/10 shadow-sm shadow-pink-500/10`;
                    case 'growth':
                      return `${base} border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 shadow-sm shadow-green-500/10`;
                    case 'creative':
                      return `${base} border-purple-200 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-500/10 shadow-sm shadow-purple-500/10`;
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
                    <div className="flex items-center space-x-2">
                      <span className="text-[18px]">{config.icon === 'Book' ? '📚' : config.icon === 'Heart' ? '💝' : config.icon === 'Sprout' ? '🌱' : '🎨'}</span>
                      <span className={`text-[13px] font-medium ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                        {config.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration Input */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-[0.06em]">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3.5 py-2.5 text-[14px] border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent hover:border-gray-300 dark:hover:border-gray-600 text-gray-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all select-chevron"
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
          <div className="bg-gray-50/70 dark:bg-gray-800/40 rounded-xl px-3.5 py-2.5">
            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em] mb-1">Examples</p>
            <p className="text-[12px] text-gray-600 dark:text-gray-300 leading-[1.5]">
              {ACTIVITY_TYPES[type].examples.join(' • ')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3.5 bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-[13px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave} 
            className="px-5 py-2 text-[13px] font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-xl transition-all hover:scale-105 shadow-sm"
          >
            {editingActivity ? 'Save Changes' : 'Add Activity'}
          </button>
        </div>
      </div>
    </div>
  );
}