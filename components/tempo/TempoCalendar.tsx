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
import { format, startOfWeek, addDays } from 'date-fns';
import { DayColumn } from './DayColumn';
import { ActivityEditor } from './ActivityEditor';
import { ActivityBank } from './ActivityBank';
import { ActivityBlock } from './ActivityBlock';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTempoStorage } from '@/hooks/useTempoStorage';
import type { TempoActivity } from '@/lib/types';

export function TempoCalendar() {
  const { activities, moveActivity, addActivity, deleteActivity, updateActivity } = useTempoStorage();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isBankOpen, setIsBankOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<TempoActivity | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeActivity, setActiveActivity] = useState<TempoActivity | null>(null);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  
  const weekStart = startOfWeek(new Date());
  
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
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const today = new Date();
    const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
    
    return {
      date: format(date, 'yyyy-MM-dd'),
      dayOfWeek: format(date, 'EEEE'),
      shortDay: format(date, 'EEE'),
      dayNumber: format(date, 'd'),
      isToday
    };
  });

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const [date, activityId] = active.id.toString().split(':');
    
    // Find the activity being dragged
    const activity = activities[date]?.find(a => a.id === activityId);
    if (activity) {
      setActiveId(active.id.toString());
      setActiveActivity(activity);
      setActiveDate(date);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Reset active state
    setActiveId(null);
    setActiveActivity(null);
    setActiveDate(null);
    
    if (!over) return;
    
    // Handle moving activities between days
    const [fromDate, activityId] = active.id.toString().split(':');
    const toDate = over.id.toString();
    
    // If it's a different column (day), move the activity
    if (fromDate !== toDate) {
      moveActivity(activityId, fromDate, toDate, 0);
    }
    // TODO: Handle reordering within the same column
  };

  const handleAddActivity = (date: string) => {
    setSelectedDate(date);
    setEditingActivity(null);
    setIsEditorOpen(true);
  };

  const handleEditActivity = (activity: TempoActivity) => {
    // Find which date this activity belongs to
    const activityDate = Object.entries(activities).find(([date, dayActivities]) =>
      dayActivities.some(a => a.id === activity.id)
    )?.[0];
    
    if (activityDate) {
      setSelectedDate(activityDate);
      setEditingActivity(activity);
      setIsEditorOpen(true);
    }
  };

  const handleDeleteActivity = (date: string, activityId: string) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      deleteActivity(date, activityId);
    }
  };

  const handleSaveActivity = (activityData: Omit<TempoActivity, 'id'>) => {
    if (!selectedDate) return;
    
    if (editingActivity) {
      // Update existing activity
      updateActivity(selectedDate, editingActivity.id, activityData);
    } else {
      // Create new activity
      const newActivity: TempoActivity = {
        ...activityData,
        id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      addActivity(selectedDate, newActivity);
    }
  };

  const handleSelectFromBank = (activityData: Omit<TempoActivity, 'id'>) => {
    // Default to today if no date is selected
    const targetDate = selectedDate || format(new Date(), 'yyyy-MM-dd');
    
    const newActivity: TempoActivity = {
      ...activityData,
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    addActivity(targetDate, newActivity);
  };

  return (
    <>
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden relative">
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            <button
              onClick={() => setIsBankOpen(true)}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Activity Inspiration"
            >
              <Sparkles className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => {
                const today = format(new Date(), 'yyyy-MM-dd');
                handleAddActivity(today);
              }}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Add Activity"
            >
              <Plus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-0">
            {weekDays.map(day => (
              <DayColumn 
                key={day.date} 
                day={day} 
                activities={activities[day.date] || []} 
                onAddActivity={handleAddActivity}
                onEditActivity={handleEditActivity}
                onDeleteActivity={handleDeleteActivity}
              />
            ))}
          </div>
        </div>
        
        <DragOverlay>
          {activeId && activeActivity && activeDate ? (
            <div style={{ 
              cursor: 'grabbing',
              transform: 'scale(1.05)',
              filter: 'drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))'
            }}>
              <ActivityBlock
                activity={activeActivity}
                date={activeDate}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      
      <ActivityEditor
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedDate(null);
          setEditingActivity(null);
        }}
        onSave={handleSaveActivity}
        defaultDay={selectedDate || undefined}
        editingActivity={editingActivity || undefined}
      />
      
      <ActivityBank
        isOpen={isBankOpen}
        onClose={() => setIsBankOpen(false)}
        onSelectActivity={handleSelectFromBank}
      />
    </>
  );
}