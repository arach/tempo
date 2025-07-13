import { eq, and, desc, asc, gte, lte, gt, ne, sql } from 'drizzle-orm';
import { ensureDatabaseInitialized } from './config';
import { 
  activities, 
  dayTemplates, 
  templateActivities,
  type Activity,
  type NewActivity,
  type DayTemplate,
  type NewDayTemplate,
  type TemplateActivity,
  type NewTemplateActivity,
  type DayTemplateWithActivities
} from './schema';
import type { TempoActivity, DayTemplate as OriginalDayTemplate } from '../types';

// Helper function to convert database activity to original type
function dbActivityToTempo(dbActivity: Activity): TempoActivity {
  return {
    id: dbActivity.id,
    title: dbActivity.title,
    type: dbActivity.type,
    description: dbActivity.description || undefined,
    duration: dbActivity.duration || undefined,
    color: dbActivity.color || undefined,
    completed: dbActivity.completed || false,
    completedAt: dbActivity.completedAt || undefined,
    metadata: dbActivity.metadata as Record<string, any> || undefined,
  };
}

// Helper function to convert tempo activity to database type
function tempoActivityToDb(tempoActivity: Omit<TempoActivity, 'id'>, date: string, position: number = 0): Omit<NewActivity, 'id'> {
  const now = new Date().toISOString();
  return {
    title: tempoActivity.title,
    type: tempoActivity.type,
    description: tempoActivity.description || null,
    duration: tempoActivity.duration || null,
    color: tempoActivity.color || null,
    date,
    position,
    completed: tempoActivity.completed || false,
    completedAt: tempoActivity.completedAt || null,
    metadata: tempoActivity.metadata || null,
    createdAt: now,
    updatedAt: now,
  };
}

// Helper function to convert template activity to tempo activity
function templateActivityToTempo(templateActivity: TemplateActivity): TempoActivity {
  return {
    id: templateActivity.id,
    title: templateActivity.title,
    type: templateActivity.type,
    description: templateActivity.description || undefined,
    duration: templateActivity.duration || undefined,
    color: templateActivity.color || undefined,
    metadata: templateActivity.metadata as Record<string, any> || undefined,
  };
}

// Helper function to convert database template to original type
function dbTemplateToOriginal(dbTemplate: DayTemplateWithActivities): OriginalDayTemplate {
  return {
    id: dbTemplate.id,
    name: dbTemplate.name,
    description: dbTemplate.description || undefined,
    activities: dbTemplate.activities.map(templateActivityToTempo),
    createdAt: dbTemplate.createdAt,
    updatedAt: dbTemplate.updatedAt,
    tags: (dbTemplate.tags as string[]) || undefined,
  };
}

export class ActivitiesService {
  private getDb() {
    return ensureDatabaseInitialized();
  }

  async getActivitiesForDate(date: string): Promise<TempoActivity[]> {
    const db = this.getDb();
    const result = await db
      .select()
      .from(activities)
      .where(eq(activities.date, date))
      .orderBy(asc(activities.position), asc(activities.createdAt));
    
    return result.map(dbActivityToTempo);
  }

  async getActivitiesForDateRange(startDate: string, endDate: string): Promise<Record<string, TempoActivity[]>> {
    const db = this.getDb();
    const result = await db
      .select()
      .from(activities)
      .where(and(
        gte(activities.date, startDate),
        lte(activities.date, endDate)
      ))
      .orderBy(asc(activities.date), asc(activities.position), asc(activities.createdAt));

    // Group by date
    const grouped: Record<string, TempoActivity[]> = {};
    result.forEach(activity => {
      if (!grouped[activity.date]) {
        grouped[activity.date] = [];
      }
      grouped[activity.date].push(dbActivityToTempo(activity));
    });

    return grouped;
  }

  async getAllActivities(): Promise<Record<string, TempoActivity[]>> {
    const db = this.getDb();
    const result = await db
      .select()
      .from(activities)
      .orderBy(asc(activities.date), asc(activities.position), asc(activities.createdAt));

    // Group by date
    const grouped: Record<string, TempoActivity[]> = {};
    result.forEach(activity => {
      if (!grouped[activity.date]) {
        grouped[activity.date] = [];
      }
      grouped[activity.date].push(dbActivityToTempo(activity));
    });

    return grouped;
  }

  async createActivity(date: string, activityData: Omit<TempoActivity, 'id'>): Promise<TempoActivity> {
    const db = this.getDb();
    
    // Get the highest position for this date
    const existingActivities = await this.getActivitiesForDate(date);
    const position = existingActivities.length;

    const newActivity: NewActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...tempoActivityToDb(activityData, date, position)
    };

