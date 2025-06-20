import { ensureDatabaseInitialized } from '@/lib/db/config';
import { dayMutations } from '@/lib/db/schema';
import { desc, eq, and, gte, lte } from 'drizzle-orm';
import type { 
  DayMutationRecord, 
  MutationType, 
  MutationData,
  DayMutationSummary 
} from '@/lib/types/mutations';

export class MutationTrackingService {
  private getDb() {
    return ensureDatabaseInitialized();
  }

  /**
   * Record a new mutation
   */
  async recordMutation(
    date: string,
    mutationType: MutationType,
    mutationData: MutationData,
    sourceTemplateId?: string,
    userId?: string
  ): Promise<DayMutationRecord> {
    const db = this.getDb();
    const now = new Date().toISOString();
    
    const newMutation = {
      id: `mutation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date,
      mutationType,
      mutationData: mutationData as any, // JSON field
      sourceTemplateId: sourceTemplateId || null,
      userId: userId || null,
      createdAt: now,
    };

    await db.insert(dayMutations).values(newMutation);
    
    return {
      ...newMutation,
      sourceTemplateId: newMutation.sourceTemplateId || undefined,
      userId: newMutation.userId || undefined,
      mutationData
    };
  }

  /**
   * Get all mutations for a specific date
   */
  async getMutationsForDate(date: string): Promise<DayMutationRecord[]> {
    const db = this.getDb();
    
    const results = await db
      .select()
      .from(dayMutations)
      .where(eq(dayMutations.date, date))
      .orderBy(desc(dayMutations.createdAt));

    return results.map((result: any) => ({
      ...result,
      mutationData: result.mutationData as MutationData
    }));
  }

  /**
   * Get mutations for a date range
   */
  async getMutationsForDateRange(
    startDate: string, 
    endDate: string
  ): Promise<DayMutationRecord[]> {
    const db = this.getDb();
    
    const results = await db
      .select()
      .from(dayMutations)
      .where(
        and(
          gte(dayMutations.date, startDate),
          lte(dayMutations.date, endDate)
        )
      )
      .orderBy(desc(dayMutations.createdAt));

    return results.map((result: any) => ({
      ...result,
      mutationData: result.mutationData as MutationData
    }));
  }

  /**
   * Get mutations by type for a specific date
   */
  async getMutationsByType(
    date: string, 
    mutationType: MutationType
  ): Promise<DayMutationRecord[]> {
    const db = this.getDb();
    
    const results = await db
      .select()
      .from(dayMutations)
      .where(
        and(
          eq(dayMutations.date, date),
          eq(dayMutations.mutationType, mutationType)
        )
      )
      .orderBy(desc(dayMutations.createdAt));

    return results.map((result: any) => ({
      ...result,
      mutationData: result.mutationData as MutationData
    }));
  }

  /**
   * Get mutation summary for a date
   */
  async getDayMutationSummary(date: string): Promise<DayMutationSummary> {
    const mutations = await this.getMutationsForDate(date);
    
    const summary: DayMutationSummary = {
      date,
      totalMutations: mutations.length,
      mutationTypes: {
        'template_applied': 0,
        'activity_added': 0,
        'activity_edited': 0,
        'activity_moved': 0,
        'activity_deleted': 0,
        'day_cleared': 0,
        'activities_reordered': 0
      },
      templatesApplied: [],
      activitiesAdded: 0,
      activitiesDeleted: 0,
      lastMutationAt: mutations.length > 0 ? mutations[0].createdAt : date
    };

    mutations.forEach(mutation => {
      summary.mutationTypes[mutation.mutationType]++;
      
      switch (mutation.mutationType) {
        case 'template_applied':
          if (mutation.sourceTemplateId) {
            summary.templatesApplied.push(mutation.sourceTemplateId);
          }
          break;
        case 'activity_added':
          summary.activitiesAdded++;
          break;
        case 'activity_deleted':
          summary.activitiesDeleted++;
          break;
      }
    });

    return summary;
  }

  /**
   * Get template application history
   */
  async getTemplateApplicationHistory(
    templateId?: string,
    limit: number = 50
  ): Promise<DayMutationRecord[]> {
    const db = this.getDb();
    
    let query = db
      .select()
      .from(dayMutations)
      .where(eq(dayMutations.mutationType, 'template_applied'))
      .orderBy(desc(dayMutations.createdAt))
      .limit(limit);

    if (templateId) {
      query = db
        .select()
        .from(dayMutations)
        .where(
          and(
            eq(dayMutations.mutationType, 'template_applied'),
            eq(dayMutations.sourceTemplateId, templateId)
          )
        )
        .orderBy(desc(dayMutations.createdAt))
        .limit(limit);
    }

    const results = await query;
    
    return results.map((result: any) => ({
      ...result,
      mutationData: result.mutationData as MutationData
    }));
  }

  /**
   * Get activity creation patterns (for analytics)
   */
  async getActivityCreationPatterns(
    dateRange?: { start: string; end: string }
  ): Promise<{
    totalActivitiesAdded: number;
    addedByDay: Record<string, number>;
    addedByType: Record<string, number>;
    addedViaMethod: Record<'manual' | 'template' | 'duplicate', number>;
  }> {
    let mutations: DayMutationRecord[];
    
    if (dateRange) {
      mutations = await this.getMutationsForDateRange(dateRange.start, dateRange.end);
    } else {
      // Get last 30 days by default
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      mutations = await this.getMutationsForDateRange(
        thirtyDaysAgo.toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      );
    }

    const activityAddedMutations = mutations.filter(m => m.mutationType === 'activity_added');
    
    const patterns = {
      totalActivitiesAdded: activityAddedMutations.length,
      addedByDay: {} as Record<string, number>,
      addedByType: {} as Record<string, number>,
      addedViaMethod: {
        manual: 0,
        template: 0,
        duplicate: 0
      } as Record<'manual' | 'template' | 'duplicate', number>
    };

    activityAddedMutations.forEach(mutation => {
      const data = mutation.mutationData as any;
      
      // Count by day
      patterns.addedByDay[mutation.date] = (patterns.addedByDay[mutation.date] || 0) + 1;
      
      // Count by activity type
      if (data.activity?.type) {
        patterns.addedByType[data.activity.type] = (patterns.addedByType[data.activity.type] || 0) + 1;
      }
      
      // Count by method
      if (data.addedVia) {
        const method = data.addedVia as 'manual' | 'template' | 'duplicate';
        if (method === 'manual' || method === 'template' || method === 'duplicate') {
          patterns.addedViaMethod[method]++;
        }
      }
    });

    return patterns;
  }

  /**
   * Clean up old mutations (for maintenance)
   */
  async cleanupOldMutations(olderThanDays: number = 365): Promise<number> {
    const db = this.getDb();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    const result = await db
      .delete(dayMutations)
      .where(lte(dayMutations.date, cutoffDateStr));

    return result.changes || 0;
  }
}