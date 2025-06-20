# Template Application Specification

## Overview

This specification outlines the implementation of template-to-date application functionality in Tempo, allowing users to apply day templates as "recipes" to specific calendar dates while maintaining full independence and mutation tracking.

## Core Principles

1. **Template as Recipe**: Templates are prototypical day patterns (e.g., "Creative Sunday", "Deep Work Day")
2. **Independence After Application**: Once applied, activities become completely independent and manageable
3. **Mutation Tracking**: Record all changes to each day for audit trail and future composable days
4. **Future Extensibility**: Architecture supports multiple templates per day and composable day patterns

## Current System Analysis

### Existing Infrastructure
- ✅ **Database**: SQLite with Drizzle ORM, tables: `day_templates`, `template_activities`, `activities`
- ✅ **Backend**: `TemplatesService.applyTemplateToDate()` method exists
- ✅ **Frontend Storage**: localStorage with date-keyed activities `Record<string, TempoActivity[]>`
- ✅ **UI Components**: Calendar, day columns, template library, activity management

### Data Flow
```
Template (Database) → Apply → Independent Activities (localStorage + Database)
```

## Implementation Plan

### Phase 1: Template Application UI (High Priority)

#### 1.1 Day Column Enhancement
**File**: `components/tempo/DayColumn.tsx`

Add template application button that appears on hover:
```typescript
// New props interface
interface DayColumnProps {
  // ... existing props
  onApplyTemplate: (date: string) => void;
}

// New UI element (appears on hover with Add Activity button)
<button
  onClick={() => onApplyTemplate(day.date)}
  className="template-apply-button"
>
  <Sparkles className="h-3 w-3" />
  <span>Apply Template</span>
</button>
```

#### 1.2 Quick Template Selector Modal
**New File**: `components/tempo/QuickTemplateSelector.tsx`

Modal that opens when "Apply Template" is clicked:
```typescript
interface QuickTemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (templateId: string, date: string) => Promise<void>;
  selectedDate: string;
}

// Features:
// - Grid of template cards with preview
// - "Apply to [Date]" button on each template
// - Loading states during application
// - Success/error feedback
// - Overwrite warning if day has existing activities
```

#### 1.3 Enhanced Template Library
**File**: `components/tempo/DayTemplateLibrary.tsx`

Add date selection functionality:
```typescript
// New features:
// - Date picker for bulk application
// - "Apply to Today/Tomorrow" quick buttons
// - Batch template application
```

### Phase 2: Data Integration (High Priority)

#### 2.1 Template Application Service
**File**: `lib/services/templateApplication.ts`

Bridge between database and localStorage:
```typescript
export class TemplateApplicationService {
  async applyTemplateToDate(
    templateId: string, 
    date: string, 
    options: {
      overwrite?: boolean;
      trackMutation?: boolean;
    }
  ): Promise<{
    appliedActivities: TempoActivity[];
    mutation: DayMutation;
  }> {
    // 1. Apply template via database service
    // 2. Update localStorage calendar
    // 3. Record mutation if enabled
    // 4. Return applied activities and mutation record
  }
  
  async syncToLocalStorage(date: string, activities: TempoActivity[]): Promise<void> {
    // Update localStorage calendar with new activities
  }
}
```

#### 2.2 Enhanced useTempoStorage Hook
**File**: `hooks/useTempoStorage.ts`

Add template application method:
```typescript
export function useTempoStorage() {
  // ... existing methods
  
  const applyTemplate = useCallback(async (templateId: string, date: string, overwrite = false) => {
    try {
      const service = new TemplateApplicationService();
      const result = await service.applyTemplateToDate(templateId, date, { overwrite });
      
      // Update local state
      setActivities(prev => ({
        ...prev,
        [date]: result.appliedActivities
      }));
      
      return result;
    } catch (error) {
      console.error('Failed to apply template:', error);
      throw error;
    }
  }, []);
  
  return {
    // ... existing returns
    applyTemplate
  };
}
```

### Phase 3: Mutation Tracking (Medium Priority)

#### 3.1 Database Schema Extension
**File**: `lib/db/schema.ts`

New table for tracking day mutations:
```sql
CREATE TABLE `day_mutations` (
  `id` text PRIMARY KEY NOT NULL,
  `date` text NOT NULL,  -- YYYY-MM-DD
  `mutation_type` text NOT NULL,  -- 'template_applied', 'activity_added', 'activity_moved', etc.
  `mutation_data` text,  -- JSON blob with mutation details
  `source_template_id` text,  -- For template applications
  `user_id` text,  -- For future multi-user support
  `created_at` text NOT NULL,
  INDEX `idx_day_mutations_date` (`date`),
  INDEX `idx_day_mutations_type` (`mutation_type`)
);
```

#### 3.2 Mutation Types
```typescript
export type MutationType = 
  | 'template_applied'
  | 'activity_added' 
  | 'activity_edited'
  | 'activity_moved'
  | 'activity_deleted'
  | 'day_cleared';

export interface DayMutation {
  id: string;
  date: string;
  mutationType: MutationType;
  mutationData: {
    templateId?: string;
    templateName?: string;
    activityId?: string;
    fromDate?: string;
    toDate?: string;
    fromPosition?: number;
    toPosition?: number;
    activityData?: Partial<TempoActivity>;
    [key: string]: any;
  };
  sourceTemplateId?: string;
  userId?: string;
  createdAt: string;
}
```

