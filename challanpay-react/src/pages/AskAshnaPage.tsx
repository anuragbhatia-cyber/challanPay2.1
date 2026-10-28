import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Search, Sparkle, Clock, TrendingUp, X, Paperclip, FileText } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { cn } from '@/lib/utils'

const COMMON_SEARCHES: string[] = [
  'check challan status',
  'pay challan online',
  'pay court challan',
  'challan by vehicle number',
  'challan by DL number',
  'pending challan check',
  'traffic fine list',
  'contest a challan',
  'Lok Adalat challan',
]

const FEATURED_SEARCHES = new Set<string>(['pay challan online', 'pay court challan'])

const TRENDING_SEARCHES: string[] = [
  'e-challan status',
  'challan in lok adalat',
  'traffic fine list',
  'pending challan check',
]

const DEFAULT_RECENT: string[] = [
  'challan by vehicle number',
  'pay challan online',
  'no parking fine amount',
  'challan payment receipt download',
]

export function AskAshnaPage() {
  const [message, setMessage] = useState('')
  const [open, setOpen] = useState(false)
  const [recent, setRecent] = useState<string[]>(DEFAULT_RECENT)
  const [attachment, setAttachment] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const searchBoxRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (!searchBoxRef.current) return
      if (!searchBoxRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const handleSearch = () => {
    const q = message.trim()
    if (!q) {
      inputRef.current?.focus()
      return
    }
    setRecent((prev) => [q, ...prev.filter((p) => p.toLowerCase() !== q.toLowerCase())].slice(0, 6))
    setOpen(false)
    navigate(`/?q=${encodeURIComponent(q)}`)
  }

  const handleChipClick = (text: string) => {
    setMessage(text)
    inputRef.current?.focus()
    setOpen(true)
  }

  const handlePickSuggestion = (text: string) => {
    setMessage(text)
    inputRef.current?.focus()
  }

  const handleRemoveRecent = (text: string) => {
    setRecent((prev) => prev.filter((p) => p !== text))
  }

  const handleClearRecent = () => setRecent([])

  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setAttachment(f)
    e.target.value = ''
  }

  const handleRemoveAttachment = () => setAttachment(null)

  return (
    <PageTransition>
      <div
        className="relative overflow-hidden min-h-[calc(100vh-64px)]"
        style={{ backgroundColor: '#F1F7FB' }}
      >
        {/* Illustration pinned to the bottom, bleeding full-width; soft fade at the top blends it into the page color */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0"
          style={{
            height: 'min(72vh, 760px)',
            backgroundImage:
              "linear-gradient(to bottom, rgba(241,247,251,1) 0%, rgba(241,247,251,0) 22%), url('/images/askashna-highway.png')",
            backgroundRepeat: 'no-repeat, no-repeat',
            backgroundPosition: 'top center, bottom center',
            backgroundSize: '100% 100%, 100% auto',
          }}
        />
        {/* ───────────── Hero + Search ───────────── */}
        <section className="relative z-20 max-w-[1100px] mx-auto px-4 sm:px-6 pt-16 md:pt-24 pb-8 md:pb-10 text-center">
          <ScrollReveal>
            <h1 className="relative inline-block font-display font-extrabold leading-none tracking-tight text-4xl sm:text-5xl md:text-6xl">
              <span className="text-text-light/70">Ask </span>
              <span className="text-text-primary">Ashna</span>
              <Sparkle
                className="absolute -top-1 -right-4 md:-top-2 md:-right-6 w-4 h-4 md:w-5 md:h-5 text-primary"
                strokeWidth={2.5}
                fill="currentColor"
              />
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div
              ref={searchBoxRef}
              className="relative mt-10 md:mt-14 mx-auto max-w-[920px]"
            >
              <div
                className={cn(
                  'bg-white border border-white shadow-[0_8px_30px_rgba(15,29,59,0.08)]',
                  open ? 'rounded-3xl rounded-b-none' : 'rounded-full',
                )}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSearch()
                  }}
                  className="flex items-center gap-2 pl-5 pr-2 py-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onFocus={() => setOpen(true)}
                    placeholder="Write message"
                    aria-label="Ask Ashna"
                    className="flex-1 min-w-0 bg-transparent outline-none font-body text-sm md:text-base text-text-primary placeholder:text-text-light py-3"
                  />
                  {attachment && (
                    <span className="shrink-0 inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full pl-2.5 pr-1 py-1 max-w-[180px]">
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-body text-xs font-medium truncate">
                        {attachment.name}
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveAttachment}
                        aria-label="Remove attachment"
                        className="shrink-0 w-5 h-5 rounded-full hover:bg-primary/20 flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileSelected}
                    className="sr-only"
                    aria-hidden="true"
                    tabIndex={-1}
                  />
                  <button
                    type="button"
                    onClick={handleAttachClick}
                    aria-label="Attach file"
                    title="Attach file"
                    className="shrink-0 inline-flex items-center justify-center gap-1 h-10 w-10 rounded-full border border-border bg-white hover:border-primary hover:text-primary text-text-secondary transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    type="submit"
                    className="shrink-0 inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-display font-semibold px-5 md:px-7 py-3 rounded-full transition-colors text-sm md:text-base"
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </button>
                </form>
              </div>

              {open && (
                <div className="absolute top-full left-0 right-0 z-30 bg-white border border-white border-t-0 rounded-b-3xl shadow-[0_8px_30px_rgba(15,29,59,0.08)] px-5 md:px-6 pt-4 pb-5 text-left">
                  {/* Recent */}
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-display text-xs md:text-sm font-bold text-text-primary">
                      Recent searches
                    </p>
                    {recent.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearRecent}
                        className="font-body text-xs md:text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {recent.length === 0 ? (
                    <p className="font-body text-xs text-text-light py-2">No recent searches.</p>
                  ) : (
                    <ul className="flex flex-col">
                      {recent.map((text) => (
                        <li key={text}>
                          <div className="group flex items-center justify-between gap-3 py-2 rounded-md hover:bg-bg-page transition-colors px-2 -mx-2">
                            <button
                              type="button"
                              onClick={() => handlePickSuggestion(text)}
                              className="flex items-center gap-3 min-w-0 flex-1 text-left"
                            >
                              <Clock className="w-4 h-4 text-text-light shrink-0" />
                              <span className="font-body text-sm text-text-primary truncate">
                                {text}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveRecent(text)}
                              aria-label={`Remove ${text}`}
                              className="shrink-0 w-6 h-6 rounded-full text-text-light hover:text-text-primary hover:bg-white transition-colors flex items-center justify-center"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Trending */}
                  <p className="font-display text-xs md:text-sm font-bold text-text-primary mt-4 mb-2">
                    Trending searches
                  </p>
                  <ul className="flex flex-col">
                    {TRENDING_SEARCHES.map((text) => (
                      <li key={text}>
                        <button
                          type="button"
                          onClick={() => handlePickSuggestion(text)}
                          className="w-full flex items-center gap-3 py-2 px-2 -mx-2 rounded-md hover:bg-bg-page transition-colors text-left"
                        >
                          <TrendingUp className="w-4 h-4 text-text-light shrink-0" />
                          <span className="font-body text-sm text-text-primary truncate">
                            {text}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </ScrollReveal>
        </section>

        {/* ───────────── Common searches ───────────── */}
        <section className="relative z-10 max-w-[1100px] mx-auto px-4 sm:px-6 pb-16 md:pb-24">
          <ScrollReveal delay={0.15}>
            <p className="text-center font-body text-sm md:text-base font-bold text-text-primary mb-5">
              Common searches
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="flex flex-wrap items-center justify-center gap-2.5 md:gap-3">
              {COMMON_SEARCHES.map((text) => {
                const isFeatured = FEATURED_SEARCHES.has(text)
                return (
                  <button
                    key={text}
                    type="button"
                    onClick={() => handleChipClick(text)}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full px-4 md:px-5 py-2 md:py-2.5 transition-all',
                      'font-body text-xs md:text-sm',
                      isFeatured
                        ? 'bg-white border-2 border-primary text-primary font-semibold shadow-[0_1px_2px_rgba(8,145,178,0.08)] hover:bg-primary/5 hover:shadow-md'
                        : 'bg-white/80 border border-white text-text-primary shadow-[0_1px_2px_rgba(15,29,59,0.04)] hover:bg-white hover:shadow-md',
                    )}
                  >
                    <Search className={cn('w-3.5 h-3.5', isFeatured ? 'text-primary' : 'text-text-light')} />
                    {text}
                  </button>
                )
              })}
            </div>
          </ScrollReveal>
        </section>
      </div>
    </PageTransition>
  )
}
