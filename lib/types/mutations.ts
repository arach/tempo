import type { TempoActivity } from '@/lib/types';

// Mutation type enum
export type MutationType = 
  | 'template_applied'
  | 'activity_added' 
  | 'activity_edited'
  | 'activity_moved'
  | 'activity_deleted'
  | 'day_cleared'
  | 'activities_reordered';

// Base mutation interface
export interface BaseMutationData {
  timestamp: string;
  userAgent?: string;
  source?: 'web' | 'mobile' | 'api'; // How the mutation was triggered
}

// Template applied mutation
export interface TemplateAppliedData extends BaseMutationData {
  templateId: string;
  templateName: string;
  appliedActivities: TempoActivity[];
  overwrittenActivities?: TempoActivity[]; // Activities that were replaced
  activitiesCount: number;
}

// Activity added mutation
export interface ActivityAddedData extends BaseMutationData {
  activity: TempoActivity;
  position: number;
  addedVia: 'manual' | 'template' | 'duplicate';
}

// Activity edited mutation
export interface ActivityEditedData extends BaseMutationData {
  activityId: string;
  changes: {
    before: Partial<TempoActivity>;
    after: Partial<TempoActivity>;
  };
  fieldsChanged: string[];
}

// Activity moved mutation (between days or within day)
export interface ActivityMovedData extends BaseMutationData {
  activityId: string;
  activityTitle: string;
  movement: {
    fromDate: string;
    toDate: string;
    fromPosition: number;
    toPosition: number;
  };
  moveType: 'within_day' | 'between_days';
}

// Activity deleted mutation
export interface ActivityDeletedData extends BaseMutationData {
  deletedActivity: TempoActivity;
  position: number;
  deletionReason?: 'user_action' | 'template_overwrite' | 'day_clear';
}

// Day cleared mutation
export interface DayClearedData extends BaseMutationData {
  clearedActivities: TempoActivity[];
  activitiesCount: number;
  clearReason: 'user_action' | 'template_overwrite';
}

// Activities reordered mutation
export interface ActivitiesReorderedData extends BaseMutationData {
  reorderingMap: {
    activityId: string;
    activityTitle: string;
    fromPosition: number;
    toPosition: number;
  }[];
  activitiesAffected: number;
}

// Union type for all mutation data
export type MutationData = 
  | TemplateAppliedData
  | ActivityAddedData
  | ActivityEditedData
  | ActivityMovedData
  | ActivityDeletedData
  | DayClearedData
  | ActivitiesReorderedData;

// Complete mutation record
export interface DayMutationRecord {
  id: string;
  date: string;
  mutationType: MutationType;
  mutationData: MutationData;
  sourceTemplateId?: string;
  userId?: string;
  createdAt: string;
}

// Mutation summary for analytics
export interface DayMutationSummary {
  date: string;
  totalMutations: number;
  mutationTypes: Record<MutationType, number>;
  templatesApplied: string[];
  activitiesAdded: number;
  activitiesDeleted: number;
  lastMutationAt: string;
}

// Helper functions for creating mutation data
export const createMutationData = {
  templateApplied: (
    templateId: string,
    templateName: string,
    appliedActivities: TempoActivity[],
    overwrittenActivities?: TempoActivity[]
  ): TemplateAppliedData => ({
    timestamp: new Date().toISOString(),
    templateId,
    templateName,
    appliedActivities,
    overwrittenActivities,
    activitiesCount: appliedActivities.length,
    source: 'web'
  }),

  activityAdded: (
    activity: TempoActivity,
    position: number,
    addedVia: 'manual' | 'template' | 'duplicate' = 'manual'
  ): ActivityAddedData => ({
    timestamp: new Date().toISOString(),
    activity,
    position,
    addedVia,
    source: 'web'
  }),

  activityEdited: (
    activityId: string,
    before: Partial<TempoActivity>,
    after: Partial<TempoActivity>
  ): ActivityEditedData => ({
    timestamp: new Date().toISOString(),
    activityId,
    changes: { before, after },
    fieldsChanged: Object.keys(after),
    source: 'web'
  }),

  activityMoved: (
    activityId: string,
    activityTitle: string,
    fromDate: string,
    toDate: string,
    fromPosition: number,
    toPosition: number
  ): ActivityMovedData => ({
    timestamp: new Date().toISOString(),
    activityId,
    activityTitle,
    movement: { fromDate, toDate, fromPosition, toPosition },
    moveType: fromDate === toDate ? 'within_day' : 'between_days',
    source: 'web'
  }),

  activityDeleted: (
    deletedActivity: TempoActivity,
    position: number,
    deletionReason: 'user_action' | 'template_overwrite' | 'day_clear' = 'user_action'
  ): ActivityDeletedData => ({
    timestamp: new Date().toISOString(),
    deletedActivity,
    position,
    deletionReason,
    source: 'web'
  }),

  dayCleared: (
    clearedActivities: TempoActivity[],
    clearReason: 'user_action' | 'template_overwrite' = 'user_action'
  ): DayClearedData => ({
    timestamp: new Date().toISOString(),
    clearedActivities,
    activitiesCount: clearedActivities.length,
    clearReason,
    source: 'web'
  }),

  activitiesReordered: (
    reorderingMap: Array<{
      activityId: string;
      activityTitle: string;
      fromPosition: number;
      toPosition: number;
    }>
  ): ActivitiesReorderedData => ({
    timestamp: new Date().toISOString(),
    reorderingMap,
    activitiesAffected: reorderingMap.length,
    source: 'web'
  })
};