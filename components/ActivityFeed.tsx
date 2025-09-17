'use client'

import { useEffect, useState } from 'react'
import { Activity, Clock } from 'lucide-react'
import { realtime } from '@/lib/realtime'

interface ActivityItem {
  id: string
  message: string
  createdAt: string
}

interface ActivityFeedProps {
  sessionId: string
  initialActivities?: ActivityItem[]
}

export function ActivityFeed({ sessionId, initialActivities = [] }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities)
  const [isPolling, setIsPolling] = useState(!realtime.enabled)

  useEffect(() => {
    let unsubscribe: () => void = () => {}
    let pollInterval: NodeJS.Timeout

    if (realtime.enabled) {
      // Subscribe to realtime updates
      unsubscribe = realtime.subscribe(`session:${sessionId}`, (event, data) => {
        if (event === 'response_submitted') {
          const newActivity: ActivityItem = {
            id: `activity-${Date.now()}`,
            message: `${data.participantName} submitted!`,
            createdAt: new Date().toISOString(),
          }
          setActivities(prev => [newActivity, ...prev].slice(0, 20))
        }
      })
    } else {
      // Fallback to polling
      setIsPolling(true)
      
      const pollActivities = async () => {
        try {
          const response = await fetch(`/api/activity/feed?sessionId=${sessionId}&limit=20`)
          if (response.ok) {
            const data = await response.json()
            setActivities(data.activities || [])
          }
        } catch (error) {
          console.warn('Failed to poll activities:', error)
        }
      }

      pollInterval = setInterval(pollActivities, 3000)
    }

    return () => {
      unsubscribe()
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [sessionId])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="dev-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="dev-heading text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-accent-2" />
          Activity Feed
        </h3>
        {isPolling && (
          <div className="flex items-center gap-1 text-xs text-muted">
            <Clock className="w-3 h-3" />
            <span>Polling</span>
          </div>
        )}
      </div>

      <div className="space-y-1 max-h-80 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No activity yet...</p>
            <p className="text-xs mt-1">Responses will appear here in real time</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="flex-1">
                <span className="text-ink">{activity.message}</span>
              </div>
              <time className="text-xs text-muted flex-shrink-0">
                {formatTime(activity.createdAt)}
              </time>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
