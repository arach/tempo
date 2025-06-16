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