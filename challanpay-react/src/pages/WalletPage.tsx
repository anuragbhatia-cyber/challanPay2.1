import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  ArrowLeft,
  Coins,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageTransition } from '@/components/shared/PageTransition'

const formatINR = (n: number) => n.toLocaleString('en-IN')

type LedgerEntry = {
  id: string
  date: string
  description: string
  amount: number
  expires?: string
  expiryTag?: string
}

type RefundStatus = 'in_progress' | 'delayed' | 'on_hold' | 'refunded' | 'not_approved'

type Refund = {
  id: string
  incidentId: string
  amount: number
  destination: string
  expectedDate: string
  status: RefundStatus
  refundTxnId?: string
  completedOn?: string
  isReferralBalance?: boolean
}

const AVAILABLE_COINS = 600
const EXPIRING_SOON_COINS = 300

const LEDGER: LedgerEntry[] = [
  {
    id: 'l1',
    date: '20 Sep',
    description: 'First-time check credit received',
    amount: 200,
    expires: '19 Nov',
  },
  {
    id: 'l2',
    date: '18 Sep',
    description: 'Returned after failed payment, incident 10481',
    amount: 200,
  },
  {
    id: 'l3',
    date: '18 Sep',
    description: 'Used on incident 10482',
    amount: -200,
  },
  {
    id: 'l4',
    date: '15 Sep',
    description: 'Coupon WELCOME100 converted to credit',
    amount: 100,
    expires: '15 Oct',
  },
  {
    id: 'l5',
    date: '14 Sep',
    description: 'Reward for order 10478',
    amount: 50,
    expires: '14 Oct',
  },
  {
    id: 'l6',
    date: '12 Sep',
    description: 'Employee benefit',
    amount: 300,
    expires: '27 Sep',
    expiryTag: 'Expires in 7 days',
  },
]

const REFUNDS: Refund[] = [
  {
    id: 'r1',
    incidentId: '10490',
    amount: 1250,
    destination: 'HDFC Bank account •••• 4123',
    expectedDate: 'by 26 Sep',
    status: 'in_progress',
  },
  {
    id: 'r2',
    incidentId: '10476',
    amount: 500,
    destination: 'HDFC Bank account •••• 4123',
    expectedDate: 'by 18 Sep',
    status: 'delayed',
  },
  {
    id: 'r3',
    incidentId: '10471',
    amount: 850,
    destination: 'UPI anurag@okhdfcbank',
    expectedDate: 'by 15 Sep',
    status: 'on_hold',
    isReferralBalance: true,
  },
  {
    id: 'r4',
    incidentId: '10462',
    amount: 2300,
    destination: 'HDFC Bank account •••• 4123',
    expectedDate: 'by 09 Sep',
    status: 'refunded',
    completedOn: '08 Sep',
    refundTxnId: 'RZPY-REF-9F2A17C',
  },
]

type WalletTab = 'credits' | 'refunds'

