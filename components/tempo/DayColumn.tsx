'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Sparkles } from 'lucide-react';
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
  onApplyTemplate: (date: string) => void;
}

export function DayColumn({ day, activities, onAddActivity, onEditActivity, onDeleteActivity, onApplyTemplate }: DayColumnProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const { setNodeRef, isOver } = useDroppable({
    id: day.date,
  });

  const handleDayHeaderClick = () => {
    router.push(`/tempo/day/${day.date}`);
  };

  const sortableItems = activities.map(a => `${day.date}:${a.id}`);

  return (
    <div 
      className={cn(
        "bg-gray-50 dark:bg-gray-800 h-full transition-all relative overflow-visible",
        "border-r border-gray-200 dark:border-gray-700 last:border-r-0",
        day.isToday && "bg-blue-50 dark:bg-blue-900/10",
        isOver && "bg-blue-100/50 dark:bg-blue-500/30 ring-2 ring-inset ring-blue-500/20"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {day.isToday && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
      )}
      <div className="relative border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={handleDayHeaderClick}
          className={cn(
            "w-full py-4 px-3 pb-5 text-center transition-all duration-200 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] group touch-manipulation",
            day.isToday && "bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20"
          )}
          title={`View details for ${day.dayOfWeek}`}
        >
          <h3 className={cn(
            "text-[11px] font-medium uppercase tracking-[0.08em] transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400",
            day.isToday ? "text-blue-600/90 dark:text-blue-400/90" : "text-gray-600 dark:text-gray-300"
          )}>{day.shortDay}</h3>
          <p className={cn(
            "text-3xl font-light mt-1 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400",
            day.isToday ? "text-blue-600 dark:text-blue-400" : "text-gray-800 dark:text-gray-200"
          )}>{day.dayNumber}</p>
        </button>
        
        {/* Apply Template - Thin Day-Level Action in Header */}
        <div className={cn(
          "absolute bottom-0 left-2 right-2 pb-1 transition-all duration-300 ease-out",
          isHovered && activities.length === 0 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-2 pointer-events-none"
        )}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onApplyTemplate(day.date);
            }}
            className={cn(
              "w-full py-1 px-2 rounded border border-dashed transition-all duration-200 group",
              "border-purple-200 dark:border-purple-600 hover:border-purple-300 dark:hover:border-purple-500",
              "bg-purple-50/90 dark:bg-purple-500/20 hover:bg-purple-100/90 dark:hover:bg-purple-500/30",
              "flex items-center justify-center gap-1",
              "backdrop-blur-sm shadow-sm"
            )}
          >
            <Sparkles className="h-2.5 w-2.5 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-all duration-200 group-hover:scale-110 group-hover:rotate-12" />
            <span className="text-[10px] font-medium text-purple-700 dark:text-purple-300 group-hover:text-purple-800 dark:group-hover:text-purple-200 transition-colors duration-200">
              Apply Template
            </span>
          </button>
        </div>
      </div>
      
      <div ref={setNodeRef} className={cn(
        "px-3 py-4 min-h-[200px] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[350px] transition-all relative",
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
            
            
            {/* Inline Add Activity Button - appears on hover */}
            <div className={cn(
              "transition-opacity duration-150",
              isHovered 
                ? "opacity-100" 
                : "opacity-0 pointer-events-none"
            )}>
              <button
                onClick={() => onAddActivity(day.date)}
                className={cn(
                  "w-full py-2.5 px-3 rounded border border-dashed transition-all duration-200 group",
                  "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500",
                  "bg-white/90 dark:bg-gray-800/90 hover:bg-gray-50 dark:hover:bg-gray-700",
                  "flex items-center justify-center gap-2",
                  "backdrop-blur-sm shadow-sm"
                )}
              >
                <Plus className="h-3 w-3 text-gray-500 dark:text-gray-300 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors duration-200" />
                <span className="text-[12px] font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-100 transition-colors duration-200">
                  Add Activity
                </span>
              </button>
            </div>
            
            {/* Empty state for days with no activities */}
            {activities.length === 0 && !isHovered && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground w-full">
                <p className="text-[11px] font-light text-gray-500/50 dark:text-gray-400/60">Free as a bird</p>
              </div>
            )}
          </div>
        </SortableContext>
        
      </div>
    </div>
  );
}