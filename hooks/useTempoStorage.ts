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
    const fromActivities = [...(activities[fromDate] || [])];
    const toActivities = [...(activities[toDate] || [])];
    
    // Find and remove the activity from the source
    const activityIndex = fromActivities.findIndex(a => a.id === activityId);
    if (activityIndex === -1) return;
    
    const [movedActivity] = fromActivities.splice(activityIndex, 1);
    
    // Add to destination at the specified index
    if (fromDate === toDate) {
      // Moving within the same day
      fromActivities.splice(newIndex, 0, movedActivity);
      saveActivities({
        ...activities,
        [fromDate]: fromActivities
      });
    } else {
      // Moving to a different day
      toActivities.splice(newIndex, 0, movedActivity);
      saveActivities({
        ...activities,
        [fromDate]: fromActivities,
        [toDate]: toActivities
      });
    }
  }, [activities, saveActivities]);

  const deleteActivity = useCallback((date: string, activityId: string) => {
    const updated = {
      ...activities,
      [date]: (activities[date] || []).filter(a => a.id !== activityId)
    };
    saveActivities(updated);
  }, [activities, saveActivities]);

  const updateActivity = useCallback((date: string, activityId: string, updates: Partial<TempoActivity>) => {
    const updated = {
      ...activities,
      [date]: (activities[date] || []).map(a => 
        a.id === activityId ? { ...a, ...updates } : a
      )
    };
    saveActivities(updated);
  }, [activities, saveActivities]);

  return { 
    activities, 
    saveActivities, 
    addActivity, 
    moveActivity,
    deleteActivity,
    updateActivity
  };
}