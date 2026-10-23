import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
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
  AlertTriangle,
  RefreshCw,
  User,
  Plus,
  Minus,
  Search,
  ArrowRightLeft,
} from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/stores/userStore'

interface UseCase {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

const WHO_IS_IT_FOR: UseCase[] = [
  {
    icon: Scale,
    title: 'Pending court challan',
    description:
      'A court-pending traffic challan is delaying your paperwork or causing unnecessary stress.',
  },
  {
    icon: Car,
    title: 'Planning to Sell Your Vehicle',
    description:
      'You have a buyer ready and need the challan resolved before transferring ownership.',
  },
  {
    icon: FileText,
    title: 'RC Transfer Delayed',
    description:
      'An unresolved court challan is holding up your Registration Certificate transfer.',
  },
  {
    icon: ShieldAlert,
    title: 'Insurance Renewal Due Soon',
    description:
      'Your renewal date is approaching, and a pending court challan may delay the process.',
  },
  {
    icon: CalendarClock,
    title: 'Fitness Certificate Renewal',
    description:
      'Your fitness renewal is due, and Xpress helps resolve eligible challans on time.',
  },
  {
    icon: Wrench,
    title: 'Loan or Vehicle Paperwork',
    description:
      'A lender or buyer needs documents cleared of pending court challans.',
  },
  {
    icon: Truck,
    title: 'Commercial Vehicle Compliance',
    description:
      'Fleet owners and operators seeking timely resolution of commercial court challans.',
  },
  {
    icon: MapPin,
    title: 'Out-of-State or City Challan',
    description:
      "You can't visit the issuing jurisdiction and need convenient remote assistance.",
  },
  {
    icon: Layers,
    title: 'Multiple Outstanding Challans',
    description:
      'Several court challans for one vehicle can be managed together, subject to eligibility.',
  },
]

interface UseCaseTopic {
  anchor: string
  heading: string
  intro: string
  keywords: string[]
  image: string
  badge: {
    icon: React.ComponentType<{ className?: string }>
    label: string
  }
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
    ],
    image: '/images/blog-heading.webp',
    badge: { icon: Scale, label: 'Court Resolution' },
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
    badge: { icon: ShieldCheck, label: 'Safe Vehicle Sale' },
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
      'RC transfer paperwork',
    ],
    image: '/images/CarInfo.png',
    badge: { icon: FileText, label: 'RC Transfer' },
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
      'Insurance renewal with challan',
    ],
    image: '/images/Blogs-img.png',
    badge: { icon: ShieldAlert, label: 'Insurance Renewal' },
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
      'Court challan for commercial vehicles',
    ],
    image: '/images/91Trucks.png',
    badge: { icon: Truck, label: 'Fleet Compliance' },
  },
]

