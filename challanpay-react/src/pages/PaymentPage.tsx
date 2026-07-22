import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'
import { Gift, ArrowLeft, X, ShieldAlert, AlertTriangle, ChevronDown, Info, Check, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageTransition } from '@/components/shared/PageTransition'
import { Skeleton } from '@/components/shared/Skeleton'
import { useTranslation } from '@/hooks/useTranslation'
import { useModalA11y } from '@/hooks/useModalA11y'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { usePageState } from '@/hooks/usePageState'
import {
  useChallanStore,
  ONLINE_CONVENIENCE_FEE,
  COURT_CONVENIENCE_FEE,
  EXPRESS_CONVENIENCE_FEE,
  PLEDGE_REWARD,
} from '@/stores/challanStore'

const formatINR = (n: number) => n.toLocaleString('en-IN')

export function PaymentPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const challans = useChallanStore((s) => s.challans)
  const selectedChallanIds = useChallanStore((s) => s.selectedChallanIds)
  const resolutionMethod = useChallanStore((s) => s.resolutionMethod)
  const recordTransaction = useChallanStore((s) => s.recordTransaction)
  const markSubmitted = useChallanStore((s) => s.markSubmitted)
  const { state: pageState } = usePageState()

  // Challans opted OUT of Express (10d) — default: all eligible court challans start in Regular
  const [regularIds, setRegularIds] = useState<Set<string>>(() => {
    const idSet = new Set(selectedChallanIds)
    return new Set(
      challans
        .filter((c) => idSet.has(c.id) && c.type === 'court' && c.expressEligible !== false)
        .map((c) => c.id),
    )
  })
  const toggleRowExpress = (id: string) =>
    setRegularIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const selectedChallans = useMemo(() => {
    const idSet = new Set(selectedChallanIds)
    return challans
      .filter((c) => idSet.has(c.id))
      .slice()
      .sort((a, b) => (a.type === 'court' ? 0 : 1) - (b.type === 'court' ? 0 : 1))
  }, [challans, selectedChallanIds])

  const effectiveChallans = selectedChallans

  const summary = useMemo(() => {
    const online = effectiveChallans.filter((c) => c.type === 'online')
    const court = effectiveChallans.filter((c) => c.type === 'court')
    const onlineAmount = online.reduce((sum, c) => sum + c.amount, 0)
    const courtAmount = court.reduce((sum, c) => sum + c.amount, 0)

    // Online challans always pay the online convenience fee. Court challans
    // pay a regular fee unless they've opted into Express (10 days).
    const expressCourt = court.filter((c) => c.expressEligible !== false && !regularIds.has(c.id))
    const regularCourt = court.filter((c) => !expressCourt.includes(c))
    const expressCount = expressCourt.length
    const regularCourtCount = regularCourt.length
    const regularCourtAmount = regularCourt.reduce((sum, c) => sum + c.amount, 0)
    const expressCourtAmount = expressCourt.reduce((sum, c) => sum + c.amount, 0)
    const onlineFee = online.length * ONLINE_CONVENIENCE_FEE
    const regularFee = regularCourtCount * COURT_CONVENIENCE_FEE
    const expressFee = expressCount * EXPRESS_CONVENIENCE_FEE
    const totalFee = onlineFee + regularFee + expressFee
    const subtotal = onlineAmount + courtAmount + totalFee

    return {
      onlineCount: online.length,
      courtCount: court.length,
      onlineAmount,
      courtAmount,
      onlineFee,
      regularCourtCount,
      regularCourtAmount,
      regularFee,
      expressCount,
      expressCourtAmount,
      expressFee,
      totalFee,
      subtotal,
    }
  }, [effectiveChallans, regularIds])

  const isPremium = resolutionMethod === 'premium'
  const displaySummary = summary

  const [pledgeChecked, setPledgeChecked] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [legalChargesInfo, setLegalChargesInfo] = useState<'online' | 'court' | null>(null)
  const [showIneligibleInfo, setShowIneligibleInfo] = useState(false)
  const [showExpressIneligibleInfo, setShowExpressIneligibleInfo] = useState(false)
  const [showAllIneligible, setShowAllIneligible] = useState(false)
  const [showXpressWelcome, setShowXpressWelcome] = useState(() =>
    effectiveChallans.some((c) => c.type === 'court' && c.expressEligible !== false),
  )
  const [showOnlineChallans, setShowOnlineChallans] = useState(false)

  const pledgeActive = pledgeChecked && !isPremium && displaySummary.expressCount === 0
  const payNowTotal = pledgeActive ? Math.max(0, displaySummary.subtotal - PLEDGE_REWARD) : displaySummary.subtotal
  const effectiveChallanIds = useMemo(() => effectiveChallans.map((c) => c.id), [effectiveChallans])
  const selectedCount = effectiveChallanIds.length

  useModalA11y(legalChargesInfo !== null, () => setLegalChargesInfo(null))
  useModalA11y(showBackConfirm, () => setShowBackConfirm(false))
  useModalA11y(showIneligibleInfo, () => setShowIneligibleInfo(false))
  useModalA11y(showExpressIneligibleInfo, () => setShowExpressIneligibleInfo(false))
  useModalA11y(showXpressWelcome, () => setShowXpressWelcome(false))

  const prefersReducedMotion = useReducedMotion()

  const handlePledge = () => {
    const next = !pledgeChecked
    setPledgeChecked(next)
    if (next) {
      if (!prefersReducedMotion) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      }
      toast.success('Congratulations! Reward applied 🎉')
    }
  }

  const pledgeCard = !isPremium ? (
    <div className="bg-white rounded-2xl overflow-hidden border border-border/60 p-4 sm:p-5">
      <label className="flex items-center justify-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={pledgeChecked}
          onChange={handlePledge}
          className="w-6 h-6 rounded border-primary text-primary accent-primary focus:ring-primary flex-shrink-0"
        />
        <p className="font-display font-medium text-base text-text-primary">
          {t.payment.pledgeTitle}
        </p>
      </label>
      <div
        className={cn(
          'mt-4 flex items-center gap-3 rounded-lg p-3.5 transition-colors',
          pledgeChecked
            ? 'bg-gradient-to-r from-emerald-100 via-emerald-50 to-white'
            : 'bg-gradient-to-r from-amber-100 via-amber-50 to-white'
        )}
      >
        <Gift
          className={cn(
            'w-6 h-6 flex-shrink-0',
            pledgeChecked ? 'text-emerald-700' : 'text-amber-700'
          )}
        />
        <p
          className={cn(
            'font-display text-base sm:text-lg font-bold leading-tight',
            pledgeChecked ? 'text-emerald-700' : 'text-amber-700'
          )}
        >
          {pledgeChecked ? t.payment.rewardAppliedCongrats : t.payment.rewardAmount}
        </p>
      </div>
    </div>
  ) : null

  const handlePayment = () => {
    const txnId = `TXN${Date.now()}`
    recordTransaction(txnId, payNowTotal, effectiveChallanIds.length)
    markSubmitted(effectiveChallanIds)
    navigate('/payment/completed')
  }

  const handleBack = () => {
    setShowBackConfirm(true)
  }

  const confirmBack = () => {
    setShowBackConfirm(false)
    navigate(-1)
  }

  return (
    <PageTransition>
      {/* Ineligible Challans Info Modal */}
      {showIneligibleInfo && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowIneligibleInfo(false)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowIneligibleInfo(false)}
              className="absolute top-2 right-2 z-10 w-11 h-11 rounded-full bg-white/80 flex items-center justify-center text-gray-500 hover:bg-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="bg-gradient-to-b from-gray-50 via-gray-50/40 to-white pt-8 pb-4 px-6 text-left">
              <h3 className="font-display text-xl font-bold text-text-primary mb-2">
                {t.payment.ineligibleChallansTitle}
              </h3>
              <p className="text-base leading-relaxed text-text-primary">
                {t.payment.ineligibleChallansDesc}
              </p>
            </div>

            <div className="px-6 pt-4 pb-6">
              <button
                onClick={() => setShowIneligibleInfo(false)}
                className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm shadow-sm"
              >
                {t.payment.gotIt}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* XPress Welcome Modal — shown on first arrival when court challans are eligible */}
      {showXpressWelcome && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowXpressWelcome(false)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowXpressWelcome(false)}
              className="absolute top-2 right-2 z-10 w-11 h-11 rounded-full bg-white/80 flex items-center justify-center text-gray-500 hover:bg-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="bg-gradient-to-b from-cyan-50 via-cyan-50/40 to-white pt-8 pb-4 px-6 text-left">
              <div className="flex items-center gap-2.5 mb-2">
                <img
                  src="/images/resolution-premium.png"
                  alt=""
                  aria-hidden
                  className="w-8 h-8 object-contain"
                />
                <h3 className="font-display text-xl font-bold">
                  <span className="text-text-primary">ChallanPay </span>
                  <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                    XPress
                  </span>
                </h3>
              </div>
              <p className="text-base leading-relaxed text-text-primary">
                Your challans are eligible for XPress Resolution.
              </p>
            </div>

            <div className="px-6 py-4 space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-emerald-50/60 border border-emerald-100 p-3.5">
                <span className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100">
                  <Clock className="w-5 h-5 text-emerald-700" />
                </span>
                <p className="font-display font-semibold text-text-primary">10 Days Resolution</p>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-emerald-50/60 border border-emerald-100 p-3.5">
                <span className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100">
                  <ShieldAlert className="w-5 h-5 text-emerald-700" />
                </span>
                <p className="font-display font-semibold text-text-primary">Priority Support</p>
              </div>
            </div>

            <div className="px-6 pt-2 pb-6">
              <button
                type="button"
                onClick={() => setShowXpressWelcome(false)}
                aria-label="Okay"
                className="relative overflow-hidden w-full inline-flex items-center justify-center rounded-xl bg-primary text-white py-3.5 font-semibold shadow-sm hover:bg-primary-dark transition-colors"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"
                />
                <span className="relative">Okay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Express-Ineligible Row Info Modal */}
      {showExpressIneligibleInfo && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowExpressIneligibleInfo(false)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowExpressIneligibleInfo(false)}
              className="absolute top-2 right-2 z-10 w-11 h-11 rounded-full bg-white/80 flex items-center justify-center text-gray-500 hover:bg-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="bg-gradient-to-b from-gray-50 via-gray-50/40 to-white pt-8 pb-4 px-6 text-left">
              <h3 className="font-display text-xl font-bold text-text-primary mb-2">
                Not eligible for XPress
              </h3>
              <p className="text-base leading-relaxed text-text-primary">
                This challan requires standard court dispute timelines and is ineligible for XPress resolution.
              </p>
            </div>

            <div className="px-6 pt-4 pb-6">
              <button
                onClick={() => setShowExpressIneligibleInfo(false)}
                className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm shadow-sm"
              >
                {t.payment.gotIt}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legal Charges Info Modal */}
      {legalChargesInfo && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setLegalChargesInfo(null)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLegalChargesInfo(null)}
              className="absolute top-2 right-2 z-10 w-11 h-11 rounded-full bg-white/80 flex items-center justify-center text-gray-500 hover:bg-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="bg-gradient-to-b from-cyan-50 via-cyan-50/40 to-white pt-8 pb-4 px-6 text-left">
              <h3 className="font-display text-xl font-bold text-text-primary mb-2">
                {t.payment.legalCharges}
              </h3>
              <p className="text-base leading-relaxed text-text-primary">
                {legalChargesInfo === 'online' ? t.payment.onlineLegalFeeDesc : t.payment.courtLegalFeeDesc}
              </p>
            </div>

            <div className="px-6 pt-4 pb-6">
              <button
                onClick={() => setLegalChargesInfo(null)}
                className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm shadow-sm"
              >
                {t.payment.gotIt}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back Confirmation Modal */}
      {showBackConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowBackConfirm(false)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowBackConfirm(false)}
              className="absolute top-2 right-2 z-10 w-11 h-11 rounded-full bg-white/80 flex items-center justify-center text-gray-500 hover:bg-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="bg-gradient-to-b from-amber-50 via-amber-50/40 to-white pt-8 pb-3 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6 text-amber-600" strokeWidth={2.5} />
              </div>
              <h3 className="font-display text-xl font-bold text-text-primary mb-1">
                {t.payment.leaveBackTitle}
              </h3>
              <p className="text-sm text-text-secondary">
                {t.payment.leaveBackSubtitle}
              </p>
            </div>

            {/* Reassurance + soft nudges */}
            <div className="px-6 pt-2 pb-6">
              <div className="space-y-2.5 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/70">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-emerald-600" strokeWidth={3} />
                  </div>
                  <span className="text-sm font-medium text-text-primary">{t.payment.selectionSaved}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/70">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium text-text-primary">{t.payment.avoidLateFees}</span>
                </div>
              </div>

              {/* Pay Now button */}
              <button
                onClick={() => setShowBackConfirm(false)}
                className="w-full py-3.5 min-h-11 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm shadow-sm"
              >
                {t.payment.continueToPay}
              </button>

              {/* Go Back link */}
              <button
                onClick={confirmBack}
                className="w-full py-3 min-h-11 text-text-secondary font-medium text-sm hover:text-text-primary transition-colors mt-1"
              >
                {t.payment.goBack}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Mobile: Header outside grid */}
        <div className="mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              aria-label="Back"
              className="w-11 h-11 rounded-full flex items-center justify-center text-text-secondary hover:bg-gray-100 hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-text-primary">Selected Challans</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px] gap-6 lg:gap-8 xl:gap-10">
          {/* Left: Resolution Options (Pledge nested in Regular) + Selected Challans */}
          <div className="min-w-0 space-y-4">
            {/* Ineligible Challans — Express only, shown above Selected Challans */}
            {pageState !== 'loading' && isPremium && (() => {
              const ineligibleCourt = selectedChallans.filter(
                (c) => c.type === 'court' && c.expressEligible === false,
              )
              const ineligibleOnline = selectedChallans.filter((c) => c.type === 'online')
              const totalIneligible = ineligibleCourt.length + ineligibleOnline.length
              if (totalIneligible === 0) return null
              const INITIAL_VISIBLE = 3
              const isCollapsed = !showAllIneligible && totalIneligible > INITIAL_VISIBLE
              const courtVisible = isCollapsed
                ? ineligibleCourt.slice(0, INITIAL_VISIBLE)
                : ineligibleCourt
              const onlineBudget = isCollapsed
                ? Math.max(0, INITIAL_VISIBLE - courtVisible.length)
                : ineligibleOnline.length
              const onlineVisible = ineligibleOnline.slice(0, onlineBudget)
              const hiddenCount = totalIneligible - (courtVisible.length + onlineVisible.length)
              const renderIneligibleRow = (c: typeof selectedChallans[number], idx: number) => (
                <li key={c.id} className="py-2 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-text-light/70 tabular-nums">
                          {idx + 1}.
                        </span>
                        <span className="font-mono text-xs text-text-light">
                          #{c.challanNumber}
                        </span>
                      </div>
                    </div>
                    <span className="font-display text-xs whitespace-nowrap text-text-light flex-shrink-0">
                      ₹{formatINR(c.amount)}
                    </span>
                  </div>
                </li>
              )
              return (
                <div className="bg-gray-50/70 rounded-xl border border-border/50 p-4 sm:p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <h3 className="font-display font-bold text-base text-text-primary">
                      {t.payment.ineligibleChallansTitle}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowIneligibleInfo(true)}
                      aria-label={t.payment.ineligibleChallansTitle}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-text-light hover:text-text-primary hover:bg-gray-200/60 transition-colors"
                    >
                      <Info className="w-4 h-4" aria-hidden />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {courtVisible.length > 0 && (
                      <section>
                        <div className="flex items-baseline gap-2 mb-1.5">
                          <h4 className="font-display font-semibold text-xs text-rose-800/60 uppercase tracking-wide">
                            {t.payment.courtChallans}
                          </h4>
                          <span className="font-display font-semibold text-xs text-rose-800/50 tabular-nums">
                            {ineligibleCourt.length}
                          </span>
                        </div>
                        <ul className="divide-y divide-border/40">
                          {courtVisible.map((c, idx) => renderIneligibleRow(c, idx))}
                        </ul>
                      </section>
                    )}
                    {onlineVisible.length > 0 && (
                      <section>
                        <div className="flex items-baseline gap-2 mb-1.5">
                          <h4 className="font-display font-semibold text-xs text-cyan-700/60 uppercase tracking-wide">
                            {t.payment.onlineChallans}
                          </h4>
                          <span className="font-display font-semibold text-xs text-cyan-700/50 tabular-nums">
                            {ineligibleOnline.length}
                          </span>
                        </div>
                        <ul className="divide-y divide-border/40">
                          {onlineVisible.map((c, idx) => renderIneligibleRow(c, idx))}
                        </ul>
                      </section>
                    )}
                  </div>
                  {totalIneligible > INITIAL_VISIBLE && (
                    <button
                      type="button"
                      onClick={() => setShowAllIneligible((v) => !v)}
                      className="mt-3 w-full flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold text-text-light hover:text-text-primary hover:bg-gray-100/70 transition-colors"
                    >
                      <span>
                        {showAllIneligible
                          ? t.payment.showLess
                          : t.payment.showMoreCount.replace('{n}', String(hiddenCount))}
                      </span>
                      <ChevronDown
                        className={cn(
                          'w-3.5 h-3.5 transition-transform',
                          showAllIneligible && 'rotate-180',
                        )}
                        aria-hidden
                      />
                    </button>
                  )}
                </div>
              )
            })()}

            {/* Selected Challans */}
            {pageState === 'loading' ? (
              <div className="bg-white rounded-xl p-4 sm:p-5 space-y-3">
                <Skeleton className="h-4 w-40" />
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {(() => {
                  const allOnlineList = selectedChallans.filter((c) => c.type === 'online')
                  const allCourtList = selectedChallans.filter((c) => c.type === 'court')
                  const onlineList = isPremium ? [] : allOnlineList
                  const courtList = isPremium
                    ? allCourtList.filter((c) => c.expressEligible !== false)
                    : allCourtList
                  const renderRow = (c: typeof selectedChallans[number], idx: number) => {
                    const premiumOnly = !isPremium && c.amount === 0
                    const isCourt = c.type === 'court'
                    const canExpress = isCourt && c.expressEligible !== false
                    const isExpress = canExpress && !regularIds.has(c.id)
                    return (
                      <li
                        key={c.id}
                        className={cn(
                          'flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-4 sm:py-5 rounded-xl border transition-colors min-w-0',
                          isExpress ? 'border-amber-300 bg-amber-50/50' : 'border-gray-300 bg-white',
                          premiumOnly && 'opacity-60'
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-x-3 sm:gap-x-6 gap-y-1 min-w-0 flex-nowrap sm:flex-wrap">
                            <span className="font-mono text-xs text-text-light tabular-nums flex-shrink-0">
                              {idx + 1}.
                            </span>
                            <span className="font-mono font-semibold text-xs sm:text-sm text-text-primary truncate min-w-0">
                              {c.challanNumber}
                            </span>
                            {!premiumOnly && (
                              <span className="font-display font-bold text-sm text-text-primary whitespace-nowrap tabular-nums flex-shrink-0">
                                ₹{formatINR(c.amount)}
                              </span>
                            )}
                            {premiumOnly && (
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 whitespace-nowrap flex-shrink-0">
                                {t.payment.eligibleForPremium}
                              </span>
                            )}
                          </div>
                          {c.violation && (
                            <p className="text-sm text-text-light mt-1 ml-6 sm:ml-9 truncate max-w-[200px] sm:max-w-[360px]">{c.violation}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isCourt && canExpress ? (
                            <div
                              className={cn(
                                'inline-flex items-center gap-2 pl-2 pr-1 py-1 rounded-full transition-colors',
                                isExpress ? 'bg-amber-100' : 'bg-gray-100'
                              )}
                            >
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1.5 text-[11px] font-semibold whitespace-nowrap transition-colors',
                                  isExpress ? 'text-amber-800' : 'text-text-secondary'
                                )}
                              >
                                {isExpress && (
                                  <img
                                    src="/images/resolution-premium.png"
                                    alt=""
                                    aria-hidden
                                    className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                                  />
                                )}
                                {isExpress ? 'XPress: 10 Days' : '45 Days'}
                              </span>
                              <button
                                type="button"
                                role="switch"
                                aria-checked={isExpress}
                                aria-label={`XPress delivery for challan ${c.challanNumber}`}
                                onClick={() => toggleRowExpress(c.id)}
                                className={cn(
                                  'relative flex-shrink-0 h-5 w-9 sm:h-6 sm:w-11 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
                                  isExpress ? 'bg-emerald-500' : 'bg-gray-300'
                                )}
                              >
                                <span
                                  className={cn(
                                    'absolute top-0.5 left-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white shadow-md transition-transform duration-200',
                                    isExpress ? 'translate-x-4 sm:translate-x-5' : 'translate-x-0'
                                  )}
                                />
                              </button>
                            </div>
                          ) : isCourt ? (
                            <div className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full bg-gray-100">
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-text-secondary whitespace-nowrap">
                                <Clock className="w-3 h-3" aria-hidden />
                                45 Days
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowExpressIneligibleInfo(true)}
                                aria-label="Why is XPress not available?"
                                className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full text-text-light hover:text-text-primary hover:bg-gray-200 transition-colors"
                              >
                                <Info className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                role="switch"
                                aria-checked={false}
                                aria-disabled
                                disabled
                                aria-label={`XPress delivery not available for challan ${c.challanNumber}`}
                                className="relative flex-shrink-0 h-5 w-9 sm:h-6 sm:w-11 rounded-full bg-gray-200 opacity-70 cursor-not-allowed"
                              >
                                <span className="absolute top-0.5 left-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white shadow-sm" />
                              </button>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-text-secondary whitespace-nowrap">
                              <Clock className="w-3 h-3" aria-hidden />
                              15 Days
                            </span>
                          )}
                        </div>
                      </li>
                    )
                  }
                  const renderSectionHeader = (
                    title: string,
                    count: number,
                    colorClass: string,
                    countColorClass: string,
                  ) => (
                    <div className="flex items-baseline gap-2.5 mb-2.5">
                      <h4 className={cn('font-display font-bold text-base sm:text-lg', colorClass)}>
                        {title}
                      </h4>
                      <span className={cn('font-display font-bold text-base sm:text-lg tabular-nums', countColorClass)}>
                        {count}
                      </span>
                    </div>
                  )
                  const ONLINE_INITIAL_VISIBLE = 2
                  const visibleOnline = showOnlineChallans
                    ? onlineList
                    : onlineList.slice(0, ONLINE_INITIAL_VISIBLE)
                  const hiddenOnlineCount = onlineList.length - ONLINE_INITIAL_VISIBLE
                  const onlineTotal = displaySummary.onlineAmount + displaySummary.onlineFee
                  const onlineSection = onlineList.length > 0 && (
                    <section key="online" className="bg-gray-50/70 rounded-2xl border border-border/40 p-4 sm:p-5">
                      {renderSectionHeader(
                        t.payment.onlineChallans,
                        onlineList.length,
                        'text-cyan-700',
                        'text-cyan-700/70',
                      )}
                      <ul className="space-y-2">
                        {visibleOnline.map((c, idx) => renderRow(c, idx))}
                      </ul>
                      {hiddenOnlineCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowOnlineChallans((v) => !v)}
                          className="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-cyan-700 hover:bg-gray-50 transition-colors"
                        >
                          {showOnlineChallans
                            ? 'Show less'
                            : `Show ${hiddenOnlineCount} more ${hiddenOnlineCount === 1 ? 'challan' : 'challans'}`}
                          <ChevronDown
                            className={cn('w-4 h-4 transition-transform', showOnlineChallans && 'rotate-180')}
                            aria-hidden
                          />
                        </button>
                      )}
                      <div className="mt-3.5 pt-3 border-t border-border/60 flex items-baseline justify-between">
                        <span className="font-display text-sm font-semibold text-text-primary">
                          Total Payable Online Challans
                        </span>
                        <span className="font-display text-base font-bold text-text-primary tabular-nums">
                          ₹{formatINR(onlineTotal)}
                        </span>
                      </div>
                    </section>
                  )
                  const expressEligibleCount = courtList.filter((c) => c.expressEligible !== false).length
                  const expressEligibleIds = courtList
                    .filter((c) => c.expressEligible !== false)
                    .map((c) => c.id)
                  const allExpressOn =
                    expressEligibleIds.length > 0 &&
                    expressEligibleIds.every((id) => !regularIds.has(id))
                  const toggleAllExpress = () =>
                    setRegularIds((prev) => {
                      const next = new Set(prev)
                      if (allExpressOn) {
                        expressEligibleIds.forEach((id) => next.add(id))
                      } else {
                        expressEligibleIds.forEach((id) => next.delete(id))
                      }
                      return next
                    })
                  const courtSection = courtList.length > 0 && (
                    <section key="court" className="bg-gray-50/70 rounded-2xl border border-border/40 p-4 sm:p-5">
                      <div className="flex items-baseline justify-between gap-3 mb-2.5">
                        <div className="flex items-baseline gap-2.5">
                          <h4 className="font-display font-bold text-base sm:text-lg text-rose-800">
                            {t.payment.courtChallans}
                          </h4>
                          <span className="font-display font-bold text-base sm:text-lg tabular-nums text-rose-800/70">
                            {courtList.length}
                          </span>
                        </div>
                        {expressEligibleCount > 0 && (
                          <button
                            type="button"
                            onClick={toggleAllExpress}
                            role="switch"
                            aria-checked={allExpressOn}
                            aria-label={allExpressOn ? 'Switch all to Regular' : 'Switch all to XPress'}
                            className={cn(
                              'relative overflow-hidden inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-colors whitespace-nowrap',
                              allExpressOn
                                ? 'bg-gradient-to-r from-white via-gray-50 to-white text-cyan-700 hover:from-gray-50 hover:to-gray-50'
                                : 'bg-gradient-to-r from-amber-100 via-amber-50 to-white text-amber-700 hover:from-amber-200 hover:via-amber-100 hover:to-amber-50',
                            )}
                          >
                            <span
                              aria-hidden
                              className={cn(
                                'pointer-events-none absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r animate-shine',
                                allExpressOn
                                  ? 'from-transparent via-cyan-500/40 to-transparent'
                                  : 'from-transparent via-white to-transparent',
                              )}
                            />
                            <span className="relative">
                              {allExpressOn ? 'Switch all to Regular' : 'Switch all to XPress'}
                            </span>
                            <span
                              aria-hidden
                              className={cn(
                                'relative flex-shrink-0 h-5 w-9 rounded-full transition-colors duration-200',
                                allExpressOn ? 'bg-emerald-500' : 'bg-gray-300',
                              )}
                            >
                              <span
                                className={cn(
                                  'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-200',
                                  allExpressOn ? 'translate-x-4' : 'translate-x-0',
                                )}
                              />
                            </span>
                          </button>
                        )}
                      </div>
                      <ul className="space-y-2">
                        {courtList.map((c, idx) => renderRow(c, idx))}
                      </ul>
                      {(() => {
                        const courtGross =
                          displaySummary.courtAmount + displaySummary.regularFee + displaySummary.expressFee
                        const courtNet = Math.max(0, courtGross - (pledgeActive ? PLEDGE_REWARD : 0))
                        return (
                          <>
                            {pledgeActive && (
                              <div className="mt-3.5 flex items-baseline justify-between rounded-lg bg-emerald-50 px-3 py-2">
                                <span className="font-display text-sm font-semibold text-emerald-700 inline-flex items-center gap-1.5">
                                  <Gift className="w-4 h-4" aria-hidden />
                                  Pledge reward applied
                                </span>
                                <span className="font-display text-sm font-semibold text-emerald-700 tabular-nums">
                                  -₹{formatINR(PLEDGE_REWARD)}
                                </span>
                              </div>
                            )}
                            <div
                              className={cn(
                                'pt-3 border-t border-border/60 flex items-baseline justify-between',
                                pledgeActive ? 'mt-3' : 'mt-3.5',
                              )}
                            >
                              <span className="font-display text-sm font-semibold text-text-primary">
                                Total Payable Court Challans
                              </span>
                              <span className="font-display text-base font-bold text-text-primary tabular-nums">
                                ₹{formatINR(courtNet)}
                              </span>
                            </div>
                          </>
                        )
                      })()}
                    </section>
                  )
                  return (
                    <div className="space-y-6">
                      {courtSection}
                      {onlineSection}
                    </div>
                  )
                })()}
              </div>
            )}

          </div>

          {/* Right: Payment Summary (desktop only) */}
          <div className="hidden lg:block lg:sticky lg:top-20 lg:self-start min-w-0 space-y-4">
            {pageState !== 'loading' && pledgeCard}
            {pageState === 'loading' ? (
              <div className="bg-white rounded-2xl p-6 space-y-4">
                <Skeleton className="h-5 w-56" />
                <Skeleton className="h-9 w-full rounded-lg" />
                <hr className="border-border" />
                <div className="space-y-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
                <hr className="border-border" />
                <div className="flex justify-between items-baseline">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ) : (
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
              <h3 className="font-display font-bold text-base text-text-primary mb-4">
                {(() => {
                  const count = selectedCount
                  return `${count} ${count === 1 ? 'Challan' : 'Challans'} selected for settlement`
                })()}
              </h3>

              <div className="rounded-xl border border-border p-4 space-y-3.5">
                <h4 className="font-display font-semibold text-sm text-text-primary">Regular</h4>
                <RegularSummary
                  summary={displaySummary}
                  t={t}
                  onOnlineFeeInfo={() => setLegalChargesInfo('online')}
                  onCourtFeeInfo={() => setLegalChargesInfo('court')}
                />
                {pledgeActive && (
                  <div className="flex justify-between text-sm bg-emerald-50 -mx-4 px-4 py-2.5 rounded-lg">
                    <span className="font-display font-semibold text-emerald-700">{t.payment.pledgeReward}</span>
                    <span className="font-display font-semibold text-emerald-700">-₹{formatINR(PLEDGE_REWARD)}</span>
                  </div>
                )}
                {regularBlockTotal(displaySummary) > 0 && (
                  <>
                    <hr className="border-border" />
                    <div className="flex justify-between items-baseline">
                      <span className="font-display text-[13px] font-bold text-text-primary">Subtotal</span>
                      <span className="font-display text-sm font-bold text-text-primary">
                        ₹{formatINR(Math.max(0, regularBlockTotal(displaySummary) - (pledgeActive ? PLEDGE_REWARD : 0)))}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {displaySummary.expressCount > 0 && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-display font-semibold text-sm text-amber-900">XPress</h4>
                    <ResolutionBadge />
                  </div>
                  <ExpressSummary summary={displaySummary} />
                </div>
              )}

              <hr className="border-border my-3.5" />
              <div className="flex justify-between items-baseline">
                <span className="font-display text-[15px] font-bold text-text-primary">
                  {isPremium ? t.payment.totalAmount : t.payment.grandTotal}
                </span>
                <span className="font-display text-lg font-bold text-text-primary">
                  ₹{formatINR(payNowTotal)}
                </span>
              </div>
              <button
                onClick={handlePayment}
                className="w-full mt-4 py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-md relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 text-sm">
                  {t.payment.proceedToPay}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </button>
            </div>
            )}
          </div>
        </div>

        {/* Mobile: Sticky bottom payment bar */}
        {pageState === 'loading' ? (
          <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3 safe-bottom">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2 flex-1 min-w-0">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-28" />
              </div>
              <Skeleton className="h-12 w-36 rounded-xl" />
            </div>
          </div>
        ) : (
        <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3 safe-bottom">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-text-light">{isPremium ? t.payment.totalAmount : t.payment.grandTotal}</p>
              <p className="font-display text-lg font-bold text-text-primary">
                ₹{formatINR(payNowTotal)}
              </p>
              {pledgeActive && (
                <p className="text-[10px] text-success font-medium">{t.payment.savedAmount}</p>
              )}
            </div>
            <button
              onClick={handlePayment}
              className="relative flex-shrink-0 overflow-hidden px-7 sm:px-9 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-md text-base"
            >
              <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
              <span className="relative">{t.payment.proceedToPay}</span>
            </button>
          </div>
        </div>
        )}

        {/* Mobile: Expandable summary drawer */}
        {pageState === 'loading' ? (
          <div className="lg:hidden mt-4 mb-20 bg-white rounded-xl p-4 space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-9 w-full rounded-lg" />
            <hr className="border-border" />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
            <hr className="border-border" />
            <div className="flex justify-between items-baseline">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        ) : (
        <>
        {pledgeCard && <div className="lg:hidden mt-4">{pledgeCard}</div>}
        <details open className="lg:hidden mt-4 mb-20 bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <summary className="flex items-center justify-between p-4 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
            <span className="font-display font-semibold text-sm text-text-primary">{t.payment.paymentSummary}</span>
            <ChevronDown className="w-5 h-5 text-text-light transition-transform [[open]>&]:rotate-180" />
          </summary>
          <div className="px-4 pb-4 space-y-3">
            <hr className="border-border" />

            <div className="rounded-xl border border-border p-4 space-y-3.5">
              <h4 className="font-display font-semibold text-sm text-text-primary">Regular</h4>
              <RegularSummary
                summary={displaySummary}
                t={t}
                onOnlineFeeInfo={() => setLegalChargesInfo('online')}
                onCourtFeeInfo={() => setLegalChargesInfo('court')}
              />
              {pledgeActive && (
                <div className="flex justify-between text-sm bg-emerald-50 -mx-4 px-4 py-2.5 rounded-lg">
                  <span className="font-display font-semibold text-emerald-700">{t.payment.pledgeReward}</span>
                  <span className="font-display font-semibold text-emerald-700">-₹{formatINR(PLEDGE_REWARD)}</span>
                </div>
              )}
              {regularBlockTotal(displaySummary) > 0 && (
                <>
                  <hr className="border-border" />
                  <div className="flex justify-between items-baseline">
                    <span className="font-display text-[13px] font-bold text-text-primary">Total Amount</span>
                    <span className="font-display text-sm font-bold text-text-primary">
                      ₹{formatINR(Math.max(0, regularBlockTotal(displaySummary) - (pledgeActive ? PLEDGE_REWARD : 0)))}
                    </span>
                  </div>
                </>
              )}
            </div>

            {displaySummary.expressCount > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-display font-semibold text-sm text-amber-900">XPress</h4>
                  <ResolutionBadge />
                </div>
                <ExpressSummary summary={displaySummary} />
              </div>
            )}

            <hr className="border-border" />
            <div className="flex justify-between items-baseline">
              <span className="font-display text-sm font-bold text-text-primary">
                {isPremium ? t.payment.totalAmount : t.payment.grandTotal}
              </span>
              <span className="font-display text-base font-bold text-text-primary">
                ₹{formatINR(payNowTotal)}
              </span>
            </div>
          </div>
        </details>
        </>
        )}
      </div>
    </PageTransition>
  )
}

