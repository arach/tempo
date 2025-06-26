import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';

// Activities table
export const activities = sqliteTable('activities', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  type: text('type', { enum: ['enrichment', 'connection', 'growth', 'creative'] }).notNull(),
  description: text('description'),
  duration: text('duration'),
  color: text('color'),
  date: text('date').notNull(), // ISO date string (YYYY-MM-DD)
  position: integer('position').default(0), // For ordering within a day
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false), // Completion status
  completedAt: text('completed_at'), // ISO timestamp when completed
  metadata: text('metadata', { mode: 'json' }), // JSON field for additional data
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Day templates table
export const dayTemplates = sqliteTable('day_templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  tags: text('tags', { mode: 'json' }), // Array of strings stored as JSON
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Template activities table (activities that belong to templates)
export const templateActivities = sqliteTable('template_activities', {
  id: text('id').primaryKey(),
  templateId: text('template_id').notNull().references(() => dayTemplates.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  type: text('type', { enum: ['enrichment', 'connection', 'growth', 'creative'] }).notNull(),
  description: text('description'),
  duration: text('duration'),
  color: text('color'),
  position: integer('position').default(0), // For ordering within template
  metadata: text('metadata', { mode: 'json' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Day mutations table - tracks all changes made to days
export const dayMutations = sqliteTable('day_mutations', {
  id: text('id').primaryKey(),
  date: text('date').notNull(), // YYYY-MM-DD format
  mutationType: text('mutation_type', { 
    enum: [
      'template_applied',
      'activity_added', 
      'activity_edited',
      'activity_moved',
      'activity_deleted',
      'day_cleared',
      'activities_reordered'
    ] 
  }).notNull(),
  mutationData: text('mutation_data', { mode: 'json' }).notNull(), // JSON blob with mutation details
  sourceTemplateId: text('source_template_id'), // For template_applied mutations
  userId: text('user_id'), // For future multi-user support
  createdAt: text('created_at').notNull(),
}, (table) => ({
  dateIdx: index('idx_day_mutations_date').on(table.date),
  typeIdx: index('idx_day_mutations_type').on(table.mutationType),
  dateTypeIdx: index('idx_day_mutations_date_type').on(table.date, table.mutationType),
}));

// Relations
export const dayTemplatesRelations = relations(dayTemplates, ({ many }) => ({
  activities: many(templateActivities),
}));

export const templateActivitiesRelations = relations(templateActivities, ({ one }) => ({
  template: one(dayTemplates, {
    fields: [templateActivities.templateId],
    references: [dayTemplates.id],
  }),
}));

// Zod schemas for validation
export const insertActivitySchema = createInsertSchema(activities);
export const selectActivitySchema = createSelectSchema(activities);

export const insertDayTemplateSchema = createInsertSchema(dayTemplates);
export const selectDayTemplateSchema = createSelectSchema(dayTemplates);

export const insertTemplateActivitySchema = createInsertSchema(templateActivities);
export const selectTemplateActivitySchema = createSelectSchema(templateActivities);

export const insertDayMutationSchema = createInsertSchema(dayMutations);
export const selectDayMutationSchema = createSelectSchema(dayMutations);

// Types
export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;

export type DayTemplate = typeof dayTemplates.$inferSelect;
export type NewDayTemplate = typeof dayTemplates.$inferInsert;

export type TemplateActivity = typeof templateActivities.$inferSelect;
export type NewTemplateActivity = typeof templateActivities.$inferInsert;

export type DayMutation = typeof dayMutations.$inferSelect;
export type NewDayMutation = typeof dayMutations.$inferInsert;

// Helper types for API responses
export type DayTemplateWithActivities = DayTemplate & {
  activities: TemplateActivity[];
};