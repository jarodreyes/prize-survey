'use client'

import { useEffect, useState } from 'react'
import { Users, Wifi, WifiOff } from 'lucide-react'
import { realtime } from '@/lib/realtime'

interface LiveCounterProps {
  sessionId: string
  initialCount: number
}

export function LiveCounter({ sessionId, initialCount }: LiveCounterProps) {
  const [count, setCount] = useState(initialCount)
  const [isConnected, setIsConnected] = useState(realtime.enabled)

  useEffect(() => {
    let unsubscribe: () => void = () => {}
    let pollInterval: NodeJS.Timeout

    if (realtime.enabled) {
      // Subscribe to realtime counter updates
      unsubscribe = realtime.subscribe(`session:${sessionId}`, (event, data) => {
        if (event === 'counter_updated') {
          setCount(data.count)
        }
      })
      setIsConnected(true)
    } else {
      // Fallback to polling
      setIsConnected(false)
      
      const pollCount = async () => {
        try {
          const response = await fetch(`/api/results/${sessionId}`)
          if (response.ok) {
            const data = await response.json()
            setCount(data.responseCount || 0)
          }
        } catch (error) {
          console.warn('Failed to poll response count:', error)
        }
      }

      pollInterval = setInterval(pollCount, 3000)
    }

    return () => {
      unsubscribe()
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [sessionId])

  return (
    <div className="dev-card p-6 bg-gradient-to-r from-accent/10 to-accent-2/10 border-accent/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent-2 rounded-xl flex items-center justify-center">
            <Users className="w-8 h-8 text-background" />
          </div>
          
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold dev-heading text-foreground">
                {count.toLocaleString()}
              </span>
              <span className="text-lg font-semibold text-accent">
                {count === 1 ? 'Response' : 'Responses'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {isConnected ? (
                <div className="flex items-center gap-1 text-sm text-success font-medium">
                  <Wifi className="w-3 h-3" />
                  <span>Live</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-sm text-muted font-medium">
                  <WifiOff className="w-3 h-3" />
                  <span>Polling</span>
                </div>
              )}
              {count > 0 && (
                <>
                  <span className="text-muted">•</span>
                  <div className="flex items-center gap-1 text-sm text-muted">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    <span>Active</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
