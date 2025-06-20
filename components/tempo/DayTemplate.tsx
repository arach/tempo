'use client';

import { useState } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent,
  DragOverlay,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import { ActivityBlock } from './ActivityBlock';
import { ActivityEditor } from './ActivityEditor';
import { Plus, Save, ArrowLeft, Sparkles, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TempoActivity, DayTemplate as DayTemplateType } from '@/lib/types';

interface DayTemplateProps {
  template?: DayTemplateType;
  onSave: (template: Omit<DayTemplateType, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function DayTemplate({ template, onSave, onCancel }: DayTemplateProps) {
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [activities, setActivities] = useState<TempoActivity[]>(template?.activities || []);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<TempoActivity | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeActivity, setActiveActivity] = useState<TempoActivity | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activity = activities.find(a => a.id === active.id);
    if (activity) {
      setActiveId(active.id.toString());
      setActiveActivity(activity);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setActiveActivity(null);
    
    if (!over) return;
    
    const oldIndex = activities.findIndex(a => a.id === active.id);
    const newIndex = activities.findIndex(a => a.id === over.id);
    
    if (oldIndex !== newIndex) {
      setActivities(arrayMove(activities, oldIndex, newIndex));
    }
  };

  const handleAddActivity = () => {
    setEditingActivity(null);
    setIsEditorOpen(true);
  };

  const handleEditActivity = (activity: TempoActivity) => {
    setEditingActivity(activity);
    setIsEditorOpen(true);
  };

  const handleDeleteActivity = (activityId: string) => {
    if (confirm('Remove this activity from the template?')) {
      setActivities(prev => prev.filter(a => a.id !== activityId));
    }
  };

  const handleSaveActivity = (activityData: Omit<TempoActivity, 'id'>) => {
    if (editingActivity) {
      // Update existing activity
      setActivities(prev => prev.map(a => 
        a.id === editingActivity.id 
          ? { ...activityData, id: editingActivity.id }
          : a
      ));
    } else {
      // Create new activity
      const newActivity: TempoActivity = {
        ...activityData,
        id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      setActivities(prev => [...prev, newActivity]);
    }
    setIsEditorOpen(false);
    setEditingActivity(null);
  };

  const handleSaveTemplate = () => {
    if (!name.trim()) {
      alert('Please give your day template a name');
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      activities
    });
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="relative group mb-4">
                <input
                  type="text"
                  placeholder="Name your ideal day..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-4xl font-bold w-full px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-gray-800 focus:ring-4 focus:ring-purple-500/10 dark:focus:ring-purple-400/10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 group-hover:opacity-60 transition-opacity">
                  <Edit3 className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </div>
              </div>
              
              <div className="relative group mb-4">
                <textarea
                  placeholder="Describe this kind of day (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-lg w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30 text-gray-600 dark:text-gray-400 placeholder-gray-400 dark:placeholder-gray-500 resize-none transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-100/30 dark:hover:bg-gray-700/30 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-gray-800 focus:ring-4 focus:ring-purple-500/10 dark:focus:ring-purple-400/10"
                  rows={2}
                />
                <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-60 transition-opacity duration-200 pointer-events-none">
                  <Edit3 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate} className="bg-gray-900 dark:bg-gray-700/50 text-white dark:text-gray-100 hover:bg-gray-800 dark:hover:bg-gray-600/60 border dark:border-gray-600">
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </Button>
            </div>
          </div>
        </div>

        {/* Day Canvas */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Your Ideal Day
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Design the flow of activities for this type of day
                </p>
              </div>
              
              <Button 
                onClick={handleAddActivity}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            </div>
          </div>

          <div className="p-6">
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Start building your ideal day
                </h4>
                <p className="text-gray-500 dark:text-gray-500 mb-6">
                  Add activities that would make this the perfect day of its kind
                </p>
                <Button onClick={handleAddActivity} className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Activity
                </Button>
              </div>
            ) : (
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={activities.map(a => a.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {activities.map((activity, index) => (
                      <div key={activity.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <ActivityBlock
                            activity={activity}
                            date="template"
                            onEdit={handleEditActivity}
                            onDelete={handleDeleteActivity}
                            isDragOverlay={false}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </SortableContext>
                
                <DragOverlay>
                  {activeId && activeActivity ? (
                    <div style={{ 
                      cursor: 'grabbing',
                      transform: 'scale(1.05)',
                      filter: 'drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))'
                    }}>
                      <ActivityBlock
                        activity={activeActivity}
                        date="template"
                        isDragOverlay={true}
                      />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </div>
        </div>
      </div>

      <ActivityEditor
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingActivity(null);
        }}
        onSave={handleSaveActivity}
        editingActivity={editingActivity || undefined}
      />
    </div>
  );
}