import { NextRequest, NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'
import { activity } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'
import { safeParse } from '@/lib/utils'
import { activityFeedSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        { error: 'Database not configured. Please set POSTGRES_URL environment variable.' },
        { status: 503 }
      )
    }
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const limit = parseInt(searchParams.get('limit') || '20')

    const parseResult = safeParse(activityFeedSchema, { sessionId, limit })
    
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error },
        { status: 400 }
      )
    }

    const activities = await db
      .select()
      .from(activity)
      .where(eq(activity.sessionId, parseResult.data.sessionId))
      .orderBy(desc(activity.createdAt))
      .limit(parseResult.data.limit || 20)

    return NextResponse.json({
      activities: activities.map(a => ({
        id: a.id,
        message: a.message,
        createdAt: a.createdAt,
      })),
      success: true,
    })
  } catch (error) {
    console.error('Error fetching activity feed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
