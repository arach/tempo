import { NextRequest, NextResponse } from 'next/server';
import { TemplatesService, ActivitiesService } from '@/lib/db/services';

// POST /api/day-templates/apply - Apply a day template to a specific date
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, date, overwrite = false } = body;

    if (!templateId || !date) {
      return NextResponse.json(
        { error: 'Template ID and date are required' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Date must be in YYYY-MM-DD format' },
        { status: 400 }
      );
    }

    const templatesService = new TemplatesService();
    const activitiesService = new ActivitiesService();

    const appliedActivities = await templatesService.applyTemplateToDate(
      templateId, 
      date, 
      activitiesService, 
      overwrite
    );

    return NextResponse.json({
      message: 'Template applied successfully',
      templateId,
      date,
      overwrite,
      appliedActivities
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to apply template' },
      { status: 500 }
    );
  }
}