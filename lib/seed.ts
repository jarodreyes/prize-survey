import { db } from './db'
import { sessions, participants, responses, activity } from './schema'
import { generateSessionCode, getNameInitial } from './utils'

async function seed() {
  if (process.env.NODE_ENV !== 'development') {
    console.log('Seeding only available in development mode')
    return
  }

  console.log('🌱 Seeding development data...')

  try {
    // Create test session
    const [session] = await db
      .insert(sessions)
      .values({
        code: 'TEST01',
        hostGithubId: '12345',
        active: true,
      })
      .returning()

    console.log(`✅ Created session: ${session.code} (${session.id})`)

    // Create test participants and responses
    const testData = [
      {
        githubId: '11111',
        githubLogin: 'alice_dev',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        title: 'Senior Frontend Developer',
        preferredLlm: 'GPT-4o family' as const,
        preferredFramework: 'React' as const,
        location: 'San Francisco, CA',
        jobHunting: false,
        funAnswers: {
          editor: 'VS Code',
          indentation: 'Spaces',
          darkmode: 'Always'
        }
      },
      {
        githubId: '22222',
        githubLogin: 'bob_codes',
        name: 'Bob Smith',
        email: 'bob@example.com',
        title: 'Full Stack Engineer',
        preferredLlm: 'Claude family' as const,
        preferredFramework: 'Next.js' as const,
        location: 'New York, NY',
        jobHunting: true,
        funAnswers: {
          editor: 'Neovim',
          indentation: 'Tabs',
          darkmode: 'Always'
        }
      },
      {
        githubId: '33333',
        githubLogin: 'carol_tech',
        name: 'Carol Williams',
        email: 'carol@example.com',
        title: 'DevOps Engineer',
        preferredLlm: 'Llama family' as const,
        preferredFramework: 'Vue' as const,
        location: 'Austin, TX',
        jobHunting: false,
        funAnswers: {
          editor: 'VS Code',
          indentation: 'Spaces',
          darkmode: 'Sometimes'
        }
      },
      {
        githubId: '44444',
        githubLogin: 'dave_builds',
        name: 'Dave Brown',
        email: 'dave@example.com',
        title: 'Backend Developer',
        preferredLlm: 'GPT-4o family' as const,
        preferredFramework: 'Svelte' as const,
        location: 'Seattle, WA',
        jobHunting: true,
        funAnswers: {
          editor: 'JetBrains',
          indentation: 'Tabs',
          darkmode: 'Always'
        }
      },
      {
        githubId: '55555',
        githubLogin: 'eve_creates',
        name: 'Eve Davis',
        email: 'eve@example.com',
        title: 'UI/UX Designer',
        preferredLlm: 'Claude family' as const,
        preferredFramework: 'React' as const,
        location: 'Remote',
        jobHunting: false,
        funAnswers: {
          editor: 'VS Code',
          indentation: 'Spaces',
          darkmode: 'Never'
        }
      }
    ]

    for (const data of testData) {
      // Create participant
      const [participant] = await db
        .insert(participants)
        .values({
          sessionId: session.id,
          userId: data.githubId,
          name: data.name,
          email: data.email,
        })
        .returning()

      // Create response
      await db.insert(responses).values({
        sessionId: session.id,
        participantId: participant.id,
        title: data.title,
        preferredLlm: data.preferredLlm,
        preferredFramework: data.preferredFramework,
        location: data.location,
        jobHunting: data.jobHunting,
        funAnswers: data.funAnswers,
      })

      // Create activity
      const activityMessage = `${getNameInitial(data.name, data.githubLogin)} submitted!`
      await db.insert(activity).values({
        sessionId: session.id,
        message: activityMessage,
      })

      console.log(`✅ Created participant and response for ${data.name}`)
    }

    console.log('🎉 Seeding completed successfully!')
    console.log(`\n📝 Test session created:`)
    console.log(`   Code: TEST01`)
    console.log(`   Join URL: http://localhost:3000/join?code=TEST01`)
    console.log(`   Results: http://localhost:3000/results/${session.id}`)
    console.log(`   Responses: ${testData.length}`)

  } catch (error) {
    console.error('❌ Error seeding data:', error)
    process.exit(1)
  }
}

// Run seed if called directly
if (require.main === module) {
  seed().then(() => process.exit(0))
}

export { seed }
