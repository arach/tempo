'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { format, subDays, addDays, eachDayOfInterval, isToday, isSameDay } from 'date-fns';
import { ArrowLeft, Calendar, Target, TrendingUp, Award, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTempoStorageAPI } from '@/hooks/useTempoStorageAPI';
import { cn } from '@/lib/utils';
import { findActivityBySlug, unslugify } from '@/lib/utils/slugify';

const ACTIVITY_TYPE_COLORS = {
  enrichment: 'bg-blue-500',
  connection: 'bg-pink-500', 
  growth: 'bg-green-500',
  creative: 'bg-purple-500'
};

export default function ActivityStreakPage() {
  const router = useRouter();
  const params = useParams();
  const { activities, isLoading } = useTempoStorageAPI();
  const [timeRange, setTimeRange] = useState<'month' | '3months' | '6months' | 'year'>('3months');

  // Get the activity slug from URL
  const activitySlug = params.activity as string;
  
  // Find the actual activity from all activities using the slug
  const allActivities = Object.values(activities).flat();
  const matchedActivity = findActivityBySlug(allActivities, activitySlug);
  const activityName = matchedActivity?.title || unslugify(activitySlug);

  // Calculate date range based on timeRange
  const endDate = new Date();
  const startDate = useMemo(() => {
    switch (timeRange) {
      case 'month':
        return subDays(endDate, 30);
      case '3months':
        return subDays(endDate, 90);
      case '6months':
        return subDays(endDate, 180);
      case 'year':
        return subDays(endDate, 365);
      default:
        return subDays(endDate, 90);
    }
  }, [timeRange, endDate]);

  // Find all instances of this activity and track completion
  const activityData = useMemo(() => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return days.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const dayActivities = activities[dateKey] || [];
      
      // Find activities that match this title (case-insensitive)
      const matchingActivities = dayActivities.filter(a => 
        a.title.toLowerCase() === activityName.toLowerCase()
      );
      
      const hasActivity = matchingActivities.length > 0;
      const isCompleted = matchingActivities.some(a => a.completed);
      const activityType = matchingActivities[0]?.type;
      
      return {
        date: day,
        dateKey,
        hasActivity,
        isCompleted,
        activityType,
        activities: matchingActivities
      };
    });
  }, [activities, startDate, endDate, activityName]);

  // Calculate streak statistics
  const currentStreak = useMemo(() => {
    let streak = 0;
    for (let i = activityData.length - 1; i >= 0; i--) {
      if (activityData[i].isCompleted) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [activityData]);

  const longestStreak = useMemo(() => {
    let maxStreak = 0;
    let currentStreakCount = 0;
    
    activityData.forEach(day => {
      if (day.isCompleted) {
        currentStreakCount++;
        maxStreak = Math.max(maxStreak, currentStreakCount);
      } else {
        currentStreakCount = 0;
      }
    });
    
    return maxStreak;
  }, [activityData]);

  const totalCompletions = useMemo(() => {
    return activityData.filter(day => day.isCompleted).length;
  }, [activityData]);

  const completionRate = useMemo(() => {
    const daysWithActivity = activityData.filter(day => day.hasActivity).length;
    if (daysWithActivity === 0) return 0;
    return Math.round((totalCompletions / daysWithActivity) * 100);
  }, [activityData, totalCompletions]);

  // Get activity type for coloring
  const activityType = activityData.find(d => d.activityType)?.activityType;
  const activityColor = activityType ? ACTIVITY_TYPE_COLORS[activityType as keyof typeof ACTIVITY_TYPE_COLORS] : 'bg-gray-500';

  // Get intensity color based on completion
  const getIntensityColor = (day: typeof activityData[0]) => {
    if (!day.hasActivity) return 'bg-gray-100 dark:bg-gray-800/60';
    if (!day.isCompleted) return 'bg-gray-300 dark:bg-gray-700/80';
    return `${activityColor}/90 dark:${activityColor}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse w-16 h-16 bg-purple-200 dark:bg-purple-700 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading activity streak...</p>
        </div>
      </div>
    );
  }

  // If no instances of this activity found
  const hasAnyInstances = activityData.some(day => day.hasActivity);
  if (!hasAnyInstances) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-4 h-16">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/tempo/streaks')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Streaks
              </Button>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Activity Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              No instances of "{activityName}" found in the selected time range.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Slug: {activitySlug}
            </p>
            <div className="space-x-3">
              <Button onClick={() => router.push('/tempo')}>
                Add This Activity
              </Button>
              <Button variant="outline" onClick={() => router.push('/tempo/streaks')}>
                View All Streaks
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/tempo/streaks')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Streaks
              </Button>
              
              <div className="flex items-center gap-3">
                <div className={cn("w-4 h-4 rounded-full", activityColor)} />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {activityName}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {activityType} activity
                  </p>
                </div>
              </div>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center gap-2">
              {(['month', '3months', '6months', 'year'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                  className="capitalize"
                >
                  {range === '3months' ? '3M' : range === '6months' ? '6M' : range === 'month' ? '1M' : '1Y'}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <h3 className="font-medium text-gray-900 dark:text-white">Current Streak</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentStreak}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {currentStreak === 1 ? 'day' : 'days'} in a row
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <h3 className="font-medium text-gray-900 dark:text-white">Best Streak</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {longestStreak}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              personal record
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3 className="font-medium text-gray-900 dark:text-white">Completions</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalCompletions}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              total completed
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-blue-500" />
              <h3 className="font-medium text-gray-900 dark:text-white">Success Rate</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {completionRate}%
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              when scheduled
            </p>
          </div>
        </div>

        {/* Calendar Heatmap */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Activity Calendar
          </h2>
          
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {activityData.map((dayData) => (
                  <div
                    key={dayData.dateKey}
                    className={cn(
                      "w-10 h-10 rounded-md flex items-center justify-center text-sm font-medium transition-all hover:scale-110 cursor-pointer",
                      getIntensityColor(dayData),
                      isToday(dayData.date) && "ring-2 ring-purple-500 ring-offset-1 ring-offset-white dark:ring-offset-gray-800",
                      dayData.isCompleted ? "text-white" : "text-gray-600 dark:text-gray-400"
                    )}
                    title={`${format(dayData.date, 'MMM d')}: ${dayData.isCompleted ? 'Completed' : dayData.hasActivity ? 'Planned but not completed' : 'Not scheduled'}`}
                    onClick={() => router.push(`/tempo/day/${dayData.dateKey}`)}
                  >
                    {format(dayData.date, 'd')}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800/60" title="Not scheduled"></div>
                <div className="w-3 h-3 rounded-sm bg-gray-300 dark:bg-gray-700/80" title="Scheduled but not completed"></div>
                <div className={cn("w-3 h-3 rounded-sm", `${activityColor}/90`, `dark:${activityColor}`)} title="Completed"></div>
              </div>
              <span>More</span>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Click any day to view details
            </div>
          </div>
        </div>

        {/* Motivation Message */}
        {currentStreak > 0 && (
          <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-800/60 p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                🔥 You're on fire!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {currentStreak === longestStreak 
                  ? `You're at your personal best with ${currentStreak} ${currentStreak === 1 ? 'day' : 'days'} in a row!`
                  : `Keep going! You're ${longestStreak - currentStreak} ${longestStreak - currentStreak === 1 ? 'day' : 'days'} away from your personal best.`
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}