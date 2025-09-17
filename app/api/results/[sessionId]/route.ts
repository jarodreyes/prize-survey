import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sessions, responses } from '@/lib/schema'
import { eq, sql } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId

    // Verify session exists
    const session = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1)

    if (session.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Get response count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(responses)
      .where(eq(responses.sessionId, sessionId))

    const responseCount = countResult[0]?.count || 0

    // Get aggregated results for charts
    const llmResults = await db
      .select({
        option: responses.preferredLlm,
        count: sql<number>`count(*)`,
      })
      .from(responses)
      .where(eq(responses.sessionId, sessionId))
      .groupBy(responses.preferredLlm)
      .orderBy(sql`count(*) desc`)

    const frameworkResults = await db
      .select({
        option: responses.preferredFramework,
        count: sql<number>`count(*)`,
      })
      .from(responses)
      .where(eq(responses.sessionId, sessionId))
      .groupBy(responses.preferredFramework)
      .orderBy(sql`count(*) desc`)

    const jobHuntingResults = await db
      .select({
        option: sql<string>`case when job_hunting then 'Yes' else 'No' end`,
        count: sql<number>`count(*)`,
      })
      .from(responses)
      .where(eq(responses.sessionId, sessionId))
      .groupBy(responses.jobHunting)

    // Get fun question results
    const funAnswers = await db
      .select({ funAnswers: responses.funAnswers })
      .from(responses)
      .where(eq(responses.sessionId, sessionId))

    // Aggregate fun answers
    const funResults: Record<string, Record<string, number>> = {}
    
    funAnswers.forEach(({ funAnswers }) => {
      if (funAnswers && typeof funAnswers === 'object') {
        Object.entries(funAnswers as Record<string, string>).forEach(([questionId, answer]) => {
          if (!funResults[questionId]) {
            funResults[questionId] = {}
          }
          funResults[questionId][answer] = (funResults[questionId][answer] || 0) + 1
        })
      }
    })

    return NextResponse.json({
      session: session[0],
      responseCount,
      results: {
        preferredLlm: llmResults,
        preferredFramework: frameworkResults,
        jobHunting: jobHuntingResults,
        funQuestions: funResults,
      },
      success: true,
    })
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
