'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format, subDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay } from 'date-fns';
import { ArrowLeft, Calendar, Filter, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTempoStorageAPI } from '@/hooks/useTempoStorageAPI';
import { cn } from '@/lib/utils';
import type { TempoActivity } from '@/lib/types';

const ACTIVITY_TYPE_COLORS = {
  enrichment: 'bg-blue-500',
  connection: 'bg-pink-500', 
  growth: 'bg-green-500',
  creative: 'bg-purple-500'
};

export default function StreaksPage() {
  const router = useRouter();
  const { activities, isLoading } = useTempoStorageAPI();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | '3months'>('month');

  // Calculate date range based on timeRange
  const endDate = new Date();
  const startDate = useMemo(() => {
    switch (timeRange) {
      case 'week':
        return subDays(endDate, 7);
      case 'month':
        return subDays(endDate, 30);
      case '3months':
        return subDays(endDate, 90);
      default:
        return subDays(endDate, 30);
    }
  }, [timeRange, endDate]);

  // Generate calendar grid data
  const calendarData = useMemo(() => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return days.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const dayActivities = activities[dateKey] || [];
      
      const filteredActivities = selectedType 
        ? dayActivities.filter(a => a.type === selectedType)
        : dayActivities;
      
      const completedCount = filteredActivities.filter(a => a.completed).length;
      const totalCount = filteredActivities.length;
      const completionRate = totalCount > 0 ? completedCount / totalCount : 0;
      
      return {
        date: day,
        dateKey,
        totalActivities: totalCount,
        completedActivities: completedCount,
        completionRate,
        activities: filteredActivities
      };
    });
  }, [activities, startDate, endDate, selectedType]);

  // Calculate streaks
  const currentStreak = useMemo(() => {
    let streak = 0;
    for (let i = calendarData.length - 1; i >= 0; i--) {
      if (calendarData[i].completionRate > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [calendarData]);

  const longestStreak = useMemo(() => {
    let maxStreak = 0;
    let currentStreakCount = 0;
    
    calendarData.forEach(day => {
      if (day.completionRate > 0) {
        currentStreakCount++;
        maxStreak = Math.max(maxStreak, currentStreakCount);
      } else {
        currentStreakCount = 0;
      }
    });
    
    return maxStreak;
  }, [calendarData]);

  // Get intensity color based on completion rate
  const getIntensityColor = (completionRate: number, hasActivities: boolean) => {
    if (!hasActivities) return 'bg-gray-100 dark:bg-gray-800/60';
    
    if (completionRate === 0) return 'bg-gray-200 dark:bg-gray-700/60';
    
    // Use opacity instead of color variants for better dark mode contrast
    if (selectedType) {
      const typeColorMap = {
        enrichment: 'bg-blue-500',
        connection: 'bg-pink-500',
        growth: 'bg-green-500',
        creative: 'bg-purple-500'
      };
      const baseColor = typeColorMap[selectedType as keyof typeof typeColorMap];
      
      if (completionRate < 0.25) return `${baseColor}/30 dark:${baseColor}/80`;
      if (completionRate < 0.5) return `${baseColor}/50 dark:${baseColor}/90`;
      if (completionRate < 0.75) return `${baseColor}/70 dark:${baseColor}/95`;
      return `${baseColor} dark:${baseColor}`;
    }
    
    // Default purple scale using opacity
    if (completionRate < 0.25) return 'bg-purple-500/30 dark:bg-purple-500/80';
    if (completionRate < 0.5) return 'bg-purple-500/50 dark:bg-purple-500/90';
    if (completionRate < 0.75) return 'bg-purple-500/70 dark:bg-purple-500/95';
    return 'bg-purple-500 dark:bg-purple-500';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse w-16 h-16 bg-purple-200 dark:bg-purple-700 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your activity patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/tempo')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Calendar
              </Button>
              
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Streaks</h1>
              </div>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center gap-2">
              {(['week', 'month', '3months'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                  className="capitalize"
                >
                  {range === '3months' ? '3 Months' : range}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h3 className="font-medium text-gray-900 dark:text-white">Current Streak</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Keep it going!
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <h3 className="font-medium text-gray-900 dark:text-white">Longest Streak</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Personal best
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h3 className="font-medium text-gray-900 dark:text-white">Total Activities</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {calendarData.reduce((sum, day) => sum + day.completedActivities, 0)}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Completed in {timeRange}
            </p>
          </div>
        </div>

        {/* Activity Type Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by activity type:</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedType === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(null)}
            >
              All Activities
            </Button>
            {Object.entries(ACTIVITY_TYPE_COLORS).map(([type, color]) => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type)}
                className="capitalize"
              >
                <div className={cn("w-3 h-3 rounded-full mr-2", color)} />
                {type}
              </Button>
            ))}
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
              <div className="grid grid-cols-7 gap-1 mb-4" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {calendarData.map((dayData, index) => (
                  <div
                    key={dayData.dateKey}
                    className={cn(
                      "w-8 h-8 rounded-sm flex items-center justify-center text-xs font-medium transition-all hover:scale-110 cursor-pointer",
                      getIntensityColor(dayData.completionRate, dayData.totalActivities > 0),
                      isToday(dayData.date) && "ring-2 ring-purple-500 ring-offset-1 ring-offset-white dark:ring-offset-gray-800",
                      dayData.completionRate > 0 ? "text-white" : "text-gray-600 dark:text-gray-400"
                    )}
                    title={`${format(dayData.date, 'MMM d')}: ${dayData.completedActivities}/${dayData.totalActivities} completed`}
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
                <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700/60"></div>
                <div className="w-3 h-3 rounded-sm bg-purple-500/30 dark:bg-purple-500/80"></div>
                <div className="w-3 h-3 rounded-sm bg-purple-500/50 dark:bg-purple-500/90"></div>
                <div className="w-3 h-3 rounded-sm bg-purple-500/70 dark:bg-purple-500/95"></div>
                <div className="w-3 h-3 rounded-sm bg-purple-500 dark:bg-purple-500"></div>
              </div>
              <span>More</span>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Click any day to view details
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}