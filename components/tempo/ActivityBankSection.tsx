'use client';

import { useState } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import { ACTIVITY_TYPES, type ActivityType, type TempoActivity } from '@/lib/types';
import { useTempoStorage } from '@/hooks/useTempoStorage';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ActivityTemplate {
  title: string;
  type: ActivityType;
  duration: string;
  emoji: string;
  description?: string;
}

const EXPANDED_ACTIVITY_TEMPLATES: Record<ActivityType, ActivityTemplate[]> = {
  enrichment: [
    { title: 'Morning Pages', type: 'enrichment', duration: '30 min', emoji: '✍️', description: 'Stream-of-consciousness writing' },
    { title: 'Read Book', type: 'enrichment', duration: '45 min', emoji: '📖', description: 'Fiction or non-fiction' },
    { title: 'Learn Language', type: 'enrichment', duration: '30 min', emoji: '🗣️', description: 'Practice vocabulary or conversation' },
    { title: 'Watch Documentary', type: 'enrichment', duration: '1 hour', emoji: '🎬', description: 'Educational content' },
    { title: 'Listen to Podcast', type: 'enrichment', duration: '45 min', emoji: '🎧', description: 'Educational or inspiring shows' },
    { title: 'Practice Instrument', type: 'enrichment', duration: '30 min', emoji: '🎸', description: 'Music practice session' },
    { title: 'Online Course', type: 'enrichment', duration: '1 hour', emoji: '💻', description: 'Skill development' },
    { title: 'Museum Visit', type: 'enrichment', duration: '2 hours', emoji: '🏛️', description: 'Art or history exploration' },
  ],
  connection: [
    { title: 'Call Family', type: 'connection', duration: '30 min', emoji: '📞', description: 'Check in with loved ones' },
    { title: 'Coffee with Friend', type: 'connection', duration: '1 hour', emoji: '☕', description: 'Catch up over drinks' },
    { title: 'Write Thank You Note', type: 'connection', duration: '15 min', emoji: '💌', description: 'Express gratitude' },
    { title: 'Game Night', type: 'connection', duration: '2 hours', emoji: '🎲', description: 'Board games with friends' },
    { title: 'Dinner Date', type: 'connection', duration: '2 hours', emoji: '🍽️', description: 'Quality time over meals' },
    { title: 'Video Call Catch-up', type: 'connection', duration: '45 min', emoji: '📹', description: 'Remote connection' },
    { title: 'Community Event', type: 'connection', duration: '2 hours', emoji: '🎪', description: 'Local gathering or meetup' },
    { title: 'Team Building', type: 'connection', duration: '1.5 hours', emoji: '🤝', description: 'Workplace bonding' },
  ],
  growth: [
    { title: 'Morning Meditation', type: 'growth', duration: '15 min', emoji: '🧘', description: 'Mindfulness practice' },
    { title: 'Journaling', type: 'growth', duration: '30 min', emoji: '📔', description: 'Reflect and plan' },
    { title: 'Nature Walk', type: 'growth', duration: '45 min', emoji: '🌳', description: 'Peaceful outdoor time' },
    { title: 'Yoga Session', type: 'growth', duration: '1 hour', emoji: '🧘‍♀️', description: 'Physical and mental wellness' },
    { title: 'Breathwork', type: 'growth', duration: '15 min', emoji: '🌬️', description: 'Breathing exercises' },
    { title: 'Gratitude Practice', type: 'growth', duration: '15 min', emoji: '🙏', description: 'Appreciate the good' },
    { title: 'Therapy Session', type: 'growth', duration: '1 hour', emoji: '💭', description: 'Mental health care' },
    { title: 'Life Planning', type: 'growth', duration: '45 min', emoji: '🎯', description: 'Goal setting and review' },
  ],
  creative: [
    { title: 'Sketch or Draw', type: 'creative', duration: '45 min', emoji: '✏️', description: 'Visual art creation' },
    { title: 'Write Poetry', type: 'creative', duration: '30 min', emoji: '🖋️', description: 'Express through verse' },
    { title: 'Photography Walk', type: 'creative', duration: '1 hour', emoji: '📸', description: 'Capture moments' },
    { title: 'Paint or Watercolor', type: 'creative', duration: '1.5 hours', emoji: '🎨', description: 'Color and canvas' },
    { title: 'Creative Writing', type: 'creative', duration: '1 hour', emoji: '📝', description: 'Stories and ideas' },
    { title: 'Make Music', type: 'creative', duration: '1 hour', emoji: '🎵', description: 'Compose or play' },
    { title: 'Crafting Project', type: 'creative', duration: '2 hours', emoji: '🧵', description: 'Hands-on creation' },
    { title: 'Design Work', type: 'creative', duration: '1.5 hours', emoji: '🎭', description: 'Visual or UX design' },
  ],
};

export function ActivityBankSection() {
  const { addActivity } = useTempoStorage();
  const [selectedCategory, setSelectedCategory] = useState<ActivityType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const allTemplates = Object.values(EXPANDED_ACTIVITY_TEMPLATES).flat();
  const filteredTemplates = selectedCategory === 'all' 
    ? allTemplates 
    : EXPANDED_ACTIVITY_TEMPLATES[selectedCategory];

  const searchFilteredTemplates = filteredTemplates.filter(template =>
    template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTemplate = (template: ActivityTemplate) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const newActivity: TempoActivity = {
      ...template,
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    addActivity(today, newActivity);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Activity Bank
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose from curated life-enriching activities
        </p>
      </div>

      {/* Search and Filter */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
              selectedCategory === 'all'
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            )}
          >
            All
          </button>
          {Object.entries(ACTIVITY_TYPES).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key as ActivityType)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                selectedCategory === key
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="max-h-96 overflow-y-auto">
        <div className="p-2">
          {searchFilteredTemplates.map((template, index) => (
            <button
              key={index}
              onClick={() => handleAddTemplate(template)}
              className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group"
            >
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">{template.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {template.title}
                    </h4>
                    <Plus className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {template.description} • {template.duration}
                  </p>
                </div>
              </div>
            </button>
          ))}
          
          {searchFilteredTemplates.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No activities found matching your search.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}