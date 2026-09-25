import { useNavigate } from 'react-router'
import { ArrowLeft, Coins, Clock, Hourglass, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageTransition } from '@/components/shared/PageTransition'

const formatINR = (n: number) => n.toLocaleString('en-IN')

type Batch = {
  id: string
  source: string
  coinsLeft: number
  received: string
  expires: string
  expiringSoon?: boolean
  expiryTag?: string
}

type HistoryItem = {
  id: string
  date: string
  description: string
  amount: number
}

const AVAILABLE_COINS = 600
const RESERVED_COINS = 0
const PENDING_COINS = 0
const EXPIRING_SOON_COINS = 300

const BATCHES: Batch[] = [
  {
    id: 'b1',
    source: 'Employee benefit',
    coinsLeft: 300,
    received: '12 Sep',
    expires: '27 Sep',
    expiringSoon: true,
    expiryTag: 'Expires in 7 days',
  },
  {
    id: 'b2',
    source: 'First-time check credit',
    coinsLeft: 200,
    received: '20 Sep',
    expires: '19 Nov',
  },
  {
    id: 'b3',
    source: 'Coupon converted to credit',
    coinsLeft: 100,
    received: '15 Sep',
    expires: '15 Oct',
  },
]

const HISTORY: HistoryItem[] = [
  { id: 'h1', date: '20 Sep', description: 'First-time check credit received', amount: 200 },
  { id: 'h2', date: '18 Sep', description: 'Used on order 10482', amount: -200 },
  { id: 'h3', date: '18 Sep', description: 'Returned after failed payment, order 10481', amount: 200 },
  { id: 'h4', date: '15 Sep', description: 'Coupon WELCOME100 converted to credit', amount: 100 },
]

export function WalletPage() {
  const navigate = useNavigate()

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
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))] gap-3 sm:gap-4">
          <div className="rounded-2xl border border-border/60 bg-white p-5 sm:p-6">
            <p className="text-xs sm:text-sm text-text-light mb-2">Available credit</p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-yellow-100 flex-shrink-0">
                <Coins className="w-5 h-5 text-yellow-600" strokeWidth={2.25} />
              </span>
              <span className="font-display text-3xl sm:text-4xl font-bold text-text-primary tabular-nums">
                {AVAILABLE_COINS} coins
              </span>
              <span className="text-sm text-text-light">(₹{formatINR(AVAILABLE_COINS)})</span>
            </div>
          </div>

          <StatTile
            label="Reserved"
            value={RESERVED_COINS}
            icon={<Hourglass className="w-4 h-4 text-text-light" />}
          />
          <StatTile
            label="Pending"
            value={PENDING_COINS}
            icon={<Clock className="w-4 h-4 text-text-light" />}
          />
          <StatTile
            label="Expiring soon"
            value={EXPIRING_SOON_COINS}
            icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
            emphasize={EXPIRING_SOON_COINS > 0}
          />
        </div>

        {/* Your credit by batch */}
        <section className="mt-6 rounded-2xl border border-border/60 bg-white overflow-hidden">
          <div className="px-4 sm:px-5 pt-5 pb-3">
            <h2 className="font-display font-bold text-base text-text-primary">
              Your credits
            </h2>
          </div>

          {/* Desktop table */}
          <ul className="divide-y divide-border/50 border-t border-border/50">
            {BATCHES.map((b) => (
              <li
                key={b.id}
                className="flex items-center gap-4 px-4 sm:px-5 py-3.5 text-sm"
              >
                <span className="w-14 sm:w-16 flex-shrink-0 text-xs sm:text-sm text-text-light tabular-nums">
                  {b.received}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-text-primary truncate">{b.source}</p>
                  <p className="text-[11px] text-text-light mt-0.5 flex items-center gap-2 flex-wrap">
                    <span className="tabular-nums">Expires {b.expires}</span>
                    {b.expiryTag && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 whitespace-nowrap">
                        {b.expiryTag}
                      </span>
                    )}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 font-display font-bold text-sm text-text-primary whitespace-nowrap">
                  <Coins className="w-4 h-4 text-yellow-600" strokeWidth={2.25} aria-hidden />
                  <span className="tabular-nums">{b.coinsLeft}</span> coins
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* History */}
        <section className="mt-6 rounded-2xl border border-border/60 bg-white overflow-hidden">
          <div className="px-4 sm:px-5 pt-5 pb-3">
            <h2 className="font-display font-bold text-base text-text-primary">History</h2>
          </div>
          <ul className="divide-y divide-border/50">
            {HISTORY.map((h) => (
              <li
                key={h.id}
                className="flex items-center gap-4 px-4 sm:px-5 py-3.5"
              >
                <span className="w-14 sm:w-16 flex-shrink-0 text-xs sm:text-sm text-text-light tabular-nums">
                  {h.date}
                </span>
                <span className="flex-1 min-w-0 text-sm text-text-primary truncate">
                  {h.description}
                </span>
                <span
                  className={cn(
                    'font-display font-bold text-sm tabular-nums whitespace-nowrap',
                    h.amount >= 0 ? 'text-emerald-600' : 'text-rose-600',
                  )}
                >
                  {h.amount >= 0 ? '+' : '−'}{Math.abs(h.amount)}
                </span>
              </li>
            ))}
          </ul>
        </section>

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
