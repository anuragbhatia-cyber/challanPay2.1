import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useUserStore } from '@/stores/userStore'
import { mobileSchema, otpSchema, userNameSchema } from '@/lib/validators'
import { useModalA11y } from '@/hooks/useModalA11y'

type Step = 'details' | 'otp'

export function VerificationModal() {
  const { isVerificationModalOpen, vehicleNumber, closeVerificationModal, setUser } =
    useUserStore()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('details')
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [otpDigits, setOtpDigits] = useState(['', '', '', ''])
  const otp = otpDigits.join('')
  const [error, setError] = useState('')
  const [mobileError, setMobileError] = useState('')
  const [nameError, setNameError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const startResendTimer = () => {
    setResendTimer(60)
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newDigits = [...otpDigits]
    // Handle paste of full OTP
    if (value.length > 1) {
      const chars = value.slice(0, 4).split('')
      chars.forEach((c, i) => { newDigits[i] = c })
      setOtpDigits(newDigits)
      setError('')
      const focusIdx = Math.min(chars.length, 3)
      otpRefs.current[focusIdx]?.focus()
      if (chars.length === 4) {
        setTimeout(() => handleOtpSubmitWithDigits(newDigits), 0)
      }
      return
    }
    newDigits[index] = value
    setOtpDigits(newDigits)
    setError('')
    if (value && index < 3) {
      otpRefs.current[index + 1]?.focus()
    }
    // Auto-submit when all 4 digits filled
    if (value && newDigits.every(d => d !== '')) {
      setTimeout(() => handleOtpSubmitWithDigits(newDigits), 0)
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      handleOtpSubmit()
    }
  }

  useModalA11y(isVerificationModalOpen, closeVerificationModal)

  // Reset state when modal closes
  useEffect(() => {
    if (!isVerificationModalOpen) {
      setStep('details')
      setName('')
      setMobile('')
      setOtpDigits(['', '', '', ''])
      setError('')
      setMobileError('')
      setNameError('')
    }
  }, [isVerificationModalOpen])

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
    setUser(name, mobile)
    closeVerificationModal()
    navigate(`/loading?vehicle=${encodeURIComponent(vehicleNumber ?? '')}`)
  }

  const handleOtpSubmit = () => {
    handleOtpSubmitWithDigits(otpDigits)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (step === 'details') handleDetailsSubmit()
      else handleOtpSubmit()
    }
  }

  const stepIndex = step === 'details' ? 0 : 1

  return (
    <AnimatePresence>
      {isVerificationModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm md:p-4"
          onClick={closeVerificationModal}
        >
          <motion.div
            initial={{ y: '100%', opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 1 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full md:max-w-lg bg-white rounded-t-2xl md:rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Close */}
            <button
              onClick={closeVerificationModal}
              aria-label="Close"
              className="absolute top-2 right-2 md:top-3 md:right-3 w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 pb-8 md:p-10">
              {/* Progress */}
              <div className="flex items-center gap-2 mb-8 pr-12">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i <= stepIndex ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>

              {/* Vehicle badge */}
              {vehicleNumber && (
                <div className="inline-block px-4 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full mb-5 font-display tracking-wide">
                  {vehicleNumber}
                </div>
              )}

              <AnimatePresence mode="wait">
                {/* Step 1: Name + Mobile */}
                {step === 'details' && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="font-display text-2xl font-bold text-text-primary mb-2">
                      Enter your details
                    </h3>
                    <p className="font-body text-sm text-text-secondary mb-7">
                      We'll send you an OTP to verify your number
                    </p>

                    {/* Name input */}
                    <div className="mb-5">
                      <label htmlFor="vm-name" className="block text-xs font-medium text-text-secondary mb-2 font-body">
                        Full Name
                      </label>
                      <input
                        id="vm-name"
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value)
                          setNameError('')
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter your full name"
                        autoFocus
                        aria-invalid={nameError ? true : undefined}
                        aria-describedby={nameError ? 'vm-name-error' : undefined}
                        className="w-full px-4 py-4 rounded-xl border border-border bg-gray-50 text-sm font-body text-text-primary placeholder:text-gray-500 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                      {nameError && (
                        <p id="vm-name-error" role="alert" className="text-xs text-red-500 mt-1.5 font-body">{nameError}</p>
                      )}
                    </div>

                    {/* Mobile input */}
                    <div>
                      <label htmlFor="vm-mobile" className="block text-xs font-medium text-text-secondary mb-2 font-body">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-body">
                          +91
                        </span>
                        <input
                          id="vm-mobile"
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          value={mobile}
                          onChange={(e) => {
                            setMobile(e.target.value.replace(/\D/g, ''))
                            setMobileError('')
                          }}
                          onKeyDown={handleKeyDown}
                          placeholder="10-digit mobile number"
                          aria-invalid={mobileError ? true : undefined}
                          aria-describedby={mobileError ? 'vm-mobile-error' : undefined}
                          className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-gray-50 text-sm font-body text-text-primary placeholder:text-gray-500 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                      </div>
                      {mobileError && (
                        <p id="vm-mobile-error" role="alert" className="text-xs text-red-500 mt-1.5 font-body">{mobileError}</p>
                      )}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDetailsSubmit}
                      className="w-full mt-7 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-display font-semibold py-4 rounded-xl transition-colors text-sm"
                    >
                      Send OTP
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>

                    <p className="text-[11px] text-text-light text-center mt-4 leading-relaxed">
                      By continuing, you agree to our{' '}
                      <a href="/terms" className="text-primary underline underline-offset-2">Terms &amp; Conditions</a>
                      {' '}and{' '}
                      <a href="/privacy-policy" className="text-primary underline underline-offset-2">Privacy Policy</a>
                    </p>
                  </motion.div>
                )}

                {/* Step 2: OTP */}
                {step === 'otp' && (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="font-display text-2xl font-bold text-text-primary mb-2">
                      Verify OTP
                    </h3>
                    <p className="font-body text-sm text-text-secondary mb-7">
                      Enter the 4-digit code sent to +91 {mobile}
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
                          aria-describedby={error ? 'vm-otp-error' : undefined}
                          className="w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 border-border bg-gray-50 text-center text-xl font-display font-bold text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                      ))}
                    </div>
                    {error && (
                      <p id="vm-otp-error" role="alert" className="text-xs text-red-500 mt-2 font-body">{error}</p>
                    )}
                    <div className="text-center mt-4">
                      <p className="text-sm text-text-light">
                        Didn't receive the code?{' '}
                        {resendTimer > 0 ? (
                          <span className="text-text-secondary font-medium">Resend in {resendTimer}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setOtpDigits(['', '', '', ''])
                              setError('')
                              startResendTimer()
                            }}
                            className="text-primary font-medium hover:underline inline-flex items-center justify-center px-3 py-2 -my-2 min-h-11"
                          >
                            Resend OTP
                          </button>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-3 mt-5">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleOtpSubmit}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-display font-semibold py-4 rounded-xl transition-colors text-sm"
                      >
                        Check Challans
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
