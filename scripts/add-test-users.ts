import { db } from '../lib/db'
import { sessions, participants, responses, activity } from '../lib/schema'
import { eq } from 'drizzle-orm'
import { getNameInitial } from '../lib/utils'

const SESSION_CODE = '52XZ1W'
const NUM_USERS = 120

// Generate realistic test data
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
    userId: `testuser_${index.toString().padStart(3, '0')}`,
    name: fullName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    title: jobTitles[index % jobTitles.length],
    preferredLlm: llmOptions[index % llmOptions.length],
    preferredFramework: frameworkOptions[index % frameworkOptions.length],
    location: locations[index % locations.length],
    jobHunting: Math.random() > 0.6, // 40% are job hunting
    funAnswers: {
      editor: editorOptions[index % editorOptions.length],
      indentation: indentationOptions[index % indentationOptions.length],
      darkmode: darkmodeOptions[index % darkmodeOptions.length]
    }
  }
}

async function addTestUsers() {
  console.log(`🎯 Adding ${NUM_USERS} test users to session ${SESSION_CODE}...`)

  try {
    // Find the session
    const sessionData = await db
      .select()
      .from(sessions)
      .where(eq(sessions.code, SESSION_CODE))
      .limit(1)

    if (sessionData.length === 0) {
      console.error(`❌ Session with code ${SESSION_CODE} not found`)
      return
    }

    const session = sessionData[0]
    console.log(`✅ Found session: ${session.id}`)

    // Add users in batches to avoid overwhelming the database
    const batchSize = 10
    let successCount = 0

    for (let i = 0; i < NUM_USERS; i += batchSize) {
      const batchEnd = Math.min(i + batchSize, NUM_USERS)
      console.log(`📝 Processing batch ${Math.floor(i / batchSize) + 1}: users ${i + 1}-${batchEnd}`)

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
          console.error(`❌ Failed to create user ${userData.name}:`, error)
        }
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log(`🎉 Successfully added ${successCount}/${NUM_USERS} test users!`)
    console.log(`\n📊 Session ${SESSION_CODE} now has enough responses to unlock all prizes:`)
    console.log(`   • 15+ responses: Foods of Seattle Pouch ✅`)
    console.log(`   • 25+ responses: Sub Pop Beanie ✅`)
    console.log(`   • 50+ responses: Kurt Cobain Shirt ✅`)
    console.log(`   • 100+ responses: AudioBox Cassette Player/Recorder ✅`)
    console.log(`\n🎲 Ready for raffle testing!`)
    console.log(`   • Results: /results/${session.id}`)
    console.log(`   • Raffle: /raffle/${session.id}`)

  } catch (error) {
    console.error('❌ Error adding test users:', error)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  addTestUsers().then(() => process.exit(0))
}

export { addTestUsers }
