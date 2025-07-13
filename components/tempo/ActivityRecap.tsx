'use client';

import { useState } from 'react';
import { X, Send, Image } from 'lucide-react';
import type { TempoActivity } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ActivityRecapProps {
  activity: TempoActivity;
  isOpen: boolean;
  onClose: () => void;
  onSave: (recap: { notes: string; media?: string[] }) => void;
}

export function ActivityRecap({ activity, isOpen, onClose, onSave }: ActivityRecapProps) {
  const [notes, setNotes] = useState(activity.recap?.notes || '');
  const [media, setMedia] = useState<string[]>(activity.recap?.media || []);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!notes.trim() && media.length === 0) return;
    
    setIsSending(true);
    
    // Simulate sending animation
    setTimeout(() => {
      onSave({
        notes: notes.trim(),
        media: media.length > 0 ? media : undefined
      });
      setIsSending(false);
      onClose();
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setMedia(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 w-full sm:max-w-lg h-[600px] sm:h-[500px] sm:rounded-2xl shadow-2xl flex flex-col animate-slide-up sm:animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold",
              activity.type === 'enrichment' && 'bg-blue-500',
              activity.type === 'connection' && 'bg-pink-500',
              activity.type === 'growth' && 'bg-green-500',
              activity.type === 'creative' && 'bg-purple-500'
            )}>
              {activity.title.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {activity.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                How did it go?
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Welcome message */}
          <div className="flex gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0",
              activity.type === 'enrichment' && 'bg-blue-500',
              activity.type === 'connection' && 'bg-pink-500',
              activity.type === 'growth' && 'bg-green-500',
              activity.type === 'creative' && 'bg-purple-500'
            )}>
              ✨
            </div>
            <div className="max-w-[80%]">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-2.5">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Hey! You just completed &quot;{activity.title}&quot;. Take a moment to reflect - how was it? What stood out? 🌟
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-2">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Previous recap if exists */}
          {activity.recap && activity.recap.notes && (
            <div className="flex gap-3 justify-end">
              <div className="max-w-[80%]">
                <div className="bg-blue-500 text-white rounded-2xl rounded-tr-sm px-4 py-2.5">
                  <p className="text-sm">{activity.recap.notes}</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mr-2 text-right">
                  {new Date(activity.recap.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )}

          {/* Media previews */}
          {media.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {media.map((src, index) => (
                <div key={index} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Upload ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setMedia(prev => prev.filter((_, i) => i !== index))}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share your thoughts..."
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-2xl resize-none text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                rows={1}
                style={{
                  minHeight: '44px',
                  maxHeight: '120px',
                  height: 'auto'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
              />
            </div>
            
            {/* Media Upload */}
            <label className="h-11 w-11 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center cursor-pointer transition-colors">
              <Image className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleMediaUpload}
                className="hidden"
              />
            </label>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!notes.trim() && media.length === 0}
              className={cn(
                "h-11 w-11 rounded-full flex items-center justify-center transition-all",
                notes.trim() || media.length > 0
                  ? "bg-blue-500 hover:bg-blue-600 text-white hover:scale-105"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600",
                isSending && "animate-pulse scale-95"
              )}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}