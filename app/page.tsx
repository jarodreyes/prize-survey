import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BrandShell } from '@/components/BrandShell'
import { Users, BarChart3, Gift, Zap, Shield, Globe } from 'lucide-react'

export default function HomePage() {
  return (
    <BrandShell>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="dev-heading text-4xl md:text-6xl mb-6 bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
            Live Event Surveys
          </h1>
          <p className="text-xl text-muted mb-8 leading-relaxed">
            Create engaging real-time surveys for your events. Collect responses, 
            show live results, and unlock prizes as participation grows.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/host">
              <Button size="lg" className="text-lg px-8 py-4 h-auto">
                Create Session
              </Button>
            </Link>
            <Link href="/join">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-auto">
                Join Session
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="dev-card p-6">
            <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <h3 className="dev-heading text-xl mb-3">Real-time Participation</h3>
            <p className="text-muted">
              Attendees join with a simple 6-character code and authenticate via GitHub. 
              See responses flow in real-time.
            </p>
          </div>

          <div className="dev-card p-6">
            <div className="w-12 h-12 bg-accent-2/20 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-accent-2" />
            </div>
            <h3 className="dev-heading text-xl mb-3">Live Results</h3>
            <p className="text-muted">
              Beautiful charts update instantly as responses come in. 
              Perfect for displaying on stage or sharing with attendees.
            </p>
          </div>

          <div className="dev-card p-6">
            <div className="w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center mb-4">
              <Gift className="w-6 h-6 text-success" />
            </div>
            <h3 className="dev-heading text-xl mb-3">Prize Unlocks</h3>
            <p className="text-muted">
              Gamify participation with milestone rewards. Unlock prizes at 25, 50, 
              and 125 responses to keep engagement high.
            </p>
          </div>

          <div className="dev-card p-6">
            <div className="w-12 h-12 bg-warn/20 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-warn" />
            </div>
            <h3 className="dev-heading text-xl mb-3">Lead Generation</h3>
            <p className="text-muted">
              Collect valuable insights: job titles, preferred tools, locations, 
              and job hunting status. Perfect for event organizers.
            </p>
          </div>

          <div className="dev-card p-6">
            <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-accent" />
            </div>
            <h3 className="dev-heading text-xl mb-3">Privacy First</h3>
            <p className="text-muted">
              GitHub authentication ensures real identities while respecting privacy. 
              Clear terms about follow-up communication.
            </p>
          </div>

          <div className="dev-card p-6">
            <div className="w-12 h-12 bg-accent-2/20 rounded-xl flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-accent-2" />
            </div>
            <h3 className="dev-heading text-xl mb-3">Deploy Anywhere</h3>
            <p className="text-muted">
              Built on Next.js 14 with Vercel deployment in mind. 
              Scales automatically and works on any device.
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="dev-heading text-3xl mb-8">How it Works</h2>
          
          <div className="space-y-8">
            <div className="flex items-center gap-6 p-6 dev-card">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-background font-bold">
                1
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg mb-2">Create a Session</h3>
                <p className="text-muted">
                  Host creates a new survey session and gets a 6-character join code plus QR code.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 p-6 dev-card">
              <div className="w-10 h-10 bg-accent-2 rounded-full flex items-center justify-center text-background font-bold">
                2
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg mb-2">Attendees Join</h3>
                <p className="text-muted">
                  Participants enter the code, sign in with GitHub, and fill out the survey form.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 p-6 dev-card">
              <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center text-background font-bold">
                3
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg mb-2">Watch Results Live</h3>
                <p className="text-muted">
                  Real-time charts, activity feed, and prize unlocks create an engaging experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrandShell>
  )
}
