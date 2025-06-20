'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Plus,
  Clock,
  Sparkles,
  GripVertical
} from 'lucide-react';
import { ActivityBlock } from './ActivityBlock';
import { cn } from '@/lib/utils';
import type { TempoActivity } from '@/lib/types';

// Sortable wrapper component
function SortableActivityItem({ activity, date, index, onEdit, onDelete }: {
  activity: TempoActivity;
  date: string;
  index: number;
  onEdit: (activity: TempoActivity) => void;
  onDelete: (activityId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex gap-2 cursor-grab active:cursor-grabbing hover:bg-gray-50/50 dark:hover:bg-white/5 rounded-lg py-1 pl-4 pr-1 -mx-4 -my-1 transition-colors"
      {...attributes}
      {...listeners}
    >
      {/* Empty spacer column for breathing room */}
      <div className="flex-shrink-0 w-4"></div>
      
      {/* Drag Handle with Number - Coin flip transformation */}
      <div className="flex-shrink-0 flex items-center justify-start w-10 pl-2 relative">
        <div className="w-6 h-6 bg-gray-200/10 dark:bg-gray-700/10 rounded-full flex items-center justify-center transition-all duration-500 ease-out group-hover:rotate-y-180 [transform-style:preserve-3d]">
          {/* Number side */}
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 absolute inset-0 flex items-center justify-center [backface-visibility:hidden]">
            {index + 1}
          </span>
          {/* Grip side */}
          <div className="absolute inset-0 flex items-center justify-center [backface-visibility:hidden] rotate-y-180">
            <GripVertical className="h-3 w-3 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
      </div>
      
      {/* Activity Card - Full width */}
      <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <ActivityBlock
          activity={activity}
          date={date}
          onEdit={onEdit}
          onDelete={onDelete}
          isDragOverlay={false}
          disableSorting={true}
        />
      </div>
    </div>
  );
}

interface DayViewActivityListProps {
  activities: TempoActivity[];
  onEditActivity: (activity: TempoActivity) => void;
  onDeleteActivity: (activityId: string) => void;
  onReorderActivities: (reorderedActivities: TempoActivity[]) => void;
  date: string;
}

export function DayViewActivityList({
  activities,
  onEditActivity,
  onDeleteActivity,
  onReorderActivities,
  date
}: DayViewActivityListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeActivity, setActiveActivity] = useState<TempoActivity | null>(null);

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activity = activities.find(a => a.id === active.id);
    
    if (activity) {
      setActiveId(active.id.toString());
      setActiveActivity(activity);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setActiveActivity(null);
    
    if (!over || active.id === over.id) return;

    const oldIndex = activities.findIndex(a => a.id === active.id);
    const newIndex = activities.findIndex(a => a.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedActivities = arrayMove(activities, oldIndex, newIndex);
      onReorderActivities(reorderedActivities);
    }
  };

  const getTotalEstimatedTime = () => {
    return activities.reduce((total, activity) => {
      if (activity.duration) {
        // Handle various duration formats: "30 min", "1 hour", "45", etc.
        const match = activity.duration.match(/(\d+)/);
        if (match) {
          let minutes = parseInt(match[1]);
          // If it contains "hour" or "hr", convert to minutes
          if (activity.duration.toLowerCase().includes('hour') || activity.duration.toLowerCase().includes('hr')) {
            minutes = minutes * 60;
          }
          return total + minutes;
        }
      }
      return total;
    }, 0);
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="h-10 w-10 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
          No activities planned
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          This day is free as a bird. Add some meaningful activities or apply a template to get started.
        </p>
        <div className="flex justify-center items-center gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium transition-colors">
            <Plus className="h-4 w-4" />
            Add Activity
          </button>
          <span className="text-gray-400 dark:text-gray-500 text-sm">or</span>
          <button className="flex items-center gap-2 px-4 py-2 border border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-300 dark:hover:bg-purple-900/20 rounded-lg font-medium transition-colors">
            <Sparkles className="h-4 w-4" />
            Apply Template
          </button>
        </div>
      </div>
    );
  }

  const totalTime = getTotalEstimatedTime();

  return (
    <div>
      {/* Compact Day Summary */}
      <div className="flex items-center justify-between mb-6">
        <div className="pl-10" style={{ paddingLeft: '30px' }}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {activities.length} {activities.length === 1 ? 'Activity' : 'Activities'} Today
          </h2>
          {totalTime > 0 && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{totalTime} min total</span>
            </div>
          )}
        </div>
        
        {/* Activity Types - Compact Side Legend */}
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <span>Enrichment</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-pink-400"></div>
            <span>Connection</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span>Growth</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
            <span>Creative</span>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={activities.map(a => a.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {activities.map((activity, index) => (
              <SortableActivityItem
                key={activity.id}
                activity={activity}
                date={date}
                index={index}
                onEdit={onEditActivity}
                onDelete={onDeleteActivity}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId && activeActivity ? (
            <div style={{ 
              cursor: 'grabbing',
              transform: 'scale(1.05)',
              filter: 'drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))'
            }}>
              <div className="flex gap-2 bg-white dark:bg-gray-900 rounded-lg p-1 shadow-lg">
                {/* Empty spacer column for breathing room */}
                <div className="flex-shrink-0 w-4"></div>
                
                {/* Drag Handle with Number in overlay - showing grip side */}
                <div className="flex-shrink-0 flex items-center justify-start w-10 pl-2 relative">
                  <div className="w-6 h-6 bg-gray-200/10 dark:bg-gray-700/10 rounded-full flex items-center justify-center">
                    <GripVertical className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
                
                {/* Activity Card in overlay */}
                <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <ActivityBlock
                    activity={activeActivity}
                    date={date}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    isDragOverlay={true}
                    disableSorting={true}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

    </div>
  );
}