'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Book, Heart, Sprout, Palette, Edit2, Trash2, CheckCircle2, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { slugify } from '@/lib/utils/slugify';
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

const completedColorMap = {
  enrichment: 'bg-green-50 border-green-400 text-green-800 dark:bg-green-900/80 dark:border-green-600 dark:text-green-100',
  connection: 'bg-green-50 border-green-400 text-green-800 dark:bg-green-900/80 dark:border-green-600 dark:text-green-100',
  growth: 'bg-green-50 border-green-400 text-green-800 dark:bg-green-900/80 dark:border-green-600 dark:text-green-100',
  creative: 'bg-green-50 border-green-400 text-green-800 dark:bg-green-900/80 dark:border-green-600 dark:text-green-100',
};

interface ActivityBlockProps {
  activity: TempoActivity;
  date: string;
  onEdit?: (activity: TempoActivity) => void;
  onDelete?: (activityId: string) => void;
  isDragOverlay?: boolean;
  disableSorting?: boolean;
}

export function ActivityBlock({ activity, date, onEdit, onDelete, isDragOverlay = false, disableSorting = false }: ActivityBlockProps) {
  const router = useRouter();
  const sortable = useSortable({ 
    id: date === 'template' ? activity.id : `${date}:${activity.id}`,
    disabled: isDragOverlay || disableSorting
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = sortable;

  const style = disableSorting ? {} : {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = iconMap[activity.type];

  return (
    <div ref={disableSorting ? undefined : setNodeRef} style={style} {...(disableSorting ? {} : attributes)}>
      <div 
        className={cn(
          'group relative px-3 sm:px-4 py-3 sm:py-3.5 rounded border transition-all duration-200 hover:shadow-sm',
          !disableSorting && 'cursor-grab active:cursor-grabbing',
          activity.completed ? completedColorMap[activity.type] : colorMap[activity.type],
          isDragging && 'opacity-50',
          activity.completed && 'ring-1 ring-green-300 dark:ring-green-600 shadow-sm'
        )}
        {...(disableSorting ? {} : listeners)}
      >
        {/* Action buttons - visible on mobile, hover on desktop */}
        <div 
          className={cn(
            "absolute top-1.5 sm:top-2 right-1.5 sm:right-2 flex gap-0.5 sm:gap-1 transition-opacity duration-200",
            "opacity-100 sm:opacity-0 group-hover:opacity-100",
            "sm:pointer-events-none group-hover:pointer-events-auto"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 sm:h-7 sm:w-7 hover:bg-black/10 dark:hover:bg-white/10 rounded"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onEdit?.(activity);
            }}
          >
            <Edit2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 sm:h-7 sm:w-7 hover:bg-black/10 dark:hover:bg-white/10 hover:text-purple-500 rounded"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              router.push(`/tempo/streaks/${slugify(activity.title)}`);
            }}
            title="View activity streak"
          >
            <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 sm:h-7 sm:w-7 hover:bg-black/10 dark:hover:bg-white/10 hover:text-red-500 rounded"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDelete?.(activity.id);
            }}
          >
            <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Button>
        </div>

        {/* Completion Check Mark Overlay */}
        {activity.completed && (
          <div className="absolute top-1 left-1">
            <div className="bg-green-500 rounded-full p-0.5">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <Icon className="w-3.5 h-3.5 mt-1 flex-shrink-0 opacity-60" />
          <div className="flex-1 min-w-0">
            <p className={cn(
              "font-normal text-[13px] leading-tight",
              activity.completed && "line-through opacity-75"
            )}>
              {activity.title}
            </p>
            {activity.duration && (
              <p className={cn(
                "text-[11px] opacity-50 mt-0.5 font-light",
                activity.completed && "line-through"
              )}>
                {activity.duration}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}