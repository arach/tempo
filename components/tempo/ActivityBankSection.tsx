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
  image?: string;
  color?: string;
}

const EXPANDED_ACTIVITY_TEMPLATES: Record<ActivityType, ActivityTemplate[]> = {
  enrichment: [
    { title: 'Morning Pages', type: 'enrichment', duration: '30 min', emoji: '✍️', description: 'Stream-of-consciousness writing', color: 'from-blue-400 to-blue-600' },
    { title: 'Read Book', type: 'enrichment', duration: '45 min', emoji: '📖', description: 'Fiction or non-fiction', color: 'from-blue-500 to-indigo-600' },
    { title: 'Learn Language', type: 'enrichment', duration: '30 min', emoji: '🗣️', description: 'Practice vocabulary or conversation', color: 'from-cyan-400 to-blue-500' },
    { title: 'Watch Documentary', type: 'enrichment', duration: '1 hour', emoji: '🎬', description: 'Educational content', color: 'from-blue-600 to-purple-600' },
    { title: 'Listen to Podcast', type: 'enrichment', duration: '45 min', emoji: '🎧', description: 'Educational or inspiring shows', color: 'from-indigo-400 to-blue-500' },
    { title: 'Practice Instrument', type: 'enrichment', duration: '30 min', emoji: '🎸', description: 'Music practice session', color: 'from-blue-500 to-purple-500' },
    { title: 'Online Course', type: 'enrichment', duration: '1 hour', emoji: '💻', description: 'Skill development', color: 'from-cyan-500 to-blue-600' },
    { title: 'Museum Visit', type: 'enrichment', duration: '2 hours', emoji: '🏛️', description: 'Art or history exploration', color: 'from-blue-400 to-indigo-500' },
  ],
  connection: [
    { title: 'Call Family', type: 'connection', duration: '30 min', emoji: '📞', description: 'Check in with loved ones', color: 'from-pink-400 to-rose-500' },
    { title: 'Coffee with Friend', type: 'connection', duration: '1 hour', emoji: '☕', description: 'Catch up over drinks', color: 'from-rose-400 to-pink-600' },
    { title: 'Write Thank You Note', type: 'connection', duration: '15 min', emoji: '💌', description: 'Express gratitude', color: 'from-pink-500 to-rose-600' },
    { title: 'Game Night', type: 'connection', duration: '2 hours', emoji: '🎲', description: 'Board games with friends', color: 'from-pink-400 to-purple-500' },
    { title: 'Dinner Date', type: 'connection', duration: '2 hours', emoji: '🍽️', description: 'Quality time over meals', color: 'from-rose-500 to-pink-600' },
    { title: 'Video Call Catch-up', type: 'connection', duration: '45 min', emoji: '📹', description: 'Remote connection', color: 'from-pink-600 to-rose-700' },
    { title: 'Community Event', type: 'connection', duration: '2 hours', emoji: '🎪', description: 'Local gathering or meetup', color: 'from-fuchsia-400 to-pink-500' },
    { title: 'Team Building', type: 'connection', duration: '1.5 hours', emoji: '🤝', description: 'Workplace bonding', color: 'from-pink-500 to-purple-600' },
  ],
  growth: [
    { title: 'Morning Meditation', type: 'growth', duration: '15 min', emoji: '🧘', description: 'Mindfulness practice', color: 'from-green-400 to-emerald-500' },
    { title: 'Journaling', type: 'growth', duration: '30 min', emoji: '📔', description: 'Reflect and plan', color: 'from-emerald-400 to-green-600' },
    { title: 'Nature Walk', type: 'growth', duration: '45 min', emoji: '🌳', description: 'Peaceful outdoor time', color: 'from-green-500 to-teal-600' },
    { title: 'Yoga Session', type: 'growth', duration: '1 hour', emoji: '🧘‍♀️', description: 'Physical and mental wellness', color: 'from-teal-400 to-green-500' },
    { title: 'Breathwork', type: 'growth', duration: '15 min', emoji: '🌬️', description: 'Breathing exercises', color: 'from-green-400 to-teal-500' },
    { title: 'Gratitude Practice', type: 'growth', duration: '15 min', emoji: '🙏', description: 'Appreciate the good', color: 'from-emerald-500 to-green-600' },
    { title: 'Therapy Session', type: 'growth', duration: '1 hour', emoji: '💭', description: 'Mental health care', color: 'from-teal-500 to-emerald-600' },
    { title: 'Life Planning', type: 'growth', duration: '45 min', emoji: '🎯', description: 'Goal setting and review', color: 'from-green-600 to-emerald-700' },
  ],
  creative: [
    { title: 'Sketch or Draw', type: 'creative', duration: '45 min', emoji: '✏️', description: 'Visual art creation', color: 'from-purple-400 to-violet-500' },
    { title: 'Write Poetry', type: 'creative', duration: '30 min', emoji: '🖋️', description: 'Express through verse', color: 'from-violet-400 to-purple-600' },
    { title: 'Photography Walk', type: 'creative', duration: '1 hour', emoji: '📸', description: 'Capture moments', color: 'from-purple-500 to-indigo-600' },
    { title: 'Paint or Watercolor', type: 'creative', duration: '1.5 hours', emoji: '🎨', description: 'Color and canvas', color: 'from-fuchsia-400 to-purple-500' },
    { title: 'Creative Writing', type: 'creative', duration: '1 hour', emoji: '📝', description: 'Stories and ideas', color: 'from-purple-600 to-violet-700' },
    { title: 'Make Music', type: 'creative', duration: '1 hour', emoji: '🎵', description: 'Compose or play', color: 'from-violet-500 to-purple-600' },
    { title: 'Crafting Project', type: 'creative', duration: '2 hours', emoji: '🧵', description: 'Hands-on creation', color: 'from-purple-400 to-pink-500' },
    { title: 'Design Work', type: 'creative', duration: '1.5 hours', emoji: '🎭', description: 'Visual or UX design', color: 'from-indigo-500 to-purple-600' },
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
          Activity Ideas
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

      {/* Activity Cards Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {searchFilteredTemplates.map((template, index) => (
            <button
              key={index}
              onClick={() => handleAddTemplate(template)}
              className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300 hover:scale-105 text-left"
            >
              {/* Gradient Background */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity",
                template.color
              )} />
              
              {/* Content */}
              <div className="relative p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{template.emoji}</span>
                      <div className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-semibold",
                        template.type === 'enrichment' && "bg-blue-200 text-blue-800 dark:bg-blue-500/30 dark:text-blue-100",
                        template.type === 'connection' && "bg-pink-200 text-pink-800 dark:bg-pink-500/30 dark:text-pink-100", 
                        template.type === 'growth' && "bg-green-200 text-green-800 dark:bg-green-500/30 dark:text-green-100",
                        template.type === 'creative' && "bg-purple-200 text-purple-800 dark:bg-purple-500/30 dark:text-purple-100"
                      )}>
                        {template.duration}
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                      {template.title}
                    </h3>
                  </div>
                  <Plus className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-all opacity-0 group-hover:opacity-100 transform group-hover:scale-110" />
                </div>

                {/* Description */}
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {template.description}
                </p>

                {/* Category Badge */}
                <div className="mt-3 flex items-center justify-between">
                  <span className={cn(
                    "text-xs font-medium px-2 py-1 rounded-lg",
                    template.type === 'enrichment' && "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
                    template.type === 'connection' && "bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400",
                    template.type === 'growth' && "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
                    template.type === 'creative' && "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
                  )}>
                    {ACTIVITY_TYPES[template.type].label}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        {searchFilteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-3">🔍</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No activities found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}