// Data access layer for server-side operations
// Since we can't access localStorage on the server, we'll need to pass data via headers or body

import type { TempoActivity, DayTemplate } from './types';

export interface ServerDataContext {
  activities?: Record<string, TempoActivity[]>;
  templates?: DayTemplate[];
}

// Extract data from request headers (sent by client)
export function getDataFromRequest(request: Request): ServerDataContext {
  const activitiesHeader = request.headers.get('x-tempo-activities');
  const templatesHeader = request.headers.get('x-tempo-templates');

  return {
    activities: activitiesHeader ? JSON.parse(activitiesHeader) : {},
    templates: templatesHeader ? JSON.parse(templatesHeader) : []
  };
}

// Activities operations
export class ActivitiesService {
  constructor(private data: ServerDataContext) {}

  getActivitiesForDate(date: string): TempoActivity[] {
    return this.data.activities?.[date] || [];
  }

  getActivitiesForDateRange(startDate: string, endDate: string): Record<string, TempoActivity[]> {
    const result: Record<string, TempoActivity[]> = {};
    
    if (!this.data.activities) return result;

    Object.keys(this.data.activities).forEach(date => {
      if (date >= startDate && date <= endDate) {
        result[date] = this.data.activities![date];
      }
    });

    return result;
  }

  getAllActivities(): Record<string, TempoActivity[]> {
    return this.data.activities || {};
  }

  createActivity(date: string, activityData: Omit<TempoActivity, 'id'>): TempoActivity {
    const newActivity: TempoActivity = {
      ...activityData,
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    if (!this.data.activities) {
      this.data.activities = {};
    }

    if (!this.data.activities[date]) {
      this.data.activities[date] = [];
    }

    this.data.activities[date].push(newActivity);
    return newActivity;
  }

  updateActivity(date: string, activityId: string, updates: Partial<Omit<TempoActivity, 'id'>>): TempoActivity | null {
    if (!this.data.activities?.[date]) return null;

    const activityIndex = this.data.activities[date].findIndex(a => a.id === activityId);
    if (activityIndex === -1) return null;

    this.data.activities[date][activityIndex] = {
      ...this.data.activities[date][activityIndex],
      ...updates
    };

    return this.data.activities[date][activityIndex];
  }

  deleteActivity(date: string, activityId: string): boolean {
    if (!this.data.activities?.[date]) return false;

    const initialLength = this.data.activities[date].length;
    this.data.activities[date] = this.data.activities[date].filter(a => a.id !== activityId);
    
    return this.data.activities[date].length < initialLength;
  }
}

// Templates operations
export class TemplatesService {
  constructor(private data: ServerDataContext) {}

  getAllTemplates(): DayTemplate[] {
    return this.data.templates || [];
  }


  searchTemplates(searchTerm: string): DayTemplate[] {
    const searchLower = searchTerm.toLowerCase();
    return this.getAllTemplates().filter(t => 
      t.name.toLowerCase().includes(searchLower) ||
      (t.description && t.description.toLowerCase().includes(searchLower))
    );
  }

  getTemplate(id: string): DayTemplate | null {
    return this.getAllTemplates().find(t => t.id === id) || null;
  }

  createTemplate(templateData: Omit<DayTemplate, 'id' | 'createdAt' | 'updatedAt'>): DayTemplate {
    const newTemplate: DayTemplate = {
      ...templateData,
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!this.data.templates) {
      this.data.templates = [];
    }

    this.data.templates.push(newTemplate);
    return newTemplate;
  }

  updateTemplate(id: string, updates: Partial<Omit<DayTemplate, 'id' | 'createdAt'>>): DayTemplate | null {
    if (!this.data.templates) return null;

    const templateIndex = this.data.templates.findIndex(t => t.id === id);
    if (templateIndex === -1) return null;

    this.data.templates[templateIndex] = {
      ...this.data.templates[templateIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.data.templates[templateIndex];
  }

  deleteTemplate(id: string): boolean {
    if (!this.data.templates) return false;

    const initialLength = this.data.templates.length;
    this.data.templates = this.data.templates.filter(t => t.id !== id);
    
    return this.data.templates.length < initialLength;
  }

  applyTemplateToDate(templateId: string, date: string, activitiesService: ActivitiesService, overwrite = false): TempoActivity[] {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Check if date already has activities
    const existingActivities = activitiesService.getActivitiesForDate(date);
    if (existingActivities.length > 0 && !overwrite) {
      throw new Error(`Date ${date} already has activities. Use overwrite=true to replace them.`);
    }

    // Clear existing activities if overwriting
    if (overwrite && existingActivities.length > 0) {
      existingActivities.forEach(activity => {
        activitiesService.deleteActivity(date, activity.id);
      });
    }

    // Copy template activities to the date
    const copiedActivities: TempoActivity[] = [];
    template.activities.forEach(activity => {
      const { id, ...activityData } = activity;
      const newActivity = activitiesService.createActivity(date, activityData);
      copiedActivities.push(newActivity);
    });

    return copiedActivities;
  }
}