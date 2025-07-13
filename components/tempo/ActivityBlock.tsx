'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Book, Heart, Sprout, Palette, Edit2, Trash2, CheckCircle2, TrendingUp, MessageCircle, Link2 } from 'lucide-react';
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
  enrichment: 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-100',
  connection: 'bg-pink-100 border-pink-300 text-pink-800 dark:bg-pink-900 dark:border-pink-600 dark:text-pink-100',
  growth: 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-600 dark:text-green-100',
  creative: 'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900 dark:border-purple-600 dark:text-purple-100',
};

const completedColorMap = {
  enrichment: 'bg-green-100 border-green-500 text-green-900 dark:bg-green-800 dark:border-green-500 dark:text-green-100',
  connection: 'bg-green-100 border-green-500 text-green-900 dark:bg-green-800 dark:border-green-500 dark:text-green-100',
  growth: 'bg-green-100 border-green-500 text-green-900 dark:bg-green-800 dark:border-green-500 dark:text-green-100',
  creative: 'bg-green-100 border-green-500 text-green-900 dark:bg-green-800 dark:border-green-500 dark:text-green-100',
};

interface ActivityBlockProps {
  activity: TempoActivity;
  date: string;
  onEdit?: (activity: TempoActivity) => void;
  onDelete?: (activityId: string) => void;
  onToggleCompletion?: (activityId: string, currentCompleted: boolean) => void;
  onRecap?: (activity: TempoActivity) => void;
  isDragOverlay?: boolean;
  disableSorting?: boolean;
}

export function ActivityBlock({ activity, date, onEdit, onDelete, onToggleCompletion, onRecap, isDragOverlay = false, disableSorting = false }: ActivityBlockProps) {
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
          activity.completed && 'ring-1 ring-green-300 dark:ring-green-600 shadow-sm',
          // Add subtle left border for repeated instances
          'parentId' in activity && activity.parentId && 'border-l-4'
        )}
        {...(disableSorting ? {} : listeners)}
      >
        {/* Action buttons - visible on mobile, hover on desktop */}
        <div 
          className={cn(
            "absolute top-1.5 sm:top-2 right-1.5 sm:right-2 flex gap-0.5 sm:gap-1 transition-opacity duration-200",
            "opacity-100 sm:opacity-0 group-hover:opacity-100",
            "sm:pointer-events-none group-hover:pointer-events-auto",
            "backdrop-blur-sm rounded-lg p-1 shadow-sm",
            activity.completed 
              ? "bg-white dark:bg-gray-900" 
              : "bg-white/80 dark:bg-gray-900/80"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {onToggleCompletion && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6 sm:h-6 sm:w-6 hover:bg-gray-100 dark:hover:bg-gray-800 rounded",
                activity.completed 
                  ? "text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300" 
                  : "text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
              )}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onToggleCompletion(activity.id, activity.completed || false);
              }}
              title={activity.completed ? "Mark as incomplete" : "Mark as complete"}
            >
              <CheckCircle2 className={cn(
                "h-3 w-3 sm:h-3.5 sm:w-3.5",
                activity.completed && "fill-current"
              )} />
            </Button>
          )}
          {activity.completed && onRecap && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6 sm:h-6 sm:w-6 hover:bg-gray-100 dark:hover:bg-gray-800 rounded",
                activity.recap ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
              )}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onRecap(activity);
              }}
              title={activity.recap ? "Edit recap" : "Add recap"}
            >
              <MessageCircle className={cn(
                "h-3 w-3 sm:h-3.5 sm:w-3.5",
                activity.recap && "fill-current"
              )} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 sm:h-6 sm:w-6 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
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
            className="h-6 w-6 sm:h-6 sm:w-6 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-500 rounded"
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
            className="h-6 w-6 sm:h-6 sm:w-6 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-500 rounded"
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

        {/* Instance Indicator - subtle number badge */}
        {'parentId' in activity && activity.parentId && 'instanceIndex' in activity && activity.instanceIndex !== undefined && (
          <div className="absolute -top-2 -left-2">
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium border-2 border-white dark:border-gray-800",
              activity.type === 'enrichment' && "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
              activity.type === 'connection' && "bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300",
              activity.type === 'growth' && "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300",
              activity.type === 'creative' && "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300"
            )}>
              {activity.instanceIndex + 1}
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