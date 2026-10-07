import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import {
  Clock,
  BadgeIndianRupee,
  ShieldCheck,
  ArrowRight,
  Scale,
  Car,
  FileText,
  ShieldAlert,
  CalendarClock,
  Wrench,
  Truck,
  MapPin,
  Layers,
  MessageCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Quote,
  Star,
} from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { cn } from '@/lib/utils'

const WHATSAPP_URL =
  'https://wa.me/919988441033?text=Hi%2C%20I%20need%20help%20with%20a%20court%20challan%20via%20ChallanPay%20Xpress'

interface UseCase {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

const WHO_IS_IT_FOR: UseCase[] = [
  {
    icon: Scale,
    title: 'Court challan pending',
    description:
      'A traffic challan sent to court is holding up your paperwork or peace of mind.',
  },
  {
    icon: Car,
    title: 'Vehicle sale coming up',
    description:
      'You have a buyer lined up and need the challan cleared before the handover.',
  },
  {
    icon: FileText,
    title: 'RC transfer pending',
    description:
      'An unresolved court challan is blocking the Registration Certificate transfer.',
  },
  {
    icon: ShieldAlert,
    title: 'Insurance renewal approaching',
    description:
      'Your renewal date is near and a pending court challan is standing in the way.',
  },
  {
    icon: CalendarClock,
    title: 'Fitness certificate renewal',
    description:
      'Fitness renewal requires a clean record — Xpress helps clear eligible challans in time.',
  },
  {
    icon: Wrench,
    title: 'Loan or vehicle documentation',
    description:
      'A lender or buyer needs documents that depend on no pending court challan.',
  },
  {
    icon: Truck,
    title: 'Commercial vehicle compliance',
    description:
      'Fleet owners and operators needing fast resolution on commercial court challans.',
  },
  {
    icon: MapPin,
    title: 'Challan from another city or state',
    description:
      "You can't travel to the issuing jurisdiction and need remote resolution.",
  },
  {
    icon: Layers,
    title: 'Multiple pending challans',
    description:
      'More than one court challan on the same vehicle — handled together where eligible.',
  },
]

interface UseCaseTopic {
  anchor: string
  heading: string
  intro: string
  keywords: string[]
  image: string
}

const USE_CASE_TOPICS: UseCaseTopic[] = [
  {
    anchor: 'court-challan-resolution',
    heading: 'Court Challan Resolution',
    intro:
      'When a traffic challan is forwarded to court, it stops being a simple online payment. ChallanPay Xpress is built for exactly this situation — eligible court challans resolved through a structured 10-day pathway, with every step tracked and transparent.',
    keywords: [
      'Court challan settlement',
      'Court challan payment',
      'Pending court challan',
      'How to clear court challan',
      'Traffic challan sent to court',
    ],
    image: '/images/blog-heading.webp',
  },
  {
    anchor: 'challan-before-vehicle-sale',
    heading: 'Challan Before Vehicle Sale',
    intro:
      "A pending court challan on your car or two-wheeler can delay — or kill — a sale. Buyers want a clean record, and most won't close until it's resolved. Xpress helps you clear eligible court challans before the handover so the sale moves forward.",
    keywords: [
      'Pending challan before selling a car',
      'Challan affecting vehicle sale',
      'Clear challan before RC transfer',
      'Vehicle sale with pending challan',
    ],
    image: '/images/BLACK-CAR.png',
  },
  {
    anchor: 'challan-rc-transfer',
    heading: 'Challan & RC Transfer',
    intro:
      'RC transfer at the RTO typically requires that there are no pending court challans against the vehicle. Xpress focuses on the eligible court challans standing between you and a clean RC transfer.',
    keywords: [
      'Challan pending for RC transfer',
      'RC transfer with pending challan',
      'Clear challan before RC transfer',
    ],
    image: '/images/CarInfo.png',
  },
  {
    anchor: 'challan-insurance-renewal',
    heading: 'Challan & Insurance Renewal',
    intro:
      "Renewing insurance with a court challan hanging over the vehicle slows down everything — from policy issuance to claims later. Xpress helps resolve the eligible court challan first, so renewal doesn't carry an avoidable risk.",
    keywords: [
      'Pending challan insurance renewal',
      'Traffic challan before insurance renewal',
      'Clear vehicle challan before insurance',
    ],
    image: '/images/Blogs-img.png',
  },
  {
    anchor: 'commercial-fleet',
    heading: 'Commercial Vehicle / Fleet Challan Resolution',
    intro:
      'For commercial operators, a pending court challan can idle a truck, cab, or delivery vehicle — costing far more than the challan itself. Xpress supports eligible commercial vehicle court challans with a predictable timeline and flat fee per challan.',
    keywords: [
      'Commercial vehicle challan',
      'Truck challan resolution',
      'Fleet challan management',
      'Pending challan for commercial vehicles',
      'Court challan for commercial vehicles',
    ],
    image: '/images/91Trucks.png',
  },
]

const WHY_XPRESS: Array<{ title: string; body: string; icon: React.ComponentType<{ className?: string }> }> = [
  {
    icon: Clock,
    title: 'Built for a 10-day pathway',
    body: 'Eligible court challans are moved on a structured timeline so you can plan your sale, RC transfer, or renewal around it.',
  },
  {
    icon: BadgeIndianRupee,
    title: 'Flat ₹3,000 per eligible challan',
    body: 'One transparent fee per eligible court challan — no mystery add-ons, no "it depends."',
  },
  {
    icon: ShieldCheck,
    title: 'Eligibility checked up front',
    body: "We confirm whether your court challan qualifies for Xpress before you commit — so you don't pay to find out.",
  },
  {
    icon: MapPin,
    title: 'Works across cities and states',
    body: 'Court challan issued somewhere you can\'t easily travel to? Xpress is designed for exactly that.',
  },
  {
    icon: Layers,
    title: 'Handles multiple challans',
    body: 'More than one eligible court challan on the vehicle? Xpress can take them on together.',
  },
  {
    icon: MessageCircle,
    title: 'Tracked and updated',
    body: 'You get status updates during the process — no chasing, no silence.',
  },
]

interface CaseStudy {
  title: string
  problem: string
  vehicleType: string
  challanSituation: string
  location: string
  requiredTimeline: string
  actionTaken: string
  resolution: string
  outcome: string
}

const CASE_STUDIES: CaseStudy[] = [
  {
    title: 'How a Pending Court Challan Was Resolved Before a Vehicle Sale',
    problem:
      'Owner had a buyer ready, but a pending court challan was blocking the RC transfer. The buyer refused to pay the balance until records were clean.',
    vehicleType: 'Private hatchback',
    challanSituation: 'Single court challan from a camera-based violation, pending for several months.',
    location: 'Issued in a different state from where the owner lived.',
    requiredTimeline: 'Sale was scheduled to close in under 2 weeks.',
    actionTaken:
      'ChallanPay Xpress eligibility check cleared the challan for the 10-day pathway. Owner paid the flat ₹3,000 Xpress fee and shared the required documents.',
    resolution:
      'The eligible court challan was resolved within the Xpress timeline, with status updates shared through the process.',
    outcome:
      'RC transfer went through without further hold-ups, and the buyer closed the sale on the originally planned date.',
  },
  {
    title: 'Insurance Renewal Protected After a Long-Pending Court Challan',
    problem:
      'Insurance renewal was weeks away and the policyholder discovered a court challan on the vehicle that would complicate paperwork.',
    vehicleType: 'Sedan — personal use',
    challanSituation: 'Court challan pending for over a year.',
    location: 'Issued in the same state as the owner.',
    requiredTimeline: 'Renewal date fixed — ~3 weeks away.',
    actionTaken:
      'Eligibility confirmed, Xpress initiated, documents submitted, status tracked through the dashboard.',
    resolution:
      'Challan resolved within the Xpress window — well before the renewal deadline.',
    outcome:
      'Insurance renewed on time, no last-minute complications on the policy side.',
  },
  {
    title: 'Fleet Operator Clears a Commercial Court Challan Without Travel',
    problem:
      'A commercial vehicle was off-route due to a pending court challan in another state. The operator could not spare time or staff to travel for a hearing.',
    vehicleType: 'Commercial goods vehicle',
    challanSituation: 'Court challan tied to a compliance issue on an inter-state trip.',
    location: 'Issued in a state 1,000+ km from the fleet base.',
    requiredTimeline: 'Vehicle needed back on route within 2 weeks.',
    actionTaken:
      'Xpress eligibility confirmed for the court challan. Fleet shared vehicle and ownership documents remotely.',
    resolution: 'Court challan resolved within the Xpress pathway, no on-ground travel required.',
    outcome: 'Vehicle was back in service on the original timeline the operator had planned for.',
  },
]

interface Testimonial {
  initials: string
  challanType: string
  location: string
  vehicleType: string
  urgency: string
  experience: string
  timeline: string
}

const BARCODE_PATTERN = [
  2, 1, 3, 1, 2, 2, 1, 3, 1, 2, 1, 3, 2, 1, 2, 1, 3, 1, 2, 2, 1, 3, 1, 2, 2, 1, 3, 1, 2, 1, 2, 3,
  1, 2, 1, 3, 2, 1, 3, 1, 2, 2, 1, 3,
]

const TESTIMONIALS: Testimonial[] = [
  {
    initials: 'R.K.',
    challanType: 'Court challan — camera-based violation',
    location: 'Issued in Delhi, owner based in Punjab',
    vehicleType: 'Private car',
    urgency: 'Needed before vehicle sale',
    experience:
      'The team confirmed eligibility, told me exactly what documents to share, and kept me updated. I did not have to travel to Delhi even once.',
    timeline: 'Resolved within the 10-day Xpress pathway.',
  },
  {
    initials: 'S.P.',
    challanType: 'Court challan — multiple pending',
    location: 'Mumbai',
    vehicleType: 'Two-wheeler',
    urgency: 'Needed before RC transfer',
    experience:
      "They checked which of my challans qualified for Xpress and were upfront about the ones that didn't. That transparency alone made me go ahead.",
    timeline: 'Eligible court challans resolved within the stated Xpress window.',
  },
  {
    initials: 'A.M.',
    challanType: 'Commercial vehicle court challan',
    location: 'Issued in Gujarat, operator based in Rajasthan',
    vehicleType: 'Commercial truck',
    urgency: 'Vehicle idle until resolved',
    experience:
      'For a fleet, idle days are a real cost. Having a flat fee and a predictable 10-day pathway made the decision easy. Status updates were clear.',
    timeline: 'Resolved within the Xpress timeline agreed up front.',
  },
  {
    initials: 'N.V.',
    challanType: 'Court challan — long-pending',
    location: 'Bengaluru',
    vehicleType: 'SUV',
    urgency: 'Insurance renewal approaching',
    experience:
      "I didn't realise the challan had gone to court until I started the renewal. Xpress took it from there and I did not have to coordinate with any lawyer directly.",
    timeline: 'Resolved before the insurance renewal deadline.',
  },
]

interface Faq {
  q: string
  a: string
}

const FAQS: Faq[] = [
  {
    q: 'What is ChallanPay Xpress?',
    a: 'ChallanPay Xpress is a service designed to help vehicle owners resolve eligible court challans on a defined 10-day pathway, with a flat ₹3,000 service fee per eligible challan.',
  },
  {
    q: 'Which court challans are eligible for Xpress?',
    a: 'Not every court challan qualifies. Eligibility depends on the nature of the challan, the issuing jurisdiction, and the status in court. We check eligibility before you commit, so you know exactly what you are paying for.',
  },
  {
    q: 'How does the 10-day resolution process work?',
    a: 'Once your challan is confirmed eligible and documents are shared, the Xpress pathway is initiated. The team manages the required steps and keeps you updated through the process — targeting resolution within 10 days.',
  },
  {
    q: 'How much does ChallanPay Xpress cost?',
    a: 'The service fee is a flat ₹3,000 per eligible court challan. There are no hidden add-ons attached to the Xpress fee itself. Government or statutory amounts, if any, remain separate and are communicated transparently.',
  },
  {
    q: 'Can I use Xpress for a challan from another state?',
    a: 'Yes. Xpress is designed to work remotely, which is especially useful when the court challan was issued in a city or state different from where you live or operate.',
  },
  {
    q: 'Can Xpress help with multiple court challans?',
    a: 'Yes. If more than one court challan on the vehicle is eligible, Xpress can take them on together. The flat ₹3,000 fee applies per eligible challan.',
  },
  {
    q: 'Can I use Xpress before selling my vehicle?',
    a: 'Yes. Clearing eligible court challans ahead of a sale is one of the most common reasons people use Xpress — it makes RC transfer smoother and gives buyers confidence.',
  },
  {
    q: 'How do I track my Xpress request?',
    a: 'You can track status through the ChallanPay dashboard once your Xpress request is initiated.',
  },
  {
    q: 'Do I need to visit the court?',
    a: 'Xpress is designed to minimise your involvement with the court directly. In the standard Xpress pathway, you are not expected to appear in court yourself.',
  },
  {
    q: 'What documents/information are required?',
    a: 'Typically, basic vehicle and ownership information along with the challan details. The team will share the exact list once your challan is confirmed eligible.',
  },
]

function useFaqStructuredData(faqs: Faq[]) {
  useEffect(() => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a,
        },
      })),
    }
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.setAttribute('data-cp-xpress-faq', 'true')
    script.textContent = JSON.stringify(data)
    document.head.appendChild(script)

    const prevTitle = document.title
    document.title = 'ChallanPay Xpress — Fast Court Challan Resolution in 10 Days'

    let descMeta = document.querySelector(
      'meta[name="description"]',
    ) as HTMLMetaElement | null
    let descCreated = false
    const prevDesc = descMeta?.content ?? null
    if (!descMeta) {
      descMeta = document.createElement('meta')
      descMeta.name = 'description'
      descCreated = true
      document.head.appendChild(descMeta)
    }
    descMeta.content =
      'ChallanPay Xpress resolves eligible court challans on a 10-day pathway for a flat ₹3,000 per challan. Clear court challans before vehicle sale, RC transfer, or insurance renewal.'

    return () => {
      script.remove()
      document.title = prevTitle
      if (descCreated) {
        descMeta?.remove()
      } else if (descMeta && prevDesc !== null) {
        descMeta.content = prevDesc
      }
    }
  }, [faqs])
}