#### 3.3 Mutation Service
**File**: `lib/services/mutationTracking.ts`

```typescript
export class MutationTrackingService {
  async recordMutation(mutation: Omit<DayMutation, 'id' | 'createdAt'>): Promise<DayMutation> {
    // Insert mutation record into database
  }
  
  async getMutationsForDate(date: string): Promise<DayMutation[]> {
    // Get all mutations for a specific date
  }
  
  async getMutationHistory(dateRange?: {start: string, end: string}): Promise<DayMutation[]> {
    // Get mutation history across date range
  }
}
```

### Phase 4: User Experience Features

#### 4.1 Visual Feedback
- Loading states during template application
- Success toast: "Template 'Sunny Sunday' applied to June 20th"
- Overwrite confirmation dialog
- Template-applied badge on day columns (optional)

#### 4.2 Error Handling
- Network errors during application
- Database conflicts
- Invalid template/date combinations
- Graceful degradation

#### 4.3 Performance Optimizations
- Lazy loading of template library
- Debounced search in template selector
- Optimistic UI updates
- Background sync between localStorage and database

## API Endpoints

### New Endpoints

#### POST /api/day-mutations
```typescript
// Record a new mutation
body: Omit<DayMutation, 'id' | 'createdAt'>
response: { mutation: DayMutation }
```

#### GET /api/day-mutations?date=YYYY-MM-DD
```typescript
// Get mutations for specific date
response: { mutations: DayMutation[] }
```

#### Enhanced: POST /api/day-templates/apply
```typescript
// Enhanced to include mutation tracking
body: {
  templateId: string;
  date: string;
  overwrite?: boolean;
  trackMutation?: boolean;
}
response: {
  appliedActivities: TempoActivity[];
  mutation?: DayMutation;
}
```

## Future Architecture: Composable Days

### Multi-Template Support
```typescript
// Future: Apply multiple templates to one day
interface ComposableDay {
  date: string;
  appliedTemplates: {
    templateId: string;
    templateName: string;
    appliedAt: string;
    activities: TempoActivity[];
  }[];
  mutations: DayMutation[];
}

// Usage: Apply "Health Morning" + "Creative Afternoon" + "Social Evening"
await applyMultipleTemplates([
  { templateId: 'health-morning', timeSlot: 'morning' },
  { templateId: 'creative-afternoon', timeSlot: 'afternoon' },
  { templateId: 'social-evening', timeSlot: 'evening' }
], '2025-06-20');
```

### Template Composition Rules
- Templates can be tagged with time periods (morning, afternoon, evening)
- Conflict detection between overlapping templates
- Smart merging of compatible templates
- Template inheritance and extension

## Testing Strategy

### Unit Tests
- Template application service logic
- Mutation tracking accuracy  
- localStorage/database sync
- Error handling scenarios

### Integration Tests
- End-to-end template application flow
- Multi-template application (future)
- Performance under load
- Data consistency checks

### User Testing
- Template application workflow usability
- Discovery of template application features
- Error recovery scenarios

## Migration Strategy

### Phase 1 Rollout
1. Deploy backend mutation tracking (passive)
2. Add UI for template application
3. Enable mutation recording
4. Monitor performance and usage

### Data Migration
- Existing activities remain unchanged
- New mutation tracking starts from implementation date
- Optional: Backfill mutations for recent template applications

## Success Metrics

### User Experience
- Template application completion rate
- Time from template selection to application
- User satisfaction with applied template results

### Technical
- Template application success rate
- Performance impact on calendar loading
- Mutation data accuracy and completeness

## Implementation Timeline

### Week 1: Foundation
- [ ] Create specification document ✅
- [ ] Implement QuickTemplateSelector component
- [ ] Add template application UI to DayColumn

### Week 2: Integration
- [ ] Build TemplateApplicationService
- [ ] Enhance useTempoStorage with template application
- [ ] Connect UI to backend services

### Week 3: Mutation Tracking
- [ ] Implement database schema for mutations
- [ ] Build MutationTrackingService
- [ ] Add mutation recording to template application

### Week 4: Polish & Testing
- [ ] Error handling and edge cases
- [ ] Performance optimizations
- [ ] User testing and feedback integration

## Technical Considerations

### Data Consistency
- Ensure localStorage and database stay in sync
- Handle offline scenarios gracefully
- Implement conflict resolution for concurrent edits

### Performance
- Minimize database queries during template application
- Optimize mutation tracking overhead
- Cache frequently accessed templates

### Scalability
- Design for future multi-user scenarios
- Support large numbers of templates and mutations
- Efficient queries for mutation history

### Security
- Validate template application permissions
- Sanitize mutation data
- Prevent malicious template applications

## Conclusion

This specification provides a comprehensive roadmap for implementing template-to-date application in Tempo, with a strong foundation for future composable day functionality and complete mutation tracking for audit trails and analytics.