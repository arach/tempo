'use client';

import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { 
  ArrowLeft, 
  Calendar,
  CheckCircle2,
  Circle,
  Sparkles,
  Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTempoStorageAPI } from '@/hooks/useTempoStorageAPI';
import type { TempoActivity } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function FocusModeDay() {
  const router = useRouter();
  const params = useParams();
  const { activities, completeActivity, isLoading, error } = useTempoStorageAPI();
  const [showCelebration, setShowCelebration] = useState(false);
  
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
            The date &quot;{dateParam}&quot; is not valid. Please use YYYY-MM-DD format.
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
  const completedCount = dayActivities.filter(a => a.completed).length;
  const totalCount = dayActivities.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse w-16 h-16 bg-purple-200 dark:bg-purple-700 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Preparing your focus session...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-lg mb-4">
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

  const handleCompleteActivity = async (activityId: string) => {
    try {
      await completeActivity(currentDate, activityId);
      
      // Check if this completes all activities
      const updatedActivities = activities[currentDate] || [];
      const nowCompleted = updatedActivities.filter(a => a.completed || a.id === activityId).length;
      const total = updatedActivities.length;
      
      if (nowCompleted === total && total > 0) {
        // All activities completed - trigger celebration
        setTimeout(() => {
          setShowCelebration(true);
        }, 500);
      }
    } catch (error) {
      console.error('Failed to complete activity:', error);
    }
  };

  const formattedDate = format(parsedDate, 'EEEE, MMMM d');
  const isToday = currentDate === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-900 dark:to-slate-900">
      {/* Top Navigation Bar */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/tempo/day/${currentDate}`)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Mode
            </Button>
            
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Focus Mode
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/tempo')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6">
        {/* Date and Progress Section */}
        <div className="py-12 border-b border-gray-200 dark:border-gray-800">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light text-gray-900 dark:text-white mb-2">
              {formattedDate}
            </h1>
            {isToday && (
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                Today
              </span>
            )}
          </div>
          
          {/* Progress Bar */}
          {totalCount > 0 && (
            <div className="max-w-sm mx-auto">
              <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
                <span>Progress</span>
                <span>{completedCount} of {totalCount}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              {completionPercentage === 100 ? (
                <p className="text-center text-sm text-purple-600 dark:text-purple-400 font-medium mt-4">
                  All activities complete ✓
                </p>
              ) : completionPercentage >= 75 ? (
                <p className="text-center text-sm text-purple-600 dark:text-purple-400 mt-4">
                  Almost there! Keep going!
                </p>
              ) : completionPercentage >= 50 ? (
                <p className="text-center text-sm text-purple-600 dark:text-purple-400 mt-4">
                  You're halfway there!
                </p>
              ) : completionPercentage >= 25 ? (
                <p className="text-center text-sm text-purple-600 dark:text-purple-400 mt-4">
                  Great start! Keep it up!
                </p>
              ) : null}
            </div>
          )}
        </div>

        {/* Activities List */}
        <div className="py-8">
          {dayActivities.length === 0 ? (
            <div className="text-center py-24">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
                <Sparkles className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No activities planned
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Your day is open for spontaneous moments
              </p>
              <Button
                onClick={() => router.push(`/tempo/day/${currentDate}`)}
                variant="outline"
                size="sm"
                className="border-gray-300 dark:border-gray-700"
              >
                <Edit3 className="h-3.5 w-3.5 mr-2" />
                Plan Your Day
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {dayActivities.map((activity, index) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  index={index}
                  onComplete={() => handleCompleteActivity(activity.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-in zoom-in-95 duration-300">
            <div className="mb-6">
              <div className="relative inline-block">
                <div className="absolute inset-0 animate-ping">
                  <Sparkles className="h-16 w-16 text-yellow-400" />
                </div>
                <Sparkles className="h-16 w-16 text-yellow-400 relative" />
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              Day Complete!
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You've completed all {totalCount} {totalCount === 1 ? 'activity' : 'activities'} for today. 
              Take a moment to appreciate your dedication.
            </p>
            
            <div className="space-y-2">
              <Button
                onClick={() => {
                  setShowCelebration(false);
                  router.push('/tempo');
                }}
                className="w-full"
              >
                Back to Calendar
              </Button>
              
              <Button
                onClick={() => setShowCelebration(false)}
                variant="ghost"
                className="w-full"
              >
                Stay Here
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ActivityCardProps {
  activity: TempoActivity;
  index: number;
  onComplete: () => void;
}

function ActivityCard({ activity, index, onComplete }: ActivityCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await onComplete();
      
      // Only show celebration animation when completing (not uncompleting)
      if (!activity.completed) {
        setJustCompleted(true);
        
        // Reset the celebration state after animation
        setTimeout(() => {
          setJustCompleted(false);
        }, 1000);
      }
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className={cn(
      "group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200",
      activity.completed && "opacity-60",
      justCompleted && "animate-pulse bg-green-100 dark:bg-green-800 border-green-400 dark:border-green-600"
    )}>
      <div className="flex items-center gap-4 p-4">
        {/* Completion Button */}
        <button
          onClick={handleComplete}
          disabled={isCompleting}
          className={cn(
            "flex-shrink-0 w-6 h-6 rounded-full transition-all duration-200",
            activity.completed 
              ? "text-green-500 dark:text-green-400 hover:text-gray-400 dark:hover:text-gray-500" 
              : "text-gray-300 hover:text-purple-500 dark:text-gray-600 dark:hover:text-purple-400"
          )}
          title={activity.completed ? "Click to mark as incomplete" : "Click to mark as complete"}
        >
          {activity.completed ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            <Circle className="w-6 h-6" />
          )}
        </button>

        {/* Activity Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className={cn(
              "font-medium text-gray-900 dark:text-white",
              activity.completed && "line-through text-gray-500 dark:text-gray-400"
            )}>
              {activity.title}
            </h3>
            <div className={cn(
              "w-2 h-2 rounded-full flex-shrink-0",
              activity.type === 'enrichment' && "bg-blue-400",
              activity.type === 'connection' && "bg-pink-400", 
              activity.type === 'growth' && "bg-green-400",
              activity.type === 'creative' && "bg-purple-400"
            )} />
          </div>
          
          {activity.description && (
            <p className={cn(
              "text-sm text-gray-500 dark:text-gray-400 mt-1",
              activity.completed && "line-through"
            )}>
              {activity.description}
            </p>
          )}
        </div>

        {/* Duration */}
        {activity.duration && (
          <span className={cn(
            "text-sm text-gray-400 dark:text-gray-500 flex-shrink-0",
            activity.completed && "line-through"
          )}>
            {activity.duration}
          </span>
        )}
      </div>
    </div>
  );
}