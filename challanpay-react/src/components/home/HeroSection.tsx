import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/stores/userStore'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { useTranslation } from '@/hooks/useTranslation'

const SLIDE_INTERVAL_MS = 6000

const slides = [
  {
    image: '/images/hero-slide-1.png',
    mobileImage: '/images/hero-slide-1-mobile.png',
    alt: 'ChallanPay, Anytime Anywhere — #Be Road Smart',
  },
  {
    image: '/images/hero-slide-2.png',
    mobileImage: '/images/hero-slide-2-mobile.png',
    alt: 'ChallanPay XPress — The Fastest Way To Clear Your Traffic Challan',
  },
]

export function HeroSection() {
  const [vehicleInput, setVehicleInput] = useState('')
  const [inputError, setInputError] = useState('')
  const [shake, setShake] = useState(false)
  const [slideIndex, setSlideIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const { userName, setVehicleNumber, openVerificationModal } = useUserStore()
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    if (isPaused || slides.length <= 1) return
    const id = window.setInterval(() => {
      setSlideIndex((i) => (i + 1) % slides.length)
    }, SLIDE_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [isPaused])

  const handleCheck = () => {
    if (!vehicleInput.trim()) {
      setInputError('Please enter a vehicle number')
      setShake(true)
      setTimeout(() => setShake(false), 400)
      return
    }
    setInputError('')
    const vn = vehicleInput.trim().toUpperCase()
    setVehicleNumber(vn)
    if (userName) {
      navigate(`/loading?vehicle=${encodeURIComponent(vn)}`)
    } else {
      openVerificationModal()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCheck()
    }
  }

  const cardContent = (
    <div className="bg-white rounded-3xl shadow-[0_2px_14px_rgba(0,0,0,0.06)] p-6 md:p-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg font-semibold text-text-primary">
          {t.hero.enterVehicleNumber}
        </h3>
        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-extrabold bg-emerald-100 text-emerald-700 rounded-full tracking-wide animate-shimmer">
          <Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />
          {t.hero.free}
        </span>
      </div>

      <div className="space-y-5">
        <div>
          <motion.div
            animate={shake ? { x: [-6, 6, -4, 4, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className={cn(
              'flex items-center bg-[#F7F8FA] border-2 rounded-[14px] overflow-hidden focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(8,145,178,0.1)] transition-all',
              inputError ? 'border-red-400' : 'border-[#E5E7EB]'
            )}
          >
            <div className="flex items-center gap-1.5 px-3 py-3.5 border-r border-[#E5E7EB]">
              <img
                src="/images/flag.png"
                alt="India Flag"
                className="w-7 h-auto object-contain"
              />
            </div>
            <input
              id="hero-vehicle"
              type="text"
              value={vehicleInput}
              onChange={(e) => {
                setVehicleInput(e.target.value.toUpperCase())
                if (inputError) setInputError('')
              }}
              onKeyDown={handleKeyDown}
              placeholder={t.hero.placeholder}
              aria-label="Vehicle number"
              maxLength={12}
              aria-invalid={inputError ? true : undefined}
              aria-describedby={inputError ? 'hero-vehicle-error' : undefined}
              className="flex-1 px-4 py-3.5 text-base font-body font-medium text-text-primary placeholder:text-gray-500 placeholder:normal-case outline-none bg-transparent uppercase tracking-wider"
            />
          </motion.div>
          {inputError && (
            <p id="hero-vehicle-error" role="alert" className="text-xs text-red-500 mt-1.5 font-body">
              {inputError}
            </p>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCheck}
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-display font-semibold py-4 px-6 rounded-[14px] transition-colors text-base"
        >
          {t.hero.checkChallans}
        </motion.button>

        <div className="mt-0 flex flex-col items-center text-center py-2 px-6 rounded-2xl bg-[radial-gradient(ellipse_65%_90%_at_50%_50%,rgba(8,145,178,0.32)_0%,rgba(8,145,178,0.12)_45%,transparent_75%)]">
          <span className="font-display text-2xl md:text-3xl font-bold text-primary">
            ₹75 Crore+
          </span>
          <span className="font-body font-medium text-base text-primary-dark mt-0.5">
            Savings on Legal Fees
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <section id="track" className="relative overflow-hidden bg-white">
      {/* Mobile: banner carousel + card stacked below */}
      <div className="md:hidden">
        <div
          className="relative w-full"
          style={{ aspectRatio: '1717 / 700' }}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={`m-${slideIndex}`}
              src={slides[slideIndex].mobileImage}
              alt={slides[slideIndex].alt}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </AnimatePresence>

          {/* Dots */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10" role="tablist" aria-label="Hero banner slides">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === slideIndex}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setSlideIndex(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.15)]',
                  i === slideIndex ? 'w-6 bg-primary' : 'w-1.5 bg-gray-300'
                )}
              />
            ))}
          </div>
        </div>

        <div className="px-4 sm:px-6 pb-8 pt-4">
          <ScrollReveal direction="scale">
            <div className="max-w-[420px] mx-auto">{cardContent}</div>
          </ScrollReveal>
        </div>
      </div>

      {/* Desktop: full-width banner carousel with card overlaid on the right */}
      <div
        className="hidden md:block relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative w-full h-[380px] lg:h-[420px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={slideIndex}
              src={slides[slideIndex].image}
              alt={slides[slideIndex].alt}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full object-contain object-left"
            />
          </AnimatePresence>

          {/* Card overlay — constrained to 1280px container, pinned right */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-full relative">
              <ScrollReveal
                direction="scale"
                delay={0.2}
                className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-full max-w-[420px] pointer-events-auto"
              >
                {cardContent}
              </ScrollReveal>
            </div>
          </div>

          {/* Dots */}
          <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-20" role="tablist" aria-label="Hero banner slides">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === slideIndex}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setSlideIndex(i)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.15)]',
                  i === slideIndex ? 'w-8 bg-primary' : 'w-2 bg-white/80 hover:bg-white'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
