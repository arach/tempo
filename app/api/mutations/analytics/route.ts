import { NextRequest, NextResponse } from 'next/server';
import { MutationTrackingService } from '@/lib/services/mutationTracking';

// GET /api/mutations/analytics - Get activity pattern analytics
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const type = searchParams.get('type') || 'activity_patterns';

  try {
    const mutationService = new MutationTrackingService();

    switch (type) {
      case 'activity_patterns': {
        const dateRange = startDate && endDate ? { start: startDate, end: endDate } : undefined;
        const patterns = await mutationService.getActivityCreationPatterns(dateRange);
        return NextResponse.json({ patterns });
      }

      case 'template_usage': {
        const templateHistory = await mutationService.getTemplateApplicationHistory(undefined, 100);
        
        // Analyze template usage patterns
        const templateUsage = templateHistory.reduce((acc, mutation) => {
          const templateId = mutation.sourceTemplateId;
          if (templateId) {
            const data = mutation.mutationData as any;
            acc[templateId] = acc[templateId] || {
              templateId,
              templateName: data.templateName || 'Unknown',
              applicationCount: 0,
              datesApplied: new Set(),
              totalActivitiesAdded: 0,
              lastUsed: mutation.createdAt
            };
            
            acc[templateId].applicationCount++;
            acc[templateId].datesApplied.add(mutation.date);
            acc[templateId].totalActivitiesAdded += data.activitiesCount || 0;
            
            // Update last used if this is more recent
            if (new Date(mutation.createdAt) > new Date(acc[templateId].lastUsed)) {
              acc[templateId].lastUsed = mutation.createdAt;
            }
          }
          return acc;
        }, {} as Record<string, any>);

        // Convert Set to array and sort by usage
        const templateStats = Object.values(templateUsage)
          .map((template: any) => ({
            ...template,
            datesApplied: Array.from(template.datesApplied),
            uniqueDatesCount: template.datesApplied.size
          }))
          .sort((a: any, b: any) => b.applicationCount - a.applicationCount);

        return NextResponse.json({ templateUsage: templateStats });
      }

      case 'daily_activity': {
        // Get mutations for the last 30 days if no range specified
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const start = startDate || thirtyDaysAgo.toISOString().split('T')[0];
        const end = endDate || new Date().toISOString().split('T')[0];
        
        const mutations = await mutationService.getMutationsForDateRange(start, end);
        
        // Group by date and analyze daily activity
        const dailyActivity = mutations.reduce((acc, mutation) => {
          const date = mutation.date;
          acc[date] = acc[date] || {
            date,
            totalMutations: 0,
            templatesApplied: 0,
            activitiesAdded: 0,
            activitiesEdited: 0,
            activitiesDeleted: 0,
            activitiesMoved: 0
          };
          
          acc[date].totalMutations++;
          
          switch (mutation.mutationType) {
            case 'template_applied':
              acc[date].templatesApplied++;
              break;
            case 'activity_added':
              acc[date].activitiesAdded++;
              break;
            case 'activity_edited':
              acc[date].activitiesEdited++;
              break;
            case 'activity_deleted':
              acc[date].activitiesDeleted++;
              break;
            case 'activity_moved':
              acc[date].activitiesMoved++;
              break;
          }
          
          return acc;
        }, {} as Record<string, any>);

        return NextResponse.json({ dailyActivity: Object.values(dailyActivity) });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid analytics type. Use: activity_patterns, template_usage, or daily_activity' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}