    await db.insert(activities).values(newActivity);
    return dbActivityToTempo(newActivity as Activity);
  }

  async updateActivity(date: string, activityId: string, updates: Partial<Omit<TempoActivity, 'id'>>): Promise<TempoActivity | null> {
    const db = this.getDb();
    
    const updateData: Partial<Activity> = {
      updatedAt: new Date().toISOString()
    };

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.description !== undefined) updateData.description = updates.description || null;
    if (updates.duration !== undefined) updateData.duration = updates.duration || null;
    if (updates.color !== undefined) updateData.color = updates.color || null;
    if (updates.metadata !== undefined) updateData.metadata = updates.metadata || null;

    await db
      .update(activities)
      .set(updateData)
      .where(and(eq(activities.id, activityId), eq(activities.date, date)));

    // Return updated activity
    const updatedActivity = await db
      .select()
      .from(activities)
      .where(and(eq(activities.id, activityId), eq(activities.date, date)))
      .limit(1);

    return updatedActivity.length > 0 ? dbActivityToTempo(updatedActivity[0]) : null;
  }

  async deleteActivity(date: string, activityId: string): Promise<boolean> {
    const db = this.getDb();
    
    const result = await db
      .delete(activities)
      .where(and(eq(activities.id, activityId), eq(activities.date, date)));

    return result.changes > 0;
  }

  async moveActivity(activityId: string, fromDate: string, toDate: string, newPosition: number): Promise<TempoActivity | null> {
    const db = this.getDb();
    
    // Get the activity
    const activity = await db
      .select()
      .from(activities)
      .where(and(eq(activities.id, activityId), eq(activities.date, fromDate)))
      .limit(1);
    
    if (!activity[0]) {
      return null;
    }

    // Note: We get the target activities info for position calculation in the transaction

    // Update positions in a transaction
    await db.transaction(async (tx) => {
      // If moving within the same day
      if (fromDate === toDate) {
        const currentPosition = activity[0].position;
        
        if (currentPosition !== newPosition) {
          // Shift positions between old and new position
          const minPos = Math.min(currentPosition || 0, newPosition);
          const maxPos = Math.max(currentPosition || 0, newPosition);
          const increment = (currentPosition || 0) < newPosition ? -1 : 1;
          
          await tx
            .update(activities)
            .set({ position: sql`position + ${increment}` })
            .where(
              and(
                eq(activities.date, toDate),
                gte(activities.position, minPos),
                lte(activities.position, maxPos),
                ne(activities.id, activityId)
              )
            );
        }
      } else {
        // Moving to different day
        // Fill gap in source date
        await tx
          .update(activities)
          .set({ position: sql`position - 1` })
          .where(
            and(
              eq(activities.date, fromDate),
              gt(activities.position, activity[0].position || 0)
            )
          );
        
        // Make room in target date
        await tx
          .update(activities)
          .set({ position: sql`position + 1` })
          .where(
            and(
              eq(activities.date, toDate),
              gte(activities.position, newPosition)
            )
          );
      }

      // Update the activity
      await tx
        .update(activities)
        .set({ 
          date: toDate, 
          position: newPosition,
          updatedAt: new Date().toISOString()
        })
        .where(eq(activities.id, activityId));
    });

    // Return updated activity
    const updatedActivity = await db
      .select()
      .from(activities)
      .where(eq(activities.id, activityId))
      .limit(1);
    
    return updatedActivity[0] ? dbActivityToTempo(updatedActivity[0]) : null;
  }

  async toggleActivityCompletion(date: string, activityId: string): Promise<TempoActivity | null> {
    const db = this.getDb();
    
    // Get current activity to check completion status
    const currentActivity = await db
      .select()
      .from(activities)
      .where(and(eq(activities.id, activityId), eq(activities.date, date)))
      .limit(1);
    
    if (!currentActivity[0]) {
      return null;
    }

    const isCurrentlyCompleted = currentActivity[0].completed;
    const now = new Date().toISOString();

    // Toggle completion status
    await db
      .update(activities)
      .set({
        completed: !isCurrentlyCompleted,
        completedAt: !isCurrentlyCompleted ? now : null,
        updatedAt: now
      })
      .where(and(eq(activities.id, activityId), eq(activities.date, date)));

    // Return updated activity
    const updatedActivity = await db
      .select()
      .from(activities)
      .where(eq(activities.id, activityId))
      .limit(1);
    
    return updatedActivity[0] ? dbActivityToTempo(updatedActivity[0]) : null;
  }
}

export class TemplatesService {
  private getDb() {
    return ensureDatabaseInitialized();
  }

  async getAllTemplates(): Promise<OriginalDayTemplate[]> {
    const db = this.getDb();
    
    const templatesWithActivities = await db
      .select()
      .from(dayTemplates)
      .leftJoin(templateActivities, eq(dayTemplates.id, templateActivities.templateId))
      .orderBy(desc(dayTemplates.createdAt));

    // Group activities by template
    const groupedTemplates: Record<string, DayTemplateWithActivities> = {};
    
    templatesWithActivities.forEach(row => {
      const template = row.day_templates;
      const activity = row.template_activities;

      if (!groupedTemplates[template.id]) {
        groupedTemplates[template.id] = {
          ...template,
          activities: []
        };
      }

      if (activity) {
        groupedTemplates[template.id].activities.push(activity);
      }
    });

    // Sort activities within each template by position
    Object.values(groupedTemplates).forEach(template => {
      template.activities.sort((a, b) => (a.position || 0) - (b.position || 0));
    });

    return Object.values(groupedTemplates).map(dbTemplateToOriginal);
  }

