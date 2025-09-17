import Image from 'next/image'
import Link from 'next/link'

export function DevAirBadge() {
  return (
    <div className="fixed top-4 right-4 z-50">
      <Link 
        href="https://devair.io" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 hover:bg-white/20 transition-all duration-200 group"
      >
        <span className="text-sm text-white/80 group-hover:text-white transition-colors">
          Built with ❤️ by
        </span>
        <Image 
          src="/images/logo.svg" 
          alt="DevAir" 
          width={80} 
          height={28}
          className="opacity-90 group-hover:opacity-100 transition-opacity"
        />
      </Link>
    </div>
  )
}
