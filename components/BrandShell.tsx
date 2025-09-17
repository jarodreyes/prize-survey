import { ReactNode } from 'react'
import Image from 'next/image'

interface BrandShellProps {
  children: ReactNode
}

export function BrandShell({ children }: BrandShellProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 bg-panel/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                <Image 
                  src="/images/signalfire-logo.png" 
                  alt="SignalFire" 
                  width={32} 
                  height={32}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="dev-heading text-lg text-ink">SignalFire Survey</h1>
                <p className="text-xs text-muted">Live Event Polling</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-panel/30">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted">
            <p>
              Powered by{' '}
              <span className="text-accent font-medium">SignalFire</span>
              {' & '}
              <span className="text-accent-2 font-medium">DevAir</span>
            </p>
            <p className="mt-1 text-xs">
              By participating, you agree to allow SignalFire and DevAir to follow up once via email.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
