'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BrandShell } from '@/components/BrandShell'
import { LeadGenForm } from '@/components/LeadGenForm'
import { CheckCircle } from 'lucide-react'

interface SessionInfo {
  id: string
  code: string
  active: boolean
  createdAt: string | Date
}

export default function JoinPage() {
  const searchParams = useSearchParams()
  const [sessionCode, setSessionCode] = useState(searchParams.get('code') || '')
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Validate session code when it changes
  useEffect(() => {
    if (sessionCode.length === 6) {
      validateSession()
    }
  }, [sessionCode]) // eslint-disable-line react-hooks/exhaustive-deps

  const validateSession = async () => {
    if (!sessionCode || sessionCode.length !== 6) return
    
    setIsValidating(true)
    setError('')
    
    try {
      const response = await fetch(`/api/session/status?code=${sessionCode}`)
      if (response.ok) {
        const data = await response.json()
        if (data.active) {
          setSessionInfo(data)
        } else {
          setError('This session has ended')
          setSessionInfo(null)
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Session not found')
        setSessionInfo(null)
      }
    } catch (error) {
      setError('Failed to validate session code')
      setSessionInfo(null)
    } finally {
      setIsValidating(false)
    }
  }

  const handleSubmitResponse = async (formData: any) => {
    setIsSubmitting(true)
    setError('')
    
    try {
      const response = await fetch('/api/response/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sessionCode,
        }),
      })

      if (response.ok) {
        setSubmitted(true)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to submit response')
      }
    } catch (error) {
      setError('Failed to submit response. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show success state
  if (submitted && sessionInfo) {
    return (
      <BrandShell>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="dev-card p-8">
              <div className="w-16 h-16 bg-success/20 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              
              <h1 className="dev-heading text-2xl mb-4">Response Submitted!</h1>
              <p className="text-muted mb-6">
                Thank you for participating. Your response has been recorded.
              </p>
              
              <Button 
                onClick={() => window.open(`/results/${sessionInfo.id}`, '_blank')}
                className="w-full"
              >
                View Live Results
              </Button>
            </div>
          </div>
        </div>
      </BrandShell>
    )
  }

  // Show form if session is valid
  if (sessionInfo) {
    return (
      <BrandShell>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="dev-heading text-3xl mb-4">Survey Session</h1>
            <p className="text-muted">
              Session: <span className="font-mono text-accent">{sessionInfo.code}</span>
            </p>
          </div>

          {error && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="dev-card p-4 border-danger/20 bg-danger/5">
                <p className="text-danger text-center">{error}</p>
              </div>
            </div>
          )}

          <LeadGenForm
            sessionCode={sessionCode}
            onSubmit={handleSubmitResponse}
            isSubmitting={isSubmitting}
          />
        </div>
      </BrandShell>
    )
  }

  // Show session code entry form
  return (
    <BrandShell>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="dev-heading text-3xl mb-4">Join Session</h1>
            <p className="text-muted">
              Enter the 6-character session code to get started
            </p>
          </div>

          <div className="dev-card p-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sessionCode">Session Code</Label>
                <Input
                  id="sessionCode"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  className="text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                />
              </div>

              {error && (
                <div className="dev-card p-3 border-danger/20 bg-danger/5">
                  <p className="text-danger text-sm text-center">{error}</p>
                </div>
              )}

              {isValidating && (
                <div className="text-center">
                  <p className="text-sm text-muted">Validating session...</p>
                </div>
              )}

              {sessionInfo && (
                <div className="dev-card p-4 border-success/20 bg-success/5">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Valid session found!</span>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    Created {new Date(sessionInfo?.createdAt || '').toLocaleString()}
                  </p>
                </div>
              )}

              <div className="text-center text-xs text-muted">
                <p>Don&apos;t have a code? Ask your event host for the session code.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrandShell>
  )
}
