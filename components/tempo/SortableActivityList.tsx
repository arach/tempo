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
import { GripVertical } from 'lucide-react';
import { ActivityBlock } from './ActivityBlock';
import type { TempoActivity } from '@/lib/types';

// Sortable wrapper component with coin flip animation
function SortableActivityItem({ 
  activity, 
  date, 
  index, 
  onEdit, 
  onDelete,
  showActions = true 
}: {
  activity: TempoActivity;
  date: string;
  index: number;
  onEdit: (activity: TempoActivity) => void;
  onDelete: (activityId: string) => void;
  showActions?: boolean;
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
          onEdit={showActions ? onEdit : undefined}
          onDelete={showActions ? onDelete : undefined}
          isDragOverlay={false}
          disableSorting={true}
        />
      </div>
    </div>
  );
}

interface SortableActivityListProps {
  activities: TempoActivity[];
  onEditActivity: (activity: TempoActivity) => void;
  onDeleteActivity: (activityId: string) => void;
  onReorderActivities: (reorderedActivities: TempoActivity[]) => void;
  date: string;
  showActions?: boolean;
  className?: string;
}

export function SortableActivityList({
  activities,
  onEditActivity,
  onDeleteActivity,
  onReorderActivities,
  date,
  showActions = true,
  className
}: SortableActivityListProps) {
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

  if (activities.length === 0) {
    return null;
  }

  return (
    <div className={className}>
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
                showActions={showActions}
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