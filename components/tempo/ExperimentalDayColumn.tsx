'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDroppable } from '@dnd-kit/core'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { TempoActivity } from '@/lib/types'
import { Sparkles } from 'lucide-react'

interface ExperimentalDayColumnProps {
  date: Date
  activities: TempoActivity[]
  isToday: boolean
  isEmpty: boolean
}

interface ActivityWithCount extends TempoActivity {
  count: number
}

const ACTIVITY_COLORS = {
  enrichment: { 
    bg: 'bg-blue-500', 
    light: 'bg-blue-50 dark:bg-blue-900/70', 
    border: 'border-blue-200 dark:border-blue-800/60', 
    text: 'text-blue-700 dark:text-blue-300' 
  },
  connection: { 
    bg: 'bg-pink-500', 
    light: 'bg-pink-50 dark:bg-pink-900/70', 
    border: 'border-pink-200 dark:border-pink-800/60', 
    text: 'text-pink-700 dark:text-pink-300' 
  },
  growth: { 
    bg: 'bg-green-500', 
    light: 'bg-green-50 dark:bg-green-900/70', 
    border: 'border-green-200 dark:border-green-800/60', 
    text: 'text-green-700 dark:text-green-300' 
  },
  creative: { 
    bg: 'bg-purple-500', 
    light: 'bg-purple-50 dark:bg-purple-900/70', 
    border: 'border-purple-200 dark:border-purple-800/60', 
    text: 'text-purple-700 dark:text-purple-300' 
  }
}

