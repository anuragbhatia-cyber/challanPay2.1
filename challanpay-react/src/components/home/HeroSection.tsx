import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/stores/userStore'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { useTranslation } from '@/hooks/useTranslation'

export function HeroSection() {
  const [vehicleInput, setVehicleInput] = useState('')
  const [inputError, setInputError] = useState('')
  const [shake, setShake] = useState(false)
  const { setVehicleNumber, openVerificationModal } = useUserStore()
  const { t } = useTranslation()

  const handleCheck = () => {
    if (!vehicleInput.trim()) {
      setInputError('Please enter a vehicle number')
      setShake(true)
      setTimeout(() => setShake(false), 400)
      return
    }
    setInputError('')
    setVehicleNumber(vehicleInput.trim().toUpperCase())
    openVerificationModal()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCheck()
    }
  }

  return (
    <section
      id="track"
      className="relative pt-16 md:pt-28 overflow-hidden bg-bg-page"
    >
      {/* Hero background — desktop only (mobile uses the composite image below) */}
      <div
        className="hidden md:block absolute inset-0 bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: "url('/images/hero-bg.png')",
          backgroundSize: '100% auto',
          backgroundPosition: '-6vw bottom',
        }}
        aria-hidden="true"
      />
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-3 md:pt-10 pb-2 md:pb-4 relative z-10">
        {/* Mobile-only composite hero image (text + person baked in) */}
        <img
          src="/images/hero-mobile-full.png"
          alt="ChallanPay, Anytime Anywhere — #Be Road Smart"
          className="md:hidden w-full h-auto block mb-4"
        />
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6 md:gap-12 items-start">
          {/* Left Column - Text (desktop only — mobile uses the image above) */}
          <div className="hidden md:block text-left">
            {/* Tagline */}
            <ScrollReveal>
              <p className="font-display font-extrabold uppercase tracking-wider text-sm sm:text-base md:text-lg mb-3 [text-shadow:0_2px_8px_rgba(255,255,255,0.8)]">
                <span className="text-[#EE2E2D]">#BE</span>{' '}
                <span className="text-[#F49925]">ROAD</span>{' '}
                <span className="text-[#2CB87B]">SMART</span>
              </p>
            </ScrollReveal>

            {/* Heading */}
            <ScrollReveal delay={0.05}>
              <h1 className="font-display text-4xl sm:text-5xl md:text-[4.25rem] font-extrabold text-text-primary mb-4 md:mb-6 leading-tight">
                {t.hero.title}
              </h1>
            </ScrollReveal>

            {/* Subtext */}
            <ScrollReveal delay={0.1}>
              <p className="font-body text-base md:text-xl text-text-secondary mb-8 md:mb-14 max-w-[70%] md:max-w-lg">
                {t.hero.subtitle}
              </p>
            </ScrollReveal>
          </div>

          {/* Right Column - Challan Check Card */}
          <ScrollReveal direction="scale" delay={0.2}>
            <div className="bg-white rounded-3xl shadow-[0_2px_14px_rgba(0,0,0,0.06)] p-6 md:p-8 max-w-[420px] mx-auto md:ml-auto md:mr-0 w-full relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-semibold text-text-primary">
                  {t.hero.enterVehicleNumber}
                </h3>
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-extrabold bg-emerald-100 text-emerald-700 rounded-full tracking-wide animate-shimmer">
                  <Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />
                  {t.hero.free}
                </span>
              </div>

              {/* Input group */}
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
          </ScrollReveal>
        </div>

      </div>
    </section>
  )
}
