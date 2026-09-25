import { lazy, Suspense, type ComponentType } from 'react'
import { createBrowserRouter } from 'react-router'
import { RootLayout } from '@/components/layout/RootLayout'
import { AppLayout } from '@/components/layout/AppLayout'
import { RequireSelection, RequireTransaction } from '@/components/shared/RouteGuards'

// Eagerly load the homepage (critical path)
import { HomePage } from '@/pages/HomePage'

// Reload once when a lazy chunk 404s after a deploy (stale index.html).
const RELOAD_KEY = 'cp:chunk-reloaded'
function lazyWithReload<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      return await factory()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      const isChunkError =
        /Failed to fetch dynamically imported module/i.test(msg) ||
        /Importing a module script failed/i.test(msg) ||
        /ChunkLoadError/i.test(msg)
      if (isChunkError && typeof window !== 'undefined' && !sessionStorage.getItem(RELOAD_KEY)) {
        sessionStorage.setItem(RELOAD_KEY, '1')
        window.location.reload()
        return { default: (() => null) as unknown as T }
      }
      throw err
    }
  })
}

// Lazy-load all other pages (bundle-dynamic-imports)
const DashboardPage = lazyWithReload(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const StatusPage = lazyWithReload(() => import('@/pages/StatusPage').then(m => ({ default: m.StatusPage })))
const PaymentPage = lazyWithReload(() => import('@/pages/PaymentPage').then(m => ({ default: m.PaymentPage })))
const PaymentCompletedPage = lazyWithReload(() => import('@/pages/PaymentCompletedPage').then(m => ({ default: m.PaymentCompletedPage })))
const ChallanDetailsPage = lazyWithReload(() => import('@/pages/ChallanDetailsPage').then(m => ({ default: m.ChallanDetailsPage })))
const LoadingPage = lazyWithReload(() => import('@/pages/LoadingPage').then(m => ({ default: m.LoadingPage })))
const BlogsPage = lazyWithReload(() => import('@/pages/BlogsPage').then(m => ({ default: m.BlogsPage })))
const NewsPage = lazyWithReload(() => import('@/pages/NewsPage').then(m => ({ default: m.NewsPage })))
const FAQPage = lazyWithReload(() => import('@/pages/FAQPage').then(m => ({ default: m.FAQPage })))
const PrivacyPolicyPage = lazyWithReload(() => import('@/pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })))
const TermsPage = lazyWithReload(() => import('@/pages/TermsPage').then(m => ({ default: m.TermsPage })))
const RefundPolicyPage = lazyWithReload(() => import('@/pages/RefundPolicyPage').then(m => ({ default: m.RefundPolicyPage })))
const RoadSmartPartnersPage = lazyWithReload(() => import('@/pages/RoadSmartPartnersPage').then(m => ({ default: m.RoadSmartPartnersPage })))
const TrackStatusPage = lazyWithReload(() => import('@/pages/TrackStatusPage').then(m => ({ default: m.TrackStatusPage })))
const ProfilePage = lazyWithReload(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const WalletPage = lazyWithReload(() => import('@/pages/WalletPage').then(m => ({ default: m.WalletPage })))

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={<PageFallback />}>
      <Component />
    </Suspense>
  )
}

function RouteErrorBoundary() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-2xl font-bold text-text-primary mb-2">Something went wrong</h1>
      <p className="text-sm text-text-secondary mb-6">We couldn't load this page. Please refresh to try again.</p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
      >
        Refresh
      </button>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'blogs', element: withSuspense(BlogsPage) },
      { path: 'news', element: withSuspense(NewsPage) },
      { path: 'faq', element: withSuspense(FAQPage) },
      { path: 'privacy-policy', element: withSuspense(PrivacyPolicyPage) },
      { path: 'terms', element: withSuspense(TermsPage) },
      { path: 'refund-policy', element: withSuspense(RefundPolicyPage) },
      { path: 'road-smart-partners', element: withSuspense(RoadSmartPartnersPage) },
      { path: 'track-status', element: withSuspense(TrackStatusPage) },
      { path: 'profile', element: withSuspense(ProfilePage) },
      { path: 'wallet', element: withSuspense(WalletPage) },
    ],
  },
  {
    element: <AppLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: 'loading', element: withSuspense(LoadingPage) },
      { path: 'dashboard', element: withSuspense(DashboardPage) },
      { path: 'status', element: withSuspense(StatusPage) },
      { path: 'challan/:id', element: withSuspense(ChallanDetailsPage) },
      { path: 'payment', element: <RequireSelection>{withSuspense(PaymentPage)}</RequireSelection> },
      { path: 'payment/completed', element: <RequireTransaction>{withSuspense(PaymentCompletedPage)}</RequireTransaction> },
    ],
  },
])