export function ChallanPayXpressPage() {
  useFaqStructuredData(FAQS)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <PageTransition>
      <div className="bg-bg-page">
        {/* ───────────── Hero ───────────── */}
        <section className="relative overflow-hidden bg-white">
          <h1 className="sr-only">ChallanPay Xpress — Fast Court Challan Resolution</h1>

          {/* Mobile: banner on top, text + buttons below (right-aligned) */}
          <div className="md:hidden">
            <div className="relative w-full" style={{ aspectRatio: '2172 / 724' }}>
              <img
                src="/images/xpress-hero-banner.png"
                alt="ChallanPay Xpress — Solve your challan within 10 days"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </div>
            <div className="px-4 sm:px-6 py-6">
              <ScrollReveal delay={0.1}>
                <div className="flex flex-col items-start text-left gap-3">
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-text-primary leading-tight">
                    Solve Your Challan Within{' '}
                    <span className="text-primary">10 Days</span>
                  </h2>
                  <p className="font-body text-sm text-text-secondary">
                    The <em>fastest</em> way to move ahead.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Link
                      to="/#track"
                      className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-display font-semibold py-3 px-5 rounded-xl transition-colors text-sm shadow-sm"
                    >
                      Check Your Challan
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-text-primary font-display font-semibold py-3 px-5 rounded-xl transition-colors text-sm border border-border hover:border-primary"
                    >
                      <MessageCircle className="w-4 h-4 text-primary" />
                      Talk to an Expert
                    </a>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Desktop: full-width banner with overlay on right */}
          <div className="hidden md:block relative w-full h-[420px] lg:h-[500px] overflow-hidden">
            <img
              src="/images/xpress-hero-banner.png"
              alt="ChallanPay Xpress — Solve your challan within 10 days"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 pointer-events-none">
              <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-full relative">
                <ScrollReveal
                  delay={0.1}
                  className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 max-w-[600px] pointer-events-auto"
                >
                  <div className="flex flex-col items-start text-left gap-5">
                    <h2 className="font-display text-4xl lg:text-6xl font-bold text-text-primary leading-tight">
                      Solve Your Challan Within{' '}
                      <span className="text-primary">10 Days</span>
                    </h2>
                    <p className="font-body text-base lg:text-lg text-text-secondary">
                      The <em>fastest</em> way to move ahead.
                    </p>
                    <div className="flex flex-row gap-3">
                      <Link
                        to="/#track"
                        className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-display font-semibold py-3 px-5 rounded-xl transition-colors text-sm lg:text-base shadow-sm"
                      >
                        Check Your Challan
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <a
                        href={WHATSAPP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-text-primary font-display font-semibold py-3 px-5 rounded-xl transition-colors text-sm lg:text-base border border-border hover:border-primary"
                      >
                        <MessageCircle className="w-4 h-4 text-primary" />
                        Talk to an Expert
                      </a>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── Who is Xpress for? ───────────── */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
            <ScrollReveal>
              <div className="text-center mb-10">
                <h2 className="font-display text-2xl md:text-3xl font-extrabold text-text-primary">
                  Who Is ChallanPay Xpress For?
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {WHO_IS_IT_FOR.map((item, i) => {
                const Icon = item.icon
                return (
                  <ScrollReveal key={item.title} delay={i * 0.04}>
                    <div className="h-full bg-bg-page border border-border rounded-xl p-4 hover:border-primary/40 hover:bg-white hover:shadow-sm transition-all">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-display font-bold text-lg md:text-xl text-text-primary mb-1.5">
                        {item.title}
                      </h3>
                      <p className="font-body text-sm text-text-secondary leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </ScrollReveal>
                )
              })}
            </div>
          </div>
        </section>

        {/* ───────────── Why Xpress? ───────────── */}
        <section className="py-20 md:py-28 bg-bg-dark">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
            <ScrollReveal>
              <div className="text-center mb-10">
                <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white">
                  Why people choose Xpress over the usual back-and-forth
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 lg:items-stretch">
              <div className="lg:col-span-4 flex flex-col gap-4 md:gap-5 order-2 lg:order-1">
                {WHY_XPRESS.slice(0, 3).map((item, i) => (
                  <ScrollReveal key={item.title} delay={i * 0.05} className="flex-1">
                    <div className="h-full bg-white border border-border rounded-xl p-5 flex items-center gap-3 hover:shadow-sm transition-shadow">
                      <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <h3 className="font-display font-semibold text-base text-text-primary leading-snug">
                        {item.title}
                      </h3>
                    </div>
                  </ScrollReveal>
                ))}
              </div>

              <ScrollReveal
                direction="scale"
                delay={0.1}
                className="lg:col-span-4 order-1 lg:order-2 flex items-stretch justify-center"
              >
                <img
                  src="/images/xpress-hero-illustration.png"
                  alt="ChallanPay Xpress — fast court challan resolution"
                  className="w-full max-w-[420px] h-full object-cover bg-white border border-border rounded-2xl"
                  loading="lazy"
                />
              </ScrollReveal>

              <div className="lg:col-span-4 flex flex-col gap-4 md:gap-5 order-3">
                {WHY_XPRESS.slice(3, 6).map((item, i) => (
                  <ScrollReveal key={item.title} delay={i * 0.05} className="flex-1">
                    <div className="h-full bg-white border border-border rounded-xl p-5 flex items-center gap-3 hover:shadow-sm transition-shadow">
                      <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <h3 className="font-display font-semibold text-base text-text-primary leading-snug">
                        {item.title}
                      </h3>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── Use-case deep sections ───────────── */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
            <ScrollReveal>
              <div className="text-center mb-16 md:mb-20">
                <h2 className="font-display text-2xl md:text-3xl font-extrabold text-text-primary">
                  Real court challan situations Xpress is built for
                </h2>
              </div>
            </ScrollReveal>

            <UseCaseCarousel topics={USE_CASE_TOPICS} />
          </div>
        </section>

        {/* ───────────── Case studies ───────────── */}
        <section className="py-20 md:py-28 bg-bg-page">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
            <ScrollReveal>
              <div className="text-center mb-10">
                <h2 className="font-display text-2xl md:text-3xl font-extrabold text-text-primary">
                  ChallanPay Xpress — Real resolution stories
                </h2>
              </div>
            </ScrollReveal>

            <div className="space-y-6">
              {CASE_STUDIES.map((cs, i) => (
                <ScrollReveal key={cs.title} delay={i * 0.06}>
                  <article className="bg-white border border-border rounded-xl overflow-hidden">
                    <div className="p-5 md:p-6 border-b border-border bg-gradient-to-br from-primary/5 to-transparent">
                      <h3 className="font-display text-base md:text-lg font-bold text-text-primary">
                        {cs.title}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                      <CaseField label="Problem" value={cs.problem} />
                      <CaseField label="Vehicle type" value={cs.vehicleType} />
                      <CaseField label="Challan situation" value={cs.challanSituation} />
                      <CaseField label="Location" value={cs.location} />
                      <CaseField label="Required timeline" value={cs.requiredTimeline} />
                      <CaseField label="Action taken" value={cs.actionTaken} />
                      <CaseField label="Resolution" value={cs.resolution} />
                      <CaseField label="Customer outcome" value={cs.outcome} highlight />
                    </div>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────── Testimonials ───────────── */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
            <ScrollReveal>
              <div className="text-center mb-16 md:mb-20">
                <h2 className="font-display text-2xl md:text-3xl font-extrabold text-text-primary">
                  What ChallanPay Xpress customers tell us
                </h2>
              </div>
            </ScrollReveal>

            <TestimonialsCarousel items={TESTIMONIALS} />
          </div>
        </section>

        {/* ───────────── FAQ ───────────── */}
        <section id="xpress-faq" className="py-14 md:py-20 bg-bg-page scroll-mt-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <ScrollReveal>
              <div className="text-center mb-10">
                <h2 className="font-display text-2xl md:text-3xl font-extrabold text-text-primary">
                  Frequently asked questions
                </h2>
              </div>
            </ScrollReveal>

            <div className="space-y-3">
              {FAQS.map((f, i) => {
                const isOpen = openFaq === i
                return (
                  <ScrollReveal key={f.q} delay={Math.min(i, 6) * 0.03}>
                    <div
                      className={cn(
                        'bg-white rounded-xl border transition-colors',
                        isOpen ? 'border-primary/40 shadow-sm' : 'border-border',
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        className="w-full flex items-start justify-between gap-4 text-left p-4 md:p-5"
                      >
                        <span className="font-display font-semibold text-sm text-text-primary">
                          {f.q}
                        </span>
                        <ChevronDown
                          className={cn(
                            'w-4 h-4 text-text-secondary shrink-0 transition-transform',
                            isOpen && 'rotate-180 text-primary',
                          )}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 md:px-5 pb-4 md:pb-5">
                          <p className="font-body text-sm text-text-secondary leading-relaxed">{f.a}</p>
                        </div>
                      )}
                    </div>
                  </ScrollReveal>
                )
              })}
            </div>
          </div>
        </section>

      </div>
    </PageTransition>
  )
}

function UseCaseCarousel({ topics }: { topics: UseCaseTopic[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const n = topics.length
  const slides = useMemo(() => [...topics, ...topics, ...topics], [topics])
  const isAdjustingRef = useRef(false)

  const findClosestChildIndex = () => {
    const el = scrollerRef.current
    if (!el) return 0
    const center = el.scrollLeft + el.clientWidth / 2
    let closest = 0
    let closestDist = Infinity
    for (let i = 0; i < el.children.length; i++) {
      const child = el.children[i] as HTMLElement
      const childCenter = child.offsetLeft - el.offsetLeft + child.clientWidth / 2
      const dist = Math.abs(childCenter - center)
      if (dist < closestDist) {
        closestDist = dist
        closest = i
      }
    }
    return closest
  }

  const scrollToChild = (childIdx: number, smooth = true) => {
    const el = scrollerRef.current
    if (!el) return
    const target = el.children[childIdx] as HTMLElement | undefined
    if (!target) return
    const left = target.offsetLeft - el.offsetLeft - (el.clientWidth - target.clientWidth) / 2
    el.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' })
  }

  // Start in the middle copy so there's room to loop in either direction
  useEffect(() => {
    isAdjustingRef.current = true
    scrollToChild(n, false)
    setActiveIndex(0)
    requestAnimationFrame(() => {
      isAdjustingRef.current = false
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n])

  // Track active dot + silently teleport back to middle copy once scroll settles in an edge copy
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    let settleTimer: number | undefined
    const onScroll = () => {
      if (isAdjustingRef.current) return
      const closest = findClosestChildIndex()
      setActiveIndex(((closest % n) + n) % n)
      if (settleTimer) window.clearTimeout(settleTimer)
      settleTimer = window.setTimeout(() => {
        const settled = findClosestChildIndex()
        if (settled < n) {
          isAdjustingRef.current = true
          scrollToChild(settled + n, false)
          requestAnimationFrame(() => {
            isAdjustingRef.current = false
          })
        } else if (settled >= 2 * n) {
          isAdjustingRef.current = true
          scrollToChild(settled - n, false)
          requestAnimationFrame(() => {
            isAdjustingRef.current = false
          })
        }
      }, 180)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      if (settleTimer) window.clearTimeout(settleTimer)
    }
  }, [n])

  useEffect(() => {
    if (isPaused) return
    const id = window.setInterval(() => {
      scrollToChild(findClosestChildIndex() + 1, true)
    }, 4000)
    return () => window.clearInterval(id)
  }, [isPaused, n])

  const handlePrev = () => scrollToChild(findClosestChildIndex() - 1, true)
  const handleNext = () => scrollToChild(findClosestChildIndex() + 1, true)
  const handleGoToIndex = (i: number) => {
    const current = findClosestChildIndex()
    const copy = Math.floor(current / n)
    scrollToChild(copy * n + i, true)
  }

  return (
    <div
      className="relative -mx-4 sm:-mx-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous use case"
        className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white border border-border shadow-md items-center justify-center text-text-primary hover:border-primary hover:text-primary transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={handleNext}
        aria-label="Next use case"
        className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white border border-border shadow-md items-center justify-center text-text-primary hover:border-primary hover:text-primary transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div
        ref={scrollerRef}
        className="flex items-stretch gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth px-[6%] md:px-[8%] pb-6"
      >
        {slides.map((topic, i) => {
          const logicalIndex = i % n
          const isActive = logicalIndex === activeIndex
          const isMiddleCopy = i >= n && i < 2 * n
          return (
            <article
              key={`${topic.anchor}-${i}`}
              id={isMiddleCopy ? topic.anchor : undefined}
              className={cn(
                'snap-center shrink-0 w-[88%] md:w-[84%] bg-bg-page border border-border rounded-2xl overflow-hidden scroll-mt-24 transition-all duration-300 origin-center min-h-[340px] md:min-h-[380px]',
                isActive ? 'scale-100 opacity-100 shadow-lg' : 'scale-[0.92] opacity-60',
              )}
            >
              <div className="grid grid-cols-1 md:grid-cols-5 h-full">
                <div className="md:col-span-2 bg-white">
                  <img
                    src={topic.image}
                    alt={topic.heading}
                    className="w-full h-64 md:h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="md:col-span-3 p-6 md:p-10 flex flex-col gap-6 justify-between">
                  <div>
                    <h3 className="font-display text-xl md:text-2xl font-bold text-text-primary mb-2">
                      {topic.heading}
                    </h3>
                    <p className="font-body text-sm md:text-base text-text-secondary leading-relaxed">
                      {topic.intro}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary mb-2">
                      Common search intents
                    </p>
                    <ul className="flex flex-col gap-y-1.5">
                      {topic.keywords.map((k) => (
                        <li
                          key={k}
                          className="flex items-center gap-2 font-body text-sm text-text-secondary"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="whitespace-nowrap">{k}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <div className="flex items-center justify-center gap-2 mt-2" role="tablist" aria-label="Use case slides">
        {topics.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => handleGoToIndex(i)}
            className={cn(
              'h-2 rounded-full transition-all',
              i === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-gray-300 hover:bg-gray-400',
            )}
          />
        ))}
      </div>
    </div>
  )
}

function TestimonialsCarousel({ items }: { items: Testimonial[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const n = items.length
  const slides = useMemo(() => [...items, ...items, ...items], [items])
  const isAdjustingRef = useRef(false)

  const findClosestChildIndex = () => {
    const el = scrollerRef.current
    if (!el) return 0
    const center = el.scrollLeft + el.clientWidth / 2
    let closest = 0
    let closestDist = Infinity
    for (let i = 0; i < el.children.length; i++) {
      const child = el.children[i] as HTMLElement
      const childCenter = child.offsetLeft - el.offsetLeft + child.clientWidth / 2
      const dist = Math.abs(childCenter - center)
      if (dist < closestDist) {
        closestDist = dist
        closest = i
      }
    }
    return closest
  }

  const scrollToChild = (childIdx: number, smooth = true) => {
    const el = scrollerRef.current
    if (!el) return
    const target = el.children[childIdx] as HTMLElement | undefined
    if (!target) return
    const left = target.offsetLeft - el.offsetLeft - (el.clientWidth - target.clientWidth) / 2
    el.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' })
  }

  useEffect(() => {
    isAdjustingRef.current = true
    scrollToChild(n, false)
    setActiveIndex(0)
    requestAnimationFrame(() => {
      isAdjustingRef.current = false
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    let settleTimer: number | undefined
    const onScroll = () => {
      if (isAdjustingRef.current) return
      const closest = findClosestChildIndex()
      setActiveIndex(((closest % n) + n) % n)
      if (settleTimer) window.clearTimeout(settleTimer)
      settleTimer = window.setTimeout(() => {
        const settled = findClosestChildIndex()
        if (settled < n) {
          isAdjustingRef.current = true
          scrollToChild(settled + n, false)
          requestAnimationFrame(() => {
            isAdjustingRef.current = false
          })
        } else if (settled >= 2 * n) {
          isAdjustingRef.current = true
          scrollToChild(settled - n, false)
          requestAnimationFrame(() => {
            isAdjustingRef.current = false
          })
        }
      }, 180)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      if (settleTimer) window.clearTimeout(settleTimer)
    }
  }, [n])

  useEffect(() => {
    if (isPaused) return
    const id = window.setInterval(() => {
      scrollToChild(findClosestChildIndex() + 1, true)
    }, 4500)
    return () => window.clearInterval(id)
  }, [isPaused, n])

  const handlePrev = () => scrollToChild(findClosestChildIndex() - 1, true)
  const handleNext = () => scrollToChild(findClosestChildIndex() + 1, true)
  const handleGoToIndex = (i: number) => {
    const current = findClosestChildIndex()
    const copy = Math.floor(current / n)
    scrollToChild(copy * n + i, true)
  }

  return (
    <div
      className="relative -mx-4 sm:-mx-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous testimonial"
        className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white border border-border shadow-md items-center justify-center text-text-primary hover:border-primary hover:text-primary transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={handleNext}
        aria-label="Next testimonial"
        className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white border border-border shadow-md items-center justify-center text-text-primary hover:border-primary hover:text-primary transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div
        ref={scrollerRef}
        className="flex items-stretch gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth px-[6%] md:px-[22%] pb-6"
      >
        {slides.map((t, i) => {
          const logicalIndex = i % n
          const isActive = logicalIndex === activeIndex
          return (
            <article
              key={`${t.initials}-${i}`}
              className={cn(
                'snap-center shrink-0 w-[88%] md:w-[56%] relative transition-all duration-300 origin-center text-white',
                isActive ? 'scale-100 opacity-100' : 'scale-[0.94] opacity-60',
              )}
            >
              <img
                src="/images/resolved-stamp.png"
                alt=""
                aria-hidden="true"
                className="absolute top-4 right-2 md:top-6 md:right-3 w-24 md:w-32 lg:w-36 rotate-[-14deg] opacity-90 pointer-events-none z-10 drop-shadow-sm"
              />
              <svg
                className="block w-full"
                height="10"
                preserveAspectRatio="none"
                viewBox="0 0 40 10"
                aria-hidden="true"
              >
                <path
                  d="M0,10 L2,0 L4,10 L6,0 L8,10 L10,0 L12,10 L14,0 L16,10 L18,0 L20,10 L22,0 L24,10 L26,0 L28,10 L30,0 L32,10 L34,0 L36,10 L38,0 L40,10 Z"
                  fill="currentColor"
                />
              </svg>
              <div
                className={cn(
                  'bg-white bg-[url(/images/crumpled-paper-texture.png)] bg-cover bg-center px-6 md:px-10 py-6 md:py-8',
                  isActive && 'shadow-lg',
                )}
              >
                <div className="mb-8 md:mb-10">
                  <p className="font-display text-base md:text-lg font-extrabold tracking-wider text-text-primary leading-none">
                    COURT CHALLAN
                  </p>
                  <p className="font-body text-[10px] md:text-xs font-semibold uppercase tracking-wider text-red-600 mt-1.5">
                    Pending since 48 months
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-6 md:gap-y-7 mb-6">
                  <TestimonialMeta label="Challan type" value={t.challanType} />
                  <TestimonialMeta label="Location" value={t.location} />
                  <TestimonialMeta label="Vehicle" value={t.vehicleType} />
                  <TestimonialMeta label="Urgency" value={t.urgency} />
                  <TestimonialMeta
                    label="Timeline"
                    value={t.timeline}
                    className="col-span-2"
                  />
                </dl>

                <div className="border-t border-dashed border-text-light/60 mb-5" />

                <div className="flex items-center gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className="w-3.5 h-3.5 text-amber-400"
                      fill="currentColor"
                      strokeWidth={0}
                    />
                  ))}
                </div>
                <p className="font-body text-sm md:text-base text-text-primary leading-relaxed italic mb-5">
                  <Quote className="inline w-4 h-4 text-primary/40 mr-1 -mt-1" />
                  {t.experience}
                </p>

                <div className="flex items-end justify-between gap-3 pt-2">
                  <div className="flex gap-[2px] items-end h-7 overflow-hidden scale-75 origin-left" aria-hidden="true">
                    {BARCODE_PATTERN.map((w, idx) => (
                      <span
                        key={idx}
                        className="block bg-text-primary h-full"
                        style={{ width: `${w}px` }}
                      />
                    ))}
                  </div>
                  <p className="font-display text-[10px] md:text-xs font-extrabold tracking-widest text-emerald-600 text-right leading-tight">
                    RESOLVED BY
                    <br />
                    CHALLANPAY XPRESS
                  </p>
                </div>
              </div>
              <svg
                className="block w-full rotate-180"
                height="10"
                preserveAspectRatio="none"
                viewBox="0 0 40 10"
                aria-hidden="true"
              >
                <path
                  d="M0,10 L2,0 L4,10 L6,0 L8,10 L10,0 L12,10 L14,0 L16,10 L18,0 L20,10 L22,0 L24,10 L26,0 L28,10 L30,0 L32,10 L34,0 L36,10 L38,0 L40,10 Z"
                  fill="currentColor"
                />
              </svg>
            </article>
          )
        })}
      </div>

      <div className="flex items-center justify-center gap-2 mt-2" role="tablist" aria-label="Testimonials">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={`Go to testimonial ${i + 1}`}
            onClick={() => handleGoToIndex(i)}
            className={cn(
              'h-2 rounded-full transition-all',
              i === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-gray-300 hover:bg-gray-400',
            )}
          />
        ))}
      </div>
    </div>
  )
}

function HeroPill({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-white rounded-full border border-border px-3 py-1.5">
      <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
      <span className="font-body text-xs font-semibold text-text-primary leading-tight">{label}</span>
    </div>
  )
}

function CaseField({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'p-4 md:p-5',
        highlight && 'bg-emerald-50/60',
      )}
    >
      <p className="text-[10px] uppercase tracking-wider font-bold text-text-light mb-1">
        {label}
      </p>
      <p
        className={cn(
          'font-body text-sm leading-relaxed',
          highlight ? 'text-emerald-900 font-medium' : 'text-text-secondary',
        )}
      >
        {value}
      </p>
    </div>
  )
}

function TestimonialMeta({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={className}>
      <dt className="font-body text-xs md:text-sm uppercase tracking-wider font-bold text-text-primary">{label}</dt>
      <dd className="font-body text-xs text-text-secondary">{value}</dd>
    </div>
  )
}
