'use client'

import { useState } from 'react'
import { BrandShell } from '@/components/BrandShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AddTestUsersPage() {
  const [sessionCode, setSessionCode] = useState('52XZ1W')
  const [numUsers, setNumUsers] = useState(120)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const addTestUsers = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/admin/add-test-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionCode,
          numUsers,
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to add test users')
      }
    } catch (err) {
      setError('Network error: ' + String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <BrandShell>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="dev-heading text-3xl mb-4">Add Test Users</h1>
          <p className="text-muted">Add test participants to a session for raffle testing</p>
        </div>

        <div className="dev-card p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sessionCode">Session Code</Label>
            <Input
              id="sessionCode"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value)}
              placeholder="Enter session code"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numUsers">Number of Users</Label>
            <Input
              id="numUsers"
              type="number"
              value={numUsers}
              onChange={(e) => setNumUsers(parseInt(e.target.value) || 0)}
              min="1"
              max="200"
            />
          </div>

          <Button
            onClick={addTestUsers}
            disabled={loading || !sessionCode}
            className="w-full"
          >
            {loading ? 'Adding Users...' : `Add ${numUsers} Test Users`}
          </Button>

          {error && (
            <div className="dev-card p-4 border-danger/20 bg-danger/5">
              <p className="text-danger text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="dev-card p-4 border-success/20 bg-success/5">
              <h3 className="font-semibold text-success mb-2">Success!</h3>
              <div className="text-sm space-y-1">
                <p>Session: {result.sessionCode} ({result.sessionId})</p>
                <p>Users Added: {result.usersAdded}/{result.totalRequested}</p>
                <p className="mt-3 font-medium">Prize Status:</p>
                <ul className="ml-4 space-y-1">
                  <li>🎁 Tier 1 (15+): {result.prizeStatus?.tier1 === 'unlocked' ? '✅ Unlocked' : '❌ Locked'}</li>
                  <li>🎁 Tier 2 (25+): {result.prizeStatus?.tier2 === 'unlocked' ? '✅ Unlocked' : '❌ Locked'}</li>
                  <li>🎁 Tier 3 (50+): {result.prizeStatus?.tier3 === 'unlocked' ? '✅ Unlocked' : '❌ Locked'}</li>
                  <li>🎁 Tier 4 (100+): {result.prizeStatus?.tier4 === 'unlocked' ? '✅ Unlocked' : '❌ Locked'}</li>
                </ul>
                
                {result.sessionId && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="font-medium mb-2">Quick Links:</p>
                    <div className="space-y-1">
                      <a 
                        href={`/results/${result.sessionId}`}
                        target="_blank"
                        className="block text-accent hover:text-accent-2 text-sm"
                      >
                        📊 View Results →
                      </a>
                      <a 
                        href={`/raffle/${result.sessionId}`}
                        target="_blank"
                        className="block text-accent hover:text-accent-2 text-sm"
                      >
                        🎲 Run Raffle →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </BrandShell>
  )
}
