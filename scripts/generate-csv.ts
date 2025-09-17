import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const SESSION_ID = 'ac81b064-337e-4cce-954c-69f65cd76c70'
const NUM_USERS = 120

// Test data arrays
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

const frameworkOptions = ['React', 'Next.js', 'Vue', 'Angular', 'Svelte', 'Other']
const editorOptions = ['VS Code', 'Neovim', 'JetBrains', 'Other']
const indentationOptions = ['Tabs', 'Spaces']
const darkmodeOptions = ['Always', 'Sometimes', 'Never']

function generateUUID(index: number): string {
  // Generate a deterministic UUID based on index
  const hex = index.toString(16).padStart(12, '0')
  return `550e8400-e29b-41d4-a716-${hex}`
}

function generateTestUser(index: number) {
  const firstName = firstNames[index % firstNames.length]
  const lastName = lastNames[Math.floor(index / firstNames.length) % lastNames.length]
  const fullName = `${firstName} ${lastName}`
  
  return {
    id: generateUUID(index + 1),
    sessionId: SESSION_ID,
    userId: `testuser_${(index + 1).toString().padStart(3, '0')}`,
    name: fullName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${index + 1}@example.com`,
    title: jobTitles[index % jobTitles.length],
    preferredLlm: llmOptions[index % llmOptions.length],
    preferredFramework: frameworkOptions[index % frameworkOptions.length],
    location: locations[index % locations.length],
    jobHunting: index % 3 === 0, // Every 3rd person is job hunting
    funAnswers: {
      editor: editorOptions[index % editorOptions.length],
      indentation: indentationOptions[index % indentationOptions.length],
      darkmode: darkmodeOptions[index % darkmodeOptions.length]
    },
    createdAt: new Date(Date.now() + index * 1000).toISOString().replace('T', ' ').slice(0, 19)
  }
}

function escapeCSV(value: any): string {
  if (value === null || value === undefined) {
    return ''
  }
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function generateCSVs() {
  try {
    // Create test-data directory
    mkdirSync('test-data', { recursive: true })

    console.log(`Generating CSV files for ${NUM_USERS} test users...`)

    const users = Array.from({ length: NUM_USERS }, (_, i) => generateTestUser(i))

    // 1. Participants CSV
    const participantsHeader = 'id,session_id,user_id,name,email,created_at'
    const participantsRows = users.map(user => 
      [user.id, user.sessionId, user.userId, user.name, user.email, user.createdAt]
        .map(escapeCSV)
        .join(',')
    )
    const participantsCSV = [participantsHeader, ...participantsRows].join('\n')
    writeFileSync('test-data/participants.csv', participantsCSV)

    // 2. Responses CSV
    const responsesHeader = 'id,session_id,participant_id,title,preferred_llm,preferred_framework,location,job_hunting,fun_answers,created_at'
    const responsesRows = users.map(user => 
      [
        generateUUID(1000 + users.indexOf(user)),
        user.sessionId,
        user.id,
        user.title,
        user.preferredLlm,
        user.preferredFramework,
        user.location,
        user.jobHunting,
        JSON.stringify(user.funAnswers),
        user.createdAt
      ].map(escapeCSV).join(',')
    )
    const responsesCSV = [responsesHeader, ...responsesRows].join('\n')
    writeFileSync('test-data/responses.csv', responsesCSV)

    // 3. Activity CSV
    const activityHeader = 'id,session_id,message,created_at'
    const activityRows = users.map(user => {
      const firstName = user.name.split(' ')[0]
      const lastName = user.name.split(' ')[1]
      const initial = lastName ? lastName.charAt(0).toUpperCase() + '.' : ''
      const message = `${firstName} ${initial} submitted!`
      
      return [
        generateUUID(2000 + users.indexOf(user)),
        user.sessionId,
        message,
        user.createdAt
      ].map(escapeCSV).join(',')
    })
    const activityCSV = [activityHeader, ...activityRows].join('\n')
    writeFileSync('test-data/activity.csv', activityCSV)

    console.log('✅ Generated CSV files:')
    console.log(`   📄 test-data/participants.csv (${users.length} rows)`)
    console.log(`   📄 test-data/responses.csv (${users.length} rows)`)
    console.log(`   📄 test-data/activity.csv (${users.length} rows)`)
    console.log('')
    console.log('🎯 Import Instructions:')
    console.log('   1. Go to your Supabase dashboard')
    console.log('   2. Navigate to Table Editor')
    console.log('   3. Import each CSV file into the corresponding table:')
    console.log('      - participants.csv → participants table')
    console.log('      - responses.csv → responses table')
    console.log('      - activity.csv → activity table')
    console.log('')
    console.log('🎲 After import, you can test the raffle with all 4 prizes unlocked!')
    console.log(`   Session ID: ${SESSION_ID}`)

  } catch (error) {
    console.error('❌ Error generating CSV files:', error)
  }
}

// Run the script
generateCSVs()
