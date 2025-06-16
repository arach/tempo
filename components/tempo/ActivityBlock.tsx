'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Book, Heart, Sprout, Palette, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TempoActivity } from '@/lib/types';

const iconMap = {
  enrichment: Book,
  connection: Heart,
  growth: Sprout,
  creative: Palette,
};

const colorMap = {
  enrichment: 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-100 dark:border-blue-300 dark:text-blue-800',
  connection: 'bg-pink-100 border-pink-300 text-pink-800 dark:bg-pink-100 dark:border-pink-300 dark:text-pink-800',
  growth: 'bg-green-100 border-green-300 text-green-800 dark:bg-green-100 dark:border-green-300 dark:text-green-800',
  creative: 'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-100 dark:border-purple-300 dark:text-purple-800',
};

interface ActivityBlockProps {
  activity: TempoActivity;
  date: string;
  onEdit?: (activity: TempoActivity) => void;
  onDelete?: (activityId: string) => void;
}

export function ActivityBlock({ activity, date, onEdit, onDelete }: ActivityBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${date}:${activity.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = iconMap[activity.type];

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div 
        className={cn(
          'group relative cursor-grab active:cursor-grabbing px-4 py-3.5 rounded border transition-all hover:shadow-sm hover:scale-[1.005] hover:-translate-y-px',
          colorMap[activity.type],
          isDragging && 'opacity-50'
        )}
        {...listeners}
      >
        {/* Action buttons - only visible on hover */}
        <div 
          className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-black/5 dark:hover:bg-white/5 rounded"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onEdit?.(activity);
            }}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-black/5 dark:hover:bg-white/5 hover:text-red-500 rounded"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDelete?.(activity.id);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex items-start gap-3">
          <Icon className="w-3.5 h-3.5 mt-1 flex-shrink-0 opacity-60" />
          <div className="flex-1 min-w-0">
            <p className="font-normal text-[13px] leading-tight">{activity.title}</p>
            {activity.duration && (
              <p className="text-[11px] opacity-50 mt-0.5 font-light">{activity.duration}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}