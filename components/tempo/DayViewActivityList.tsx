'use client';

import { 
  Plus,
  Clock,
  Sparkles
} from 'lucide-react';
import { SortableActivityList } from './SortableActivityList';
import type { TempoActivity } from '@/lib/types';

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
      <SortableActivityList
        activities={activities}
        onEditActivity={onEditActivity}
        onDeleteActivity={onDeleteActivity}
        onReorderActivities={onReorderActivities}
        date={date}
        showActions={true}
      />

    </div>
  );
}