import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db, isDatabaseAvailable } from '@/lib/db'
import { sessions, participants, responses, activity } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import { safeParse, stripHtml, getNameInitial } from '@/lib/utils'
import { submitResponseSchema } from '@/lib/validations'
import { getUserFromSession, createUserSession, generateUserId } from '@/lib/auth'
import { realtime } from '@/lib/realtime'

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (limit.count >= RATE_LIMIT_MAX) {
    return false
  }

  limit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        { error: 'Database not configured. Please set POSTGRES_URL environment variable.' },
        { status: 503 }
      )
    }

    // Rate limiting
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const parseResult = safeParse(submitResponseSchema, body)
    
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error },
        { status: 400 }
      )
    }

    const data = parseResult.data

    // Get or create user session
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('user-session')?.value
    let user = getUserFromSession(sessionToken)
    
    // If no user session, create one from the form data
    if (!user) {
      user = {
        id: generateUserId(),
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
      }
      
      const newSessionToken = createUserSession(user)
      cookieStore.set('user-session', newSessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    // Verify session exists and is active
    const sessionData = await db
      .select()
      .from(sessions)
      .where(eq(sessions.code, data.sessionCode))
      .limit(1)

    if (sessionData.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    const sessionRecord = sessionData[0]
    if (!sessionRecord.active) {
      return NextResponse.json(
        { error: 'Session is no longer active' },
        { status: 400 }
      )
    }

    // Check if participant already exists for this session
    const existingParticipant = await db
      .select()
      .from(participants)
      .where(
        and(
          eq(participants.sessionId, sessionRecord.id),
          eq(participants.userId, user.id)
        )
      )
      .limit(1)

    if (existingParticipant.length > 0) {
      return NextResponse.json(
        { error: 'You have already submitted a response for this session' },
        { status: 400 }
      )
    }

    // Create participant
    const [participant] = await db
      .insert(participants)
      .values({
        sessionId: sessionRecord.id,
        userId: user.id,
        name: user.name,
        email: user.email,
      })
      .returning()

    // Create response
    await db.insert(responses).values({
      sessionId: sessionRecord.id,
      participantId: participant.id,
      title: stripHtml(data.title),
      preferredLlm: data.preferredLlm,
      preferredFramework: data.preferredFramework,
      location: stripHtml(data.location),
      jobHunting: data.jobHunting,
      funAnswers: data.funAnswers,
    })

    // Create activity entry
    const activityMessage = `${getNameInitial(user.name)} submitted!`
    await db.insert(activity).values({
      sessionId: sessionRecord.id,
      message: activityMessage,
    })

    // Get updated response count for realtime
    const responseCount = await db
      .select({ count: responses.id })
      .from(responses)
      .where(eq(responses.sessionId, sessionRecord.id))

    // Publish realtime events
    await realtime.publish(`session:${sessionRecord.id}`, 'response_submitted', {
      participantName: getNameInitial(user.name),
      count: responseCount.length,
    })

    await realtime.publish(`session:${sessionRecord.id}`, 'counter_updated', {
      count: responseCount.length,
    })

    await realtime.publish(`session:${sessionRecord.id}`, 'results_updated', {
      count: responseCount.length,
    })

    return NextResponse.json({
      success: true,
      message: 'Response submitted successfully',
    })
  } catch (error) {
    console.error('Error submitting response:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
