import { NextRequest, NextResponse } from 'next/server';
import { ActivitiesService } from '@/lib/db/services';

// POST /api/activities/move - Move an activity to a new date/position
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { activityId, fromDate, toDate, newPosition } = body;

    if (!activityId || !fromDate || !toDate || newPosition === undefined) {
      return NextResponse.json(
        { error: 'activityId, fromDate, toDate, and newPosition are required' },
        { status: 400 }
      );
    }

    const activitiesService = new ActivitiesService();
    
    const movedActivity = await activitiesService.moveActivity(
      activityId,
      fromDate,
      toDate,
      newPosition
    );
    
    if (!movedActivity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Activity moved successfully',
      activity: movedActivity,
      fromDate,
      toDate,
      position: newPosition
    });
  } catch (error) {
    console.error('Move activity error:', error);
    return NextResponse.json(
      { error: 'Failed to move activity' },
      { status: 500 }
    );
  }
}