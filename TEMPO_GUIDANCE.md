# Tempo Project - Technical Guidance & Implementation Plan

## Project Overview
Tempo is a life enrichment activity manager that breaks free from traditional time-grid calendars. It allows users to stack meaningful activities (guitar practice, call grandma, read book) across different time scales without rigid time slots.

## Core Technical Decisions

### Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui components (copy-paste, not npm install)
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
- **Date Handling**: date-fns
- **State Management**: React hooks (useState, useContext) - no external state library yet
- **Data Persistence**: localStorage for now, preparing for future backend

### Project Structure
```
tempo/
├── app/
│   ├── page.tsx              // Landing page
│   ├── tempo/page.tsx        // Main app
│   └── layout.tsx
├── components/
│   ├── tempo/
│   │   ├── TempoCalendar.tsx    // Main container
│   │   ├── DayColumn.tsx         // Droppable day column
│   │   ├── ActivityBlock.tsx     // Draggable activity
│   │   ├── ActivityEditor.tsx    // Create/edit dialog
│   │   └── TemplateManager.tsx   // Save/load templates
│   └── ui/                       // shadcn/ui components
├── lib/
│   ├── types.ts              // TypeScript types
│   └── utils.ts              // Utilities
├── hooks/
│   ├── useTempoStorage.ts    // Local storage hook
│   └── useActivityDnD.ts     // Drag and drop logic
└── styles/
    └── globals.css           // Tailwind imports
```

## Implementation Steps

### Step 1: Project Setup
```bash
# Create Next.js project
pnpm create next-app@latest tempo --typescript --tailwind --app --no-src-dir --yes
cd tempo

# Install core dependencies
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
pnpm add date-fns
pnpm add lucide-react
pnpm add clsx tailwind-merge

# Initialize shadcn/ui
pnpm dlx shadcn-ui@latest init

# Add shadcn/ui components
pnpm dlx shadcn-ui@latest add button
pnpm dlx shadcn-ui@latest add card
pnpm dlx shadcn-ui@latest add dialog
pnpm dlx shadcn-ui@latest add dropdown-menu
pnpm dlx shadcn-ui@latest add input
pnpm dlx shadcn-ui@latest add label
pnpm dlx shadcn-ui@latest add select
pnpm dlx shadcn-ui@latest add textarea
pnpm dlx shadcn-ui@latest add toast
```

### Step 2: Create Type Definitions

**lib/types.ts**
```typescript
export type ActivityType = 'enrichment' | 'connection' | 'growth' | 'creative';

export interface TempoActivity {
  id: string;
  title: string;
  type: ActivityType;
  description?: string;
  duration?: string; // "30 min", "1 hour" - human readable
  color?: string;
  metadata?: Record<string, any>;
}

export interface TempoDay {
  date: string; // ISO date
  dayOfWeek: string;
  activities: TempoActivity[];
}

export interface TempoTemplate {
  id: string;
  name: string;
  description?: string;
  activities: TempoActivity[];
  createdAt: string;
}

export type TempoView = 'day' | 'week' | 'month' | 'year';

// Activity type configuration
export const ACTIVITY_TYPES = {
  enrichment: {
    label: 'Enrichment',
    icon: 'Book',
    color: 'blue',
    examples: ['Read book', 'Learn guitar', 'Study language']
  },
  connection: {
    label: 'Connection', 
    icon: 'Heart',
    color: 'pink',
    examples: ['Call grandma', 'Coffee with friend', 'Family dinner']
  },
  growth: {
    label: 'Growth',
    icon: 'Sprout',
    color: 'green',
    examples: ['Meditation', 'Journal', 'Therapy session']
  },
  creative: {
    label: 'Creative',
    icon: 'Palette',
    color: 'purple',
    examples: ['Paint', 'Write story', 'Play music']
  }
} as const;
```

### Step 3: Create Storage Hook

**hooks/useTempoStorage.ts**
```typescript
import { useState, useEffect, useCallback } from 'react';
import type { TempoActivity } from '@/lib/types';

export function useTempoStorage() {
  const [activities, setActivities] = useState<Record<string, TempoActivity[]>>({});
  
  useEffect(() => {
    const stored = localStorage.getItem('tempo-activities');
    if (stored) {
      setActivities(JSON.parse(stored));
    }
  }, []);

  const saveActivities = useCallback((newActivities: Record<string, TempoActivity[]>) => {
    setActivities(newActivities);
    localStorage.setItem('tempo-activities', JSON.stringify(newActivities));
  }, []);

  const addActivity = useCallback((date: string, activity: TempoActivity) => {
    const updated = {
      ...activities,
      [date]: [...(activities[date] || []), activity]
    };
    saveActivities(updated);
  }, [activities, saveActivities]);

  const moveActivity = useCallback((activityId: string, fromDate: string, toDate: string, newIndex: number) => {
    // Implementation for moving activities
  }, [activities, saveActivities]);

  return { activities, saveActivities, addActivity, moveActivity };
}
```

### Step 4: Build Core Components

