import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { Copy, Check, Clock, CircleCheck, ArrowRight, X, Coins, FileWarning, Gavel, Inbox, FilePlus2, Upload, FileText, Loader2, Info, Hourglass } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { useModalA11y } from '@/hooks/useModalA11y'
import { usePageState } from '@/hooks/usePageState'
import { PageTransition } from '@/components/shared/PageTransition'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { Skeleton, SkeletonCard } from '@/components/shared/Skeleton'
import { useTranslation } from '@/hooks/useTranslation'
import { useChallanStore, type ChallanItem } from '@/stores/challanStore'

type Challan = ChallanItem & { pendingSince: string; reportedByUser?: boolean; disabled?: boolean }

interface PaidChallan {
  id: string
  challanNumber: string
  amount: number
  violation: string
  date: string
  location: string
  type: 'online' | 'court'
  paidOn: string
}

const MOCK_CHALLANS: Challan[] = [
  { id: '1', challanNumber: 'UP40838230627114376', amount: 2000, violation: 'B[2019][driver] (driving vehicle-other than two wheeler in contravention of section 3 or section 4)-drives vehicle without holding driving license.', date: '27 Jun 2023', location: 'NH-44, Gurgaon, Haryana - 122001', type: 'online', pendingSince: '24 months', premiumEligible: true },
  { id: '2', challanNumber: 'DL01234567890123456', amount: 5000, violation: 'Disobedience of any direction or obstruction of any function by a driver', date: '15 Jul 2023', location: 'Outer Ring Road, near Dhaula Kuan, New Delhi', type: 'court', pendingSince: '23 months' },
  { id: '3', challanNumber: 'HR26838230627114377', amount: 1000, violation: 'No Helmet', date: '03 Aug 2023', location: 'Sector 29 Market, Gurugram', type: 'online', pendingSince: '22 months', premiumEligible: true },
  { id: '4', challanNumber: 'DL08838230627114378', amount: 2500, violation: 'Improper Parking', date: '11 Sep 2023', location: 'Connaught Place, New Delhi', type: 'online', pendingSince: '20 months', premiumEligible: true },
  { id: '5', challanNumber: 'UP16838230627114379', amount: 10000, violation: 'Driving under the influence of alcohol exceeding permissible blood-alcohol concentration limits', date: '22 Oct 2023', location: 'Greater Noida Expressway, near Pari Chowk', type: 'court', pendingSince: '19 months' },
  { id: '6', challanNumber: 'HR26838230627114380', amount: 1500, violation: 'Without Seatbelt', date: '05 Nov 2023', location: 'NH-8, Manesar', type: 'online', pendingSince: '18 months' },
  { id: '7', challanNumber: 'DL03838230627114381', amount: 0, violation: 'Signal Jump', date: '12 Dec 2023', location: 'ITO Junction, New Delhi', type: 'online', pendingSince: '17 months', disabled: true },
  { id: '8', challanNumber: 'DL05838230627114382', amount: 3000, violation: 'Overspeeding in restricted zone', date: '18 Jan 2024', location: 'Ring Road, near AIIMS, New Delhi', type: 'court', pendingSince: '16 months', expressEligible: false },
]

const MOCK_PAID_CHALLANS: PaidChallan[] = [
  { id: 'p1', challanNumber: 'DL04838230512114300', amount: 1000, violation: 'No Parking', date: '10 Jan 2023', location: 'Karol Bagh, Delhi', type: 'online', paidOn: '15 Mar 2023' },
  { id: 'p2', challanNumber: 'UP32838230418114301', amount: 2000, violation: 'Signal Jump', date: '18 Feb 2023', location: 'Lucknow-Agra Expressway', type: 'online', paidOn: '22 Apr 2023' },
  { id: 'p3', challanNumber: 'HR06838230320114302', amount: 5000, violation: 'Driving without valid insurance', date: '20 Mar 2023', location: 'Sohna Road, Gurgaon', type: 'court', paidOn: '10 May 2023' },
  { id: 'p4', challanNumber: 'DL12838230225114303', amount: 1500, violation: 'Using mobile phone while driving', date: '25 Apr 2023', location: 'Dwarka, Delhi', type: 'online', paidOn: '30 Jun 2023' },
  { id: 'p5', challanNumber: 'UP80838230130114304', amount: 500, violation: 'No Helmet', date: '30 May 2023', location: 'Agra, UP', type: 'online', paidOn: '15 Jul 2023' },
  { id: 'p6', challanNumber: 'HR26838230605114305', amount: 10000, violation: 'Drunk Driving', date: '05 Jun 2023', location: 'MG Road, Gurgaon', type: 'court', paidOn: '20 Aug 2023' },
  { id: 'p7', challanNumber: 'DL09838230710114306', amount: 2500, violation: 'Overspeeding in school zone', date: '10 Jul 2023', location: 'Vasant Kunj, Delhi', type: 'online', paidOn: '05 Sep 2023' },
  { id: 'p8', challanNumber: 'UP16838230815114307', amount: 1000, violation: 'Without Seatbelt', date: '15 Aug 2023', location: 'Noida Expressway', type: 'online', paidOn: '01 Oct 2023' },
]

