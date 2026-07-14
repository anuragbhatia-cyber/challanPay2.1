import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Phone } from 'lucide-react'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils'

export function NeedHelpSection() {
  const { t } = useTranslation()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const handleWhatsAppClick = () => {
    window.open(
      'https://wa.me/919988441033?text=Hi%2C%20I%20need%20help%20with%20my%20challan',
      '_blank'
    )
  }

  return (
    <section id="support" className="py-16 md:py-20 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary">
              {t.needHelp.title}
            </h2>
            <p className="font-body text-text-secondary mt-3 text-lg">
              {t.needHelp.subtitle}
            </p>
          </div>
        </ScrollReveal>

        {/* Help Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
          {/* WhatsApp Card */}
          <ScrollReveal delay={0.1}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleWhatsAppClick}
              className="w-full flex items-center justify-start gap-4 p-6 rounded-2xl border border-border bg-white hover:bg-gray-50 transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-[#25D366]"
                  viewBox="0 0 512 512"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M317.12 285.93c-9.69 3.96-15.88 19.13-22.16 26.88-3.22 3.97-7.06 4.59-12.01 2.6-36.37-14.49-64.25-38.76-84.32-72.23-3.4-5.19-2.79-9.29 1.31-14.11 6.06-7.14 13.68-15.25 15.32-24.87 3.64-21.28-24.18-87.29-60.92-57.38C48.62 232.97 330.7 461.46 381.61 337.88c14.4-35.03-48.43-58.53-64.49-51.95zM256 467.28c-37.39 0-74.18-9.94-106.39-28.76-5.17-3.03-11.42-3.83-17.2-2.26l-69.99 19.21 24.38-53.71a22.34 22.34 0 0 0-2.22-22.32C58.5 343.29 44.71 300.61 44.71 256c0-116.51 94.78-211.29 211.29-211.29S467.28 139.49 467.28 256c0 116.5-94.78 211.28-211.28 211.28zM256 0C114.84 0 0 114.84 0 256c0 49.66 14.1 97.35 40.89 138.74L2 480.39a22.37 22.37 0 0 0 3.34 23.76A22.403 22.403 0 0 0 22.36 512c14.42 0 93.05-24.71 113.06-30.2C172.41 501.59 213.9 512 256 512c141.15 0 256-114.85 256-256C512 114.84 397.15 0 256 0z" />
                </svg>
              </div>
              <h3 className="font-display text-base font-semibold text-text-primary">
                {t.needHelp.whatsAppTitle}
              </h3>
            </motion.button>
          </ScrollReveal>

          {/* Click to Call Card */}
          <ScrollReveal delay={0.2}>
            <motion.a
              href="tel:+919988441033"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-start gap-4 p-6 rounded-2xl border border-border bg-white hover:bg-gray-50 transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display text-base font-semibold text-text-primary">
                {t.needHelp.callTitle}
              </h3>
            </motion.a>
          </ScrollReveal>
        </div>

        {/* FAQs */}
        <div className="max-w-4xl mx-auto mt-14">
          <ScrollReveal>
            <div className="text-center mb-8">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-text-primary">
                {t.faq.title}
              </h3>
              <p className="text-text-secondary mt-2">
                {t.faq.subtitle}
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-3">
            {[
              { question: t.faq.q1, answer: t.faq.a1 },
              { question: t.faq.q2, answer: t.faq.a2 },
              { question: t.faq.q3, answer: t.faq.a3 },
              { question: t.faq.q4, answer: t.faq.a4 },
              { question: t.faq.q5, answer: t.faq.a5 },
              { question: t.faq.q6, answer: t.faq.a6 },
              { question: t.faq.q7, answer: t.faq.a7 },
              { question: t.faq.q8, answer: t.faq.a8 },
            ].map((faq, i) => {
              const isOpen = openIndex === i
              return (
                <ScrollReveal key={i} delay={i * 0.05}>
                  <div className="bg-white rounded-xl border border-border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <h4 className="font-display font-semibold text-sm text-text-primary">
                        {faq.question}
                      </h4>
                      <ChevronDown
                        className={cn(
                          'w-5 h-5 text-text-light flex-shrink-0 transition-transform',
                          isOpen && 'rotate-180'
                        )}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <p className="text-sm text-text-secondary leading-relaxed px-5 pb-5">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
