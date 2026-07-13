import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import { Menu, X, User, ChevronDown, Calendar, LogOut, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/stores/userStore'
import { useLanguageStore, type Language } from '@/stores/languageStore'
import { useTranslation } from '@/hooks/useTranslation'

const LANGUAGES = [
  { code: 'en' as const, label: 'English', short: 'EN' },
  { code: 'hi' as const, label: 'हिन्दी', short: 'HI' },
]

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isLangOpen, setIsLangOpen] = useState(false)
  const { language, setLanguage } = useLanguageStore()
  const { userName, logout } = useUserStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  const isRSPPage = location.pathname === '/road-smart-partners'

  const NAV_LINKS = [
    { label: t.header.roadSmartPartners, href: '/road-smart-partners', badge: t.header.new },
    { label: t.header.howItWorks, href: '/#how-it-works' },
    { label: t.header.support, href: '/#support' },
    { label: t.header.blogs, href: '/blogs' },
    { label: t.header.news, href: '/news' },
  ]

  const handleLogout = () => {
    logout()
    setIsProfileOpen(false)
    navigate('/')
  }

  const handleLangChange = (code: Language) => {
    setLanguage(code)
    setIsLangOpen(false)
  }

  return (
    <>
    <header className="sticky top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-[0_2px_2px_rgba(0,0,0,0.08)]">
      <nav className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-10 flex items-center justify-between h-20">
        {/* Logo */}
        <Link to={isRSPPage ? '/road-smart-partners' : '/'} className="flex-shrink-0">
          <img
            src={isRSPPage ? '/images/rsp-logo.webp' : '/images/logo.png'}
            alt={isRSPPage ? 'Road Smart Partner Logo' : 'ChallanPay Logo'}
            className="h-8 md:h-10 w-auto"
          />
        </Link>

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                className="text-base font-medium text-text-primary hover:text-primary transition-colors flex items-center gap-1.5"
              >
                {link.label}
                {link.badge && (
                  <span className="text-[10px] font-bold bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-1.5 py-0.5 rounded leading-none">
                    {link.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side: Language + Profile */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => { setIsLangOpen(!isLangOpen); setIsProfileOpen(false) }}
              className="flex items-center gap-1.5 px-3 min-h-11 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-text-secondary"
              aria-label="Switch language"
            >
              <Globe className="w-4 h-4" />
              {LANGUAGES.find(l => l.code === language)?.short}
              <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', isLangOpen && 'rotate-180')} />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-border py-1 animate-slide-down">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLangChange(lang.code)}
                    className={cn(
                      'flex items-center justify-between w-full px-4 py-3 min-h-11 text-sm transition-colors',
                      language === lang.code
                        ? 'text-primary font-semibold bg-primary/5'
                        : 'text-text-secondary hover:bg-gray-50'
                    )}
                  >
                    {lang.label}

                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 pl-2 pr-4 py-2 min-h-11 rounded-full border border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 hover:shadow-sm transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-[15px] font-semibold text-gray-900 max-w-[150px] truncate">
              {userName || t.header.login}
            </span>
            <ChevronDown className={cn('w-4 h-4 text-gray-500 transition-transform', isProfileOpen && 'rotate-180')} />
          </button>

          {/* Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-border py-2 animate-slide-down">
              <Link
                to="/track-status"
                className="flex items-center gap-3 px-4 py-3 min-h-11 text-sm text-text-secondary hover:bg-gray-50 transition-colors"
                onClick={() => setIsProfileOpen(false)}
              >
                <Calendar className="w-4 h-4" />
                {t.header.trackMyChallans}
              </Link>
              {userName && (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 min-h-11 text-sm text-text-secondary hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    {t.header.myProfile}
                  </Link>
                  <hr className="my-1 border-border" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 min-h-11 text-sm text-text-secondary hover:bg-gray-50 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    {t.header.logout}
                  </button>
                </>
              )}
            </div>
          )}
          </div>
        </div>

        {/* Hamburger Button */}
        <button
          className="md:hidden p-3 min-w-11 min-h-11 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-text-primary" />
          ) : (
            <Menu className="w-6 h-6 text-text-primary" />
          )}
        </button>
      </nav>

      {/* Trust signal ribbon – hidden for now */}
      {/* <div className="bg-cyan-100 text-center py-1.5 text-xs font-bold tracking-wide text-gray-800">
        📺 As seen on NDTV
      </div> */}
    </header>

    {/* Mobile fullscreen menu - outside header to avoid clipping */}
    {isMobileMenuOpen && (
      <nav className="md:hidden fixed inset-0 bg-white z-[70] overflow-y-auto">
        {/* Menu header mirroring the app header so the logo isn't clipped by the overlay */}
        <div className="flex items-center justify-between h-20 px-6">
          <Link
            to={isRSPPage ? '/road-smart-partners' : '/'}
            className="flex-shrink-0"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <img
              src={isRSPPage ? '/images/rsp-logo.webp' : '/images/logo.png'}
              alt={isRSPPage ? 'Road Smart Partner Logo' : 'ChallanPay Logo'}
              className="h-8 w-auto"
            />
          </Link>
          <button
            className="p-3 min-w-11 min-h-11 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-6 h-6 text-text-primary" />
          </button>
        </div>
        <ul className="px-4 py-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                className="block px-4 py-3.5 rounded-lg text-lg font-medium text-text-primary hover:bg-gray-50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
                {link.badge && (
                  <span className="ml-2 text-[11px] font-bold bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-1.5 py-0.5 rounded">
                    {link.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile Language Switcher */}
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 px-4 py-3">
            <Globe className="w-5 h-5 text-text-primary" />
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLangChange(lang.code)}
                className={cn(
                  'px-4 py-2.5 min-h-11 rounded-full text-base font-medium transition-colors',
                  language === lang.code
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-text-primary hover:bg-gray-200'
                )}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile User Profile */}
        <div className="px-4 pb-4 pt-2 border-t border-border">
          {userName ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <span className="text-lg font-medium text-text-primary">{userName}</span>
              </div>
              <Link
                to="/track-status"
                className="flex items-center gap-3 px-4 py-3.5 min-h-11 text-lg font-medium text-text-primary hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Calendar className="w-5 h-5" />
                {t.header.trackMyChallans}
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-3.5 min-h-11 text-lg font-medium text-text-primary hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-5 h-5" />
                {t.header.myProfile}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3.5 min-h-11 text-lg font-medium text-text-primary hover:bg-gray-50 rounded-lg transition-colors w-full text-left"
              >
                <LogOut className="w-5 h-5" />
                {t.header.logout}
              </button>
            </>
          ) : (
            <Link
              to="/track-status"
              className="flex items-center gap-3 px-4 py-3.5 min-h-11 text-lg font-medium text-text-primary hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User className="w-5 h-5" />
              {t.header.login}
            </Link>
          )}
        </div>
      </nav>
    )}
    </>
  )
}
