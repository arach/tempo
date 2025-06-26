import { NextRequest, NextResponse } from 'next/server';
import { ActivitiesService } from '@/lib/db/services';

// POST /api/activities/complete - Toggle completion status of an activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, activityId } = body;

    if (!date || !activityId) {
      return NextResponse.json(
        { error: 'Date and activityId are required' },
        { status: 400 }
      );
    }

    const activitiesService = new ActivitiesService();
    
    const updatedActivity = await activitiesService.toggleActivityCompletion(date, activityId);
    
    if (!updatedActivity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    const completionMessage = updatedActivity.completed 
      ? '🎉 Well done! Activity completed!'
      : 'Activity marked as incomplete';

    return NextResponse.json({
      message: completionMessage,
      activity: updatedActivity,
      date,
      completed: updatedActivity.completed,
      celebratory: updatedActivity.completed
    });
  } catch (error) {
    console.error('Toggle completion error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle completion' },
      { status: 500 }
    );
  }
}