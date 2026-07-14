import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'
import { Gift, ArrowLeft, X, ShieldAlert, AlertTriangle, ChevronDown, Info, Check } from 'lucide-react'
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
  type ResolutionMethod,
} from '@/stores/challanStore'

const formatINR = (n: number) => n.toLocaleString('en-IN')

export function PaymentPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const challans = useChallanStore((s) => s.challans)
  const selectedChallanIds = useChallanStore((s) => s.selectedChallanIds)
  const resolutionMethod = useChallanStore((s) => s.resolutionMethod)
  const setResolutionMethod = useChallanStore((s) => s.setResolutionMethod)
  const recordTransaction = useChallanStore((s) => s.recordTransaction)
  const markSubmitted = useChallanStore((s) => s.markSubmitted)
  const { state: pageState } = usePageState()

  const selectedChallans = useMemo(() => {
    const idSet = new Set(selectedChallanIds)
    return challans
      .filter((c) => idSet.has(c.id))
      .slice()
      .sort((a, b) => (a.type === 'court' ? 0 : 1) - (b.type === 'court' ? 0 : 1))
  }, [challans, selectedChallanIds])

  const summary = useMemo(() => {
    const online = selectedChallans.filter((c) => c.type === 'online')
    const court = selectedChallans.filter((c) => c.type === 'court')
    const onlineAmount = online.reduce((sum, c) => sum + c.amount, 0)
    const courtAmount = court.reduce((sum, c) => sum + c.amount, 0)
    const onlineFee = online.length * ONLINE_CONVENIENCE_FEE
    const courtFee = court.length * COURT_CONVENIENCE_FEE
    const subtotal = onlineAmount + courtAmount + onlineFee + courtFee

    const premiumAvailableCount = selectedChallans.filter((c) => c.premiumEligible || c.type === 'court').length

    return {
      onlineCount: online.length,
      courtCount: court.length,
      onlineAmount,
      courtAmount,
      onlineFee,
      courtFee,
      expressFee: 0,
      subtotal,
      premiumAvailableCount,
    }
  }, [selectedChallans])

  const hasPremiumEligible = summary.premiumAvailableCount > 0
  const isPremium = resolutionMethod === 'premium' && hasPremiumEligible

  const displaySummary = useMemo(() => {
    if (!isPremium) return summary
    // Express: exclude online challans/fees; flat convenience fee on court challans only; no express fee.
    return {
      ...summary,
      onlineAmount: 0,
      onlineFee: 0,
      courtFee: summary.courtCount > 0 ? EXPRESS_CONVENIENCE_FEE : 0,
      expressFee: 0,
      subtotal: summary.courtAmount + (summary.courtCount > 0 ? EXPRESS_CONVENIENCE_FEE : 0),
    }
  }, [summary, isPremium])

  const [pledgeChecked, setPledgeChecked] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [legalChargesInfo, setLegalChargesInfo] = useState<'online' | 'court' | null>(null)
  const [showMoreBenefits, setShowMoreBenefits] = useState(false)

  const pledgeActive = pledgeChecked && !isPremium
  const payNowTotal = pledgeActive ? Math.max(0, displaySummary.subtotal - PLEDGE_REWARD) : displaySummary.subtotal
  const selectedCount = selectedChallanIds.length

  useModalA11y(legalChargesInfo !== null, () => setLegalChargesInfo(null))
  useModalA11y(showBackConfirm, () => setShowBackConfirm(false))

  const prefersReducedMotion = useReducedMotion()

  const RESOLUTION_OPTIONS = [
    {
      id: 'regular' as const,
      label: t.payment.regular,
      iconSrc: '/images/resolution-regular.png',
      description: t.payment.regularDesc,
      infoTitle: t.payment.regularInfoTitle,
      benefits: [
        t.payment.regularBenefit1,
        t.payment.regularBenefit2,
        t.payment.regularBenefit3,
        t.payment.regularBenefit4,
      ],
      disabled: false,
    },
    {
      id: 'premium' as const,
      label: t.payment.premium,
      iconSrc: '/images/resolution-premium.png',
      description: t.payment.premiumDesc,
      infoTitle: t.payment.premiumInfoTitle,
      benefits: [
        t.payment.premiumBenefit1,
        t.payment.premiumBenefit2,
        t.payment.premiumBenefit3,
        t.payment.premiumBenefit4,
      ],
      disabled: !hasPremiumEligible,
    },
  ]

  const activeResolutionId: ResolutionMethod =
    resolutionMethod === 'premium' && !hasPremiumEligible ? 'regular' : resolutionMethod
  const activeOption =
    RESOLUTION_OPTIONS.find((o) => o.id === activeResolutionId) ?? RESOLUTION_OPTIONS[0]

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

  const handlePayment = () => {
    const txnId = `TXN${Date.now()}`
    recordTransaction(txnId, payNowTotal, selectedChallanIds.length)
    markSubmitted(selectedChallanIds)
    navigate('/payment/completed')
  }

  const handleBack = () => {
    setShowBackConfirm(true)
  }

  const confirmBack = () => {
    setShowBackConfirm(false)
    navigate(-1)
  }

  const handleResolutionClick = (id: ResolutionMethod, disabled: boolean) => {
    if (disabled) return
    setResolutionMethod(id)
  }

  return (
    <PageTransition>
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
            <h1 className="font-display text-xl sm:text-2xl font-bold text-text-primary">{t.payment.chooseResolution}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 lg:gap-10">
          {/* Left: Resolution Options (Pledge nested in Regular) + Selected Challans */}
          <div className="space-y-4">
            {/* Resolution Tabs + Active Screen */}
            <div className="space-y-3">
              {pageState === 'loading' ? (
                <>
                  <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100 rounded-2xl">
                    {[0, 1].map((i) => (
                      <Skeleton key={i} className="h-20 rounded-xl" />
                    ))}
                  </div>
                  <div className="bg-white rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-14 h-14 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-6 w-28 rounded-full" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Tabs row */}
                  <div
                    role="tablist"
                    aria-label={t.payment.chooseResolution}
                    className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100 rounded-2xl border border-border/60"
                  >
                    {RESOLUTION_OPTIONS.map((option) => {
                      const isActive = activeResolutionId === option.id
                      return (
                        <button
                          key={option.id}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          aria-controls={`resolution-screen-${option.id}`}
                          id={`resolution-tab-${option.id}`}
                          disabled={option.disabled}
                          onClick={() => handleResolutionClick(option.id, option.disabled)}
                          className={cn(
                            'relative flex items-center justify-center gap-2 px-2 py-3 rounded-xl text-center transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                            option.disabled
                              ? 'opacity-50 cursor-not-allowed'
                              : isActive
                                ? 'bg-white border border-primary shadow-sm cursor-pointer'
                                : 'bg-transparent border border-transparent hover:bg-white/70 cursor-pointer'
                          )}
                        >
                          <span
                            aria-hidden
                            className={cn(
                              'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                              isActive ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
                            )}
                          >
                            {isActive && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                          </span>
                          <div className="-my-1 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center flex-shrink-0">
                            <img
                              src={option.iconSrc}
                              alt=""
                              aria-hidden
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex flex-col items-start gap-0.5 min-w-0">
                            <span
                              className={cn(
                                'font-display font-semibold text-sm leading-tight',
                                isActive ? 'text-text-primary' : 'text-text-secondary'
                              )}
                            >
                              {option.label}
                            </span>
                            {option.id === 'regular' ? (
                              <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                {t.payment.recommended}
                              </span>
                            ) : (
                              !option.disabled && (
                                <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                  {t.payment.expressTag}
                                </span>
                              )
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Premium disabled hint */}
                  {!hasPremiumEligible && (
                    <p className="text-xs text-text-light ml-1">{t.payment.premiumNotAvailable}</p>
                  )}

                  {/* Active resolution screen */}
                  <div
                    key={activeOption.id}
                    role="tabpanel"
                    id={`resolution-screen-${activeOption.id}`}
                    aria-labelledby={`resolution-tab-${activeOption.id}`}
                    className="animate-slide-down bg-white rounded-2xl overflow-hidden"
                  >
                    <div
                      className={cn(
                        'px-4 sm:px-5 pt-4 pb-3 flex items-start gap-3 sm:gap-4',
                        activeOption.id === 'regular'
                          ? 'bg-gradient-to-b from-cyan-50/70 to-white'
                          : 'bg-gradient-to-b from-amber-50/70 to-white'
                      )}
                    >
                      <div className="-m-1 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0">
                        <img
                          src={activeOption.iconSrc}
                          alt=""
                          aria-hidden
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-display font-bold text-base text-text-primary">
                          {activeOption.infoTitle}
                        </h2>
                        <p className="text-sm text-text-secondary mt-1">{activeOption.description}</p>
                      </div>
                    </div>

                    <div className="px-4 sm:px-5 pb-4">
                      <ul className="grid grid-cols-2 gap-2.5">
                        {activeOption.benefits.map((benefit, i) => (
                          <li
                            key={benefit}
                            className={cn(
                              'flex items-center gap-2.5 rounded-lg px-3 py-2.5',
                              activeOption.id === 'regular' ? 'bg-emerald-50/70' : 'bg-amber-50/70',
                              i >= 2 && !showMoreBenefits && 'hidden lg:flex'
                            )}
                          >
                            <span
                              className={cn(
                                'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                                activeOption.id === 'regular' ? 'bg-emerald-100' : 'bg-amber-100'
                              )}
                            >
                              <Check
                                className={cn(
                                  'w-3.5 h-3.5',
                                  activeOption.id === 'regular' ? 'text-emerald-600' : 'text-amber-600'
                                )}
                                strokeWidth={3}
                              />
                            </span>
                            <span className="text-sm font-medium text-text-primary">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                      {activeOption.benefits.length > 2 && (
                        <div className="lg:hidden mt-2.5 flex justify-center">
                          <button
                            type="button"
                            onClick={() => setShowMoreBenefits((v) => !v)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
                          >
                            {showMoreBenefits ? 'Show less' : 'More'}
                            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', showMoreBenefits && 'rotate-180')} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Pledge Section — Regular only */}
                    {activeOption.id === 'regular' && (
                      <div className="px-4 sm:px-5 pb-4 pt-1 border-t border-border/60">
                        <label className="flex items-start gap-3 cursor-pointer mt-4">
                          <input
                            type="checkbox"
                            checked={pledgeChecked}
                            onChange={handlePledge}
                            className="w-6 h-6 rounded border-primary text-primary accent-primary focus:ring-primary mt-0.5 flex-shrink-0"
                          />
                          <div>
                            <p className="font-display font-semibold text-sm text-text-primary">
                              {t.payment.pledgeTitle}
                            </p>
                            <p className="text-xs text-text-secondary mt-1">
                              {t.payment.pledgeDesc}
                            </p>
                          </div>
                        </label>

                        {/* Reward Info */}
                        <div className="mt-4 flex items-center gap-3 bg-gradient-to-r from-amber-100 via-amber-50 to-white rounded-lg p-3.5">
                          <Gift className="w-6 h-6 text-amber-700 flex-shrink-0" />
                          <div>
                            <p className="font-display text-base sm:text-lg font-bold text-amber-700 leading-tight">{t.payment.rewardAmount}</p>
                            <p className="text-xs text-text-light mt-0.5">{t.payment.rewardApplied}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

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
              <div className="bg-white rounded-xl border border-border shadow-sm p-5 sm:p-6">
                <p className="font-display font-semibold text-sm text-text-light mb-4">
                  {`${selectedCount} ${t.payment.selectedChallansTitle}`}
                </p>
                {(() => {
                  const onlineList = selectedChallans.filter((c) => c.type === 'online')
                  const courtList = selectedChallans.filter((c) => c.type === 'court')
                  const renderRow = (c: typeof selectedChallans[number], idx: number) => {
                    const premiumOnly = !isPremium && c.amount === 0
                    return (
                      <li
                        key={c.id}
                        className={cn('py-2.5 first:pt-0 last:pb-0', premiumOnly && 'opacity-60')}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs text-text-light tabular-nums">
                                {idx + 1}.
                              </span>
                              <span className="font-mono text-sm text-text-primary">
                                #{c.challanNumber}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {premiumOnly ? (
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 whitespace-nowrap">
                                {t.payment.eligibleForPremium}
                              </span>
                            ) : (
                              <span className="font-display font-semibold text-sm whitespace-nowrap text-text-primary">
                                ₹{formatINR(c.amount)}
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    )
                  }
                  const onlineSection = onlineList.length > 0 && (
                    <section
                      key="online"
                      className={cn(isPremium && 'opacity-50 pointer-events-none select-none')}
                    >
                      <div className="flex items-baseline gap-2.5 mb-2.5">
                        <h4 className="font-display font-bold text-base sm:text-lg text-cyan-700">
                          {t.payment.onlineChallans}
                        </h4>
                        <span className="font-display font-bold text-base sm:text-lg text-cyan-700/70 tabular-nums">
                          {onlineList.length}
                        </span>
                        {isPremium && (
                          <span className="ml-1 inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-text-light uppercase tracking-wide">
                            {t.payment.notIncludedInExpress}
                          </span>
                        )}
                      </div>
                      <ul className="divide-y divide-border/60">
                        {onlineList.map((c, idx) => renderRow(c, idx))}
                      </ul>
                    </section>
                  )
                  const courtSection = courtList.length > 0 && (
                    <section key="court">
                      <div className="flex items-baseline gap-2.5 mb-2.5">
                        <h4 className="font-display font-bold text-base sm:text-lg text-rose-800">
                          {t.payment.courtChallans}
                        </h4>
                        <span className="font-display font-bold text-base sm:text-lg text-rose-800/70 tabular-nums">
                          {courtList.length}
                        </span>
                      </div>
                      <ul className="divide-y divide-border/60">
                        {courtList.map((c, idx) => renderRow(c, idx))}
                      </ul>
                    </section>
                  )
                  return (
                    <div className="space-y-6">
                      {isPremium ? (
                        <>
                          {courtSection}
                          {onlineSection}
                        </>
                      ) : (
                        <>
                          {onlineSection}
                          {courtSection}
                        </>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}

          </div>

          {/* Right: Payment Summary (desktop only) */}
          <div className="hidden lg:block lg:sticky lg:top-20 lg:self-start">
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

              <hr className="border-border mb-4" />

              <SummaryBreakdown
                summary={displaySummary}
                isPremium={isPremium}
                t={t}
                onOnlineFeeInfo={() => setLegalChargesInfo('online')}
                onCourtFeeInfo={() => setLegalChargesInfo('court')}
              />

              {/* Pledge Reward */}
              {pledgeActive && (
                <div className="flex justify-between text-sm mt-3.5 bg-emerald-50 -mx-6 px-6 py-2.5">
                  <span className="font-display font-semibold text-success">{t.payment.pledgeReward}</span>
                  <span className="font-display font-semibold text-success">-₹{formatINR(PLEDGE_REWARD)}</span>
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
        <details open className="lg:hidden mt-4 mb-20 bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <summary className="flex items-center justify-between p-4 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
            <span className="font-display font-semibold text-sm text-text-primary">{t.payment.paymentSummary}</span>
            <ChevronDown className="w-5 h-5 text-text-light transition-transform [[open]>&]:rotate-180" />
          </summary>
          <div className="px-4 pb-4 space-y-3">
            <hr className="border-border" />

            <SummaryBreakdown
              summary={displaySummary}
              isPremium={isPremium}
              t={t}
              onOnlineFeeInfo={() => setLegalChargesInfo('online')}
              onCourtFeeInfo={() => setLegalChargesInfo('court')}
            />

            {pledgeActive && (
              <div className="flex justify-between text-sm bg-emerald-50 -mx-4 px-4 py-2.5">
                <span className="font-display font-semibold text-success">{t.payment.pledgeReward}</span>
                <span className="font-display font-semibold text-success">-₹{formatINR(PLEDGE_REWARD)}</span>
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
        )}
      </div>
    </PageTransition>
  )
}

type SummaryBreakdownProps = {
  summary: {
    onlineCount: number
    courtCount: number
    onlineAmount: number
    courtAmount: number
    onlineFee: number
    courtFee: number
    expressFee: number
  }
  isPremium: boolean
  t: ReturnType<typeof useTranslation>['t']
  onOnlineFeeInfo: () => void
  onCourtFeeInfo: () => void
}

function SummaryBreakdown({ summary, isPremium, t, onOnlineFeeInfo, onCourtFeeInfo }: SummaryBreakdownProps) {
  return (
    <div className="space-y-3.5">
      {/* Online Challan — Regular only */}
      {!isPremium && summary.onlineCount > 0 && (
        <div className="space-y-0.5">
          <div className="flex justify-between text-[13px]">
            <span className="font-display font-semibold text-text-primary">
              {`${t.payment.onlineChallan} (${summary.onlineCount})`}
            </span>
            <span className="font-display font-semibold text-text-primary">
              ₹{formatINR(summary.onlineAmount)}
            </span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-text-light inline-flex items-center gap-1">
              {t.payment.convenienceFee} <span className="text-text-light/70">{`(${summary.onlineCount} x ${ONLINE_CONVENIENCE_FEE})`}</span>
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

      {/* Court Challan */}
      {summary.courtCount > 0 && (
        <div className="space-y-0.5">
          <div className="flex justify-between text-[13px]">
            <span className="font-display font-semibold text-text-primary">
              {`${t.payment.courtChallan} (${summary.courtCount})`}
            </span>
            <span className="font-display font-semibold text-text-primary">
              ₹{formatINR(summary.courtAmount)}
            </span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-text-light inline-flex items-center gap-1">
              {t.payment.convenienceFee}
              {!isPremium && (
                <span className="text-text-light/70">{`(${summary.courtCount} x ${COURT_CONVENIENCE_FEE})`}</span>
              )}
              <button
                type="button"
                onClick={onCourtFeeInfo}
                aria-label={t.payment.courtLegalFeeTitle}
                className="inline-flex items-center justify-center w-9 h-9 -m-2.5 rounded-full text-text-light/80 hover:text-primary transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </span>
            <span className="font-medium text-text-light">₹{formatINR(summary.courtFee)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
