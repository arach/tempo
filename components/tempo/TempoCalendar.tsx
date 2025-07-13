'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { ExperimentalDayColumn } from './ExperimentalDayColumn';
import { ExperimentalStackedDayColumn } from './ExperimentalStackedDayColumn';
import { ExperimentalBubbleDayColumn } from './ExperimentalBubbleDayColumn';
import { ViewModeToggle, ViewMode } from './ViewModeToggle';
import { ActivityEditor } from './ActivityEditor';
import { ActivityBank } from './ActivityBank';
import { DayTemplateLibrary } from './DayTemplateLibrary';
import { QuickTemplateSelector } from './QuickTemplateSelector';
import { ActivityBlock } from './ActivityBlock';
import { ActivityRecap } from './ActivityRecap';
import { DayTemplatesSection } from './DayTemplatesSection';
import { Plus, X, TrendingUp, Library } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTempoStorageAPI } from '@/hooks/useTempoStorageAPI';
import { useDayTemplatesDB } from '@/hooks/useDayTemplatesDB';
// Note: Mutation tracking moved to server-side API calls to avoid client-side database access
import type { TempoActivity, DayTemplate } from '@/lib/types';

export function TempoCalendar() {
  const router = useRouter();
  const { activities, saveActivities, moveActivity, addActivity, deleteActivity, updateActivity, isLoading, error } = useTempoStorageAPI();
  const { applyTemplateToDate } = useDayTemplatesDB();
  const [viewMode, setViewMode] = useState<ViewMode>('default');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isBankOpen, setIsBankOpen] = useState(false);
  const [isTemplateLibraryOpen, setIsTemplateLibraryOpen] = useState(false);
  const [isQuickTemplateSelectorOpen, setIsQuickTemplateSelectorOpen] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<TempoActivity | null>(null);
  const [recapActivity, setRecapActivity] = useState<TempoActivity | null>(null);
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
    
    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    // Parse IDs to get date and activity info
    const [activeDate, activeActivityId] = activeId.includes(':') ? activeId.split(':') : [null, activeId];
    const [overDate, overActivityId] = overId.includes(':') ? overId.split(':') : [overId, null];
    
    // If we don't have proper active info, fallback to old behavior
    if (!activeDate || !activeActivityId) return;
    
    // Handle moving between different days
    if (activeDate !== overDate && !overActivityId) {
      moveActivity(activeActivityId, activeDate, overDate, 0);
    }
    // Handle reordering within the same day
    else if (activeDate === overDate && overActivityId && activeActivityId !== overActivityId) {
      const dayActivities = activities[activeDate] || [];
      const activeIndex = dayActivities.findIndex(a => a.id === activeActivityId);
      const overIndex = dayActivities.findIndex(a => a.id === overActivityId);
      
      if (activeIndex !== -1 && overIndex !== -1) {
        moveActivity(activeActivityId, activeDate, activeDate, overIndex);
      }
    }
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

  const handleToggleCompletion = async (date: string, activityId: string, currentCompleted: boolean) => {
    try {
      await updateActivity(date, activityId, { 
        completed: !currentCompleted,
        completedAt: !currentCompleted ? new Date().toISOString() : undefined
      });
    } catch (error) {
      console.error('Failed to toggle completion:', error);
    }
  };

  const handleRecap = (activity: TempoActivity) => {
    setRecapActivity(activity);
  };

  const handleSaveRecap = async (recap: { notes: string; media?: string[] }) => {
    if (!recapActivity) return;
    
    // Find the date for this activity
    const activityDate = Object.entries(activities).find(([date, dayActivities]) => 
      dayActivities.some(a => a.id === recapActivity.id)
    )?.[0];
    
    if (!activityDate) return;
    
    try {
      await updateActivity(activityDate, recapActivity.id, {
        recap: {
          ...recap,
          createdAt: new Date().toISOString()
        }
      });
      setRecapActivity(null);
    } catch (error) {
      console.error('Failed to save recap:', error);
    }
  };

  const handleSaveActivity = async (activityData: Omit<TempoActivity, 'id'>) => {
    if (!selectedDate) return;
    
    if (editingActivity) {
      // Just update the existing activity - no instance management
      await updateActivity(selectedDate, editingActivity.id, activityData);
    } else {
      // Create new activity with instances
      const instanceCount = activityData.instances || 1;
      
      if (instanceCount === 1) {
        // Single activity
        const newActivity: TempoActivity = {
          ...activityData,
          id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        await addActivity(selectedDate, newActivity);
      } else {
        // Multiple instances - create linked activities
        let masterId: string | null = null;
        
        for (let i = 0; i < instanceCount; i++) {
          const newActivity: TempoActivity = {
            ...activityData,
            id: `activity-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
            instanceIndex: i,
            // First one is the master, others reference it
            ...(i > 0 && masterId ? { parentId: masterId } : {})
          };
          
          if (i === 0) {
            masterId = newActivity.id;
          }
          
          await addActivity(selectedDate, newActivity);
        }
      }
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

  const handleApplyTemplate = async (template: DayTemplate, date: string) => {
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when no modal is open
      if (isEditorOpen || isBankOpen || isTemplateLibraryOpen || isQuickTemplateSelectorOpen || showKeyboardHelp) {
        return;
      }

      // ? key: Show keyboard shortcuts help
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        setShowKeyboardHelp(true);
      }

      // Cmd/Ctrl + K: Quick add activity to today
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const today = format(new Date(), 'yyyy-MM-dd');
        handleAddActivity(today);
      }
      
      // Cmd/Ctrl + Shift + T: Open template library
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        setIsTemplateLibraryOpen(true);
      }
      
      // Cmd/Ctrl + Shift + B: Open activity bank
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        setIsBankOpen(true);
      }

      // Arrow keys: Navigate between days (add activity to selected day)
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const today = new Date();
        const direction = e.key === 'ArrowLeft' ? -1 : 1;
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + direction);
        const dateStr = format(targetDate, 'yyyy-MM-dd');
        
        if (e.shiftKey) {
          // Shift + Arrow: Add activity to that day
          handleAddActivity(dateStr);
        }
      }

      // Numbers 1-7: Quick add to days of the week
      if (/^[1-7]$/.test(e.key) && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        const dayIndex = parseInt(e.key) - 1;
        const targetDay = weekDays[dayIndex];
        if (targetDay) {
          handleAddActivity(targetDay.date);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isEditorOpen, isBankOpen, isTemplateLibraryOpen, isQuickTemplateSelectorOpen, showKeyboardHelp, weekDays]);

  const getRecentlyUsedActivities = () => {
    const allActivities: (TempoActivity & { lastUsed: Date })[] = [];
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    // Collect all activities from the last 2 weeks
    Object.entries(activities).forEach(([dateStr, dayActivities]) => {
      const date = new Date(dateStr);
      if (date >= twoWeeksAgo) {
        dayActivities.forEach(activity => {
          allActivities.push({
            ...activity,
            lastUsed: date
          });
        });
      }
    });
    
    // Get unique activities by title and sort by most recent
    const uniqueActivities = allActivities
      .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
      .filter((activity, index, arr) => 
        arr.findIndex(a => a.title.toLowerCase() === activity.title.toLowerCase()) === index
      )
      .slice(0, 4);
    
    return uniqueActivities;
  };

  const handleQuickAddActivity = (templateActivity: TempoActivity) => {
    // Add to today by default
    const today = format(new Date(), 'yyyy-MM-dd');
    const newActivity: TempoActivity = {
      ...templateActivity,
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    addActivity(today, newActivity);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your activities...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="bg-red-100 dark:bg-red-900/80 text-red-700 dark:text-red-100 p-4 rounded-lg mb-4">
            <p className="font-medium">Unable to load activities</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* View Mode Toggle */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Recent Activities
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTemplateLibraryOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
          >
            <Library className="h-4 w-4" />
            Templates
          </button>
          <button
            onClick={() => router.push('/tempo/streaks')}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
          >
            <TrendingUp className="h-4 w-4" />
            Streaks
          </button>
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
        </div>
      </div>
      
      {/* Recently Used Activities Section - More Subtle */}
      <div className="mb-4">
        
        {getRecentlyUsedActivities().length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {getRecentlyUsedActivities().map((activity, index) => (
              <button
                key={`${activity.title}-${index}`}
                onClick={() => handleQuickAddActivity(activity)}
                className="group p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:scale-105 text-left"
              >
                <div className="flex items-start gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                    activity.type === 'enrichment' && "bg-blue-400",
                    activity.type === 'connection' && "bg-pink-400", 
                    activity.type === 'growth' && "bg-green-400",
                    activity.type === 'creative' && "bg-purple-400"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                      {activity.title}
                    </p>
                    {activity.duration && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {activity.duration}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <Plus className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Start adding activities to see your recently used ones here
            </p>
          </div>
        )}
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-visible relative">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-0">
            {weekDays.map(day => {
              const dayActivities = activities[day.date] || [];
              const commonProps = {
                date: new Date(day.date),
                activities: dayActivities,
                isToday: day.isToday,
                isEmpty: dayActivities.length === 0
              };

              switch (viewMode) {
                case 'grouped':
                  return <ExperimentalDayColumn key={day.date} {...commonProps} />;
                case 'stacked':
                  return <ExperimentalStackedDayColumn key={day.date} {...commonProps} />;
                case 'bubbles':
                  return <ExperimentalBubbleDayColumn key={day.date} {...commonProps} />;
                default:
                  return (
                    <DayColumn 
                      key={day.date} 
                      day={day} 
                      activities={dayActivities} 
                      onAddActivity={handleAddActivity}
                      onEditActivity={handleEditActivity}
                      onDeleteActivity={handleDeleteActivity}
                      onToggleCompletion={handleToggleCompletion}
                      onRecap={handleRecap}
                      onApplyTemplate={handleOpenQuickTemplateSelector}
                    />
                  );
              }
            })}
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

      {/* Day Templates Section */}
      <DayTemplatesSection 
        onApplyTemplate={handleApplyTemplate}
        onOpenLibrary={() => setIsTemplateLibraryOpen(true)}
      />

      {/* Floating Template Button - smaller and more subtle now that we have the section */}
      <button
        onClick={() => setIsTemplateLibraryOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-gray-200 dark:bg-gray-800 hover:bg-purple-600 dark:hover:bg-purple-600 text-gray-600 dark:text-gray-400 hover:text-white rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center group"
        title="Day Templates Library"
      >
        <Library className="h-5 w-5" />
        <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          All Templates
        </span>
      </button>
      
      <ActivityEditor
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedDate(null);
          setEditingActivity(null);
        }}
        onSave={handleSaveActivity}
        editingActivity={editingActivity || undefined}
      />
      
      {recapActivity && (
        <ActivityRecap
          activity={recapActivity}
          isOpen={true}
          onClose={() => setRecapActivity(null)}
          onSave={handleSaveRecap}
        />
      )}
      
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
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center group"
        title="Add Activity to Today (⌘K)"
      >
        <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      {/* Keyboard Shortcuts Help Modal */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-[500px] animate-scale-up overflow-hidden h-full sm:h-auto max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-[17px] font-semibold text-gray-900 dark:text-white">
                Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setShowKeyboardHelp(false)}
                className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-110"
              >
                <X className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="px-6 py-5 space-y-4 flex-1 overflow-y-auto">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Quick add activity to today</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">⌘K</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Open template library</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">⌘⇧T</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Open activity bank</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">⌘⇧B</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Add activity to tomorrow</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">⇧→</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Add activity to yesterday</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">⇧←</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Quick add to day of week</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">⌘1-7</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Show this help</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">?</kbd>
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  In dialogs: <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">⌘↵</kbd> to save, 
                  <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono ml-1">Esc</kbd> to close
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}