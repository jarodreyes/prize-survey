'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { BrandShell } from '@/components/BrandShell'
import { LiveCounter } from '@/components/LiveCounter'
import { PrizeSidebar } from '@/components/PrizeSidebar'
import { ActivityFeed } from '@/components/ActivityFeed'
import { QRClient } from '@/components/QRClient'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { FUN_QUESTIONS } from '@/lib/constants'
import { BarChart3, PieChart as PieChartIcon, Users, Gift } from 'lucide-react'
import { realtime } from '@/lib/realtime'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ResultsData {
  session: {
    id: string
    code: string
    active: boolean
    createdAt: string
  }
  responseCount: number
  results: {
    preferredLlm: Array<{ option: string; count: number }>
    preferredFramework: Array<{ option: string; count: number }>
    jobHunting: Array<{ option: string; count: number }>
    funQuestions: Record<string, Record<string, number>>
  }
}

const CHART_COLORS = ['#3B82F6', '#06B6D4', '#059669', '#D97706', '#DC2626', '#7C3AED']

export default function ResultsPage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const [results, setResults] = useState<ResultsData | null>(null)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const [resultsResponse, activitiesResponse] = await Promise.all([
          fetch(`/api/results/${sessionId}`),
          fetch(`/api/activity/feed?sessionId=${sessionId}&limit=20`)
        ])

        if (resultsResponse.ok) {
          const resultsData = await resultsResponse.json()
          setResults(resultsData)
        } else {
          const errorData = await resultsResponse.json()
          setError(errorData.error || 'Failed to load results')
        }

        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json()
          setActivities(activitiesData.activities || [])
        }
      } catch (error) {
        setError('Failed to load session data')
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchResults()

    // Set up real-time updates
    let unsubscribe: () => void = () => {}
    let pollInterval: NodeJS.Timeout

    if (realtime.enabled) {
      // Subscribe to realtime updates
      unsubscribe = realtime.subscribe(`session:${sessionId}`, (event, data) => {
        if (event === 'results_updated') {
          // Refresh results when new responses come in
          fetchResults()
        }
      })
    } else {
      // Fallback to polling every 5 seconds
      pollInterval = setInterval(fetchResults, 5000)
    }

    return () => {
      unsubscribe()
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [sessionId])

  if (loading) {
    return (
      <BrandShell>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="dev-card p-8 max-w-md mx-auto">
            <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted">Loading results...</p>
          </div>
        </div>
      </BrandShell>
    )
  }

  if (error || !results) {
    return (
      <BrandShell>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="dev-card p-8 max-w-md mx-auto border-danger/20 bg-danger/5">
            <p className="text-danger">{error || 'Session not found'}</p>
          </div>
        </div>
      </BrandShell>
    )
  }

  const formatChartData = (data: Array<{ option: string; count: number }>) => {
    return data.map(item => ({
      name: item.option,
      value: item.count,
    }))
  }

  const formatFunQuestionData = (questionId: string) => {
    const questionData = results.results.funQuestions[questionId] || {}
    return Object.entries(questionData).map(([option, count]) => ({
      name: option,
      value: count as number,
    }))
  }

  const getFunQuestionTitle = (questionId: string) => {
    const question = FUN_QUESTIONS.find(q => q.id === questionId)
    return question?.question || questionId
  }

  const joinUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/join?code=${results.session.code}`

  return (
    <BrandShell>
      {/* JOIN HERE Callout */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 hidden lg:block">
        <div className="bg-white border-2 border-pink-400 shadow-2xl rounded-lg p-4 max-w-2xl">
          <div className="flex items-center space-x-6">
            <QRClient value={joinUrl} size={120} />
            <div className="flex-1 space-y-2">
              <div className="text-black font-bold text-2xl tracking-wide">
                👋 JOIN HERE!
              </div>
              <div className="space-y-1">
                <div className="text-gray-600 text-sm font-medium">
                  Scan QR code or visit:
                </div>
                <div className="text-black font-bold text-lg break-all">
                  {typeof window !== 'undefined' ? window.location.host : ''}/join?code={results?.session.code || '------'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile JOIN HERE Banner */}
      <div className="lg:hidden bg-white border-2 border-pink-400 p-3 m-4 rounded-lg">
        <div className="text-center space-y-1">
          <div className="text-black font-bold text-lg">
            👋 JOIN: {typeof window !== 'undefined' ? window.location.host : ''}/join?code={results?.session.code || '------'}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="dev-heading text-3xl">Live Results</h1>
            <Link href={`/raffle/${sessionId}`}>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2 bg-gradient-to-r from-accent/10 to-accent-2/10 border-accent/30 hover:border-accent/50"
              >
                <Gift className="w-4 h-4" />
                Prize Raffle
              </Button>
            </Link>
          </div>
          <p className="text-muted">
            Session: <span className="font-mono text-accent">{results.session.code}</span>
            {!results.session.active && <span className="text-warn ml-2">(Ended)</span>}
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Lead Gen Results */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Preferred LLM */}
              <div className="dev-card p-6">
                <h3 className="dev-heading text-2xl mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-accent" />
                  Preferred LLM
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formatChartData(results.results.preferredLlm)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#6B7280" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#E5E7EB', fontSize: 14, fontWeight: 'bold' }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        stroke="#6B7280"
                      />
                      <YAxis tick={{ fill: '#E5E7EB', fontSize: 14, fontWeight: 'bold' }} stroke="#6B7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #6B7280',
                          borderRadius: '8px',
                          color: '#F9FAFB',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {formatChartData(results.results.preferredLlm).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Preferred Framework */}
              <div className="dev-card p-6">
                <h3 className="dev-heading text-2xl mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-accent-2" />
                  Preferred Framework
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formatChartData(results.results.preferredFramework)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#6B7280" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#E5E7EB', fontSize: 14, fontWeight: 'bold' }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        stroke="#6B7280"
                      />
                      <YAxis tick={{ fill: '#E5E7EB', fontSize: 14, fontWeight: 'bold' }} stroke="#6B7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #6B7280',
                          borderRadius: '8px',
                          color: '#F9FAFB',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {formatChartData(results.results.preferredFramework).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>


            {/* Fun Questions */}
            <div className="grid md:grid-cols-3 gap-6">
              {Object.keys(results.results.funQuestions).map((questionId, index) => (
                <div key={questionId} className="dev-card p-6">
                  <h3 className="dev-heading text-xl mb-4">
                    {getFunQuestionTitle(questionId)}
                  </h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={formatFunQuestionData(questionId)}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) => {
                            if (percent < 0.1) return null; // Don't show labels for slices < 10%
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            return (
                              <text 
                                x={x} 
                                y={y} 
                                fill="#F9FAFB" 
                                textAnchor={x > cx ? 'start' : 'end'} 
                                dominantBaseline="central"
                                fontSize="11"
                                fontWeight="bold"
                              >
                                {`${(percent * 100).toFixed(0)}%`}
                              </text>
                            );
                          }}
                        >
                          {formatFunQuestionData(questionId).map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #6B7280',
                            borderRadius: '8px',
                            color: '#F9FAFB'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1 mt-2">
                    {formatFunQuestionData(questionId).map((entry, idx) => (
                      <div key={entry.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                          />
                          <span className="text-foreground font-medium">{entry.name}</span>
                        </div>
                        <span className="text-foreground font-bold">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Live Counter - moved above prizes */}
            <LiveCounter sessionId={sessionId} initialCount={results.responseCount} />
            <PrizeSidebar responseCount={results.responseCount} />
            <ActivityFeed sessionId={sessionId} initialActivities={activities} />
          </div>
        </div>
      </div>
    </BrandShell>
  )
}