**components/tempo/TempoCalendar.tsx**
```typescript
'use client';

import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { format, startOfWeek, addDays } from 'date-fns';
import { DayColumn } from './DayColumn';
import { useTempoStorage } from '@/hooks/useTempoStorage';

export function TempoCalendar() {
  const { activities, moveActivity } = useTempoStorage();
  const weekStart = startOfWeek(new Date());
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      dayOfWeek: format(date, 'EEEE'),
      shortDay: format(date, 'EEE'),
      dayNumber: format(date, 'd')
    };
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    // Handle moving activities between days
    const [fromDate, activityId] = active.id.toString().split(':');
    const toDate = over.id.toString();
    
    if (fromDate !== toDate) {
      moveActivity(activityId, fromDate, toDate, 0);
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-7 gap-4 p-6">
        {weekDays.map(day => (
          <DayColumn 
            key={day.date} 
            day={day} 
            activities={activities[day.date] || []} 
          />
        ))}
      </div>
    </DndContext>
  );
}
```

**components/tempo/DayColumn.tsx**
```typescript
'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ActivityBlock } from './ActivityBlock';
import type { TempoActivity } from '@/lib/types';

interface DayColumnProps {
  day: {
    date: string;
    dayOfWeek: string;
    shortDay: string;
    dayNumber: string;
  };
  activities: TempoActivity[];
}

export function DayColumn({ day, activities }: DayColumnProps) {
  const { setNodeRef } = useDroppable({
    id: day.date,
  });

  const sortableItems = activities.map(a => `${day.date}:${a.id}`);

  return (
    <Card className="h-full min-h-[500px]">
      <CardHeader className="pb-3">
        <div className="text-center">
          <div className="text-sm font-medium text-muted-foreground">{day.shortDay}</div>
          <div className="text-2xl font-semibold">{day.dayNumber}</div>
        </div>
      </CardHeader>
      <CardContent ref={setNodeRef} className="pt-0">
        <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {activities.map((activity) => (
              <ActivityBlock 
                key={activity.id} 
                activity={activity} 
                date={day.date}
              />
            ))}
          </div>
          {activities.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No activities yet</p>
              <p className="text-xs mt-1">Click + to add one</p>
            </div>
          )}
        </SortableContext>
      </CardContent>
    </Card>
  );
}
```

**components/tempo/ActivityBlock.tsx**
```typescript
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Book, Heart, Sprout, Palette, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TempoActivity } from '@/lib/types';

const iconMap = {
  enrichment: Book,
  connection: Heart,
  growth: Sprout,
  creative: Palette,
};

const colorMap = {
  enrichment: 'bg-blue-100 border-blue-300 text-blue-800',
  connection: 'bg-pink-100 border-pink-300 text-pink-800',
  growth: 'bg-green-100 border-green-300 text-green-800',
  creative: 'bg-purple-100 border-purple-300 text-purple-800',
};

interface ActivityBlockProps {
  activity: TempoActivity;
  date: string;
}

export function ActivityBlock({ activity, date }: ActivityBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${date}:${activity.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = iconMap[activity.type];

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className={cn(
        'cursor-grab active:cursor-grabbing p-3 transition-all',
        colorMap[activity.type],
        isDragging && 'opacity-50'
      )}>
        <div className="flex items-start gap-2">
          <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{activity.title}</p>
            {activity.duration && (
              <p className="text-xs opacity-80 mt-1">{activity.duration}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mr-1 -mt-1"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
```

### Step 5: Create Main App Page

**app/tempo/page.tsx**
```typescript
import { TempoCalendar } from '@/components/tempo/TempoCalendar';

export default function TempoPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-semibold">Tempo</h1>
          <p className="text-sm text-muted-foreground">Plan meaningful activities for your week</p>
        </div>
      </header>
      <main>
        <TempoCalendar />
      </main>
    </div>
  );
}
```

### Key Design Patterns

1. **Component Philosophy**
   - Use shadcn/ui components as base (Button, Card, Dialog, etc.)
   - Build Tempo-specific components on top
   - Keep components small and focused

2. **No Time Slots**
   - Activities stack vertically
   - No hour grid
   - Focus on sequence, not schedule

3. **Life Enrichment Focus**
   - Warm, inviting colors
   - Encouraging empty states
   - No productivity metrics
   - Focus on meaningful activities

### Important Constraints
1. **No micro-tasks** - Focus on meaningful activities (no "take vitamins")
2. **Mobile responsive** - Should work on tablets (mobile can be read-only initially)
3. **Keyboard accessible** - Support keyboard navigation
4. **Template-first** - Design for saving/loading weekly templates

### Next Steps After Setup

1. Add Activity Editor dialog for creating/editing activities
2. Implement template save/load functionality
3. Add keyboard navigation
4. Create beautiful landing page
5. Add activity suggestions/examples
6. Implement activity completion tracking (optional)
7. Add animations and transitions

## Remember
Tempo is about **life enrichment**, not productivity. Keep the UI calm, the interactions smooth, and focus on helping users create meaningful patterns in their lives.
