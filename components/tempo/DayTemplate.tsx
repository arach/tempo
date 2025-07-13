'use client';

import { useState } from 'react';
import { SortableActivityList } from './SortableActivityList';
import { ActivityEditor } from './ActivityEditor';
import { Plus, Save, ArrowLeft, Sparkles, Edit3, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  const [isEditingName, setIsEditingName] = useState(false);

  // Expand activities with multiple instances for display
  const expandedActivities = activities.flatMap((activity) => {
    if (!activity.instances || activity.instances === 1) {
      return [activity];
    }
    
    // Create linked instances
    return Array.from({ length: activity.instances }, (_, index) => ({
      ...activity,
      id: `${activity.id}-instance-${index}`,
      title: `${activity.title} (${index + 1})`,
      parentId: activity.id, // Link instances together
      instanceIndex: index,
    }));
  });
  const [isNamingModalOpen, setIsNamingModalOpen] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempDescription, setTempDescription] = useState('');

  const handleReorderActivities = (reorderedActivities: TempoActivity[]) => {
    // Filter out expanded instances and maintain only parent activities
    const parentActivities = reorderedActivities.filter(activity => {
      // Keep activities that don't have a parentId (they are original activities)
      return !('parentId' in activity && activity.parentId);
    });
    
    // Update the activities state with the reordered parent activities
    setActivities(parentActivities);
  };

  const handleAddActivity = () => {
    setEditingActivity(null);
    setIsEditorOpen(true);
  };

  const handleEditActivity = (activity: TempoActivity) => {
    // If editing an expanded instance, edit the parent activity
    if ('parentId' in activity && activity.parentId) {
      const parentActivity = activities.find(a => a.id === activity.parentId);
      if (parentActivity) {
        setEditingActivity(parentActivity);
        setIsEditorOpen(true);
      }
    } else {
      setEditingActivity(activity);
      setIsEditorOpen(true);
    }
  };

  const handleDeleteActivity = (activityId: string) => {
    if (confirm('Remove this activity from the template?')) {
      // If deleting an expanded instance, delete the parent activity
      const expandedActivity = expandedActivities.find(a => a.id === activityId);
      if (expandedActivity && 'parentId' in expandedActivity && expandedActivity.parentId) {
        setActivities(prev => prev.filter(a => a.id !== expandedActivity.parentId));
      } else {
        setActivities(prev => prev.filter(a => a.id !== activityId));
      }
    }
  };

  const handleSaveActivity = (activityData: Omit<TempoActivity, 'id'>) => {
    if (editingActivity) {
      // Update existing activity - preserve the id and merge the new data
      setActivities(prev => prev.map(a => 
        a.id === editingActivity.id 
          ? { ...a, ...activityData }
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
      // Open naming modal instead of alert
      setTempName('');
      setTempDescription(description.trim());
      setIsNamingModalOpen(true);
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      activities
    });
  };

  const handleModalSave = () => {
    if (!tempName.trim()) {
      return; // Don't save without a name
    }

    setName(tempName.trim());
    setDescription(tempDescription.trim());
    setIsNamingModalOpen(false);

    onSave({
      name: tempName.trim(),
      description: tempDescription.trim() || undefined,
      activities
    });
  };

  const handleNameClick = () => {
    if (activities.length >= 2) {
      setIsEditingName(true);
    }
  };

  const handleNameSave = () => {
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    }
    if (e.key === 'Escape') {
      setIsEditingName(false);
    }
  };

  // Show subtle naming hints when there are 2+ activities
  const showNamingHints = activities.length >= 2;
  const hasEnoughActivitiesForNaming = activities.length >= 3;


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
              {isEditingName ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={handleNameSave}
                    onKeyDown={handleNameKeyDown}
                    placeholder="Name your day template..."
                    className="text-4xl font-bold w-full bg-transparent border-b-2 border-purple-300 dark:border-purple-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 pb-1"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={handleNameSave}
                    onKeyDown={handleNameKeyDown}
                    placeholder="Add a brief description (optional)..."
                    className="text-lg w-full bg-transparent border-b border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 pb-1"
                  />
                </div>
              ) : (
                <div 
                  onClick={handleNameClick}
                  className={`${showNamingHints ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-lg p-2 -m-2 transition-colors' : ''}`}
                >
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                    {name.trim() ? name : 'Create Day Template'}
                    {showNamingHints && !name.trim() && (
                      <span className="text-sm font-normal text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        <Edit3 className="w-4 h-4" />
                        click to name
                      </span>
                    )}
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {name.trim() 
                      ? (description || 'Your custom day template') 
                      : showNamingHints 
                        ? 'Design your ideal day by adding meaningful activities • You can name this template now'
                        : 'Design your ideal day by adding meaningful activities'
                    }
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate} className="bg-gray-900 dark:bg-gray-600 text-white dark:text-white hover:bg-gray-800 dark:hover:bg-gray-500 border dark:border-gray-500">
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
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Start building your ideal day
                </h4>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Add activities that would make this the perfect day of its kind
                </p>
                <Button onClick={handleAddActivity} className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Activity
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <SortableActivityList
                  activities={expandedActivities}
                  onEditActivity={handleEditActivity}
                  onDeleteActivity={handleDeleteActivity}
                  onReorderActivities={handleReorderActivities}
                  date="template"
                  showActions={true}
                />

                {/* Subtle suggestion after 3+ activities */}
                {hasEnoughActivitiesForNaming && !name.trim() && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Looking good! You can name this template by clicking the header above.
                    </p>
                  </div>
                )}
              </div>
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

      {/* Naming Modal */}
      <Dialog open={isNamingModalOpen} onOpenChange={setIsNamingModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Name Your Day Template
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Give your day template a memorable name so you can easily find and use it later.
            </p>
            
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="e.g., 'Productive Monday', 'Relaxing Sunday'"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && tempName.trim()) {
                      handleModalSave();
                    }
                  }}
                  autoFocus
                />
              </div>
              
              <div>
                <textarea
                  placeholder="Add a brief description (optional)"
                  value={tempDescription}
                  onChange={(e) => setTempDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsNamingModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleModalSave}
                disabled={!tempName.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}