const KEYWORD_TILES: Array<{
  icon: React.ComponentType<{ className?: string }>
  bg: string
  text: string
}> = [
  { icon: Search, bg: 'bg-sky-100', text: 'text-sky-600' },
  { icon: FileText, bg: 'bg-amber-100', text: 'text-amber-600' },
  { icon: ArrowRightLeft, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { icon: Car, bg: 'bg-purple-100', text: 'text-purple-600' },
]

function splitHeading(heading: string): [string, string] {
  const words = heading.split(' ')
  if (words.length <= 1) return [heading, '']
  const mid = Math.ceil(words.length / 2)
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')]
}

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
    title: 'How a Pending Court Challan Was Cleared Before a Vehicle Transfer',
    problem:
      'The seller had found a buyer, but an unresolved court challan was delaying the RC transfer. The buyer withheld payment until the vehicle records were cleared.',
    vehicleType: 'Personal hatchback',
    challanSituation: 'One camera-detected traffic challan had remained pending in court for several months.',
    location: "The challan was issued in a state different from the owner's residence.",
    requiredTimeline: 'The vehicle sale was expected to be completed within the next 12 days.',
    actionTaken:
      'ChallanPay Xpress checked the case eligibility and confirmed the 10-day resolution process was available. The owner paid the fixed ₹3,000 Xpress fee and submitted the necessary documents.',
    resolution:
      'The eligible court challan was resolved within the stated Xpress timeline, with progress updates provided throughout the process.',
    outcome:
      'The RC transfer proceeded without further delays, allowing the buyer to complete the purchase on the scheduled date.',
  },
  {
    title: 'How a Year-Old Court Challan Was Resolved Before Insurance Renewal',
    problem:
      'The insurance renewal date was approaching, and the vehicle owner found a court challan that could complicate the required paperwork.',
    vehicleType: 'Personal-use sedan',
    challanSituation: 'A court challan had remained unresolved for more than twelve months.',
    location: "The challan was issued within the owner's state of residence.",
    requiredTimeline: 'The renewal deadline was confirmed, with approximately three weeks remaining.',
    actionTaken:
      'Xpress eligibility was verified, the resolution process was started, documents were provided, and progress was monitored through the dashboard.',
    resolution:
      'The challan was resolved within the Xpress timeframe, ahead of the insurance renewal deadline.',
    outcome:
      'The insurance renewal was completed on schedule, avoiding last-minute paperwork complications.',
  },
  {
    title: 'Fleet Manager Resolves an Interstate Court Challan Remotely',
    problem:
      'A fleet vehicle was held up due to an unresolved court challan issued outside its home state. The operator lacked the time and resources to attend the hearing in person.',
    vehicleType: 'Commercial transport vehicle',
    challanSituation: 'A pending court challan related to a regulatory violation during an interstate journey.',
    location: "Issued in a state located over 1,000 km away from the fleet's operating base.",
    requiredTimeline: 'The vehicle had to resume operations within 14 days.',
    actionTaken:
      'The team verified Xpress eligibility for the court challan and collected the necessary vehicle registration and ownership documents digitally.',
    resolution: 'The court challan was addressed through the Xpress process without requiring an in-person visit.',
    outcome: "The vehicle returned to active operations within the fleet manager's planned timeframe, avoiding the need for long-distance travel.",
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
    q: 'What is ChallanPay Xpress, and how does it help resolve court challans?',
    a: 'ChallanPay Xpress is a dedicated service designed to help vehicle owners resolve eligible court challans through a streamlined process. It provides assistance with the required documentation and resolution procedure, helping reduce the time and effort involved in managing pending court challans.',
  },
  {
    q: 'Can I resolve a pending court challan online without visiting the court?',
    a: 'Eligible court challans may be handled through the ChallanPay Xpress process without requiring the vehicle owner to travel to the court personally. The process depends on the challan type, case requirements, and applicable court procedures.',
  },
  {
    q: 'How long does ChallanPay Xpress take to resolve a court challan?',
    a: "ChallanPay Xpress aims to resolve eligible court challans within 10 days. The actual resolution time may depend on document verification, case eligibility, and the relevant authority's processing requirements.",
  },
  {
    q: 'What is the service fee for ChallanPay Xpress?',
    a: 'The advertised service fee for ChallanPay Xpress is ₹3,000 per eligible court challan. This is the service fee and should be distinguished from any government-imposed fine or other applicable charges. Confirm the applicable total before proceeding.',
  },
  {
    q: 'Which types of court challans can be resolved through ChallanPay Xpress?',
    a: 'ChallanPay Xpress is intended for eligible court challans that require additional assistance with resolution. Eligibility depends on the challan details and the applicable legal process. Share your vehicle and challan information with the team to confirm whether your case qualifies.',
  },
  {
    q: 'What documents are required to resolve a court challan through ChallanPay Xpress?',
    a: 'You may be asked to provide your vehicle registration details, a copy of the Registration Certificate (RC), challan information, and ownership or supporting documents relevant to your case. Additional documents may be required depending on the nature of the challan.',
  },
  {
    q: 'Can ChallanPay Xpress help with an interstate court challan?',
    a: "Yes, you can enquire about an eligible court challan issued in a state different from your vehicle's registered location or fleet operating base. The team can assess the case and explain the available resolution process based on the issuing authority and applicable requirements.",
  },
  {
    q: 'How can I check my court challan status and track the resolution process?',
    a: 'Start by sharing your vehicle number and relevant challan details with ChallanPay. Once your case has been reviewed and submitted for resolution, use the available customer support and status updates to follow its progress. Always verify the final status before treating a challan as resolved.',
  },
  {
    q: 'Is ChallanPay Xpress suitable for commercial vehicles and fleet operators?',
    a: 'ChallanPay Xpress can be useful for commercial vehicle owners and fleet operators managing eligible court challans that may affect vehicle operations. The service is designed to simplify the resolution process and reduce the administrative burden associated with handling pending challans across different locations.',
  },
  {
    q: 'How can I get started with ChallanPay Xpress?',
    a: 'Visit the ChallanPay Xpress page and submit your enquiry with the relevant vehicle and challan details. The team can review your case, confirm eligibility, explain the applicable fees, and guide you through the next steps for resolving your pending court challan.',
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
  const [openCase, setOpenCase] = useState<number>(0)
  const [vehicleInput, setVehicleInput] = useState('')
  const [inputError, setInputError] = useState('')
  const [shake, setShake] = useState(false)
  const { userName, setVehicleNumber, openVerificationModal } = useUserStore()
  const navigate = useNavigate()

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

  return (
    <PageTransition>
      <div className="bg-bg-page">
        {/* ───────────── Hero ───────────── */}
        <section className="relative overflow-hidden bg-white">
          <h1 className="sr-only">ChallanPay Xpress — Fast Court Challan Resolution</h1>

          {/* Mobile: illustration on top, text + buttons below */}
          <div className="md:hidden">
            <div className="relative w-full bg-bg-page flex items-center justify-center px-6 pt-6 pb-2">
              <img
                src="/images/xpress-hero-illustration.png"
                alt="ChallanPay Xpress — Solve your challan within 10 days"
                className="w-full max-w-[360px] h-auto object-contain"
              />
            </div>
            <div className="px-4 sm:px-6 pt-4 pb-8">
              <ScrollReveal delay={0.1}>
                <div className="flex flex-col items-center text-center gap-3">
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-text-primary leading-tight">
                    Solve Your Challan Within{' '}
                    <span className="text-primary">10 Days</span>
                  </h2>
                  <p className="font-body text-sm text-text-secondary">
                    The <em>fastest</em> way to move ahead.
                  </p>
                  <div className="flex flex-col gap-3 w-full max-w-[360px] mt-2">
                    <motion.div
                      animate={shake ? { x: [-6, 6, -4, 4, 0] } : { x: 0 }}
                      transition={{ duration: 0.4 }}
                      className={cn(
                        'flex items-center bg-white border-2 rounded-xl overflow-hidden focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(8,145,178,0.1)] transition-all w-full',
                        inputError ? 'border-red-400' : 'border-[#E5E7EB]'
                      )}
                    >
                      <div className="flex items-center px-3 py-3 border-r border-[#E5E7EB]">
                        <img
                          src="/images/flag.png"
                          alt="India Flag"
                          className="w-6 h-auto object-contain"
                        />
                      </div>
                      <input
                        id="xpress-hero-vehicle-mobile"
                        type="text"
                        value={vehicleInput}
                        onChange={(e) => {
                          setVehicleInput(e.target.value.toUpperCase())
                          if (inputError) setInputError('')
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter Vehicle Number"
                        aria-label="Vehicle number"
                        maxLength={12}
                        aria-invalid={inputError ? true : undefined}
                        aria-describedby={inputError ? 'xpress-hero-vehicle-mobile-error' : undefined}
                        className="flex-1 min-w-0 px-3 py-3 text-sm font-body font-medium text-text-primary placeholder:text-gray-500 placeholder:normal-case outline-none bg-transparent uppercase tracking-wider"
                      />
                    </motion.div>
                    <button
                      type="button"
                      onClick={handleCheck}
                      className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-display font-semibold py-3 px-5 rounded-xl transition-colors text-sm shadow-sm"
                    >
                      Check Challans
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  {inputError && (
                    <p id="xpress-hero-vehicle-mobile-error" role="alert" className="text-xs text-red-500 font-body">
                      {inputError}
                    </p>
                  )}
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
                    <div className="flex flex-col gap-3 w-full max-w-[380px]">
                      <motion.div
                        animate={shake ? { x: [-6, 6, -4, 4, 0] } : { x: 0 }}
                        transition={{ duration: 0.4 }}
                        className={cn(
                          'flex items-center bg-white border-2 rounded-xl overflow-hidden focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(8,145,178,0.1)] transition-all w-full',
                          inputError ? 'border-red-400' : 'border-[#E5E7EB]'
                        )}
                      >
                        <div className="flex items-center px-3 py-3 border-r border-[#E5E7EB]">
                          <img
                            src="/images/flag.png"
                            alt="India Flag"
                            className="w-6 h-auto object-contain"
                          />
                        </div>
                        <input
                          id="xpress-hero-vehicle-desktop"
                          type="text"
                          value={vehicleInput}
                          onChange={(e) => {
                            setVehicleInput(e.target.value.toUpperCase())
                            if (inputError) setInputError('')
                          }}
                          onKeyDown={handleKeyDown}
                          placeholder="Enter Vehicle Number"
                          aria-label="Vehicle number"
                          maxLength={12}
                          aria-invalid={inputError ? true : undefined}
                          aria-describedby={inputError ? 'xpress-hero-vehicle-desktop-error' : undefined}
                          className="flex-1 min-w-0 px-3 py-3 text-sm lg:text-base font-body font-medium text-text-primary placeholder:text-gray-500 placeholder:normal-case outline-none bg-transparent uppercase tracking-wider"
                        />
                      </motion.div>
                      <button
                        type="button"
                        onClick={handleCheck}
                        className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-display font-semibold py-3 px-5 rounded-xl transition-colors text-sm lg:text-base shadow-sm whitespace-nowrap"
                      >
                        Check Challans
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                    {inputError && (
                      <p id="xpress-hero-vehicle-desktop-error" role="alert" className="text-xs text-red-500 font-body -mt-2">
                        {inputError}
                      </p>
                    )}
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
                  Who Can Benefit from ChallanPay Xpress?
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
                  Why Choose Xpress Instead of Repeated Follow-Ups?
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
                  Real Court Challan Cases Xpress Helps Resolve
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
              <div className="mb-10">
                <h2 className="font-display text-2xl md:text-4xl font-extrabold text-text-primary leading-tight">
                  ChallanPay Xpress – Real Challan Resolution Stories
                </h2>
              </div>
            </ScrollReveal>

            <div className="space-y-4">
              {CASE_STUDIES.map((cs, i) => {
                const isOpen = i === openCase
                if (!isOpen) {
                  return (
                    <ScrollReveal key={cs.title} delay={i * 0.04}>
                      <button
                        type="button"
                        onClick={() => setOpenCase(i)}
                        aria-expanded={false}
                        className="w-full bg-white border border-border rounded-xl p-4 md:p-5 flex items-center justify-between gap-4 hover:border-emerald-300 hover:shadow-sm transition-all text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <CalendarClock className="w-5 h-5" />
                          </div>
                          <span className="font-display font-semibold text-sm md:text-base text-text-primary truncate">
                            {cs.title}
                          </span>
                        </div>
                        <ChevronDown className="w-5 h-5 text-text-secondary shrink-0 -rotate-90" />
                      </button>
                    </ScrollReveal>
                  )
                }
                return (
                  <ScrollReveal key={cs.title} delay={i * 0.04}>
                    <article className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
                      {/* Left: narrative */}
                      <div className="md:col-span-7 bg-white rounded-2xl border border-border p-5 md:p-7">
                        <NarrativeRow
                          icon={AlertTriangle}
                          label="Problem"
                          value={cs.problem}
                        />
                        <NarrativeDivider />
                        <NarrativeRow
                          icon={Car}
                          label="Challan Situation"
                          value={cs.challanSituation}
                        />
                        <NarrativeDivider />
                        <NarrativeRow
                          icon={Clock}
                          label="Required Timeline"
                          value={cs.requiredTimeline}
                        />
                        <NarrativeDivider />
                        <NarrativeRow
                          icon={RefreshCw}
                          label="Resolution"
                          value={cs.resolution}
                        />
                      </div>

                      {/* Right: meta cards */}
                      <div className="md:col-span-5 flex flex-col gap-3 md:gap-4">
                        <MetaCard
                          icon={User}
                          iconBg="bg-purple-100"
                          iconColor="text-purple-600"
                          label="Vehicle Type"
                          value={cs.vehicleType}
                        />
                        <MetaCard
                          icon={MapPin}
                          iconBg="bg-sky-100"
                          iconColor="text-sky-600"
                          label="Location"
                          value={cs.location}
                        />
                        <MetaCard
                          icon={FileText}
                          iconBg="bg-amber-100"
                          iconColor="text-amber-600"
                          label="Action Taken"
                          value={cs.actionTaken}
                        />
                        <MetaCard
                          icon={CheckCircle2}
                          iconBg="bg-emerald-100"
                          iconColor="text-emerald-600"
                          label="Customer Outcome"
                          value={cs.outcome}
                          highlight
                        />
                      </div>
                    </article>
                  </ScrollReveal>
                )
              })}
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
        <section id="xpress-faq" className="py-14 md:py-20 bg-white scroll-mt-24">
          <div className="max-w-[860px] mx-auto px-4 sm:px-6">
            <ScrollReveal>
              <div className="text-center mb-10">
                <h2 className="font-display text-2xl md:text-3xl font-extrabold text-text-primary">
                  Got Questions? We've Got Answers.
                </h2>
              </div>
            </ScrollReveal>

            <div className="flex flex-col gap-3">
              {FAQS.map((f, i) => {
                const isOpen = openFaq === i
                return (
                  <ScrollReveal key={f.q} delay={Math.min(i, 6) * 0.02}>
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
                        className="w-full flex items-center justify-between gap-3 text-left p-4"
                      >
                        <span className="font-display font-bold text-sm text-text-primary flex-1 min-w-0 truncate">
                          {f.q}
                        </span>
                        <span
                          className={cn(
                            'w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors',
                            isOpen
                              ? 'bg-primary border-primary text-white'
                              : 'border-border text-text-secondary',
                          )}
                        >
                          {isOpen ? (
                            <Minus className="w-3 h-3" />
                          ) : (
                            <Plus className="w-3 h-3" />
                          )}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4">
                          <p className="font-body text-sm text-text-secondary leading-relaxed">
                            {f.a}
                          </p>
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
          const BadgeIcon = topic.badge.icon
          const [headLead, headTail] = splitHeading(topic.heading)
          return (
            <article
              key={`${topic.anchor}-${i}`}
              id={isMiddleCopy ? topic.anchor : undefined}
              className={cn(
                'snap-center shrink-0 w-[88%] md:w-[84%] bg-white border border-border rounded-2xl overflow-hidden scroll-mt-24 transition-all duration-300 origin-center',
                isActive ? 'scale-100 opacity-100 shadow-lg' : 'scale-[0.92] opacity-60',
              )}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 items-stretch">
                {/* Left: image */}
                <div className="relative bg-white flex items-center justify-center p-5 md:p-6">
                  <img
                    src={topic.image}
                    alt={topic.heading}
                    className="w-full h-auto max-h-[200px] md:max-h-[260px] object-contain"
                    loading="lazy"
                  />
                </div>

                {/* Right: content */}
                <div className="p-5 md:p-7 flex flex-col gap-3 md:gap-4">
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full self-start">
                    <BadgeIcon className="w-3.5 h-3.5" />
                    <span className="font-body text-[11px] font-bold uppercase tracking-wider">
                      {topic.badge.label}
                    </span>
                  </div>

                  <h3 className="font-display text-xl md:text-3xl font-extrabold leading-[1.1]">
                    <span className="text-text-primary">{headLead}</span>
                    {headTail && (
                      <>
                        {' '}
                        <span className="text-primary">{headTail}</span>
                      </>
                    )}
                  </h3>

                  <p className="font-body text-sm text-text-secondary leading-relaxed">
                    {topic.intro}
                  </p>

                  <div className="h-px bg-border" />

                  <div>
                    <p className="font-display font-bold text-sm text-text-primary mb-2">
                      Common search intents
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {topic.keywords.slice(0, 4).map((k, idx) => {
                        const tile = KEYWORD_TILES[idx % KEYWORD_TILES.length]
                        const TileIcon = tile.icon
                        return (
                          <div
                            key={k}
                            className="flex items-center gap-2.5 bg-white border border-border rounded-lg p-2"
                          >
                            <div
                              className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                                tile.bg,
                              )}
                            >
                              <TileIcon className={cn('w-4 h-4', tile.text)} />
                            </div>
                            <span className="font-body text-xs text-text-primary leading-snug">
                              {k}
                            </span>
                          </div>
                        )
                      })}
                    </div>
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

function NarrativeRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  const [lead, ...rest] = value.split(/(?<=\.)\s+/)
  const detail = rest.join(' ').trim()
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-1">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wider font-bold text-text-light mb-1.5">
          {label}
        </p>
        <p className="font-body text-sm md:text-[15px] font-semibold text-text-primary leading-relaxed">
          {lead}
        </p>
        {detail && (
          <p className="font-body text-sm text-text-secondary leading-relaxed mt-1">
            {detail}
          </p>
        )}
      </div>
    </div>
  )
}

function NarrativeDivider() {
  return <div className="h-px bg-border my-4 md:my-5 ml-14" />
}

function MetaCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  highlight = false,
}: {
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-4 md:p-5 flex items-start gap-3',
        highlight
          ? 'bg-emerald-50/70 border-emerald-200'
          : 'bg-white border-border',
      )}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
          iconBg,
          iconColor,
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wider font-bold text-text-light mb-1">
          {label}
        </p>
        <p
          className={cn(
            'font-body text-sm leading-relaxed',
            highlight ? 'text-emerald-900' : 'text-text-secondary',
          )}
        >
          {value}
        </p>
      </div>
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
