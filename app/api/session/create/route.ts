import { NextRequest, NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'
import { sessions } from '@/lib/schema'
import { generateSessionCode, safeParse } from '@/lib/utils'
import { createSessionSchema } from '@/lib/validations'
import { realtime } from '@/lib/realtime'

export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        { error: 'Database not configured. Please set POSTGRES_URL environment variable.' },
        { status: 503 }
      )
    }
    const body = await request.json()
    const parseResult = safeParse(createSessionSchema, body)
    
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error },
        { status: 400 }
      )
    }

    // Generate unique session code
    let code = generateSessionCode()
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      try {
        const [session] = await db
          .insert(sessions)
          .values({
            code,
            hostGithubId: parseResult.data.hostGithubId,
            active: true,
          })
          .returning()

        const joinUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/join?code=${code}`

        // Publish realtime event
        await realtime.publish(`session:${session.id}`, 'session_created', {
          sessionId: session.id,
          code: session.code,
        })

        return NextResponse.json({
          sessionId: session.id,
          code: session.code,
          joinUrl,
          success: true,
        })
      } catch (error: any) {
        if (error?.code === '23505' && error?.constraint_name === 'sessions_code_unique') {
          // Code collision, try again
          code = generateSessionCode()
          attempts++
          continue
        }
        throw error
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate unique session code' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
