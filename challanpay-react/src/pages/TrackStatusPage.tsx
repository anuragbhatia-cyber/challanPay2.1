import { useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ArrowLeft,
  FileText,
  CircleCheck,
  Hourglass,
  AlertCircle,
  Search,
  User,
  Car,
  ChevronRight,
  Shield,
  Plus,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/stores/userStore'
import { mobileSchema, otpSchema, userNameSchema } from '@/lib/validators'
import { usePageState } from '@/hooks/usePageState'
import { ErrorState } from '@/components/shared/ErrorState'
import { SkeletonCard } from '@/components/shared/Skeleton'
import { PageTransition } from '@/components/shared/PageTransition'
import { useTranslation } from '@/hooks/useTranslation'
import { ChallanDetailView } from './track-status/ChallanDetailView'
import { AddVehicleModal } from './track-status/AddVehicleModal'
import { MOCK_CHALLANS, MOCK_VEHICLES, STATUS_BADGE } from './track-status/mocks'
import type { FilterTab, LoginStep, SidebarTab, TrackingChallan } from './track-status/types'

// --- Login Section ---
function LoginSection({ onSuccess }: { onSuccess: (name: string, mobile: string) => void }) {
  const { t } = useTranslation()
  const [step, setStep] = useState<LoginStep>('details')
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [otpDigits, setOtpDigits] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const [nameError, setNameError] = useState('')
  const [mobileError, setMobileError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const startResendTimer = () => {
    setResendTimer(30)
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const handleDetailsSubmit = () => {
    let hasError = false
    const nameResult = userNameSchema.safeParse(name)
    if (!nameResult.success) {
      setNameError(nameResult.error.errors[0].message)
      hasError = true
    } else {
      setNameError('')
    }
    const mobileResult = mobileSchema.safeParse(mobile)
    if (!mobileResult.success) {
      setMobileError(mobileResult.error.errors[0].message)
      hasError = true
    } else {
      setMobileError('')
    }
    if (hasError) return
    setStep('otp')
    startResendTimer()
  }

  const handleOtpSubmitWithDigits = (digits: string[]) => {
    const combined = digits.join('')
    const result = otpSchema.safeParse(combined)
    if (!result.success) {
      setError(result.error.errors[0].message)
      return
    }
    setError('')
    onSuccess(name, mobile)
  }

  const handleOtpSubmit = () => handleOtpSubmitWithDigits(otpDigits)

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newDigits = [...otpDigits]
    if (value.length > 1) {
      const chars = value.slice(0, 4).split('')
      chars.forEach((c, i) => { newDigits[i] = c })
      setOtpDigits(newDigits)
      setError('')
      const focusIdx = Math.min(chars.length, 3)
      otpRefs.current[focusIdx]?.focus()
      if (chars.length === 4) setTimeout(() => handleOtpSubmitWithDigits(newDigits), 0)
      return
    }
    newDigits[index] = value
    setOtpDigits(newDigits)
    setError('')
    if (value && index < 3) otpRefs.current[index + 1]?.focus()
    if (value && newDigits.every(d => d !== '')) setTimeout(() => handleOtpSubmitWithDigits(newDigits), 0)
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
    if (e.key === 'Enter') { e.preventDefault(); handleOtpSubmit() }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (step === 'details') handleDetailsSubmit()
      else handleOtpSubmit()
    }
  }

  return (
    <div className="px-4 py-4 md:min-h-[calc(100vh-5rem)] md:flex md:items-center md:justify-center md:py-8">
      <div className="w-full max-w-md mx-auto">

        <AnimatePresence mode="wait">
          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border border-border p-6 md:p-8 shadow-sm"
            >
              <h2 className="font-display text-2xl font-bold text-text-primary mb-2">
                {t.trackStatus.loginTitle}
              </h2>
              <p className="font-body text-sm text-text-secondary mb-7">
                {t.trackStatus.loginSubtitle}
              </p>

              {/* Name input */}
              <div className="mb-5">
                <label htmlFor="ts-name" className="block text-xs font-medium text-text-secondary mb-2 font-body">
                  {t.trackStatus.fullName}
                </label>
                <input
                  id="ts-name"
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameError('') }}
                  onKeyDown={handleKeyDown}
                  placeholder={t.trackStatus.fullNamePlaceholder}
                  autoFocus
                  aria-invalid={nameError ? true : undefined}
                  aria-describedby={nameError ? 'ts-name-error' : undefined}
                  className="w-full px-4 py-4 rounded-xl border border-border bg-gray-50 text-sm font-body text-text-primary placeholder:text-gray-500 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
                {nameError && <p id="ts-name-error" role="alert" className="text-xs text-red-500 mt-1.5 font-body">{nameError}</p>}
              </div>

              {/* Mobile input */}
              <div>
                <label htmlFor="ts-mobile" className="block text-xs font-medium text-text-secondary mb-2 font-body">
                  {t.trackStatus.mobileNumber}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-body">
                    +91
                  </span>
                  <input
                    id="ts-mobile"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => { setMobile(e.target.value.replace(/\D/g, '')); setMobileError('') }}
                    onKeyDown={handleKeyDown}
                    placeholder={t.trackStatus.mobilePlaceholder}
                    aria-invalid={mobileError ? true : undefined}
                    aria-describedby={mobileError ? 'ts-mobile-error' : undefined}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-gray-50 text-sm font-body text-text-primary placeholder:text-gray-500 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
                {mobileError && <p id="ts-mobile-error" role="alert" className="text-xs text-red-500 mt-1.5 font-body">{mobileError}</p>}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDetailsSubmit}
                className="w-full mt-7 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-display font-semibold py-4 rounded-xl transition-colors text-sm"
              >
                {t.trackStatus.getOtp}
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <p className="text-[11px] text-text-light text-center mt-4 leading-relaxed">
                {t.trackStatus.termsText}{' '}
                <a href="/terms" className="text-primary underline underline-offset-2">{t.trackStatus.termsLink}</a>
                {' '}{t.trackStatus.and}{' '}
                <a href="/privacy-policy" className="text-primary underline underline-offset-2">{t.trackStatus.privacyLink}</a>
              </p>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border border-border p-6 md:p-8 shadow-sm"
            >
              <h2 className="font-display text-2xl font-bold text-text-primary mb-2">
                {t.trackStatus.verifyTitle}
              </h2>
              <p className="font-body text-sm text-text-secondary mb-7">
                {t.trackStatus.verifySubtitle} +91 {mobile}
              </p>

              <div className="flex gap-3 justify-center" role="group" aria-label="One-time password">
                {[0, 1, 2, 3].map((i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el }}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={otpDigits[i]}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={(e) => {
                      e.preventDefault()
                      const pasted = e.clipboardData.getData('text').replace(/\D/g, '')
                      if (pasted) handleOtpChange(i, pasted)
                    }}
                    autoFocus={i === 0}
                    aria-label={`OTP digit ${i + 1}`}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? 'ts-otp-error' : undefined}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 border-border bg-gray-50 text-center text-xl font-display font-bold text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                ))}
              </div>
              {error && <p id="ts-otp-error" role="alert" className="text-xs text-red-500 text-center mt-3 font-body">{error}</p>}

              <div className="text-center mt-5">
                <p className="text-xs text-text-light">
                  {t.trackStatus.didNotReceive}{' '}
                  {resendTimer > 0 ? (
                    <span className="text-text-secondary font-medium">{t.trackStatus.resendIn} {resendTimer}s</span>
                  ) : (
                    <button
                      onClick={startResendTimer}
                      className="text-primary font-medium hover:underline inline-flex items-center justify-center px-3 py-2 -my-2 min-h-11"
                    >
                      {t.trackStatus.resendOtp}
                    </button>
                  )}
                </p>
              </div>

              <div className="flex gap-3 mt-7">
                <button
                  onClick={() => { setStep('details'); setOtpDigits(['', '', '', '']); setError('') }}
                  className="flex items-center justify-center gap-1.5 px-5 py-4 rounded-xl border border-border text-sm font-display font-semibold text-text-secondary hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t.trackStatus.back}
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOtpSubmit}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-display font-semibold py-4 rounded-xl transition-colors text-sm"
                >
                  {t.trackStatus.submitOtp}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// --- Sidebar Tab Button ---
