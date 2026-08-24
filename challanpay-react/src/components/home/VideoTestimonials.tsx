import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useModalA11y } from '@/hooks/useModalA11y'

interface VideoItem {
  id: number
  src: string
}

const videos: VideoItem[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  src: `/videos/V${i + 1}.mp4`,
}))

export function VideoTestimonials() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null)
  const { t } = useTranslation()
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const openVideo = (src: string) => setActiveVideo(src)
  const closeVideo = () => setActiveVideo(null)

  useModalA11y(activeVideo !== null, closeVideo)

  const updateScrollState = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < maxScroll - 4)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [updateScrollState])

  const scrollBy = (direction: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('[data-video-card]')
    const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.8
    el.scrollBy({ left: direction * step, behavior: 'smooth' })
  }

  return (
    <section className="py-16 md:py-20 bg-bg-page">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary">
            {t.videoTestimonials.title}
          </h2>
          <p className="font-body text-text-secondary mt-3 text-lg">
            {t.videoTestimonials.subtitle}
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Nav buttons (desktop) */}
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            disabled={!canScrollLeft}
            aria-label="Scroll to previous videos"
            className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] items-center justify-center text-text-primary hover:bg-gray-50 transition-all disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            disabled={!canScrollRight}
            aria-label="Scroll to next videos"
            className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] items-center justify-center text-text-primary hover:bg-gray-50 transition-all disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Track */}
          <div
            ref={trackRef}
            className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory py-3 pb-4 -mx-6 px-6 sm:-mx-8 sm:px-8 md:mx-0 md:px-0 scrollbar-hide scroll-smooth"
          >
            {videos.map((video) => (
              <div
                key={video.id}
                data-video-card
                className="flex-shrink-0 w-[55vw] max-w-[220px] md:w-[calc((100%-4*1rem)/5)] md:max-w-none snap-center"
              >
                <div
                  className="aspect-[9/16] cursor-pointer group"
                  onClick={() => openVideo(video.src)}
                >
                  <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black transition-transform duration-300 group-hover:scale-[1.02]">
                    {/* Video preview / thumbnail */}
                    <video
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    >
                      <source src={video.src} type="video/mp4" />
                    </video>

                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/95 flex items-center justify-center z-10"
                        aria-label="Play video testimonial"
                      >
                        <Play className="w-4 h-4 md:w-5 md:h-5 text-red-500 ml-0.5" fill="currentColor" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={closeVideo}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative w-full max-w-sm bg-black rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeVideo}
                className="absolute top-3 right-3 z-20 w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="aspect-[9/16] max-h-[90vh] flex items-center justify-center bg-black">
                <video
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                >
                  <source src={activeVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
