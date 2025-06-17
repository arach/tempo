'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActivityBlock } from './ActivityBlock';
import { cn } from '@/lib/utils';
import type { TempoActivity } from '@/lib/types';

interface DayColumnProps {
  day: {
    date: string;
    dayOfWeek: string;
    shortDay: string;
    dayNumber: string;
    isToday?: boolean;
  };
  activities: TempoActivity[];
  onAddActivity: (date: string) => void;
  onEditActivity: (activity: TempoActivity) => void;
  onDeleteActivity: (date: string, activityId: string) => void;
}

export function DayColumn({ day, activities, onAddActivity, onEditActivity, onDeleteActivity }: DayColumnProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { setNodeRef, isOver } = useDroppable({
    id: day.date,
  });

  const sortableItems = activities.map(a => `${day.date}:${a.id}`);

  return (
    <div 
      className={cn(
        "bg-gray-50 dark:bg-gray-800/50 h-full transition-all relative overflow-hidden",
        "border-r border-gray-200 dark:border-gray-700 last:border-r-0",
        day.isToday && "bg-blue-50 dark:bg-blue-900/20",
        isOver && "bg-blue-100/50 dark:bg-blue-500/10 ring-2 ring-inset ring-blue-500/20"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {day.isToday && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/50 to-blue-600/50" />
      )}
      <div className={cn(
        "py-4 px-3 text-center border-b border-gray-200 dark:border-gray-700",
        day.isToday && "bg-transparent"
      )}>
        <h3 className={cn(
          "text-[11px] font-medium uppercase tracking-[0.08em]",
          day.isToday ? "text-blue-600/90 dark:text-blue-400/90" : "text-gray-600 dark:text-gray-300"
        )}>{day.shortDay}</h3>
        <p className={cn(
          "text-3xl font-light mt-1",
          day.isToday ? "text-blue-600 dark:text-blue-400" : "text-gray-800 dark:text-gray-200"
        )}>{day.dayNumber}</p>
      </div>
      <div ref={setNodeRef} className={cn(
        "px-2 py-3 min-h-[200px] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[350px] transition-all relative",
        isOver && "bg-transparent"
      )}>
        <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {activities.map((activity) => (
              <ActivityBlock 
                key={activity.id} 
                activity={activity} 
                date={day.date}
                onEdit={onEditActivity}
                onDelete={(activityId) => onDeleteActivity(day.date, activityId)}
              />
            ))}
          </div>
          {activities.length === 0 && (
            <button
              onClick={() => onAddActivity(day.date)}
              className="flex flex-col items-center justify-center py-16 text-muted-foreground w-full hover:bg-gray-100/50 dark:hover:bg-gray-700/40 rounded transition-colors group"
            >
              <p className="text-[11px] font-light text-gray-500/50 dark:text-gray-400/60 opacity-0 group-hover:opacity-100 transition-opacity">Free as a bird</p>
            </button>
          )}
        </SortableContext>
        
        {/* Add Activity Button - Show on hover for all days */}
        {isHovered && (
          <button
            onClick={() => onAddActivity(day.date)}
            className={cn(
              "absolute bottom-4 left-4 right-4 py-2.5 px-3 rounded border border-dashed transition-all group",
              "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500",
              "bg-white/90 dark:bg-gray-800/90 hover:bg-gray-50 dark:hover:bg-gray-700",
              "flex items-center justify-center gap-2",
              "backdrop-blur-sm shadow-sm"
            )}
          >
            <Plus className="h-3 w-3 text-gray-500 dark:text-gray-300 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors" />
            <span className="text-[12px] font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-100 transition-colors">
              Add Activity
            </span>
          </button>
        )}
      </div>
    </div>
  );
}