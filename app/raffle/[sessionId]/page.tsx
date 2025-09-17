'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { BrandShell } from '@/components/BrandShell'
import { Button } from '@/components/ui/button'
import { Gift, Users, Sparkles, RefreshCw } from 'lucide-react'
import Image from 'next/image'

interface Winner {
  prizeId: string
  prizeName: string
  prizeImage: string
  winnerName: string
  winnerInitial: string
  winnerEmail: string
}

interface UnlockedPrize {
  id: string
  title: string
  threshold: number
  image: string
}

interface RaffleData {
  sessionId: string
  responseCount: number
  winners: Winner[]
  unlockedPrizes: UnlockedPrize[]
  message: string
}

export default function RafflePage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const [raffleData, setRaffleData] = useState<RaffleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isDrawing, setIsDrawing] = useState(false)

  const fetchRaffleData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/raffle/${sessionId}`)
      
      if (response.ok) {
        const data = await response.json()
        setRaffleData(data)
        setError('')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load raffle data')
      }
    } catch (error) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleRedraw = async () => {
    setIsDrawing(true)
    await new Promise(resolve => setTimeout(resolve, 2000)) // Add suspense
    await fetchRaffleData()
    setIsDrawing(false)
  }

  useEffect(() => {
    fetchRaffleData()
  }, [sessionId])

  if (loading) {
    return (
      <BrandShell>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted">Loading raffle data...</p>
          </div>
        </div>
      </BrandShell>
    )
  }

  if (error) {
    return (
      <BrandShell>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="text-red-500 mb-4">❌ {error}</div>
            <Button onClick={fetchRaffleData}>Try Again</Button>
          </div>
        </div>
      </BrandShell>
    )
  }

  if (!raffleData) {
    return (
      <BrandShell>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-muted">No raffle data available</p>
          </div>
        </div>
      </BrandShell>
    )
  }

  return (
    <BrandShell>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-accent" />
            <h1 className="dev-heading text-4xl text-ink">Prize Raffle</h1>
            <Sparkles className="w-8 h-8 text-accent-2" />
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-muted mb-6">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{raffleData.responseCount} Responses</span>
            </div>
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              <span>{raffleData.unlockedPrizes.length} Prizes Unlocked</span>
            </div>
          </div>

          <p className="text-lg text-muted">{raffleData.message}</p>
        </div>

        {/* Winners Section */}
        {raffleData.winners.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="dev-heading text-2xl text-ink">🎉 Winners</h2>
              <Button 
                onClick={handleRedraw}
                disabled={isDrawing}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isDrawing ? 'animate-spin' : ''}`} />
                {isDrawing ? 'Drawing...' : 'Redraw'}
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {raffleData.winners.map((winner, index) => (
                <div 
                  key={winner.prizeId}
                  className="dev-card p-6 bg-gradient-to-br from-accent/5 to-accent-2/5 border-accent/20"
                  style={{
                    animationDelay: `${index * 0.2}s`,
                    animation: isDrawing ? 'none' : 'fadeInUp 0.6s ease-out both'
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Prize Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                      <Image
                        src={winner.prizeImage}
                        alt={winner.prizeName}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Winner Details */}
                    <div className="flex-1">
                      <h3 className="dev-heading text-lg text-ink mb-1">
                        {winner.prizeName}
                      </h3>
                      
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent-2 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-background">
                            {winner.winnerInitial}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-ink">{winner.winnerName}</p>
                          <p className="text-xs text-muted">{winner.winnerEmail}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unlocked Prizes (if no winners yet) */}
        {raffleData.winners.length === 0 && raffleData.unlockedPrizes.length > 0 && (
          <div className="mb-12">
            <h2 className="dev-heading text-2xl text-ink mb-6">Available Prizes</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {raffleData.unlockedPrizes.map((prize) => (
                <div key={prize.id} className="dev-card p-6 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-lg overflow-hidden bg-white/5">
                    <Image
                      src={prize.image}
                      alt={prize.title}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="dev-heading text-lg text-ink mb-2">{prize.title}</h3>
                  <p className="text-sm text-muted">Unlocked at {prize.threshold} responses</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Prizes Unlocked */}
        {raffleData.unlockedPrizes.length === 0 && (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-muted mx-auto mb-4" />
            <h3 className="dev-heading text-xl text-ink mb-2">No Prizes Unlocked Yet</h3>
            <p className="text-muted">
              Need more responses to unlock prizes. Keep sharing the survey!
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </BrandShell>
  )
}