export function ExperimentalDayColumn({ date, activities, isToday, isEmpty }: ExperimentalDayColumnProps) {
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null)
  const router = useRouter()
  
  const { setNodeRef, isOver } = useDroppable({
    id: format(date, 'yyyy-MM-dd'),
  })
  
  const handleDayHeaderClick = () => {
    router.push(`/tempo/day/${format(date, 'yyyy-MM-dd')}`)
  }

  // Parse duration string like "30 min" or "2 hours" to minutes
  const parseDuration = (duration: string): number => {
    if (!duration) return 0
    const hourMatch = duration.match(/(\d+)\s*h(our)?/i)
    const minMatch = duration.match(/(\d+)\s*m(in)?/i)
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0
    const minutes = minMatch ? parseInt(minMatch[1]) : 0
    return hours * 60 + minutes
  }

  // Group activities by type and count duplicates
  const groupedActivities = activities.reduce((acc, activity) => {
    if (!acc[activity.type]) {
      acc[activity.type] = []
    }
    
    // Check if this activity title already exists or matches a pattern
    const existing = acc[activity.type].find(a => {
      // Exact match
      if (a.title.toLowerCase() === activity.title.toLowerCase()) return true
      
      // Pattern match: "Activity Name #N" or "Activity Name N"
      const basePattern1 = activity.title.match(/^(.+?)\s*#\d+$/i)
      const basePattern2 = activity.title.match(/^(.+?)\s+\d+$/i)
      
      if (basePattern1 || basePattern2) {
        const activityBase = (basePattern1?.[1] || basePattern2?.[1] || '').trim().toLowerCase()
        
        const existingPattern1 = a.title.match(/^(.+?)\s*#\d+$/i)
        const existingPattern2 = a.title.match(/^(.+?)\s+\d+$/i)
        
        if (existingPattern1 || existingPattern2) {
          const existingBase = (existingPattern1?.[1] || existingPattern2?.[1] || '').trim().toLowerCase()
          return activityBase === existingBase
        }
        
        // Also match if existing is just the base without number
        return a.title.toLowerCase() === activityBase
      }
      
      return false
    })
    
    if (existing) {
      // Increment count for existing activity
      (existing as ActivityWithCount).count = ((existing as ActivityWithCount).count || 1) + 1
      
      // Update title to base pattern if it's a numbered pattern
      const basePattern1 = activity.title.match(/^(.+?)\s*#\d+$/i)
      const basePattern2 = activity.title.match(/^(.+?)\s+\d+$/i)
      if (basePattern1 || basePattern2) {
        existing.title = (basePattern1?.[1] || basePattern2?.[1] || '').trim()
      }
      
      // Add to total duration
      const existingMinutes = parseDuration(existing.duration || '')
      const newMinutes = parseDuration(activity.duration || '')
      const totalMinutes = existingMinutes + newMinutes
      if (totalMinutes > 0) {
        const hours = Math.floor(totalMinutes / 60)
        const mins = totalMinutes % 60
        existing.duration = hours > 0 
          ? (mins > 0 ? `${hours}h ${mins}m` : `${hours}h`)
          : `${mins}m`
      }
    } else {
      // Add new activity with count
      const basePattern1 = activity.title.match(/^(.+?)\s*#\d+$/i)
      const basePattern2 = activity.title.match(/^(.+?)\s+\d+$/i)
      
      acc[activity.type].push({
        ...activity,
        title: (basePattern1?.[1] || basePattern2?.[1] || activity.title).trim(),
        count: 1
      } as ActivityWithCount)
    }
    
    return acc
  }, {} as Record<string, ActivityWithCount[]>)


  return (
    <div className={cn(
      "relative h-full",
      "border-r border-gray-200 dark:border-gray-700 last:border-r-0"
    )}>
      {/* Date Header */}
      <div className={cn(
        "sticky top-0 z-10 bg-white dark:bg-gray-900 border-b",
        "border-gray-200 dark:border-gray-800"
      )}>
        <button
          onClick={handleDayHeaderClick}
          className="w-full px-3 py-2 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className={cn(
            "text-xs font-medium uppercase tracking-wider",
            isToday ? "text-blue-500" : "text-gray-500 dark:text-gray-400"
          )}>
            {format(date, 'EEE')}
          </div>
          <div className={cn(
            "text-lg font-semibold",
            isToday ? "text-blue-500" : "text-gray-900 dark:text-white"
          )}>
            {format(date, 'd')}
          </div>
        </button>
      </div>

      {/* Activity Groups */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 p-3 transition-colors min-h-[200px]",
          isOver && "bg-blue-50/50 dark:bg-blue-950/60",
          isEmpty && "flex items-center justify-center"
        )}
      >
        {isEmpty ? (
          <div className="text-center p-4">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-700" />
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Drop activities here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(groupedActivities).map(([type, typeActivities]) => {
              const colors = ACTIVITY_COLORS[type as keyof typeof ACTIVITY_COLORS]

              return (
                <div
                  key={type}
                  className="relative"
                  onMouseEnter={() => setHoveredGroup(type)}
                  onMouseLeave={() => setHoveredGroup(null)}
                >
                  <div
                    className={cn(
                      "group w-full rounded-xl transition-all duration-300 text-left",
                      colors.light,
                      colors.border,
                      "border p-4",
                      "hover:shadow-md"
                    )}
                  >
                    {/* Group Header */}
                    <div className="flex items-center justify-between">
                      <span className={cn("text-sm font-medium capitalize", colors.text)}>
                        {type}
                      </span>
                      <span className={cn("text-xs opacity-60", colors.text)}>
                        {typeActivities.length}
                      </span>
                    </div>
                  </div>
                  
                  {/* Lightweight Tooltip */}
                  {hoveredGroup === type && (
                    <div className={cn(
                      "absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50",
                      "p-4 rounded-xl shadow-xl",
                      "bg-white dark:bg-gray-800",
                      "border",
                      colors.border,
                      "min-w-[220px] max-w-[300px]",
                      "animate-in fade-in slide-in-from-top-1 duration-200"
                    )}>
                      <p className={cn("font-bold text-xs capitalize mb-3", colors.text)}>
                        {type} Activities
                      </p>
                      <div className="space-y-2">
                        {typeActivities.map((activity) => (
                          <div key={activity.id} className="text-xs">
                            <div className="flex justify-between items-start gap-3">
                              <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {activity.title}
                                {(activity as ActivityWithCount).count > 1 && (
                                  <span className="opacity-60 ml-0.5">
                                    ×{(activity as ActivityWithCount).count}
                                  </span>
                                )}
                              </span>
                              {activity.duration && (
                                <span className="text-gray-500 dark:text-gray-400 text-[10px] whitespace-nowrap">
                                  {activity.duration}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}