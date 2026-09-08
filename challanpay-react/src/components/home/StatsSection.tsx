import { useRef, useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

export function StatsSection() {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlay = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = false
    video.play()
    setIsPlaying(true)
  }

  const stats = [
    { icon: '/images/Frame-1618873258.png', number: '30 Lakhs+', label: t.stats.vehiclesProtected },
    { icon: '/images/Frame-1618873259.png', number: '2.5 Lakhs+', label: t.stats.challansResolved },
    { icon: '/images/Frame-1618873261.png', number: '65,000+', label: t.stats.legalIncidentsResolved },
    { icon: '/images/Frame-1618873259.png', number: '80,000+', label: t.stats.lawyersNetwork },
    { icon: '/images/Frame-1618873260.png', number: '99%', label: t.stats.successfulResolutions },
    { icon: '/images/Frame-1618873258.png', number: '98%', label: t.stats.pinCodesCovered },
  ]

  const renderCard = (stat: typeof stats[number], key: string) => (
    <div
      key={key}
      className="flex flex-col items-center text-center gap-2 p-3 sm:p-3.5 md:p-4 rounded-2xl bg-muted/50 border border-transparent h-full"
    >
      <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 flex-shrink-0 flex items-center justify-center">
        <img
          src={stat.icon}
          alt={`${stat.label} Icon`}
          className="w-full h-full object-contain"
        />
      </div>
      <div>
        <div className="font-display text-xl sm:text-2xl md:text-2xl font-bold text-primary leading-tight">
          {stat.number}
        </div>
        <div className="font-body text-xs sm:text-sm md:text-base text-text-secondary mt-0.5 leading-tight">
          {stat.label}
        </div>
      </div>
    </div>
  )

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        {/* Mobile: stats on top, video below | Desktop: stats left, video right */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-14 lg:items-center">
          {/* Stats grid */}
          <div className="lg:flex-1 lg:min-w-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-4">
              {stats.map((stat, index) => (
                <div key={`grid-${index}`}>
                  {renderCard(stat, `card-${index}`)}
                </div>
              ))}
            </div>
          </div>

          {/* Video — right */}
          <div className="lg:w-[41%] lg:flex-shrink-0">
            <div className="relative w-full aspect-video rounded-2xl bg-black overflow-hidden shadow-md group">
              <video
                ref={videoRef}
                src="/videos/stats-hero.mp4"
                controls={isPlaying}
                loop
                muted
                playsInline
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                className="w-full h-full object-cover"
              />
              {!isPlaying && (
                <button
                  type="button"
                  onClick={handlePlay}
                  aria-label="Play video"
                  className="absolute inset-0 flex items-center justify-center bg-black/25 hover:bg-black/35 transition-colors cursor-pointer"
                >
                  <span className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/95 shadow-xl group-hover:scale-105 transition-transform">
                    <svg
                      className="w-9 h-9 sm:w-10 sm:h-10 text-primary ml-0.5"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
