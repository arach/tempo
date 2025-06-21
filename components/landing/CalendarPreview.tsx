'use client';

import { cn } from '@/lib/utils';

// Sample activities to show in the preview
const sampleWeek = {
  'Mon': [
    { title: 'Morning meditation', type: 'growth', duration: '20 min' },
    { title: 'Deep work session', type: 'enrichment', duration: '2 hours' },
    { title: 'Call mom', type: 'connection', duration: '30 min' },
    { title: 'Evening walk', type: 'growth', duration: '45 min' }
  ],
  'Tue': [
    { title: 'Guitar practice', type: 'creative', duration: '1 hour' },
    { title: 'Reading time', type: 'enrichment', duration: '45 min' },
    { title: 'Team lunch', type: 'connection', duration: '1.5 hours' }
  ],
  'Wed': [
    { title: 'Yoga class', type: 'growth', duration: '1 hour' },
    { title: 'Writing session', type: 'creative', duration: '90 min' },
    { title: 'Coffee with Sarah', type: 'connection', duration: '1 hour' },
    { title: 'Podcast listening', type: 'enrichment', duration: '30 min' }
  ],
  'Thu': [
    { title: 'Learn Spanish', type: 'enrichment', duration: '45 min' },
    { title: 'Photography walk', type: 'creative', duration: '2 hours' },
    { title: 'Journal reflection', type: 'growth', duration: '20 min' }
  ],
  'Fri': [
    { title: 'Book club meeting', type: 'connection', duration: '2 hours' },
    { title: 'Art project', type: 'creative', duration: '90 min' },
    { title: 'Evening stretching', type: 'growth', duration: '30 min' }
  ],
  'Sat': [
    { title: 'Family brunch', type: 'connection', duration: '2 hours' },
    { title: 'Garden project', type: 'creative', duration: '3 hours' },
    { title: 'Documentary night', type: 'enrichment', duration: '2 hours' }
  ],
  'Sun': [
    { title: 'Nature hike', type: 'growth', duration: '3 hours' },
    { title: 'Cook new recipe', type: 'creative', duration: '1.5 hours' },
    { title: 'Video call with friends', type: 'connection', duration: '1 hour' },
    { title: 'Plan next week', type: 'growth', duration: '30 min' }
  ]
};

const typeColors = {
  enrichment: 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-100 dark:border-blue-300 dark:text-blue-800',
  connection: 'bg-pink-100 border-pink-300 text-pink-800 dark:bg-pink-100 dark:border-pink-300 dark:text-pink-800',
  growth: 'bg-green-100 border-green-300 text-green-800 dark:bg-green-100 dark:border-green-300 dark:text-green-800',
  creative: 'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-100 dark:border-purple-300 dark:text-purple-800',
};

const dayNumbers = ['15', '16', '17', '18', '19', '20', '21'];

export function CalendarPreview() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="grid grid-cols-7 gap-0">
        {Object.entries(sampleWeek).map(([day, activities], index) => (
          <div 
            key={day} 
            className="bg-gray-50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700 last:border-r-0 min-h-[300px] sm:min-h-[400px]"
          >
            {/* Day Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-3 text-center">
              <h3 className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-300">
                {day}
              </h3>
              <p className="text-2xl sm:text-3xl font-light mt-1 text-gray-800 dark:text-gray-200">
                {dayNumbers[index]}
              </p>
            </div>
            
            {/* Activities */}
            <div className="p-2 space-y-2">
              {activities.map((activity, actIndex) => (
                <div
                  key={actIndex}
                  className={cn(
                    'p-2 sm:p-3 rounded border text-xs sm:text-sm transition-all hover:shadow-sm cursor-pointer',
                    typeColors[activity.type as keyof typeof typeColors]
                  )}
                >
                  <p className="font-medium leading-tight line-clamp-2">
                    {activity.title}
                  </p>
                  <p className="text-xs opacity-60 mt-1">
                    {activity.duration}
                  </p>
                </div>
              ))}
              
              {/* Empty state hint */}
              {activities.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p className="text-xs">Free as a bird</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Caption */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 p-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">No time slots.</span> Activities flow naturally, 
          stacked by importance rather than rigid schedules.
        </p>
      </div>
    </div>
  );
}