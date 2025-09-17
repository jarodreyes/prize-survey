import { NextRequest, NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'
import { sessions, participants, responses } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { PRIZE_TIERS } from '@/lib/constants'

interface Winner {
  prizeId: string
  prizeName: string
  prizeImage: string
  winnerName: string
  winnerInitial: string
  winnerEmail: string
}

// Utility function to get name with last initial
function getNameWithInitial(fullName: string): string {
  const nameParts = fullName.trim().split(' ')
  if (nameParts.length < 2) return fullName
  
  const firstName = nameParts[0]
  const lastName = nameParts[nameParts.length - 1]
  const lastInitial = lastName.charAt(0).toUpperCase()
  
  return `${firstName} ${lastInitial}.`
}

// Utility function to shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        { error: 'Database not configured. Please set POSTGRES_URL environment variable.' },
        { status: 503 }
      )
    }

    const { sessionId } = params

    // Verify session exists
    const sessionData = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1)

    if (sessionData.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Get all participants who submitted responses for this session
    const participantsWithResponses = await db
      .select({
        id: participants.id,
        name: participants.name,
        email: participants.email,
        userId: participants.userId,
      })
      .from(participants)
      .innerJoin(responses, eq(participants.id, responses.participantId))
      .where(eq(participants.sessionId, sessionId))

    const responseCount = participantsWithResponses.length

    if (responseCount === 0) {
      return NextResponse.json({
        sessionId,
        responseCount: 0,
        winners: [],
        unlockedPrizes: [],
        message: 'No responses yet - no prizes to assign!'
      })
    }

    // Determine which prizes are unlocked based on response count
    const unlockedPrizes = PRIZE_TIERS.filter(tier => responseCount >= tier.threshold)
      .sort((a, b) => a.threshold - b.threshold) // Sort by threshold ascending

    if (unlockedPrizes.length === 0) {
      return NextResponse.json({
        sessionId,
        responseCount,
        winners: [],
        unlockedPrizes: [],
        message: `Need ${PRIZE_TIERS[0].threshold} responses to unlock first prize. Currently have ${responseCount}.`
      })
    }

    // Shuffle participants to randomize selection
    const shuffledParticipants = shuffleArray(participantsWithResponses)
    
    // Assign winners - each person can only win one prize
    const winners: Winner[] = []
    const assignedParticipants = new Set<string>()

    for (const prize of unlockedPrizes) {
      // Find next unassigned participant
      const availableParticipant = shuffledParticipants.find(
        p => !assignedParticipants.has(p.id)
      )

      if (availableParticipant) {
        assignedParticipants.add(availableParticipant.id)
        
        winners.push({
          prizeId: prize.id,
          prizeName: prize.title,
          prizeImage: prize.image,
          winnerName: getNameWithInitial(availableParticipant.name),
          winnerInitial: availableParticipant.name.charAt(0).toUpperCase(),
          winnerEmail: availableParticipant.email,
        })
      }
    }

    return NextResponse.json({
      sessionId,
      responseCount,
      winners,
      unlockedPrizes: unlockedPrizes.map(p => ({
        id: p.id,
        title: p.title,
        threshold: p.threshold,
        image: p.image
      })),
      message: `${winners.length} prize${winners.length !== 1 ? 's' : ''} assigned from ${responseCount} response${responseCount !== 1 ? 's' : ''}!`
    })

  } catch (error) {
    console.error('Error in raffle endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
