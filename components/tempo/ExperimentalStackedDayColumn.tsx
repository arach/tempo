'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { TempoActivity } from '@/lib/types'

interface ExperimentalStackedDayColumnProps {
  date: Date
  activities: TempoActivity[]
  isToday: boolean
  isEmpty: boolean
}

const STACK_COLORS = {
  enrichment: {
    border: 'border border-blue-600 dark:border-blue-300',
    accent: 'border-l-4 border-l-blue-400 dark:border-l-blue-500',
    text: 'text-blue-600 dark:text-blue-300',
  },
  connection: {
    border: 'border border-pink-600 dark:border-pink-300',
    accent: 'border-l-4 border-l-pink-400 dark:border-l-pink-500',
    text: 'text-pink-600 dark:text-pink-300',
  },
  growth: {
    border: 'border border-green-600 dark:border-green-300',
    accent: 'border-l-4 border-l-green-400 dark:border-l-green-500',
    text: 'text-green-600 dark:text-green-300',
  },
  creative: {
    border: 'border border-purple-600 dark:border-purple-300',
    accent: 'border-l-4 border-l-purple-400 dark:border-l-purple-500',
    text: 'text-purple-600 dark:text-purple-300',
  }
}

const STACK_ORDER = ['enrichment', 'growth', 'creative', 'connection'] as const

export function ExperimentalStackedDayColumn({ date, activities, isToday, isEmpty }: ExperimentalStackedDayColumnProps) {
  const [hoveredStack, setHoveredStack] = useState<string | null>(null)
  const router = useRouter()
  const { setNodeRef, isOver } = useDroppable({
    id: format(date, 'yyyy-MM-dd')
  })
  
  const handleDayHeaderClick = () => {
    router.push(`/tempo/day/${format(date, 'yyyy-MM-dd')}`)
  }

  // Group activities by type and then by title
  const stacks = activities.reduce((acc, activity) => {
    if (!acc[activity.type]) {
      acc[activity.type] = []
    }
    acc[activity.type].push(activity)
    return acc
  }, {} as Record<string, TempoActivity[]>)

  // Function to consolidate activities by title
  const consolidateActivities = (activities: TempoActivity[]) => {
    const consolidated: { title: string; count: number; totalDuration: number; activities: TempoActivity[] }[] = []
    
    activities.forEach(activity => {
      const existing = consolidated.find(c => c.title.toLowerCase() === activity.title.toLowerCase())
      if (existing) {
        existing.count++
        existing.totalDuration += parseDuration(activity.duration || '')
        existing.activities.push(activity)
      } else {
        consolidated.push({
          title: activity.title,
          count: 1,
          totalDuration: parseDuration(activity.duration || ''),
          activities: [activity]
        })
      }
    })
    
    return consolidated
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`
  }

  const getStackDuration = (activities: TempoActivity[]) => {
    const totalMinutes = activities.reduce((sum, activity) => {
      return sum + parseDuration(activity.duration || '')
    }, 0)
    
    if (totalMinutes === 0) return null
    return formatDuration(totalMinutes)
  }

  return (
    <div className={cn(
      "relative h-full",
      "bg-white dark:bg-gray-900", // Override any parent background
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

      {/* Stacks */}
      <div 
        ref={setNodeRef}
        className={cn(
          "p-3 space-y-3 min-h-[150px] transition-colors",
          isOver && "bg-purple-50 dark:bg-purple-900/60",
          activities.length === 0 && "flex items-center justify-center"
        )}
      >
        <SortableContext
          items={activities.map(a => `${format(date, 'yyyy-MM-dd')}:${a.id}`)}
          strategy={verticalListSortingStrategy}
        >
          {isEmpty ? (
            <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
              Free as a bird
            </p>
          ) : (
            STACK_ORDER
              .filter(type => stacks[type])
              .map((type) => {
                const stackActivities = stacks[type]
                const colors = STACK_COLORS[type as keyof typeof STACK_COLORS]
                const consolidatedActivities = consolidateActivities(stackActivities)
                
                return (
                  <div
                    key={type}
                    className="relative"
                    onMouseEnter={() => setHoveredStack(type)}
                    onMouseLeave={() => setHoveredStack(null)}
                  >
                    <div
                      className={cn(
                        "w-full rounded-lg transition-all p-3 text-left",
                        "bg-white dark:bg-gray-900",
                        "hover:bg-gray-50 dark:hover:bg-gray-800",
                        colors.border
                      )}
                    >
                      {/* Stack Header */}
                      <div className="mb-2">
                        <span className={cn("text-xs font-bold capitalize", colors.text)}>
                          {type}
                        </span>
                      </div>
                      
                      {/* Consolidated Activities Summary */}
                      <div className="space-y-1">
                        {consolidatedActivities.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="text-xs leading-relaxed">
                            <span className={cn(colors.text, "opacity-80")}>
                              {item.title}
                              {item.count > 1 && (
                                <span className="opacity-60 ml-1">×{item.count}</span>
                              )}
                            </span>
                          </div>
                        ))}
                        {consolidatedActivities.length > 3 && (
                          <div className={cn("text-xs mt-1", colors.text, "opacity-60")}>
                            +{consolidatedActivities.length - 3} more...
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Lightweight Tooltip */}
                    {hoveredStack === type && (
                      <div className={cn(
                        "absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50",
                        "p-4 rounded-lg shadow-xl",
                        "bg-white dark:bg-gray-800",
                        colors.border,
                        "min-w-[220px] max-w-[300px]",
                        "animate-in fade-in slide-in-from-top-1 duration-200"
                      )}>
                        <p className={cn("font-bold text-xs capitalize mb-3", colors.text)}>
                          {type} Details
                        </p>
                        <div className="space-y-2">
                          {consolidatedActivities.map((item, idx) => (
                            <div key={idx} className="text-xs">
                              <div className="flex justify-between items-start gap-3">
                                <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                  {item.title}
                                  {item.count > 1 && (
                                    <span className="opacity-60 ml-0.5">×{item.count}</span>
                                  )}
                                </span>
                                {item.totalDuration > 0 && (
                                  <span className="text-gray-500 dark:text-gray-400 text-[10px] whitespace-nowrap">
                                    {formatDuration(item.totalDuration)}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        {getStackDuration(stackActivities) && (
                          <div className={cn(
                            "text-[10px] mt-2 pt-2 border-t border-gray-200 dark:border-gray-700",
                            "text-gray-600 dark:text-gray-400"
                          )}>
                            Total: {getStackDuration(stackActivities)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
          )}
        </SortableContext>
      </div>
    </div>
  )
}