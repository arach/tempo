import { useState, useEffect, useCallback } from 'react';
import type { TempoActivity } from '@/lib/types';

export function useTempoStorageAPI() {
  const [activities, setActivities] = useState<Record<string, TempoActivity[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch activities for a date range
  const fetchActivities = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      let url = '/api/activities';
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      
      const data = await response.json();
      
      // Handle different response formats
      if (data.activities) {
        // Date range query - already grouped by date
        if (typeof data.activities === 'object' && !Array.isArray(data.activities)) {
          setActivities(data.activities);
        } else if (Array.isArray(data.activities)) {
          // Flat array - group by date
          const grouped: Record<string, TempoActivity[]> = {};
          data.activities.forEach((activity: TempoActivity & { date: string }) => {
            if (!grouped[activity.date]) {
              grouped[activity.date] = [];
            }
            grouped[activity.date].push(activity);
          });
          setActivities(grouped);
        }
      } else if (data.date && data.activities) {
        // Single date query - set activities for that specific date
        setActivities(prev => ({
          ...prev,
          [data.date]: data.activities
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load - fetch current week's activities
  useEffect(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    fetchActivities(
      startOfWeek.toISOString().split('T')[0],
      endOfWeek.toISOString().split('T')[0]
    );
  }, [fetchActivities]);

  const addActivity = useCallback(async (date: string, activity: Omit<TempoActivity, 'id'>) => {
    try {
      setError(null);
      
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, activity })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create activity');
      }
      
      const data = await response.json();
      
      // Optimistically update local state
      setActivities(prev => ({
        ...prev,
        [date]: [...(prev[date] || []), data.activity]
      }));
      
      return data.activity;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add activity');
      throw err;
    }
  }, []);

  const updateActivity = useCallback(async (date: string, activityId: string, updates: Partial<TempoActivity>) => {
    try {
      setError(null);
      
      const response = await fetch('/api/activities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, activityId, updates })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update activity');
      }
      
      const data = await response.json();
      
      // Optimistically update local state
      setActivities(prev => ({
        ...prev,
        [date]: (prev[date] || []).map(a => 
          a.id === activityId ? { ...a, ...updates } : a
        )
      }));
      
      return data.activity;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update activity');
      throw err;
    }
  }, []);

  const deleteActivity = useCallback(async (date: string, activityId: string) => {
    try {
      setError(null);
      
      const response = await fetch(`/api/activities?date=${date}&activityId=${activityId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete activity');
      }
      
      // Optimistically update local state
      setActivities(prev => ({
        ...prev,
        [date]: (prev[date] || []).filter(a => a.id !== activityId)
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete activity');
      throw err;
    }
  }, []);

  const moveActivity = useCallback(async (activityId: string, fromDate: string, toDate: string, newIndex: number) => {
    try {
      setError(null);
      
      const response = await fetch('/api/activities/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId,
          fromDate,
          toDate,
          newPosition: newIndex
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to move activity');
      }
      
      const data = await response.json();
      
      // Optimistically update local state
      setActivities(prev => {
        const newActivities = { ...prev };
        
        // Remove from source
        if (newActivities[fromDate]) {
          newActivities[fromDate] = newActivities[fromDate].filter(a => a.id !== activityId);
        }
        
        // Add to target
        if (!newActivities[toDate]) {
          newActivities[toDate] = [];
        }
        
        const activity = data.activity;
        newActivities[toDate].splice(newIndex, 0, activity);
        
        return newActivities;
      });
      
      return data.activity;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move activity');
      throw err;
    }
  }, []);

  const completeActivity = useCallback(async (date: string, activityId: string) => {
    try {
      setError(null);
      
      const response = await fetch('/api/activities/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, activityId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle completion');
      }
      
      const data = await response.json();
      
      // Optimistically update local state
      setActivities(prev => ({
        ...prev,
        [date]: (prev[date] || []).map(a => 
          a.id === activityId ? { ...a, completed: data.completed, completedAt: data.activity.completedAt } : a
        )
      }));
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle completion');
      throw err;
    }
  }, []);

  // Maintain compatibility with existing interface
  const saveActivities = useCallback((newActivities: Record<string, TempoActivity[]>) => {
    // This is now just a local state update
    // In a full implementation, you might want to sync this with the backend
    setActivities(newActivities);
  }, []);

  return { 
    activities, 
    saveActivities, 
    addActivity, 
    moveActivity,
    deleteActivity,
    updateActivity,
    completeActivity,
    isLoading,
    error,
    refetch: fetchActivities
  };
}