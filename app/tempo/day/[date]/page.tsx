'use client';

import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { format, parseISO, addDays, subDays, isValid } from 'date-fns';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Plus,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTempoStorage } from '@/hooks/useTempoStorage';
import { useDayTemplatesDB } from '@/hooks/useDayTemplatesDB';
import { ActivityEditor } from '@/components/tempo/ActivityEditor';
import { QuickTemplateSelector } from '@/components/tempo/QuickTemplateSelector';
import { DayViewActivityList } from '@/components/tempo/DayViewActivityList';
import type { TempoActivity } from '@/lib/types';

export default function DayViewPage() {
  const router = useRouter();
  const params = useParams();
  const { activities, saveActivities, addActivity, deleteActivity, updateActivity } = useTempoStorage();
  const { applyTemplateToDate } = useDayTemplatesDB();
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<TempoActivity | null>(null);

  // Parse and validate date from URL
  const dateParam = params.date as string;
  const parsedDate = parseISO(dateParam);
  const isValidDate = isValid(parsedDate);
  
  if (!isValidDate) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Invalid Date
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The date "{dateParam}" is not valid. Please use YYYY-MM-DD format.
          </p>
          <Button onClick={() => router.push('/tempo')}>
            Back to Calendar
          </Button>
        </div>
      </div>
    );
  }

  const currentDate = dateParam;
  const dayActivities = activities[currentDate] || [];
  const previousDay = format(subDays(parsedDate, 1), 'yyyy-MM-dd');
  const nextDay = format(addDays(parsedDate, 1), 'yyyy-MM-dd');

  const handleAddActivity = () => {
    setEditingActivity(null);
    setIsEditorOpen(true);
  };

  const handleEditActivity = (activity: TempoActivity) => {
    setEditingActivity(activity);
    setIsEditorOpen(true);
  };

  const handleDeleteActivity = (activityId: string) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      deleteActivity(currentDate, activityId);
    }
  };

  const handleSaveActivity = (activityData: Omit<TempoActivity, 'id'>) => {
    if (editingActivity) {
      // Update existing activity
      updateActivity(currentDate, editingActivity.id, activityData);
    } else {
      // Create new activity
      const newActivity: TempoActivity = {
        ...activityData,
        id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      addActivity(currentDate, newActivity);
    }
  };

  const handleApplyTemplate = () => {
    setIsTemplateSelectorOpen(true);
  };

  const handleQuickTemplateApplication = async (templateId: string, date: string) => {
    try {
      const appliedActivities = await applyTemplateToDate(templateId, date, true);
      
      // Update activities in a single batch operation
      const updatedActivities = {
        ...activities,
        [date]: appliedActivities
      };
      
      saveActivities(updatedActivities);
    } catch (error) {
      console.error('Failed to apply template:', error);
      throw error;
    }
  };

  const handleReorderActivities = (reorderedActivities: TempoActivity[]) => {
    const updatedActivities = {
      ...activities,
      [currentDate]: reorderedActivities
    };
    saveActivities(updatedActivities);
  };

  const formattedDate = format(parsedDate, 'EEEE, MMMM d, yyyy');
  const shortDate = format(parsedDate, 'MMM d');
  const isToday = currentDate === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div style={{ paddingLeft: '16px' }}>
              <Button
                variant="ghost"
                onClick={() => router.push('/tempo')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Week
            </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/tempo/day/${previousDay}`)}
                className="text-gray-600 dark:text-gray-400"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/tempo/day/${nextDay}`)}
                className="text-gray-600 dark:text-gray-400"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Date Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Calendar className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              <h1 className="text-3xl font-light text-gray-900 dark:text-white">
                {formattedDate}
              </h1>
              {isToday && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-600 text-blue-700 dark:text-white text-sm font-medium rounded-full">
                  Today
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Plan your meaningful activities without time constraints
            </p>
          </div>

          {/* Action Buttons - Improved hierarchy */}
          <div className="flex justify-center items-center mt-10">
            <Button
              onClick={handleAddActivity}
              size="lg"
              className="bg-gray-900 dark:bg-transparent hover:bg-gray-800 text-white dark:text-white border border-transparent dark:border-transparent transition-all"
              style={{
                '--tw-bg-opacity': '1'
              }}
              onMouseEnter={(e) => {
                if (document.documentElement.classList.contains('dark')) {
                  e.currentTarget.style.transition = 'background-color 0.3s ease, border-color 0.3s ease';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (document.documentElement.classList.contains('dark')) {
                  e.currentTarget.style.transition = 'background-color 0.3s ease, border-color 0.3s ease';
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
            <span className="text-gray-400 dark:text-gray-500 ml-4 mr-9 px-4">or</span>
            <Button
              onClick={handleApplyTemplate}
              variant="outline"
              size="lg"
              className="border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-300 dark:hover:bg-purple-900/20 group transition-all"
            >
              <Sparkles className="h-4 w-4 mr-2 transition-transform group-hover:scale-110 group-hover:rotate-12" />
              Apply Template
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <DayViewActivityList
          activities={dayActivities}
          onEditActivity={handleEditActivity}
          onDeleteActivity={handleDeleteActivity}
          onReorderActivities={handleReorderActivities}
          date={currentDate}
        />
      </div>

      {/* Modals */}
      <ActivityEditor
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingActivity(null);
        }}
        onSave={handleSaveActivity}
        defaultDay={currentDate}
        editingActivity={editingActivity || undefined}
      />

      <QuickTemplateSelector
        isOpen={isTemplateSelectorOpen}
        onClose={() => setIsTemplateSelectorOpen(false)}
        onApplyTemplate={handleQuickTemplateApplication}
        selectedDate={currentDate}
        hasExistingActivities={dayActivities.length > 0}
      />
    </div>
  );
}