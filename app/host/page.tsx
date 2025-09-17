'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BrandShell } from '@/components/BrandShell'
import { QRClient } from '@/components/QRClient'
import { LiveCounter } from '@/components/LiveCounter'
import { Copy, ExternalLink, Play, Square, Users } from 'lucide-react'

interface SessionData {
  sessionId: string
  code: string
  joinUrl: string
}

export default function HostPage() {
  const [session, setSession] = useState<SessionData | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const router = useRouter()

  const createSession = async () => {
    setIsCreating(true)
    try {
      const response = await fetch('/api/session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (response.ok) {
        const data = await response.json()
        setSession(data)
      } else {
        const error = await response.json()
        alert(`Failed to create session: ${error.error}`)
      }
    } catch (error) {
      alert('Failed to create session. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  }

  const viewResults = () => {
    if (session) {
      router.push(`/results/${session.sessionId}`)
    }
  }

  const toggleSession = () => {
    setIsActive(!isActive)
    // In a real app, you'd call an API to update the session status
  }

  return (
    <BrandShell>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="dev-heading text-3xl mb-4">Host Dashboard</h1>
            <p className="text-muted">
              Create and manage your survey session
            </p>
          </div>

          {!session ? (
            /* Create Session */
            <div className="dev-card p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent-2 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Play className="w-8 h-8 text-background" />
              </div>
              
              <h2 className="dev-heading text-2xl mb-4">Ready to start?</h2>
              <p className="text-muted mb-8 max-w-md mx-auto">
                Create a new survey session to get your join code and start collecting responses.
              </p>
              
              <Button 
                onClick={createSession}
                disabled={isCreating}
                size="lg"
                className="text-lg px-8 py-4 h-auto"
              >
                {isCreating ? 'Creating...' : 'Create Session'}
              </Button>
            </div>
          ) : (
            /* Session Management */
            <div className="space-y-8">
              {/* Session Info */}
              <div className="dev-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="dev-heading text-2xl">Session Active</h2>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={toggleSession}
                      variant={isActive ? "destructive" : "default"}
                      size="sm"
                    >
                      {isActive ? (
                        <>
                          <Square className="w-4 h-4 mr-2" />
                          End Session
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Reactivate
                        </>
                      )}
                    </Button>
                    <Button onClick={viewResults} variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Results
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Join Code */}
                  <div className="space-y-4">
                    <h3 className="dev-heading text-lg">Join Code</h3>
                    <div className="flex gap-2">
                      <Input 
                        value={session.code}
                        readOnly
                        className="text-2xl font-mono text-center tracking-wider"
                      />
                      <Button
                        onClick={() => copyToClipboard(session.code)}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Input 
                        value={session.joinUrl}
                        readOnly
                        className="text-sm"
                      />
                      <Button
                        onClick={() => copyToClipboard(session.joinUrl)}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center">
                    <h3 className="dev-heading text-lg mb-4">QR Code</h3>
                    <QRClient value={session.joinUrl} size={160} />
                  </div>
                </div>
              </div>

              {/* Live Stats */}
              <div className="grid md:grid-cols-2 gap-6">
                <LiveCounter sessionId={session.sessionId} initialCount={0} />
                
                <div className="dev-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-5 h-5 text-accent-2" />
                    <h3 className="dev-heading text-lg">Session Details</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">Session ID:</span>
                      <span className="font-mono">{session.sessionId.slice(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Status:</span>
                      <span className={isActive ? 'text-success' : 'text-warn'}>
                        {isActive ? 'Active' : 'Ended'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Created:</span>
                      <span>{new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="dev-card p-6">
                <h3 className="dev-heading text-lg mb-4">Instructions for Attendees</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Option 1: Join Code</h4>
                    <ol className="text-sm text-muted space-y-1 list-decimal list-inside">
                      <li>Go to the join page</li>
                      <li>Enter code: <span className="font-mono bg-panel px-1 rounded">{session.code}</span></li>
                      <li>Sign in with GitHub</li>
                      <li>Complete the survey</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Option 2: QR Code</h4>
                    <ol className="text-sm text-muted space-y-1 list-decimal list-inside">
                      <li>Scan the QR code</li>
                      <li>Sign in with GitHub</li>
                      <li>Complete the survey</li>
                      <li>See results in real-time</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </BrandShell>
  )
}
