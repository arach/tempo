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
import { DayTemplateLibrary } from './DayTemplateLibrary';
import { QuickTemplateSelector } from './QuickTemplateSelector';
import { ActivityBlock } from './ActivityBlock';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTempoStorage } from '@/hooks/useTempoStorage';
import { useDayTemplatesDB } from '@/hooks/useDayTemplatesDB';
// Note: Mutation tracking moved to server-side API calls to avoid client-side database access
import type { TempoActivity } from '@/lib/types';

export function TempoCalendar() {
  const { activities, saveActivities, moveActivity, addActivity, deleteActivity, updateActivity } = useTempoStorage();
  const { applyTemplateToDate } = useDayTemplatesDB();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isBankOpen, setIsBankOpen] = useState(false);
  const [isTemplateLibraryOpen, setIsTemplateLibraryOpen] = useState(false);
  const [isQuickTemplateSelectorOpen, setIsQuickTemplateSelectorOpen] = useState(false);
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

  const handleApplyTemplate = async (template: any, date: string) => {
    try {
      const appliedActivities = await applyTemplateToDate(template.id, date, false);
      
      // Add the applied activities to localStorage (for immediate UI update)
      appliedActivities.forEach((activity: TempoActivity) => {
        addActivity(date, activity);
      });
      
      alert(`Applied "${template.name}" to ${date} with ${appliedActivities.length} activities!`);
    } catch (error) {
      console.error('Failed to apply template:', error);
      alert('Failed to apply template. ' + (error instanceof Error ? error.message : 'Please try again.'));
    }
  };

  const handleOpenQuickTemplateSelector = (date: string) => {
    setSelectedDate(date);
    setIsQuickTemplateSelectorOpen(true);
  };

  const handleQuickTemplateApplication = async (templateId: string, date: string) => {
    try {
      // Get existing activities before applying template
      const existingActivities = activities[date] || [];
      
      const appliedActivities = await applyTemplateToDate(templateId, date, true); // Allow overwrite
      
      // Update activities in a single batch operation to avoid race conditions
      const updatedActivities = {
        ...activities,
        [date]: appliedActivities // Replace all activities for this date
      };
      
      saveActivities(updatedActivities);

      // Record mutation for audit trail via API
      try {
        // Get template info (we need to fetch it to get the name)
        const templateResponse = await fetch(`/api/day-templates?id=${templateId}`);
        if (templateResponse.ok) {
          const templateData = await templateResponse.json();
          const template = templateData.template;
          
          // Record mutation via API call
          await fetch('/api/mutations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              date,
              mutationType: 'template_applied',
              mutationData: {
                templateId,
                templateName: template.name,
                activitiesCount: appliedActivities.length,
                appliedActivities,
                replacedActivities: existingActivities.length > 0 ? existingActivities : undefined
              },
              sourceTemplateId: templateId
            })
          });
        }
      } catch (mutationError) {
        // Don't fail the main operation if mutation tracking fails
        console.warn('Failed to record mutation:', mutationError);
      }
    } catch (error) {
      console.error('Failed to apply template:', error);
      throw error; // Re-throw to let QuickTemplateSelector handle the error display
    }
  };

  const handleEditTemplate = (template: any) => {
    // TODO: Navigate to template edit page
    window.location.href = `/tempo/day-template/${template.id}`;
  };

  const handleCreateNewTemplate = () => {
    window.location.href = '/tempo/day-template';
  };

  return (
    <>
      {/* Add Activity Section */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
            Quick Actions
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Add activities to your week
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsTemplateLibraryOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-100 dark:bg-purple-500/10 hover:bg-purple-200 dark:hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-xl font-medium transition-all hover:scale-105"
          >
            <Sparkles className="h-4 w-4" />
            Browse Day Templates
          </button>
          <button
            onClick={() => setIsBankOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            Activity Ideas
          </button>
          <button
            onClick={() => {
              const today = format(new Date(), 'yyyy-MM-dd');
              handleAddActivity(today);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-medium transition-all hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            Add Activity
          </button>
        </div>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden relative">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-0">
            {weekDays.map(day => (
              <DayColumn 
                key={day.date} 
                day={day} 
                activities={activities[day.date] || []} 
                onAddActivity={handleAddActivity}
                onEditActivity={handleEditActivity}
                onDeleteActivity={handleDeleteActivity}
                onApplyTemplate={handleOpenQuickTemplateSelector}
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
      
      <DayTemplateLibrary
        isOpen={isTemplateLibraryOpen}
        onClose={() => setIsTemplateLibraryOpen(false)}
        onCreateNew={handleCreateNewTemplate}
        onEdit={handleEditTemplate}
        onApplyToDate={handleApplyTemplate}
        selectedDate={selectedDate || format(new Date(), 'yyyy-MM-dd')}
      />
      
      <QuickTemplateSelector
        isOpen={isQuickTemplateSelectorOpen}
        onClose={() => {
          setIsQuickTemplateSelectorOpen(false);
          setSelectedDate(null);
        }}
        onApplyTemplate={handleQuickTemplateApplication}
        selectedDate={selectedDate || format(new Date(), 'yyyy-MM-dd')}
        hasExistingActivities={selectedDate ? (activities[selectedDate] || []).length > 0 : false}
      />
      
      {/* Floating Add Activity Button for Accessibility */}
      <button
        onClick={() => {
          const today = format(new Date(), 'yyyy-MM-dd');
          handleAddActivity(today);
        }}
        className="fixed bottom-6 right-6 h-14 w-14 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center group"
        title="Add Activity to Today"
      >
        <Plus className="h-6 w-6" />
      </button>
    </>
  );
}