export function WalletPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<WalletTab>('credits')
  const activeRefundCount = REFUNDS.filter((r) => r.status !== 'refunded').length

  return (
    <PageTransition>
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="w-11 h-11 rounded-full flex items-center justify-center text-text-secondary hover:bg-gray-100 hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-text-primary">
            My Wallet
          </h1>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-3 sm:gap-4">
          <div className="rounded-2xl border border-border/60 bg-white p-5 sm:p-6">
            <p className="text-xs sm:text-sm text-text-light mb-2">Available credit</p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-yellow-100 flex-shrink-0">
                <Coins className="w-5 h-5 text-yellow-600" strokeWidth={2.25} />
              </span>
              <span className="font-display text-3xl sm:text-4xl font-bold text-text-primary tabular-nums">
                {AVAILABLE_COINS} coins
              </span>
            </div>
          </div>

          <StatTile
            label="Expiring soon"
            value={EXPIRING_SOON_COINS}
            icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
            emphasize={EXPIRING_SOON_COINS > 0}
          />
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Wallet sections"
          className="mt-6 inline-flex items-center gap-1 p-1 rounded-full border border-border/60 bg-gray-50"
        >
          <TabButton
            label="Activity"
            active={activeTab === 'credits'}
            onClick={() => setActiveTab('credits')}
          />
          <TabButton
            label="Refunds"
            count={activeRefundCount}
            active={activeTab === 'refunds'}
            onClick={() => setActiveTab('refunds')}
          />
        </div>

        {activeTab === 'credits' && (
          <>
            {/* Expiry reminder */}
            {EXPIRING_SOON_COINS > 0 && (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 px-4 sm:px-5 py-3.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-900 leading-relaxed">
                  <span className="font-display font-bold">{EXPIRING_SOON_COINS} coins</span>{' '}
                  expire within 7 days. Credits expiring soonest are used first at checkout.
                </p>
              </div>
            )}

            {/* Credit ledger */}
            <section className="mt-4 rounded-2xl border border-border/60 bg-white overflow-hidden">
              <div className="px-4 sm:px-5 pt-5 pb-3">
                <h2 className="font-display font-bold text-base text-text-primary">
                  Coin activity
                </h2>
              </div>
              <ul className="divide-y divide-border/50 border-t border-border/50">
                {LEDGER.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center gap-4 px-4 sm:px-5 py-3.5 text-sm"
                  >
                    <span className="w-14 sm:w-16 flex-shrink-0 text-xs sm:text-sm text-text-light tabular-nums">
                      {e.date}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary truncate">{e.description}</p>
                      {e.expires && (
                        <p className="text-[11px] text-text-light mt-0.5 flex items-center gap-2 flex-wrap">
                          <span className="tabular-nums">Expires {e.expires}</span>
                          {e.expiryTag && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 whitespace-nowrap">
                              {e.expiryTag}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <span
                      className={cn(
                        'font-display font-bold text-sm tabular-nums whitespace-nowrap',
                        e.amount >= 0 ? 'text-emerald-600' : 'text-rose-600',
                      )}
                    >
                      {e.amount >= 0 ? '+' : '−'}{Math.abs(e.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        {activeTab === 'refunds' && (
          <section className="mt-4 rounded-2xl border border-sky-200/70 bg-sky-50/30 overflow-hidden">
            <ul className="divide-y divide-sky-200/60">
              {REFUNDS.map((r) => (
                <RefundRow key={r.id} refund={r} />
              ))}
            </ul>
          </section>
        )}

        {/* Footer note */}
        <p className="mt-4 mb-10 text-xs text-text-light leading-relaxed">
          Credit can only be used on ChallanPay. It cannot be withdrawn or transferred.{' '}
          <a
            href="/terms"
            className="underline text-text-secondary hover:text-primary"
          >
            Terms
          </a>
        </p>
      </div>
    </PageTransition>
  )
}

type TabButtonProps = {
  label: string
  active: boolean
  onClick: () => void
  count?: number
}

function TabButton({ label, active, onClick, count }: TabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      onClick={onClick}
      aria-selected={active}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        active
          ? 'bg-white text-text-primary shadow-sm ring-1 ring-border/60'
          : 'text-text-light hover:text-text-primary hover:bg-white/60',
      )}
    >
      <span>{label}</span>
      {typeof count === 'number' && count > 0 && (
        <span
          className={cn(
            'text-[11px] font-bold px-1.5 py-0.5 rounded-full tabular-nums min-w-[22px] text-center',
            active ? 'bg-primary text-white' : 'bg-gray-200 text-text-secondary',
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}

type StatTileProps = {
  label: string
  value: number
  icon: React.ReactNode
  emphasize?: boolean
}

function StatTile({ label, value, icon, emphasize = false }: StatTileProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-4 sm:p-5 bg-white',
        emphasize ? 'border-amber-200 bg-amber-50/40' : 'border-border/60',
      )}
    >
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs sm:text-sm text-text-light">{label}</p>
        {icon}
      </div>
      <p
        className={cn(
          'font-display text-2xl sm:text-3xl font-bold tabular-nums',
          emphasize ? 'text-amber-800' : 'text-text-primary',
        )}
      >
        {value}
      </p>
    </div>
  )
}

const STATUS_META: Record<RefundStatus, { label: string; chip: string }> = {
  in_progress: {
    label: 'In progress',
    chip: 'bg-sky-100 text-sky-800',
  },
  delayed: {
    label: 'Delayed',
    chip: 'bg-amber-100 text-amber-800',
  },
  on_hold: {
    label: 'On hold',
    chip: 'bg-amber-100 text-amber-900',
  },
  refunded: {
    label: 'Refunded',
    chip: 'bg-emerald-100 text-emerald-800',
  },
  not_approved: {
    label: 'Not approved',
    chip: 'bg-rose-100 text-rose-800',
  },
}

function RefundRow({ refund }: { refund: Refund }) {
  const meta = STATUS_META[refund.status]
  const isDone = refund.status === 'refunded'

  return (
    <li className="px-4 sm:px-5 py-4 bg-white/60">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                'text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap',
                meta.chip,
              )}
            >
              {meta.label}
            </span>
            {refund.isReferralBalance && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 whitespace-nowrap">
                Referral balance refund
              </span>
            )}
          </div>

          <p className="font-display text-text-primary mt-1.5 text-sm">
            ₹{formatINR(refund.amount)} to {refund.destination}
          </p>

          <p className="text-[12px] text-text-light mt-0.5">
            {isDone
              ? `Refunded on ${refund.completedOn} · Txn ${refund.refundTxnId}`
              : `Expected ${refund.expectedDate}`}
          </p>
        </div>

        <span className="font-display font-bold text-sm text-text-primary tabular-nums whitespace-nowrap">
          ₹{formatINR(refund.amount)}
        </span>
      </div>
    </li>
  )
}
