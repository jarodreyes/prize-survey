'use client'

import { PRIZE_TIERS } from '@/lib/constants'
import { Lock, Trophy, Gift } from 'lucide-react'

interface PrizeSidebarProps {
  responseCount: number
}

export function PrizeSidebar({ responseCount }: PrizeSidebarProps) {
  return (
    <div className="space-y-4">
      <div className="dev-card p-4">
        <h3 className="dev-heading text-lg mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent" />
          Prize Unlocks
        </h3>
        
        <div className="space-y-4">
          {PRIZE_TIERS.map((tier, index) => {
            const isUnlocked = responseCount >= tier.threshold
            const progress = Math.min(100, (responseCount / tier.threshold) * 100)
            
            return (
              <div
                key={tier.id}
                className={`prize-card ${isUnlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden relative">
                    <img 
                      src={tier.image}
                      alt={tier.title}
                      className={`w-full h-full object-cover transition-all ${
                        isUnlocked ? 'opacity-100' : 'opacity-40 grayscale'
                      }`}
                    />
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Lock className="w-5 h-5 text-muted" />
                      </div>
                    )}
                    {isUnlocked && (
                      <div className="absolute top-1 right-1">
                        <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center">
                          <Gift className="w-3 h-3 text-background" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-sm ${
                      isUnlocked ? 'text-success' : 'text-ink'
                    }`}>
                      {tier.title}
                    </h4>
                    <p className="text-xs text-muted mt-1">
                      {tier.description}
                    </p>
                    
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-bold text-sm ${
                          isUnlocked ? 'text-success' : 'text-foreground'
                        }`}>
                          {responseCount} out of {tier.threshold}
                        </span>
                        <span className={`text-sm font-medium ${
                          isUnlocked ? 'text-success' : 'text-muted'
                        }`}>
                          {Math.round(progress)}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-panel rounded-full h-4 overflow-hidden border border-border">
                        <div
                          className={`h-full transition-all duration-700 ${
                            isUnlocked
                              ? 'bg-gradient-to-r from-success to-green-400'
                              : 'bg-gradient-to-r from-accent to-accent-2'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {isUnlocked && (
                  <div className="mt-3 pt-3 border-t border-success/20">
                    <div className="flex items-center gap-2 text-xs text-success">
                      <Trophy className="w-3 h-3" />
                      <span className="font-medium">Unlocked!</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
