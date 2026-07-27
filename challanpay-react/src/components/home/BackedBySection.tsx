import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { useTranslation } from '@/hooks/useTranslation'

export function BackedBySection() {
  const { t } = useTranslation()

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <ScrollReveal>
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary">
              {t.backedBy.title}
            </h2>
            <p className="font-body text-text-secondary mt-3 text-lg">
              {t.backedBy.subtitle}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {[
            { src: '/images/backed-meity.png', alt: 'MeitY Startup Hub', size: 'max-h-10 md:max-h-12' },
            { src: '/images/backed-ia.png', alt: 'India Accelerator', size: 'max-h-14 md:max-h-18' },
            { src: '/images/backed-zerodha.png', alt: 'Zerodha', size: 'max-h-4 md:max-h-5' },
            { src: '/images/backed-finvolve.png', alt: 'Finvolve', size: 'max-h-5 md:max-h-6' },
            { src: '/images/backed-turbostart.png', alt: 'TurboStart', size: 'max-h-7 md:max-h-8' },
          ].map((logo, i) => (
            <ScrollReveal key={logo.alt} delay={i * 0.08}>
              <div className="flex items-center justify-center bg-gray-50 rounded-2xl border border-border p-5 md:p-6 h-20 md:h-24">
                <img src={logo.src} alt={logo.alt} className={`${logo.size} w-auto object-contain`} />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
