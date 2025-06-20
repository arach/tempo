import { NextRequest, NextResponse } from 'next/server';
import { MutationTrackingService } from '@/lib/services/mutationTracking';

// GET /api/mutations - Get mutations with various filters
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const mutationType = searchParams.get('type');
  const templateId = searchParams.get('templateId');
  const summary = searchParams.get('summary') === 'true';
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const mutationService = new MutationTrackingService();

    // Handle different query types
    if (summary && date) {
      // Get summary for a specific date
      const mutationSummary = await mutationService.getDayMutationSummary(date);
      return NextResponse.json({ summary: mutationSummary });
    }

    if (date && mutationType) {
      // Get mutations by type for a specific date
      const mutations = await mutationService.getMutationsByType(date, mutationType as any);
      return NextResponse.json({ mutations });
    }

    if (date) {
      // Get all mutations for a specific date
      const mutations = await mutationService.getMutationsForDate(date);
      return NextResponse.json({ mutations });
    }

    if (startDate && endDate) {
      // Get mutations for date range
      const mutations = await mutationService.getMutationsForDateRange(startDate, endDate);
      return NextResponse.json({ mutations });
    }

    if (templateId || mutationType === 'template_applied') {
      // Get template application history
      const mutations = await mutationService.getTemplateApplicationHistory(templateId || undefined, limit);
      return NextResponse.json({ mutations });
    }

    // Default: get recent mutations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const mutations = await mutationService.getMutationsForDateRange(
      sevenDaysAgo.toISOString().split('T')[0],
      new Date().toISOString().split('T')[0]
    );

    return NextResponse.json({ mutations });
  } catch (error) {
    console.error('Failed to fetch mutations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mutations' },
      { status: 500 }
    );
  }
}

// POST /api/mutations - Record a new mutation (for manual tracking)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, mutationType, mutationData, sourceTemplateId, userId } = body;

    if (!date || !mutationType || !mutationData) {
      return NextResponse.json(
        { error: 'Date, mutation type, and mutation data are required' },
        { status: 400 }
      );
    }

    const mutationService = new MutationTrackingService();
    const mutation = await mutationService.recordMutation(
      date,
      mutationType,
      mutationData,
      sourceTemplateId,
      userId
    );

    return NextResponse.json({
      message: 'Mutation recorded successfully',
      mutation
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to record mutation:', error);
    return NextResponse.json(
      { error: 'Failed to record mutation' },
      { status: 500 }
    );
  }
}