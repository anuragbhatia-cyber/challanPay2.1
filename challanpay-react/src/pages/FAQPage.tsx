import { PageTransition } from '@/components/shared/PageTransition'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { useTranslation } from '@/hooks/useTranslation'

interface FAQItem {
  question: string
  answer: string
}

export function FAQPage() {
  const { t } = useTranslation()

  const FAQS: FAQItem[] = [
    { question: t.faq.q1, answer: t.faq.a1 },
    { question: t.faq.q2, answer: t.faq.a2 },
    { question: t.faq.q3, answer: t.faq.a3 },
    { question: t.faq.q4, answer: t.faq.a4 },
    { question: t.faq.q5, answer: t.faq.a5 },
    { question: t.faq.q6, answer: t.faq.a6 },
    { question: t.faq.q7, answer: t.faq.a7 },
    { question: t.faq.q8, answer: t.faq.a8 },
  ]

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <ScrollReveal>
          <div className="text-center">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-3">
              {t.faq.badge}
            </span>
            <h1 className="font-display text-3xl font-bold text-text-primary">
              {t.faq.title}
            </h1>
            <p className="text-text-secondary mt-2">
              {t.faq.subtitle}
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <ScrollReveal key={i} delay={i * 0.05}>
              <div className="bg-white rounded-xl border border-border p-5">
                <h2 className="font-display font-semibold text-sm text-text-primary mb-2">
                  {faq.question}
                </h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
