import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { Search, MapPinCheck, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Header } from './Header'
import { Footer } from './Footer'
import { SkipToContent } from '@/components/shared/SkipToContent'
import { OfflineBanner } from '@/components/shared/OfflineBanner'
import { VerificationModal } from '@/components/home/VerificationModal'

const BOTTOM_NAV_ITEMS = [
  { label: 'Check Challans', icon: Search, path: '/' },
  { label: 'Track Challans', icon: MapPinCheck, path: '/track-status' },
  { label: 'Profile', icon: UserRound, path: '/profile' },
]

const HIDE_BOTTOM_NAV = ['/road-smart-partners', '/blogs', '/news', '/faq', '/privacy-policy', '/terms']

export function RootLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const showBottomNav = !HIDE_BOTTOM_NAV.some(p => location.pathname.startsWith(p))

  // Hide the mobile bottom nav while scrolling down, reveal on scroll up.
  const [navHidden, setNavHidden] = useState(false)
  const lastScrollY = useRef(0)
  useEffect(() => {
    if (!showBottomNav) return
    const onScroll = () => {
      const y = window.scrollY
      const delta = y - lastScrollY.current
      if (Math.abs(delta) < 6) return
      if (delta > 0 && y > 80) setNavHidden(true)
      else setNavHidden(false)
      lastScrollY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [showBottomNav])

  return (
    <div className="min-h-screen flex flex-col overflow-x-clip">
      <SkipToContent />
      <OfflineBanner />
      {/* As Covered by NDTV ribbon — sits above the navbar, scrolls away with the page */}
      <div className="w-full bg-cyan-50 h-9 md:h-10 flex items-center">
        <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 flex items-center justify-center gap-2 md:gap-3">
          <span className="font-body text-xs md:text-sm font-medium text-text-primary">
            As Covered by
          </span>
          <span className="inline-flex items-baseline gap-1 font-display text-sm md:text-base font-bold tracking-wide">
            <span className="text-text-primary">NDTV</span>
            <span className="text-text-primary">India</span>
          </span>
        </div>
      </div>
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <VerificationModal />

      {/* Mobile Bottom Navbar */}
      {showBottomNav && (
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white rounded-t-2xl border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-bottom transition-transform duration-300',
          navHidden ? 'translate-y-full' : 'translate-y-0'
        )}
      >
        <div className="flex items-stretch px-2">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path)
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1.5 py-5 transition-colors',
                  isActive ? 'text-primary' : 'text-text-light'
                )}
              >
                <item.icon className="w-7 h-7" strokeWidth={isActive ? 2.5 : 1.5} />
                <span className={cn('text-sm', isActive ? 'font-semibold' : 'font-medium')}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
      )}
    </div>
  )
}