  async getTemplate(id: string): Promise<OriginalDayTemplate | null> {
    const db = this.getDb();
    
    const templateWithActivities = await db
      .select()
      .from(dayTemplates)
      .leftJoin(templateActivities, eq(dayTemplates.id, templateActivities.templateId))
      .where(eq(dayTemplates.id, id));

    if (templateWithActivities.length === 0) return null;

    const template = templateWithActivities[0].day_templates;
    const activities = templateWithActivities
      .map(row => row.template_activities)
      .filter(Boolean) as TemplateActivity[];

    activities.sort((a, b) => (a.position || 0) - (b.position || 0));

    return dbTemplateToOriginal({ ...template, activities });
  }

  async createTemplate(templateData: Omit<OriginalDayTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<OriginalDayTemplate> {
    const db = this.getDb();
    const now = new Date().toISOString();
    
    const newTemplate: NewDayTemplate = {
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: templateData.name,
      description: templateData.description || null,
      tags: (templateData.tags as any) || null,
      createdAt: now,
      updatedAt: now,
    };

    // Insert template
    await db.insert(dayTemplates).values(newTemplate);

    // Insert activities
    if (templateData.activities && templateData.activities.length > 0) {
      const newActivities: NewTemplateActivity[] = templateData.activities.map((activity, index) => ({
        id: `template-activity-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        templateId: newTemplate.id,
        title: activity.title,
        type: activity.type,
        description: activity.description || null,
        duration: activity.duration || null,
        color: activity.color || null,
        position: index,
        metadata: activity.metadata || null,
        createdAt: now,
        updatedAt: now,
      }));

      await db.insert(templateActivities).values(newActivities);
    }

    // Return the created template
    const created = await this.getTemplate(newTemplate.id);
    return created!;
  }

  async updateTemplate(id: string, updates: Partial<Omit<OriginalDayTemplate, 'id' | 'createdAt'>>): Promise<OriginalDayTemplate | null> {
    const db = this.getDb();
    const now = new Date().toISOString();

    const updateData: Partial<DayTemplate> = {
      updatedAt: now
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description || null;
    if (updates.tags !== undefined) updateData.tags = updates.tags as any || null;

    await db
      .update(dayTemplates)
      .set(updateData)
      .where(eq(dayTemplates.id, id));

    // If activities are being updated, replace them
    if (updates.activities !== undefined) {
      // Delete existing activities
      await db
        .delete(templateActivities)
        .where(eq(templateActivities.templateId, id));

      // Insert new activities
      if (updates.activities.length > 0) {
        const newActivities: NewTemplateActivity[] = updates.activities.map((activity, index) => ({
          id: `template-activity-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
          templateId: id,
          title: activity.title,
          type: activity.type,
          description: activity.description || null,
          duration: activity.duration || null,
          color: activity.color || null,
          position: index,
          metadata: activity.metadata || null,
          createdAt: now,
          updatedAt: now,
        }));

        await db.insert(templateActivities).values(newActivities);
      }
    }

    return await this.getTemplate(id);
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const db = this.getDb();
    
    // Delete template (activities will be deleted automatically due to cascade)
    const result = await db
      .delete(dayTemplates)
      .where(eq(dayTemplates.id, id));

    return result.changes > 0;
  }

  async applyTemplateToDate(templateId: string, date: string, activitiesService: ActivitiesService, overwrite = false): Promise<TempoActivity[]> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Check if date already has activities
    const existingActivities = await activitiesService.getActivitiesForDate(date);
    if (existingActivities.length > 0 && !overwrite) {
      throw new Error(`Date ${date} already has activities. Use overwrite=true to replace them.`);
    }

    // Clear existing activities if overwriting
    if (overwrite && existingActivities.length > 0) {
      for (const activity of existingActivities) {
        await activitiesService.deleteActivity(date, activity.id);
      }
    }

    // Copy template activities to the date
    const copiedActivities: TempoActivity[] = [];
    for (const activity of template.activities) {
      const { id, instances = 1, ...activityData } = activity;
      
      // Create the specified number of instances
      for (let i = 0; i < instances; i++) {
        const instanceData = {
          ...activityData,
          // If multiple instances, add instance number to title
          title: instances > 1 ? `${activityData.title} (${i + 1})` : activityData.title
        };
        const newActivity = await activitiesService.createActivity(date, instanceData);
        copiedActivities.push(newActivity);
      }
    }

    return copiedActivities;
  }

  async searchTemplates(searchTerm: string): Promise<OriginalDayTemplate[]> {
    const allTemplates = await this.getAllTemplates();
    const searchLower = searchTerm.toLowerCase();
    
    return allTemplates.filter(template => 
      template.name.toLowerCase().includes(searchLower) ||
      (template.description && template.description.toLowerCase().includes(searchLower))
    );
  }

}