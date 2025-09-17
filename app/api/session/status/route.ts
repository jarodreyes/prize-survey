import { NextRequest, NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'
import { sessions } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { safeParse } from '@/lib/utils'
import { sessionStatusSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        { error: 'Database not configured. Please set POSTGRES_URL environment variable.' },
        { status: 503 }
      )
    }
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    const parseResult = safeParse(sessionStatusSchema, { code })
    
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error },
        { status: 400 }
      )
    }

    const session = await db
      .select()
      .from(sessions)
      .where(eq(sessions.code, parseResult.data.code))
      .limit(1)

    if (session.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    const sessionData = session[0]

    return NextResponse.json({
      id: sessionData.id,
      code: sessionData.code,
      active: sessionData.active,
      createdAt: sessionData.createdAt,
      success: true,
    })
  } catch (error) {
    console.error('Error fetching session status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