type Filter = 'all' | 'online' | 'court'
type Tab = 'pending' | 'in-progress' | 'paid'

// Hoist constant arrays outside component (rerender-no-inline-components)
const FILTERS: Filter[] = ['all', 'online', 'court']

// Truncate a string to the first N words, appending an ellipsis if longer.
const truncateWords = (text: string, n: number) => {
  const words = text.split(/\s+/)
  return words.length > n ? words.slice(0, n).join(' ') + '…' : text
}

export function StatusPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const vehicle = searchParams.get('vehicle') || 'DL 01 AB 1234'
  const [activeTab, setActiveTab] = useState<Tab>('pending')
  const [activeFilter, setActiveFilter] = useState<Filter>('all')
  const selectedIds = useChallanStore((s) => s.selectedChallanIds)
  const toggleChallanInStore = useChallanStore((s) => s.toggleChallan)
  const selectAllInStore = useChallanStore((s) => s.selectAll)
  const setChallansInStore = useChallanStore((s) => s.setChallans)
  const submittedChallans = useChallanStore((s) => s.submittedChallans)
  const { state, retry } = usePageState()
  const { copy } = useCopyToClipboard()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [detailChallan, setDetailChallan] = useState<Challan | null>(null)
  const [showUnpaidWarning, setShowUnpaidWarning] = useState(false)
  const [showMissingModal, setShowMissingModal] = useState(false)
  const [showMissingInfo, setShowMissingInfo] = useState(false)
  const [showSubmittedInfo, setShowSubmittedInfo] = useState(false)
  const [tabInfo, setTabInfo] = useState<Tab | null>(null)
  const [missingFile, setMissingFile] = useState<File | null>(null)
  const [missingChallanNo, setMissingChallanNo] = useState('')
  const [missingOffence, setMissingOffence] = useState('')
  const [missingLocation, setMissingLocation] = useState('')
  const [missingSubmitting, setMissingSubmitting] = useState(false)
  const [missingDragOver, setMissingDragOver] = useState(false)
  const [reportedChallans, setReportedChallans] = useState<Challan[]>([])
  const [missingDismissed, setMissingDismissed] = useState(false)

  const submittedIdSet = useMemo(() => new Set(submittedChallans.map((c) => c.id)), [submittedChallans])

  const allChallans = useMemo<Challan[]>(
    () => [...reportedChallans, ...MOCK_CHALLANS].filter((c) => !submittedIdSet.has(c.id)),
    [reportedChallans, submittedIdSet]
  )

  // Sync the page's mock list into the global store so PaymentPage can read it.
  // On first visit, pre-select all pending challans. On return-navigation, keep
  // the user's prior selection and add any newly-added pending challans to it.
  useEffect(() => {
    const pending = MOCK_CHALLANS.filter((c) => !submittedIdSet.has(c.id))
    setChallansInStore(pending)
    const selectableIds = pending.filter((c) => !c.disabled).map((c) => c.id)
    const selectableIdSet = new Set(selectableIds)
    const persistedSet = new Set(useChallanStore.getState().selectedChallanIds)
    if (persistedSet.size === 0) {
      selectAllInStore(selectableIds)
    } else {
      const restored = [...persistedSet].filter((id) => selectableIdSet.has(id))
      const missing = selectableIds.filter((id) => !persistedSet.has(id))
      const next = Array.from(new Set([...restored, ...missing]))
      if (next.length !== persistedSet.size || next.some((id) => !persistedSet.has(id))) {
        selectAllInStore(next)
      }
    }
    // Run once on mount; later edits don't reset selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep the global store in sync whenever a new reported challan is appended.
  useEffect(() => {
    if (reportedChallans.length === 0) return
    setChallansInStore(allChallans)
  }, [reportedChallans, allChallans, setChallansInStore])

  useModalA11y(detailChallan !== null, () => setDetailChallan(null))
  useModalA11y(showUnpaidWarning, () => setShowUnpaidWarning(false))
  useModalA11y(showMissingModal, () => closeMissingModal())
  useModalA11y(showMissingInfo, () => setShowMissingInfo(false))
  useModalA11y(showSubmittedInfo, () => setShowSubmittedInfo(false))
  useModalA11y(tabInfo !== null, () => setTabInfo(null))

  const filteredChallans = useMemo(() => {
    const base = activeFilter === 'all' ? allChallans : allChallans.filter((c) => c.type === activeFilter)
    // Keep disabled (non-payable) challans at the bottom while preserving original order otherwise.
    return [...base].sort((a, b) => Number(!!a.disabled) - Number(!!b.disabled))
  }, [activeFilter, allChallans])

  // Use Set for O(1) lookups (js-set-map-lookups)
  const selectedIdsSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const totalAmount = useMemo(
    () => filteredChallans.filter((c) => selectedIdsSet.has(c.id)).reduce((sum, c) => sum + c.amount, 0),
    [selectedIdsSet, filteredChallans]
  )

  const selectableFilteredChallans = useMemo(
    () => filteredChallans.filter((c) => !c.disabled),
    [filteredChallans]
  )
  const isAllSelected =
    selectableFilteredChallans.length > 0 &&
    selectableFilteredChallans.every((c) => selectedIdsSet.has(c.id))

  const toggleChallan = (id: string) => {
    toggleChallanInStore(id)
  }

  const toggleSelectAll = () => {
    if (isAllSelected) {
      selectAllInStore([])
    } else {
      selectAllInStore(selectableFilteredChallans.map((c) => c.id))
    }
  }

  const handleCopyChallan = async (challanNumber: string) => {
    await copy(challanNumber)
    setCopiedId(challanNumber)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleProceed = () => {
    if (selectedIds.length === 0) {
      toast.warning('Please select at least one challan to proceed')
      return
    }
    if (!isAllSelected) {
      setShowUnpaidWarning(true)
      return
    }
    navigate('/payment')
  }

  const handleContinueWithSelected = () => {
    setShowUnpaidWarning(false)
    navigate('/payment')
  }

  const handlePayAll = () => {
    selectAllInStore(selectableFilteredChallans.map((c) => c.id))
    setShowUnpaidWarning(false)
    navigate('/payment')
  }

  const closeMissingModal = () => {
    if (missingSubmitting) return
    setShowMissingModal(false)
    setMissingFile(null)
    setMissingChallanNo('')
    setMissingOffence('')
    setMissingLocation('')
    setMissingDragOver(false)
  }

  const handleMissingFile = (file: File | null) => {
    if (!file) return
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF document')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10 MB')
      return
    }
    setMissingFile(file)
  }

  const handleMissingSubmit = () => {
    if (!missingFile) {
      toast.warning('Please attach your challan document')
      return
    }
    setMissingSubmitting(true)
    setTimeout(() => {
      const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      const challanNo = missingChallanNo.trim() || `REPORTED-${Date.now().toString().slice(-10)}`
      const offence = missingOffence.trim()
      const location = missingLocation.trim()
      const newChallan: Challan = {
        id: `reported-${Date.now()}`,
        challanNumber: challanNo,
        amount: 0,
        violation: offence || '—',
        date: today,
        location: location || '—',
        type: 'online',
        pendingSince: 'Just submitted',
        reportedByUser: true,
      }
      setReportedChallans((prev) => [newChallan, ...prev])
      setMissingSubmitting(false)
      setShowMissingModal(false)
      setMissingFile(null)
      setMissingChallanNo('')
      setMissingOffence('')
      setMissingLocation('')
      setMissingDragOver(false)
      toast.success('Challan added — pending verification by our team.')
    }, 900)
  }

  return (
    <PageTransition>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
        {/* Mobile: Vehicle Info Card stacked above tabs */}
        <div className="md:hidden bg-white rounded-2xl rounded-b-none border border-border p-4">
          <div className="flex items-center gap-4">
            <img src="/images/BLACK-CAR.png" alt="Vehicle" className="w-24 h-16 object-contain flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-light">Hyundai Creta</p>
              <p className="font-display font-bold text-text-primary text-lg truncate" title={vehicle}>{vehicle}</p>
            </div>
          </div>
          <span className="mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold w-full border-2 border-emerald-500 shadow-sm">
            <img src="/images/govt-verified-badge.png" alt="" className="w-6 h-6" />
            Govt. Verified Data
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-0 md:gap-6">
          {/* Sidebar */}
          <aside className="md:sticky md:top-24 md:self-start md:min-h-[calc(100vh-7rem)] bg-white rounded-2xl rounded-t-none md:rounded-t-2xl border border-border border-t-0 md:border-t p-2 md:p-3">
            <nav className="flex md:flex-col gap-1.5 md:gap-2">
              <div className="relative flex-1 md:flex-none min-w-0">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={cn(
                    'w-full min-w-0 flex items-center justify-between gap-1.5 md:gap-2.5 px-2.5 md:px-4 py-3 md:py-5 rounded-xl text-xs md:text-base font-semibold border transition-all',
                    activeTab === 'pending'
                      ? 'bg-primary/10 text-primary border-primary'
                      : 'bg-white border-border text-text-secondary hover:bg-gray-50'
                  )}
                >
                  <span className="min-w-0 truncate hidden md:inline">{t.status.pendingChallans}</span>
                  <span className="min-w-0 truncate md:hidden">{t.status.pending}</span>
                  <span className={cn(
                    'flex-shrink-0 text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 rounded-full md:mr-7',
                    activeTab === 'pending' ? 'bg-primary/15 text-primary' : 'bg-gray-100 text-text-secondary'
                  )}>
                    {allChallans.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setTabInfo('pending')}
                  aria-label="About Pending Challans"
                  className="hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 items-center justify-center rounded-full text-text-light hover:text-primary hover:bg-white/60 transition-colors cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="relative flex-1 md:flex-none min-w-0">
                <button
                  onClick={() => setActiveTab('in-progress')}
                  className={cn(
                    'w-full min-w-0 flex items-center justify-between gap-1.5 md:gap-2.5 px-2.5 md:px-4 py-3 md:py-5 rounded-xl text-xs md:text-base font-semibold border transition-all',
                    activeTab === 'in-progress'
                      ? 'bg-amber-50 text-amber-700 border-amber-400'
                      : 'bg-white border-border text-text-secondary hover:bg-gray-50'
                  )}
                >
                  <span className="min-w-0 truncate hidden md:inline">{t.status.inProgressChallans}</span>
                  <span className="min-w-0 truncate md:hidden">{t.status.inProgress}</span>
                  <span className={cn(
                    'flex-shrink-0 text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 rounded-full md:mr-7',
                    activeTab === 'in-progress' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-text-secondary'
                  )}>
                    {submittedChallans.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setTabInfo('in-progress')}
                  aria-label="About InProgress Challans"
                  className="hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 items-center justify-center rounded-full text-text-light hover:text-amber-700 hover:bg-white/60 transition-colors cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="relative flex-1 md:flex-none min-w-0">
                <button
                  onClick={() => setActiveTab('paid')}
                  className={cn(
                    'w-full min-w-0 flex items-center justify-between gap-1.5 md:gap-2.5 px-2.5 md:px-4 py-3 md:py-5 rounded-xl text-xs md:text-base font-semibold border transition-all',
                    activeTab === 'paid'
                      ? 'bg-success/10 text-success border-success'
                      : 'bg-white border-border text-text-secondary hover:bg-gray-50'
                  )}
                >
                  <span className="min-w-0 truncate hidden md:inline">{t.status.paidChallans}</span>
                  <span className="min-w-0 truncate md:hidden">{t.status.paid}</span>
                  <span className={cn(
                    'flex-shrink-0 text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 rounded-full md:mr-7',
                    activeTab === 'paid' ? 'bg-success/15 text-success' : 'bg-gray-100 text-text-secondary'
                  )}>8</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTabInfo('paid')}
                  aria-label="About Paid Challans"
                  className="hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 items-center justify-center rounded-full text-text-light hover:text-success hover:bg-white/60 transition-colors cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="mt-6 md:mt-0 space-y-6">
            {/* Vehicle Info Card (desktop only) */}
            <div className="hidden md:block bg-white rounded-2xl border border-border p-4">
              <div className="flex items-center gap-4">
                <img src="/images/BLACK-CAR.png" alt="Vehicle" className="w-28 h-20 object-contain flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-light">Hyundai Creta</p>
                  <p className="font-display font-bold text-text-primary text-lg truncate" title={vehicle}>{vehicle}</p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-2 pl-2 pr-5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold whitespace-nowrap flex-shrink-0">
                  <img src="/images/govt-verified-badge.png" alt="" className="w-8 h-8" />
                  Govt. Verified Data
                </span>
              </div>
              <span className="sm:hidden mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold w-full border-2 border-emerald-500 shadow-sm">
                <img src="/images/govt-verified-badge.png" alt="" className="w-6 h-6" />
                Govt. Verified Data
              </span>
            </div>

            {activeTab === 'pending' ? (
              <>
                {/* Report Missing Challan banner */}
                {!missingDismissed && (
                  <div className="w-full flex items-center gap-2.5 bg-white rounded-lg px-3 py-2">
                    <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <FilePlus2 className="w-3.5 h-3.5 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-text-primary whitespace-nowrap">Missing a challan?</p>
                      <button
                        type="button"
                        aria-label="Why can challans be missed?"
                        onClick={() => setShowMissingInfo(true)}
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-text-light hover:text-primary transition-colors cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setMissingDismissed(true)}
                        className="min-w-[56px] sm:min-w-[88px] min-h-11 px-3 sm:px-6 py-2.5 text-sm font-semibold text-text-secondary bg-white border border-border hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMissingModal(true)}
                        className="min-w-[56px] sm:min-w-[88px] min-h-11 px-3 sm:px-6 py-2.5 text-sm font-semibold text-primary bg-white border border-primary hover:bg-primary/5 rounded-lg transition-colors"
                      >
                        Yes
                      </button>
                    </div>
                  </div>
                )}

                {/* Section Header + Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                    <h2 className="font-display font-bold text-lg text-text-primary">
                      {`${t.status.pendingChallans} (${filteredChallans.length})`}
                    </h2>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-text-secondary min-h-11 px-2 -mx-2">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        className="peer sr-only"
                      />
                      <span className="w-6 h-6 shrink-0 box-border rounded-md border-2 border-border bg-white peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-1 flex items-center justify-center transition-colors">
                        <Check className="w-5 h-5 text-white" strokeWidth={3.5} />
                      </span>
                      {t.status.selectAll}
                    </label>
                  </div>
                  <div className="flex gap-2">
                    {FILTERS.map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={cn(
                          'px-4 py-3 rounded-lg text-xs font-medium transition-colors capitalize border',
                          activeFilter === filter
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-text-secondary border-border hover:bg-gray-50'
                        )}
                      >
                        {filter === 'all'
                          ? `${t.status.all} (${allChallans.length})`
                          : `${filter === 'online' ? t.status.onlineChallans : t.status.courtChallans} (${allChallans.filter((c) => c.type === filter).length})`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Challan Cards Grid */}
                {state === 'loading' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-36 md:pb-0">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : state === 'error' ? (
                  <div className="bg-white rounded-2xl border border-border">
                    <ErrorState onRetry={retry} />
                  </div>
                ) : filteredChallans.length === 0 || state === 'empty' ? (
                  <div className="bg-white rounded-2xl border border-border">
                    <EmptyState
                      icon={CircleCheck}
                      title="No pending challans"
                      description="You're all clear for this vehicle. Try changing the filter or check another vehicle."
                      action={{ label: 'Check another vehicle', onClick: () => navigate('/') }}
                    />
                  </div>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-36 md:pb-0">
                  {filteredChallans.map((challan) => (
                    <div
                      key={challan.id}
                      className={cn(
                        'relative bg-white rounded-xl border pt-8 px-5 pb-5 transition-all',
                        challan.disabled
                          ? 'border-border shadow-sm'
                          : challan.reportedByUser
                            ? selectedIdsSet.has(challan.id)
                              ? 'border-amber-400 shadow-md'
                              : 'border-amber-400 shadow-sm hover:shadow-md'
                            : selectedIdsSet.has(challan.id)
                              ? 'border-primary shadow-md'
                              : 'border-border shadow-sm hover:border-primary/30 hover:shadow-md'
                      )}
                    >
                      {/* Type badge — top-left, flush to border */}
                      {!challan.disabled && (
                        <span className={cn(
                          'absolute top-0 left-0 text-[10px] font-bold uppercase px-3 py-1 rounded-tl-xl rounded-br-lg',
                          challan.type === 'online' ? 'bg-info/10 text-info' : 'bg-warning/10 text-warning'
                        )}>
                          {challan.type === 'online' ? t.status.onlineChallan : t.status.courtChallan}
                        </span>
                      )}

                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-mono text-text-light">#{challan.challanNumber.slice(0, 12)}...</span>
                          <button
                            onClick={() => handleCopyChallan(challan.challanNumber)}
                            aria-label="Copy challan number"
                            title="Copy challan number"
                            className="text-text-light hover:text-primary transition-colors flex items-center justify-center p-2.5 -m-2.5"
                          >
                            {copiedId === challan.challanNumber ? (
                              <Check className="w-3.5 h-3.5 text-success" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          {challan.reportedByUser && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 tracking-wide whitespace-nowrap">
                              Added by you
                            </span>
                          )}
                        </div>
                        <label
                          className={cn(
                            'relative inline-flex w-11 h-11 shrink-0 items-center justify-center -mr-2.5',
                            challan.disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={selectedIdsSet.has(challan.id)}
                            onChange={() => toggleChallan(challan.id)}
                            disabled={challan.disabled}
                            className="peer sr-only"
                          />
                          <span className={cn(
                            'w-6 h-6 box-border rounded-md border-2 border-border bg-white flex items-center justify-center transition-colors',
                            challan.disabled
                              ? 'bg-gray-100 border-gray-200'
                              : 'peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-1'
                          )}>
                            {!challan.disabled && <Check className="w-5 h-5 text-white" strokeWidth={3.5} />}
                          </span>
                        </label>
                      </div>

                      {/* Amount */}
                      <div className="mb-1">
                        <p className="font-display text-xl font-bold text-text-primary">
                          ₹{challan.amount.toLocaleString('en-IN')}
                        </p>
                      </div>

                      {/* Details */}
                      <div className="space-y-1.5 text-sm">
                        <p className="line-clamp-1 leading-snug font-medium text-text-primary" title={challan.violation}>{challan.violation}</p>
                        <p className="text-xs text-text-light truncate" title={`${challan.date} · ${challan.location}`}>{challan.date} · {truncateWords(challan.location, 3)}</p>
                      </div>

                      {/* Divider */}
                      <hr className="border-border mt-4" />

                      {/* Pending since + View Details */}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-red-500 font-medium">
                          {t.status.pendingSince} {challan.pendingSince}
                        </span>
                        <button
                          onClick={() => setDetailChallan(challan)}
                          className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                          {t.status.viewDetails}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                )}

                {/* Proceed Bar — skeleton during loading */}
                {state === 'loading' && (
                  <div className="fixed md:sticky bottom-0 md:bottom-4 left-0 right-0 md:left-auto md:right-auto z-50 md:z-40 bg-white border-t border-border md:border md:rounded-2xl rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:shadow-xl overflow-hidden">
                    <div className="px-4 py-3 flex items-center justify-between gap-4">
                      <div className="space-y-2 min-w-0 flex-1">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                      <Skeleton className="h-12 w-36 rounded-xl" />
                    </div>
                  </div>
                )}

                {/* Proceed Bar */}
                {state !== 'loading' && selectedIds.length > 0 && (
              <div className="fixed md:sticky bottom-0 md:bottom-4 left-0 right-0 md:left-auto md:right-auto z-50 md:z-40 bg-white border-t border-border md:border md:rounded-2xl rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:shadow-xl overflow-hidden animate-slide-down">
                {/* Pledge & Claim Rewards banner */}
                <div className="px-4 py-2.5 bg-gradient-to-r from-amber-100 via-amber-50 to-white border-b border-amber-100">
                  <p className="text-sm font-semibold text-amber-900 leading-snug">
                    {t.status.pledgeAndClaimRewards}
                  </p>
                  <p className="text-[11px] text-amber-800/80 leading-snug mt-0.5">
                    {t.status.checkEligibilityNextStep}
                  </p>
                </div>
                <div className="px-4 py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs text-text-light">{t.status.totalAmountToPay}</p>
                    <p className="font-display text-lg font-bold text-text-primary">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <button
                    onClick={handleProceed}
                    className="relative flex-shrink-0 overflow-hidden px-7 sm:px-9 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-md text-base"
                  >
                    <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
                    <span className="relative">{`${t.status.proceedToPay} >`}</span>
                  </button>
                </div>
              </div>
            )}
              </>
            ) : activeTab === 'in-progress' ? (
              <>
                {/* In Progress Challans Header */}
                <div className="space-y-1">
                  <h2 className="font-display font-bold text-lg text-text-primary">
                    {`${t.status.inProgressChallans} (${submittedChallans.length})`}
                  </h2>
                  {submittedChallans.length > 0 && (
                    <p className="text-sm text-text-secondary leading-snug">
                      {t.status.inProgressBanner}
                    </p>
                  )}
                </div>

                {submittedChallans.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-border">
                    <EmptyState
                      icon={Hourglass}
                      title="No challans in progress"
                      description="Challans you submit for ChallanPay to resolve will appear here while we work on them."
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-36 md:pb-0">
                    {submittedChallans.map((challan) => (
                      <div
                        key={challan.id}
                        className="bg-white rounded-xl border border-border shadow-sm p-5"
                      >
                        {/* Card Header */}
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <span className="text-xs font-mono text-text-secondary truncate">#{challan.challanNumber.slice(0, 12)}...</span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700 whitespace-nowrap">
                            <Clock className="w-3 h-3" />
                            In Progress
                          </span>
                        </div>

                        {/* Amount + Type badge */}
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-display text-xl font-bold text-text-primary">
                            ₹{challan.amount.toLocaleString('en-IN')}
                          </p>
                          <span className={cn(
                            'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full',
                            challan.type === 'online' ? 'bg-info/10 text-info' : 'bg-warning/10 text-warning'
                          )}>
                            {challan.type === 'online' ? t.status.onlineChallan : t.status.courtChallan}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="space-y-1.5 text-sm">
                          <p className="line-clamp-1 leading-snug font-medium text-text-primary" title={challan.violation}>{challan.violation}</p>
                          <p className="text-xs text-text-secondary truncate" title={`${challan.date} · ${challan.location}`}>{challan.date} · {truncateWords(challan.location, 3)}</p>
                        </div>

                        {/* Divider */}
                        <hr className="border-border mt-4" />

                        {/* Status text + Track Status */}
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                            <button
                              type="button"
                              onClick={() => setShowSubmittedInfo(true)}
                              aria-label="What does this status mean?"
                              className="inline-flex items-center justify-center -m-1 p-1 rounded-full text-amber-700 hover:text-amber-800 transition-colors cursor-pointer"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                            Challan Submitted & under process
                          </span>
                          <button
                            onClick={() => navigate(`/track-status?challan=${encodeURIComponent(challan.challanNumber)}`)}
                            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                          >
                            Track Status
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Paid Challans Header */}
                <h2 className="font-display font-bold text-lg text-text-primary">
                  {`${t.status.paidChallans} (${MOCK_PAID_CHALLANS.length})`}
                </h2>

                {/* Paid Challan Cards Grid */}
                {state === 'loading' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : state === 'error' ? (
                  <div className="bg-white rounded-2xl border border-border">
                    <ErrorState onRetry={retry} />
                  </div>
                ) : MOCK_PAID_CHALLANS.length === 0 || state === 'empty' ? (
                  <div className="bg-white rounded-2xl border border-border">
                    <EmptyState
                      icon={Inbox}
                      title="No paid challans yet"
                      description="Once you settle a challan, it will appear here for your records."
                    />
                  </div>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {MOCK_PAID_CHALLANS.map((challan) => (
                    <div
                      key={challan.id}
                      className="bg-white rounded-xl border border-border shadow-sm p-5"
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-text-light">#{challan.challanNumber.slice(0, 12)}...</span>
                          <button
                            onClick={() => handleCopyChallan(challan.challanNumber)}
                            aria-label="Copy challan number"
                            title="Copy challan number"
                            className="text-text-light hover:text-primary transition-colors flex items-center justify-center p-2.5 -m-2.5"
                          >
                            {copiedId === challan.challanNumber ? (
                              <Check className="w-3.5 h-3.5 text-success" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-success/10 px-2 py-0.5 rounded-full">
                          <CircleCheck className="w-3 h-3" aria-hidden="true" />
                          {t.status.paid}
                        </span>
                      </div>

                      {/* Amount + Type badge */}
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-display text-xl font-bold text-text-primary">
                          ₹{challan.amount.toLocaleString('en-IN')}
                        </p>
                        <span className={cn(
                          'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full',
                          challan.type === 'online' ? 'bg-info/10 text-info' : 'bg-warning/10 text-warning'
                        )}>
                          {challan.type === 'online' ? t.status.onlineChallan : t.status.courtChallan}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="space-y-1.5 text-sm">
                        <p className="line-clamp-1 leading-snug font-medium text-text-primary" title={challan.violation}>{challan.violation}</p>
                        <p className="text-xs text-text-light truncate" title={`${challan.date} · ${challan.location}`}>{challan.date} · {truncateWords(challan.location, 3)}</p>
                      </div>

                      {/* Divider */}
                      <hr className="border-border mt-4" />

                      {/* Paid on */}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-emerald-700 font-semibold">
                          {t.status.paidOn} {challan.paidOn}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {/* Challan Detail Modal */}
      {detailChallan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setDetailChallan(null)}
        >
          <div
            className="relative w-full max-w-md bg-gray-100 rounded-2xl border border-border shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-2.5 bg-white border-b border-border">
              <h3 className="font-display text-base font-bold text-text-primary">{t.status.challanDetails}</h3>
              <button
                onClick={() => setDetailChallan(null)}
                aria-label="Close"
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-gray-600 hover:bg-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inner receipt card */}
            <div className="p-4">
              <div className="rounded-xl bg-white receipt-zigzag-top border border-border shadow-md">
                {/* Banner */}
                <div className="text-text-primary px-6 pt-7 pb-3">
                  <p className="text-base font-bold font-mono break-all">#{detailChallan.challanNumber}</p>
                </div>

                <div className="px-6 pb-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-display text-2xl font-bold text-text-primary">
                    ₹{detailChallan.amount.toLocaleString('en-IN')}
                  </span>
                  <span className={cn(
                    'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full',
                    detailChallan.type === 'online' ? 'bg-info/10 text-info' : 'bg-warning/10 text-warning'
                  )}>
                    {detailChallan.type === 'online' ? t.status.onlineChallan : t.status.courtChallan}
                  </span>
                </div>
                <hr className="border-border" />
                <div className="space-y-1">
                  <p className="text-xs text-text-secondary">{t.status.violation}</p>
                  <p className="text-sm font-medium text-text-primary leading-snug">{detailChallan.violation}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-text-secondary">{t.status.date}</p>
                  <p className="text-sm font-medium text-text-primary leading-snug">{detailChallan.date}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-text-secondary">{t.status.location}</p>
                  <p className="text-sm font-medium text-text-primary leading-snug">{detailChallan.location}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-text-secondary">{t.status.statusLabel}</p>
                  <p className="text-sm text-red-500 font-medium leading-snug">{t.status.pendingSince} {detailChallan.pendingSince}</p>
                </div>
                </div>
              </div>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Challan Details\n\nChallan No: #${detailChallan.challanNumber}\nAmount: ₹${detailChallan.amount.toLocaleString('en-IN')}\nViolation: ${detailChallan.violation}\nDate: ${detailChallan.date}\nLocation: ${detailChallan.location}\nType: ${detailChallan.type} Challan\nStatus: Pending since ${detailChallan.pendingSince}\n\nCheck & pay your challans on ChallanPay`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#1fb855] text-white font-semibold rounded-xl transition-colors text-sm"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                {t.status.shareOnWhatsApp}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Report Missing Challan Modal */}
      {showMissingModal && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={closeMissingModal}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h3 className="font-display text-base font-bold text-text-primary">Report Missing Challan</h3>
              <button
                onClick={closeMissingModal}
                aria-label="Close"
                disabled={missingSubmitting}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm text-text-secondary">
                Have a challan that isn't showing here? Upload a clear PDF and we'll verify and add it.
              </p>

              <div>
                <label htmlFor="missing-challan-no" className="text-xs font-medium text-text-secondary">
                  Challan number <span className="text-text-light">(optional)</span>
                </label>
                <input
                  id="missing-challan-no"
                  type="text"
                  value={missingChallanNo}
                  onChange={(e) => setMissingChallanNo(e.target.value.toUpperCase())}
                  placeholder="e.g. UP4083823062711..."
                  className="mt-1.5 w-full px-3 py-2.5 text-sm font-mono border border-border rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
                />
              </div>

              {!missingFile ? (
                <label
                  htmlFor="missing-challan-file"
                  onDragOver={(e) => { e.preventDefault(); setMissingDragOver(true) }}
                  onDragLeave={() => setMissingDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setMissingDragOver(false)
                    handleMissingFile(e.dataTransfer.files?.[0] ?? null)
                  }}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 cursor-pointer transition-colors text-center',
                    missingDragOver ? 'border-primary bg-primary/5' : 'border-border bg-gray-50 hover:border-primary/40 hover:bg-primary/5'
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-text-primary">Click to upload or drag and drop</p>
                  <p className="text-xs text-text-light">PDF only · up to 10 MB</p>
                  <input
                    id="missing-challan-file"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleMissingFile(e.target.files?.[0] ?? null)}
                    className="sr-only"
                  />
                </label>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-border bg-gray-50 px-3 py-2.5">
                  <div className="w-9 h-9 rounded-lg bg-white border border-border flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate" title={missingFile.name}>{missingFile.name}</p>
                    <p className="text-xs text-text-light">{(missingFile.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMissingFile(null)}
                    aria-label="Remove file"
                    disabled={missingSubmitting}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-text-light hover:text-text-primary hover:bg-white transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeMissingModal}
                  disabled={missingSubmitting}
                  className="flex-1 py-3 rounded-xl border border-border text-text-primary font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleMissingSubmit}
                  disabled={missingSubmitting || !missingFile}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:hover:bg-primary flex items-center justify-center gap-2"
                >
                  {missingSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {missingSubmitting ? 'Submitting…' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unpaid Challans Warning Modal */}
      {showUnpaidWarning && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowUnpaidWarning(false)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowUnpaidWarning(false)}
              aria-label="Close"
              className="absolute top-2 right-2 z-10 w-11 h-11 rounded-full bg-white/80 flex items-center justify-center text-gray-500 hover:bg-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Warning header */}
            <div className="bg-gradient-to-b from-amber-50 via-amber-50/50 to-white pt-8 pb-3 px-6 text-center">
              <div className="text-5xl mb-3">⚠️</div>
              <h3 className="font-display text-xl font-bold text-text-primary mb-1">
                Some challans are still unpaid
              </h3>
              <p className="text-sm text-text-secondary">
                You've selected only a few challans while others remain pending.
              </p>
            </div>

            {/* Consequence list */}
            <div className="px-6 pt-2 pb-6">
              <div className="space-y-2.5 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50/80">
                  <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Coins className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-sm font-medium text-text-primary">Attract additional penalties</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50/80">
                  <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <FileWarning className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-sm font-medium text-text-primary">Lead to legal notices</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50/80">
                  <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Gavel className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-sm font-medium text-text-primary">Require court appearance</span>
                </div>
              </div>

              {/* Pay All button */}
              <button
                onClick={handlePayAll}
                className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm shadow-sm"
              >
                Pay All Challans
              </button>

              {/* Continue with Selected link */}
              <button
                onClick={handleContinueWithSelected}
                className="w-full py-3 text-text-secondary font-medium text-sm hover:text-text-primary transition-colors mt-1"
              >
                Continue with Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Why can challans be missed? Info Modal */}
      {showMissingInfo && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowMissingInfo(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="missing-info-title"
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-border gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Info className="w-4 h-4 text-primary" />
                </div>
                <h3 id="missing-info-title" className="font-display text-base font-bold text-text-primary">
                  Why can challans be missed?
                </h3>
              </div>
              <button
                onClick={() => setShowMissingInfo(false)}
                aria-label="Close"
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-text-secondary leading-relaxed">
                A few challans may be missed because of incomplete data received from the government source, sync delays, or temporary processing issues.
              </p>
              <button
                onClick={() => {
                  setShowMissingInfo(false)
                  setShowMissingModal(true)
                }}
                className="mt-5 w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm shadow-sm"
              >
                Report a Missing Challan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submitted Challan Info Modal */}
      {showSubmittedInfo && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowSubmittedInfo(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="submitted-info-title"
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-border gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Info className="w-4 h-4 text-amber-700" />
                </div>
                <h3 id="submitted-info-title" className="font-display text-base font-bold text-text-primary">
                  Challan In Progress
                </h3>
              </div>
              <button
                onClick={() => setShowSubmittedInfo(false)}
                aria-label="Close"
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-text-secondary leading-relaxed">
                This challan has been submitted to the ChallanPay team. Please sit back and relax. Your challan will be closed within the specified timeline.
              </p>
              <button
                onClick={() => setShowSubmittedInfo(false)}
                className="mt-5 w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm shadow-sm"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Tab Info Modal */}
      {tabInfo !== null && (() => {
        const content: Record<Tab, { title: string; description: string; accent: 'primary' | 'amber' | 'success' }> = {
          'pending': {
            title: t.status.pendingChallans,
            description: 'Unpaid challans currently active against your vehicle. Select any to begin payment or get help resolving them through ChallanPay.',
            accent: 'primary',
          },
          'in-progress': {
            title: t.status.inProgressChallans,
            description: 'Challans submitted to the ChallanPay team that are being actively processed. Track each one’s progress in real time — they’ll move to Closed once completed.',
            accent: 'amber',
          },
          'paid': {
            title: t.status.paidChallans,
            description: 'Challans that have been fully closed and settled. They are stored here for your records.',
            accent: 'success',
          },
        }
        const c = content[tabInfo]
        const accentBg = c.accent === 'primary' ? 'bg-primary/10' : c.accent === 'amber' ? 'bg-amber-100' : 'bg-success/10'
        const accentText = c.accent === 'primary' ? 'text-primary' : c.accent === 'amber' ? 'text-amber-700' : 'text-success'
        return (
          <div
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setTabInfo(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tab-info-title"
          >
            <div
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-border gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={cn('w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0', accentBg)}>
                    <Info className={cn('w-4 h-4', accentText)} />
                  </div>
                  <h3 id="tab-info-title" className="font-display text-base font-bold text-text-primary">
                    {c.title}
                  </h3>
                </div>
                <button
                  onClick={() => setTabInfo(null)}
                  aria-label="Close"
                  className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5">
                <p className="text-sm text-text-secondary leading-relaxed">
                  {c.description}
                </p>
                <button
                  onClick={() => setTabInfo(null)}
                  className="mt-5 w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm shadow-sm"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </PageTransition>
  )
}
