'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { TempoActivity } from '@/lib/types'
import { ActivityBlock } from './ActivityBlock'
import { Sparkles } from 'lucide-react'

interface ExperimentalBubbleDayColumnProps {
  date: Date
  activities: TempoActivity[]
  isToday: boolean
  isEmpty: boolean
}

const BUBBLE_COLORS = {
  enrichment: {
    bg: 'bg-blue-500/90',
    glow: 'shadow-blue-400/50',
    ring: 'ring-blue-500',
    text: 'text-blue-600'
  },
  connection: {
    bg: 'bg-pink-500/90',
    glow: 'shadow-pink-400/50',
    ring: 'ring-pink-500',
    text: 'text-pink-600'
  },
  growth: {
    bg: 'bg-green-500/90',
    glow: 'shadow-green-400/50',
    ring: 'ring-green-500',
    text: 'text-green-600'
  },
  creative: {
    bg: 'bg-purple-500/90',
    glow: 'shadow-purple-400/50',
    ring: 'ring-purple-500',
    text: 'text-purple-600'
  }
}

interface BubbleData {
  activity: TempoActivity
  x: number
  y: number
  size: number
  groupedActivities?: TempoActivity[]
  activityCount: number
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

export function ExperimentalBubbleDayColumn({ date, activities, isToday, isEmpty }: ExperimentalBubbleDayColumnProps) {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [hoveredBubble, setHoveredBubble] = useState<string | null>(null)
  const [bubbles, setBubbles] = useState<BubbleData[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
  const { setNodeRef, isOver } = useDroppable({
    id: format(date, 'yyyy-MM-dd'),
  })
  
  const handleDayHeaderClick = () => {
    router.push(`/tempo/day/${format(date, 'yyyy-MM-dd')}`)
  }

  // Calculate bubble positions
  useEffect(() => {
    if (!containerRef.current || activities.length === 0) {
      setBubbles([])
      return
    }

    const container = containerRef.current
    const width = container.offsetWidth || 200
    const height = container.offsetHeight || 300
    
    // Group activities by type
    const groups = activities.reduce((acc, activity) => {
      if (!acc[activity.type]) {
        acc[activity.type] = {
          type: activity.type,
          activities: [],
          totalDuration: 0
        }
      }
      acc[activity.type].activities.push(activity)
      acc[activity.type].totalDuration += parseDuration(activity.duration || '')
      return acc
    }, {} as Record<string, { type: string; activities: TempoActivity[]; totalDuration: number }>)
    
    // Position bubbles for each type with reasonable padding
    const newBubbles: BubbleData[] = []
    const typePositions = {
      enrichment: { x: width * 0.35, y: height * 0.30 },
      connection: { x: width * 0.65, y: height * 0.30 },
      growth: { x: width * 0.35, y: height * 0.60 },
      creative: { x: width * 0.65, y: height * 0.60 }
    }
    
    // Convert groups to array and sort by activity count (descending)
    const sortedGroups = Object.entries(groups)
      .sort(([aType, aGroup], [bType, bGroup]) => {
        // Sort by activity count first
        if (bGroup.activities.length !== aGroup.activities.length) {
          return bGroup.activities.length - aGroup.activities.length
        }
        // If tie, use type order (enrichment, connection, growth, creative)
        const typeOrder = ['enrichment', 'connection', 'growth', 'creative']
        return typeOrder.indexOf(aType) - typeOrder.indexOf(bType)
      })
    
    sortedGroups.forEach(([type, group]) => {
      const pos = typePositions[type as keyof typeof typePositions] || { x: width / 2, y: height / 2 }
      
      // Size based on number of activities and duration
      const baseSize = 60
      const countBonus = group.activities.length * 8
      const durationBonus = Math.min(30, group.totalDuration / 10)
      const size = Math.min(120, baseSize + countBonus + durationBonus)
      
      // Create a synthetic activity to represent the group
      const groupActivity: TempoActivity = {
        id: `group-${type}`,
        title: type,
        type: type as TempoActivity['type'],
        description: `${group.activities.length} activities`,
        duration: `${Math.round(group.totalDuration)} min`
      }
      
      newBubbles.push({
        activity: groupActivity,
        x: pos.x,
        y: pos.y, // Removed offset for header
        size,
        groupedActivities: group.activities,
        activityCount: group.activities.length
      })
    })
    
    setBubbles(newBubbles)
  }, [activities])


  return (
    <div className={cn(
      "relative h-full flex flex-col overflow-visible",
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

      {/* Bubble Container */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 relative overflow-visible transition-all duration-300 min-h-[300px]",
          isOver && "bg-blue-50/50 dark:bg-blue-950/20",
          isEmpty && "flex items-center justify-center"
        )}
      >
        <div ref={containerRef} className="absolute inset-0 p-4">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 opacity-50" />
                </div>
                <Sparkles className="w-10 h-10 text-gray-400 relative z-10 m-5" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
                Drop bubbles here
              </p>
            </div>
          ) : (
            <>
              {/* Bubble Field */}
              <SortableContext
                items={activities.map(a => a.id)}
                strategy={verticalListSortingStrategy}
              >
                {bubbles.map((bubble) => {
                  const colors = BUBBLE_COLORS[bubble.activity.type as keyof typeof BUBBLE_COLORS]
                  const isSelected = selectedActivity === bubble.activity.id
                  const isHovered = hoveredBubble === bubble.activity.id
                  
                  return (
                    <div
                      key={bubble.activity.id}
                      className="absolute cursor-pointer"
                      style={{
                        left: `${bubble.x}px`,
                        top: `${bubble.y}px`,
                        width: `${bubble.size}px`,
                        height: `${bubble.size}px`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: isHovered || isSelected ? 1000 + bubble.activityCount : bubble.activityCount
                      }}
                      onMouseEnter={() => setHoveredBubble(bubble.activity.id)}
                      onMouseLeave={() => setHoveredBubble(null)}
                      onClick={() => setSelectedActivity(isSelected ? null : bubble.activity.id)}
                    >
                      <div className={cn(
                        "w-full h-full rounded-full flex flex-col items-center justify-center",
                        "text-white font-medium",
                        "shadow-lg hover:shadow-xl transition-all",
                        colors.bg,
                        isHovered && "scale-110",
                        isSelected && "scale-125 ring-4 ring-white ring-offset-2"
                      )}>
                        <span className="text-xs font-bold capitalize">
                          {bubble.activity.title}
                        </span>
                        <span className="text-[10px] opacity-90">
                          {bubble.activity.description}
                        </span>
                      </div>
                      
                      {/* Tooltip */}
                      {(isHovered || isSelected) && (
                        <div className={cn(
                          "absolute bottom-full left-1/2 -translate-x-1/2 mb-2",
                          "p-3 rounded-lg shadow-xl",
                          "bg-white dark:bg-gray-800",
                          "border",
                          bubble.activity.type === 'enrichment' && "border-blue-500 dark:border-blue-400",
                          bubble.activity.type === 'connection' && "border-pink-500 dark:border-pink-400",
                          bubble.activity.type === 'growth' && "border-green-500 dark:border-green-400",
                          bubble.activity.type === 'creative' && "border-purple-500 dark:border-purple-400",
                          "min-w-[220px] max-w-[300px]",
                          "animate-in fade-in slide-in-from-bottom-1 duration-200"
                        )}
                        style={{ zIndex: 9999 }}>
                          <p className={cn("font-bold text-sm capitalize mb-2", colors.text)}>
                            {bubble.activity.title}
                          </p>
                          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            <p className="font-medium">{bubble.activity.description}</p>
                            <p>Total: {bubble.activity.duration}</p>
                          </div>
                          {bubble.groupedActivities && bubble.groupedActivities.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                              <ul className="text-xs space-y-0.5">
                                {bubble.groupedActivities.map((act, idx) => (
                                  <li key={idx} className="text-gray-600 dark:text-gray-400">
                                    • {act.title}
                                    {act.duration && <span className="text-gray-400"> ({act.duration})</span>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </SortableContext>

              {/* Selected Activity Detail */}
              {selectedActivity && (
                <div className="absolute bottom-4 left-4 right-4" style={{ zIndex: 9998 }}>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
                    {selectedActivity.startsWith('group-') ? (
                      // Show grouped activities
                      <div>
                        <h3 className="font-bold capitalize mb-3">
                          {selectedActivity.replace('group-', '')} Activities
                        </h3>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                          {bubbles.find(b => b.activity.id === selectedActivity)?.groupedActivities?.map((act) => (
                            <ActivityBlock 
                              key={act.id}
                              activity={act}
                              date={format(date, 'yyyy-MM-dd')}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <ActivityBlock 
                        activity={activities.find(a => a.id === selectedActivity)!}
                        date={format(date, 'yyyy-MM-dd')}
                      />
                    )}
                    <button
                      onClick={() => setSelectedActivity(null)}
                      className="mt-2 w-full text-xs text-gray-500 hover:text-gray-700"
                    >
                      Click bubble again to close
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}