import { NextRequest, NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'
import { sessions, participants, responses, activity } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { getNameInitial } from '@/lib/utils'

const generateTestUser = (index: number) => {
  const firstNames = [
    'Alex', 'Jamie', 'Casey', 'Jordan', 'Taylor', 'Morgan', 'Quinn', 'Avery', 'Riley', 'Cameron',
    'Drew', 'Blake', 'Sage', 'Parker', 'Rowan', 'Emery', 'Finley', 'Reese', 'Dakota', 'Hayden',
    'Peyton', 'River', 'Skyler', 'Kendall', 'Phoenix', 'Remy', 'Lane', 'Jules', 'Kai', 'Marlowe',
    'Eden', 'Lennox', 'Indigo', 'Ari', 'Bryce', 'Devon', 'Ellis', 'Gray', 'Harper', 'Ira',
    'Jess', 'Kris', 'Lake', 'Max', 'Nova', 'Ocean', 'Pax', 'Rain', 'Sage', 'Tate'
  ]
  
  const lastNames = [
    'Anderson', 'Brown', 'Chen', 'Davis', 'Evans', 'Foster', 'Garcia', 'Harris', 'Jackson', 'Kim',
    'Lopez', 'Miller', 'Nguyen', 'O\'Brien', 'Patel', 'Quinn', 'Rodriguez', 'Smith', 'Taylor', 'Wilson',
    'Ahmed', 'Baker', 'Clark', 'Diaz', 'Fisher', 'Green', 'Hall', 'Ivanov', 'Johnson', 'Kumar',
    'Lee', 'Martinez', 'Nelson', 'Olson', 'Perez', 'Roberts', 'Singh', 'Thompson', 'Underwood', 'Valdez',
    'White', 'Xu', 'Young', 'Zhang', 'Adams', 'Bell', 'Carter', 'Duncan', 'Ellis', 'Ford'
  ]

  const jobTitles = [
    'Senior Software Engineer', 'Frontend Developer', 'Backend Engineer', 'Full Stack Developer',
    'DevOps Engineer', 'Data Scientist', 'Product Manager', 'UX Designer', 'Technical Lead',
    'Software Architect', 'Mobile Developer', 'QA Engineer', 'Site Reliability Engineer',
    'Machine Learning Engineer', 'Security Engineer', 'Cloud Engineer', 'Platform Engineer',
    'Engineering Manager', 'Principal Engineer', 'Staff Engineer', 'Senior DevOps Engineer',
    'Lead Frontend Developer', 'Senior Backend Engineer', 'Technical Product Manager',
    'Senior Data Scientist', 'Lead UX Designer', 'Senior Mobile Developer', 'Infrastructure Engineer'
  ]

  const locations = [
    'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Boston, MA',
    'Los Angeles, CA', 'Chicago, IL', 'Denver, CO', 'Portland, OR', 'Atlanta, GA',
    'Miami, FL', 'Nashville, TN', 'Raleigh, NC', 'Phoenix, AZ', 'Salt Lake City, UT',
    'Minneapolis, MN', 'Pittsburgh, PA', 'Columbus, OH', 'Detroit, MI', 'Philadelphia, PA',
    'Remote', 'London, UK', 'Toronto, ON', 'Vancouver, BC', 'Berlin, Germany'
  ]

  const llmOptions = [
    'GPT-4o (multi-modal)', 'Claude 3 Opus', 'GPT-4 Classic', 'Claude 3 Haiku',
    'Google Gemini', 'Llama 3', 'Mistral', 'Claude 4-sonnet', 'GPT-5', 'Mixtral'
  ]

  const frameworkOptions = [
    'React', 'Next.js', 'Vue', 'Angular', 'Svelte', 'Other'
  ]

  const editorOptions = ['VS Code', 'Neovim', 'JetBrains', 'Other']
  const indentationOptions = ['Tabs', 'Spaces']
  const darkmodeOptions = ['Always', 'Sometimes', 'Never']

  const firstName = firstNames[index % firstNames.length]
  const lastName = lastNames[Math.floor(index / firstNames.length) % lastNames.length]
  const fullName = `${firstName} ${lastName}`
  
  return {
    userId: `testuser_${Date.now()}_${index.toString().padStart(3, '0')}`,
    name: fullName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${index}@example.com`,
    title: jobTitles[index % jobTitles.length],
    preferredLlm: llmOptions[index % llmOptions.length],
    preferredFramework: frameworkOptions[index % frameworkOptions.length],
    location: locations[index % locations.length],
    jobHunting: Math.random() > 0.6,
    funAnswers: {
      editor: editorOptions[index % editorOptions.length],
      indentation: indentationOptions[index % indentationOptions.length],
      darkmode: darkmodeOptions[index % darkmodeOptions.length]
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        { error: 'Database not configured. Please set POSTGRES_URL environment variable.' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { sessionCode, numUsers = 120 } = body

    if (!sessionCode) {
      return NextResponse.json(
        { error: 'Session code is required' },
        { status: 400 }
      )
    }

    // Find or create the session
    let sessionData = await db
      .select()
      .from(sessions)
      .where(eq(sessions.code, sessionCode))
      .limit(1)

    let session
    if (sessionData.length === 0) {
      // Create the session if it doesn't exist
      const [newSession] = await db
        .insert(sessions)
        .values({
          code: sessionCode,
          hostGithubId: 'admin-test',
          active: true,
        })
        .returning()
      session = newSession
    } else {
      session = sessionData[0]
    }

    // Add users in batches
    const batchSize = 10
    let successCount = 0
    const errors: string[] = []

    for (let i = 0; i < numUsers; i += batchSize) {
      const batchEnd = Math.min(i + batchSize, numUsers)

      for (let j = i; j < batchEnd; j++) {
        const userData = generateTestUser(j)
        
        try {
          // Create participant
          const [participant] = await db
            .insert(participants)
            .values({
              sessionId: session.id,
              userId: userData.userId,
              name: userData.name,
              email: userData.email,
            })
            .returning()

          // Create response
          await db.insert(responses).values({
            sessionId: session.id,
            participantId: participant.id,
            title: userData.title,
            preferredLlm: userData.preferredLlm as any,
            preferredFramework: userData.preferredFramework as any,
            location: userData.location,
            jobHunting: userData.jobHunting,
            funAnswers: userData.funAnswers,
          })

          // Create activity entry
          const activityMessage = `${getNameInitial(userData.name, userData.userId)} submitted!`
          await db.insert(activity).values({
            sessionId: session.id,
            message: activityMessage,
          })

          successCount++
          
        } catch (error) {
          errors.push(`Failed to create user ${userData.name}: ${error}`)
        }
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      sessionCode: session.code,
      usersAdded: successCount,
      totalRequested: numUsers,
      errors: errors.slice(0, 5), // Only return first 5 errors
      message: `Added ${successCount}/${numUsers} test users to session ${sessionCode}`,
      prizeStatus: {
        tier1: successCount >= 15 ? 'unlocked' : 'locked',
        tier2: successCount >= 25 ? 'unlocked' : 'locked', 
        tier3: successCount >= 50 ? 'unlocked' : 'locked',
        tier4: successCount >= 100 ? 'unlocked' : 'locked',
      }
    })

  } catch (error) {
    console.error('Error adding test users:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
