'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Users, Plus } from 'lucide-react'

interface AddTestUsersButtonProps {
  sessionId: string
}

// Utility function to get name with initial (inline to avoid import issues)
function getNameInitial(name: string | null | undefined, login?: string): string {
  if (!name) {
    return login ? login.charAt(0).toUpperCase() + '.' : 'A.'
  }
  
  const nameParts = name.trim().split(' ')
  if (nameParts.length < 2) {
    return name.charAt(0).toUpperCase() + '.'
  }
  
  const firstName = nameParts[0]
  const lastName = nameParts[nameParts.length - 1]
  return `${firstName} ${lastName.charAt(0).toUpperCase()}.`
}

const generateTestUser = (index: number) => {
  const firstNames = [
    'Alex', 'Jamie', 'Casey', 'Jordan', 'Taylor', 'Morgan', 'Quinn', 'Avery', 'Riley', 'Cameron',
    'Drew', 'Blake', 'Sage', 'Parker', 'Rowan', 'Emery', 'Finley', 'Reese', 'Dakota', 'Hayden',
    'Peyton', 'River', 'Skyler', 'Kendall', 'Phoenix', 'Remy', 'Lane', 'Jules', 'Kai', 'Marlowe'
  ]
  
  const lastNames = [
    'Anderson', 'Brown', 'Chen', 'Davis', 'Evans', 'Foster', 'Garcia', 'Harris', 'Jackson', 'Kim',
    'Lopez', 'Miller', 'Nguyen', 'O\'Brien', 'Patel', 'Quinn', 'Rodriguez', 'Smith', 'Taylor', 'Wilson'
  ]

  const jobTitles = [
    'Senior Software Engineer', 'Frontend Developer', 'Backend Engineer', 'Full Stack Developer',
    'DevOps Engineer', 'Data Scientist', 'Product Manager', 'UX Designer', 'Technical Lead',
    'Software Architect', 'Mobile Developer', 'QA Engineer', 'Site Reliability Engineer'
  ]

  const locations = [
    'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Boston, MA',
    'Los Angeles, CA', 'Chicago, IL', 'Denver, CO', 'Portland, OR', 'Atlanta, GA'
  ]

  const llmOptions = [
    'GPT-4o (multi-modal)', 'Claude 3 Opus', 'GPT-4 Classic', 'Claude 3 Haiku',
    'Google Gemini', 'Llama 3', 'Mistral', 'Claude 4-sonnet'
  ]

  const frameworkOptions = ['React', 'Next.js', 'Vue', 'Angular', 'Svelte', 'Other']
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

export function AddTestUsersButton({ sessionId }: AddTestUsersButtonProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const addTestUsers = async () => {
    setLoading(true)
    setSuccess(false)

    try {
      // Generate and submit test users directly via the response API
      const numUsers = 120
      let successCount = 0

      for (let i = 0; i < numUsers; i += 5) {
        const batch = []
        for (let j = i; j < Math.min(i + 5, numUsers); j++) {
          batch.push(generateTestUser(j))
        }

        // Submit each user in the batch
        for (const userData of batch) {
          try {
            const response = await fetch('/api/response/submit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionCode: '52XZ1W', // Hardcoded for now
                name: userData.name,
                email: userData.email,
                title: userData.title,
                preferredLlm: userData.preferredLlm,
                preferredFramework: userData.preferredFramework,
                location: userData.location,
                jobHunting: userData.jobHunting,
                funAnswers: userData.funAnswers,
              }),
            })

            if (response.ok) {
              successCount++
            }
          } catch (error) {
            console.error('Failed to add user:', userData.name, error)
          }
        }

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      console.log(`Added ${successCount}/${numUsers} test users`)
      setSuccess(true)
      
      // Refresh the page after a short delay to show updated data
      setTimeout(() => {
        window.location.reload()
      }, 1000)

    } catch (error) {
      console.error('Error adding test users:', error)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Button 
        size="sm"
        className="flex items-center gap-2 bg-success text-background"
        disabled
      >
        ✅ Added 120 Users
      </Button>
    )
  }

  return (
    <Button 
      onClick={addTestUsers}
      disabled={loading}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      {loading ? (
        <>
          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          Adding Users...
        </>
      ) : (
        <>
          <Plus className="w-4 h-4" />
          Add 120 Test Users
        </>
      )}
    </Button>
  )
}