function SidebarTabButton({
  active,
  icon: Icon,
  label,
  tooltip,
  onClick,
}: {
  active: boolean
  icon: typeof FileText
  label: string
  tooltip: string
  onClick: () => void
}) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 md:flex-none flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all relative',
        active
          ? 'bg-primary text-white'
          : 'bg-white border border-border text-text-secondary hover:bg-gray-50'
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="flex-1 text-left">{label}</span>
      <div
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Info className={cn('w-3.5 h-3.5', active ? 'text-white/60' : 'text-gray-400')} />
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 px-3 py-2 bg-gray-900 text-white text-[10px] leading-relaxed rounded-lg shadow-lg z-50 pointer-events-none">
            {tooltip}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
          </div>
        )}
      </div>
    </button>
  )
}

// --- Dashboard Section ---
function DashboardSection() {
  const { t } = useTranslation()
  const { userName, userMobile } = useUserStore()
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('challan')
  const [filterTab, setFilterTab] = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [faqOpen, setFaqOpen] = useState(false)
  const [selectedChallan, setSelectedChallan] = useState<TrackingChallan | null>(null)
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false)
  const [expandedVehicleSections, setExpandedVehicleSections] = useState<Record<string, Set<string>>>({})
  const { state: pageState, retry: pageRetry } = usePageState()

  const toggleVehicleSection = (vehicleNumber: string, section: string) => {
    setExpandedVehicleSections((prev) => {
      const current = prev[vehicleNumber] ?? new Set<string>()
      const next = new Set(current)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return { ...prev, [vehicleNumber]: next }
    })
  }

  const isVehicleSectionOpen = (vehicleNumber: string, section: string) =>
    expandedVehicleSections[vehicleNumber]?.has(section) ?? false

  const stats = useMemo(() => {
    const submitted = MOCK_CHALLANS.length
    const resolved = MOCK_CHALLANS.filter(c => c.status === 'resolved').length
    const inProgress = MOCK_CHALLANS.filter(c => c.status === 'in-progress' || c.status === 'not-settled').length
    const refund = MOCK_CHALLANS.filter(c => c.status === 'refund').length
    return { submitted, resolved, inProgress, refund }
  }, [])

  const filteredChallans = useMemo(() => {
    let result = MOCK_CHALLANS
    if (filterTab !== 'all') {
      result = result.filter(c => c.status === filterTab)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(c =>
        c.challanNumber.toLowerCase().includes(q) ||
        c.vehicleNumber.toLowerCase().includes(q) ||
        c.incidentId.toLowerCase().includes(q)
      )
    }
    return result
  }, [filterTab, searchQuery])

  const STATS_CARDS = [
    { label: t.trackStatus.challansSubmitted, value: stats.submitted, icon: FileText, color: 'bg-blue-50 text-blue-600' },
    { label: t.trackStatus.resolvedChallans, value: stats.resolved, icon: CircleCheck, color: 'bg-emerald-50 text-emerald-600' },
    { label: t.trackStatus.challansInProgress, value: stats.inProgress, icon: Hourglass, color: 'bg-red-50 text-red-500' },
    { label: t.trackStatus.refundChallans, value: stats.refund, icon: AlertCircle, color: 'bg-red-50 text-red-500' },
  ]

  const FILTER_TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: t.trackStatus.allFilter },
    { key: 'in-progress', label: t.trackStatus.inProgressFilter },
    { key: 'resolved', label: t.trackStatus.resolvedFilter },
    { key: 'refund', label: t.trackStatus.refundFilter },
  ]

  return (
    <div className="bg-bg-page min-h-screen py-6 overflow-x-hidden">
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-5 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold text-text-primary">
            {t.trackStatus.welcome} {userName}
          </h1>
          <p className="text-sm text-text-secondary">{t.trackStatus.mNo} {userMobile}</p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="md:sticky md:top-24 md:self-start md:min-h-[calc(100vh-7rem)] bg-white rounded-2xl border border-border p-3">
          <nav className="flex md:flex-col gap-2">
            <SidebarTabButton
              active={sidebarTab === 'challan'}
              icon={FileText}
              label={t.trackStatus.challanInfo}
              tooltip={t.trackStatus.challanInfoTooltip}
              onClick={() => { setSidebarTab('challan'); setSelectedChallan(null) }}
            />
            <SidebarTabButton
              active={sidebarTab === 'vehicle'}
              icon={Car}
              label={t.trackStatus.vehicleInfo}
              tooltip={t.trackStatus.vehicleInfoTooltip}
              onClick={() => { setSidebarTab('vehicle'); setSelectedChallan(null) }}
            />
          </nav>
        </aside>

        {/* Content */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {sidebarTab === 'challan' ? (
              selectedChallan ? (
                <ChallanDetailView
                  key="detail"
                  challan={selectedChallan}
                  onBack={() => setSelectedChallan(null)}
                />
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {STATS_CARDS.map((card) => (
                      <div key={card.label} className="bg-white rounded-xl border border-border shadow-sm p-4 flex items-start gap-3">
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', card.color)}>
                          <card.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-display text-2xl font-bold text-text-primary">{card.value}</p>
                          <p className="text-xs text-text-secondary mt-0.5">{card.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>


                  {/* Challans Information */}
                  <div className="mt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <h2 className="font-display font-bold text-lg text-text-primary">
                        {t.trackStatus.challansInformation}
                      </h2>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder={t.trackStatus.searchChallan}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 pr-4 py-2.5 rounded-lg border border-border bg-gray-50 text-sm text-text-primary placeholder:text-gray-500 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all w-full sm:w-56"
                        />
                      </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 mb-4 overflow-x-auto">
                      {FILTER_TABS.map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setFilterTab(tab.key)}
                          className={cn(
                            'px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
                            filterTab === tab.key
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                          )}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Challan Cards Grid */}
                    {pageState === 'loading' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <SkeletonCard key={i} />
                        ))}
                      </div>
                    ) : pageState === 'error' ? (
                      <div className="bg-white rounded-2xl border border-border">
                        <ErrorState onRetry={pageRetry} />
                      </div>
                    ) : filteredChallans.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredChallans.map((challan) => (
                          <div
                            key={challan.id}
                            className="bg-white rounded-xl border border-border shadow-sm p-5 hover:border-primary/30 hover:shadow-md transition-all"
                          >
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <p className="font-display font-bold text-sm text-text-primary truncate">
                                {challan.challanNumber}
                              </p>
                              {(() => {
                                const StatusIcon = STATUS_BADGE[challan.status].icon
                                return (
                                  <span className={cn(
                                    'flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full',
                                    STATUS_BADGE[challan.status].className
                                  )}>
                                    <StatusIcon className="w-3 h-3" aria-hidden />
                                    {challan.status === 'not-settled' ? t.trackStatus.notSettled : challan.status === 'in-progress' ? t.trackStatus.inProgress : challan.status === 'resolved' ? t.trackStatus.resolved : t.trackStatus.refund}
                                  </span>
                                )
                              })()}
                            </div>
                            <div className="space-y-1.5 text-sm text-text-secondary">
                              <p>{t.trackStatus.vehicle}: <span className="font-medium text-text-primary">{challan.vehicleNumber}</span></p>
                              <p>{t.trackStatus.incident}: <span className="font-medium text-text-primary">{challan.incidentId}</span></p>
                            </div>
                            <button
                              onClick={() => setSelectedChallan(challan)}
                              className="flex items-center gap-1 mt-4 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                              {t.trackStatus.viewDetails}
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl border border-border p-8 text-center">
                        <p className="text-sm text-text-secondary">{t.trackStatus.noChallansFound}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            ) : (
              /* Vehicle Info Tab */
              <motion.div
                key="vehicle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-lg text-text-primary">
                    {t.trackStatus.vehicleDetails}
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddVehicleModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-primary text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t.trackStatus.addVehicle}
                  </motion.button>
                </div>

                {MOCK_VEHICLES.length > 0 ? (
                  MOCK_VEHICLES.map((vehicle) => {
                    const SECTIONS = [
                      {
                        id: 'owner',
                        label: 'Owner Details',
                        icon: User,
                        iconBg: 'bg-blue-50',
                        iconColor: 'text-blue-600',
                        rows: [
                          { label: 'Owner Name', value: vehicle.ownerName },
                          { label: 'Father Name', value: vehicle.fatherName },
                          { label: 'Address', value: vehicle.address },
                        ],
                      },
                      {
                        id: 'key',
                        label: 'Key Details',
                        icon: Shield,
                        iconBg: 'bg-amber-50',
                        iconColor: 'text-amber-600',
                        rows: [
                          { label: 'PUC Expiry', value: vehicle.pucExpiry },
                          { label: 'Insurance Expiry', value: vehicle.insuranceExpiry },
                          { label: 'RC Expiry', value: vehicle.rcExpiry },
                        ],
                      },
                      {
                        id: 'vehicle',
                        label: 'Vehicle Details',
                        icon: Car,
                        iconBg: 'bg-emerald-50',
                        iconColor: 'text-emerald-600',
                        rows: [
                          { label: 'Make & Model', value: vehicle.makeModel },
                          { label: 'Type / Color', value: `${vehicle.vehicleType} — ${vehicle.vehicleTypeColor}` },
                          { label: 'Engine No.', value: vehicle.engineNumber },
                          { label: 'Chassis No.', value: vehicle.chassisNumber },
                        ],
                      },
                    ] as const

                    return (
                      <div
                        key={vehicle.vehicleNumber}
                        className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm"
                      >
                        {/* Header — make/model on the left, license plate on the right */}
                        <div className="bg-white px-5 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Car className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0 flex items-center justify-between gap-3 flex-wrap">
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border-2 border-gray-900 bg-white flex-shrink-0">
                                <span className="font-display font-bold text-[13px] text-gray-900 tracking-widest">
                                  {vehicle.vehicleNumber}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap min-w-0">
                                <p className="text-sm text-text-secondary truncate">{vehicle.makeModel}</p>
                                <span className="text-text-light">·</span>
                                <span className="text-xs font-medium text-text-light bg-gray-100 px-2 py-0.5 rounded-full">
                                  {vehicle.vehicleType}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Accordion Sections */}
                        <div>
                          {SECTIONS.map((section, idx) => {
                            const SectionIcon = section.icon
                            const isOpen = isVehicleSectionOpen(vehicle.vehicleNumber, section.id)
                            return (
                              <div key={section.id} className="border-t border-border">
                                <button
                                  onClick={() => toggleVehicleSection(vehicle.vehicleNumber, section.id)}
                                  className={cn(
                                    'w-full flex items-center gap-3 px-5 py-3.5 transition-colors',
                                    isOpen ? 'bg-gray-50/80' : 'hover:bg-gray-50/50'
                                  )}
                                >
                                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', section.iconBg)}>
                                    <SectionIcon className={cn('w-3.5 h-3.5', section.iconColor)} />
                                  </div>
                                  <span className="flex-1 text-left text-sm font-medium text-text-primary">{section.label}</span>
                                  <ChevronRight className={cn(
                                    'w-4 h-4 text-text-light transition-transform duration-200',
                                    isOpen && 'rotate-90'
                                  )} />
                                </button>
                                <AnimatePresence>
                                  {isOpen && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="mx-5 mb-4 rounded-xl bg-gray-50 border border-gray-100 divide-y divide-gray-100">
                                        {section.rows.map((row) => (
                                          <div key={row.label} className="px-4 py-3 flex items-baseline justify-between gap-4">
                                            <p className="text-xs text-text-light whitespace-nowrap">{row.label}</p>
                                            <p className="text-sm font-medium text-text-primary text-right">{row.value}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="bg-white rounded-xl border border-border p-8 text-center">
                    <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-text-secondary">{t.trackStatus.noVehicles}</p>
                    <p className="text-xs text-text-light mt-1">{t.trackStatus.addVehicleHint}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      <AnimatePresence>
        {showAddVehicleModal && (
          <AddVehicleModal onClose={() => setShowAddVehicleModal(false)} />
        )}
      </AnimatePresence>
    </div>
    </div>
  )
}

// --- Main Page ---
export function TrackStatusPage() {
  const { userName, setUser } = useUserStore()
  const isLoggedIn = !!userName

  const handleLoginSuccess = (name: string, mobile: string) => {
    setUser(name, mobile)
  }

  return (
    <PageTransition>
      <div>
        {isLoggedIn ? (
          <DashboardSection />
        ) : (
          <LoginSection onSuccess={handleLoginSuccess} />
        )}
      </div>
    </PageTransition>
  )
}
