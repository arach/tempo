'use client'

import { cn } from '@/lib/utils'
import { List, Layers, Circle, Grid3x3 } from 'lucide-react'

export type ViewMode = 'default' | 'grouped' | 'stacked' | 'bubbles'

interface ViewModeToggleProps {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
}

const VIEW_MODES = [
  { id: 'default', label: 'List', icon: List, description: 'Traditional list view' },
  { id: 'grouped', label: 'Groups', icon: Grid3x3, description: 'Grouped by activity type' },
  { id: 'stacked', label: 'Stacks', icon: Layers, description: 'Compact stacked chips' },
  { id: 'bubbles', label: 'Bubbles', icon: Circle, description: 'Interactive bubble clusters' },
] as const

export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      {VIEW_MODES.map((viewMode) => {
        const Icon = viewMode.icon
        const isActive = mode === viewMode.id
        
        return (
          <button
            key={viewMode.id}
            onClick={() => onChange(viewMode.id as ViewMode)}
            className={cn(
              "relative group flex items-center gap-2 px-3 py-1.5 rounded-md",
              "transition-all duration-200",
              isActive
                ? "bg-white dark:bg-gray-900 shadow-sm text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{viewMode.label}</span>
            
            {/* Tooltip */}
            <div className={cn(
              "absolute bottom-full left-1/2 -translate-x-1/2 mb-2",
              "px-2 py-1 bg-gray-900 text-white text-xs rounded",
              "opacity-0 group-hover:opacity-100 transition-opacity",
              "pointer-events-none whitespace-nowrap"
            )}>
              {viewMode.description}
            </div>
          </button>
        )
      })}
    </div>
  )
}