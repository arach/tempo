import { NextRequest, NextResponse } from 'next/server';
import { ActivitiesService } from '@/lib/db/services';

// GET /api/activities - Get all activities for a date range or specific date
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  try {
    const activitiesService = new ActivitiesService();

    if (date) {
      // Return activities for a specific date
      const activities = await activitiesService.getActivitiesForDate(date);
      return NextResponse.json({
        date,
        activities
      });
    }

    if (startDate && endDate) {
      // Return activities for date range
      const activities = await activitiesService.getActivitiesForDateRange(startDate, endDate);
      return NextResponse.json({ activities });
    }

    // Return all activities
    const activities = await activitiesService.getAllActivities();
    return NextResponse.json({ activities });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

// POST /api/activities - Create a new activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, activity } = body;

    if (!date || !activity) {
      return NextResponse.json(
        { error: 'Date and activity are required' },
        { status: 400 }
      );
    }

    const activitiesService = new ActivitiesService();
    
    const newActivity = await activitiesService.createActivity(date, activity);

    return NextResponse.json({
      message: 'Activity created successfully',
      activity: newActivity,
      date
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}

// PUT /api/activities - Update an existing activity
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, activityId, updates } = body;

    if (!date || !activityId || !updates) {
      return NextResponse.json(
        { error: 'Date, activityId, and updates are required' },
        { status: 400 }
      );
    }

    const activitiesService = new ActivitiesService();
    
    const updatedActivity = await activitiesService.updateActivity(date, activityId, updates);
    
    if (!updatedActivity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Activity updated successfully',
      activity: updatedActivity,
      date
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update activity' },
      { status: 500 }
    );
  }
}

// DELETE /api/activities - Delete an activity
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const activityId = searchParams.get('activityId');

    if (!date || !activityId) {
      return NextResponse.json(
        { error: 'Date and activityId are required' },
        { status: 400 }
      );
    }

    const activitiesService = new ActivitiesService();
    
    const deleted = await activitiesService.deleteActivity(date, activityId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Activity deleted successfully',
      activityId,
      date
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete activity' },
      { status: 500 }
    );
  }
}