type SummaryBreakdownProps = {
  summary: {
    onlineCount: number
    onlineAmount: number
    onlineFee: number
    regularCourtCount: number
    regularCourtAmount: number
    regularFee: number
    expressCount: number
    expressCourtAmount: number
    expressFee: number
  }
  t: ReturnType<typeof useTranslation>['t']
  onOnlineFeeInfo: () => void
  onCourtFeeInfo: () => void
}

function RegularSummary({ summary, t, onOnlineFeeInfo, onCourtFeeInfo }: SummaryBreakdownProps) {
  return (
    <div className="space-y-3.5">
      {summary.onlineCount > 0 && (
        <div className="space-y-0.5">
          <div className="flex justify-between text-[13px]">
            <span className="font-display font-semibold text-text-primary">
              {`Online Challans (${summary.onlineCount})`}
            </span>
            <span className="font-display font-semibold text-text-primary">
              ₹{formatINR(summary.onlineAmount)}
            </span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-text-light inline-flex items-center gap-1">
              {t.payment.convenienceFee}
              <span className="text-text-light/70">
                {`(${summary.onlineCount} x ${ONLINE_CONVENIENCE_FEE})`}
              </span>
              <button
                type="button"
                onClick={onOnlineFeeInfo}
                aria-label={t.payment.onlineLegalFeeTitle}
                className="inline-flex items-center justify-center w-9 h-9 -m-2.5 rounded-full text-text-light/80 hover:text-primary transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </span>
            <span className="font-medium text-text-light">₹{formatINR(summary.onlineFee)}</span>
          </div>
        </div>
      )}

      {summary.regularCourtCount > 0 && (
        <div className="space-y-0.5">
          <div className="flex justify-between text-[13px]">
            <span className="font-display font-semibold text-text-primary">
              {`Court Challans (${summary.regularCourtCount})`}
            </span>
            <span className="font-display font-semibold text-text-primary">
              ₹{formatINR(summary.regularCourtAmount)}
            </span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-text-light inline-flex items-center gap-1">
              {t.payment.convenienceFee}
              <span className="text-text-light/70">
                {`(${summary.regularCourtCount} x ${COURT_CONVENIENCE_FEE})`}
              </span>
              <button
                type="button"
                onClick={onCourtFeeInfo}
                aria-label={t.payment.courtLegalFeeTitle}
                className="inline-flex items-center justify-center w-9 h-9 -m-2.5 rounded-full text-text-light/80 hover:text-primary transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </span>
            <span className="font-medium text-text-light">₹{formatINR(summary.regularFee)}</span>
          </div>
        </div>
      )}

    </div>
  )
}

function regularBlockTotal(summary: SummaryBreakdownProps['summary']) {
  return summary.onlineAmount + summary.onlineFee + summary.regularCourtAmount + summary.regularFee
}

function ExpressSummary({ summary }: { summary: SummaryBreakdownProps['summary'] }) {
  if (summary.expressCount === 0) return null
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[13px]">
        <span className="font-display font-semibold text-amber-800">
          {`XPress Challans (${summary.expressCount})`}
        </span>
        <span className="font-display font-semibold text-amber-800">
          ₹{formatINR(summary.expressCourtAmount)}
        </span>
      </div>
      <div className="flex justify-between text-[13px]">
        <span className="text-amber-800/80 inline-flex items-center gap-1">
          XPress fee
          <span className="text-amber-800/60">
            {`(${summary.expressCount} x ${EXPRESS_CONVENIENCE_FEE})`}
          </span>
        </span>
        <span className="font-medium text-amber-800">₹{formatINR(summary.expressFee)}</span>
      </div>
    </div>
  )
}

function ResolutionBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-black whitespace-nowrap">
      <img
        src="/images/resolution-premium.png"
        alt=""
        aria-hidden
        className="w-5 h-5 object-contain"
      />
      Resolution in 10 Days
    </span>
  )
}
