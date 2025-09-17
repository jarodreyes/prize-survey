import Image from 'next/image'

export function DevAirBadge() {
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
        <span className="text-sm text-white/80">
          Built with ❤️ by
        </span>
        <Image 
          src="/images/logo.svg" 
          alt="DevAir" 
          width={80} 
          height={28}
          className="opacity-90"
        />
      </div>
    </div>
  )
}
