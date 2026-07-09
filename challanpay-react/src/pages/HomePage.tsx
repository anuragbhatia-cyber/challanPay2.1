import { HeroSection } from '@/components/home/HeroSection'
import { TrustedLogosScroll } from '@/components/home/TrustedLogosScroll'
import { BeRoadSmartBanner } from '@/components/home/BeRoadSmartBanner'
import { StatsSection } from '@/components/home/StatsSection'
import { MultiVehicleCTA } from '@/components/home/MultiVehicleCTA'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { VideoTestimonials } from '@/components/home/VideoTestimonials'
import { HowItWorksAccordion } from '@/components/home/HowItWorksAccordion'
import { BlogsPreview } from '@/components/home/BlogsPreview'
import { NewsPreview } from '@/components/home/NewsPreview'
import { ComparisonSection } from '@/components/home/ComparisonSection'
import { PartnersSection } from '@/components/home/PartnersSection'
import { NeedHelpSection } from '@/components/home/NeedHelpSection'
import { BackedBySection } from '@/components/home/BackedBySection'
import { DefiningMilestoneSection } from '@/components/home/DefiningMilestoneSection'
import { VerificationModal } from '@/components/home/VerificationModal'

export function HomePage() {
  return (
    <div className="landing-page">
      <VerificationModal />
      <HeroSection />
      <TrustedLogosScroll />
      {/* <BeRoadSmartBanner /> */}
      <StatsSection />
      <MultiVehicleCTA />
      <VideoTestimonials />
      <TestimonialsSection />
      <HowItWorksAccordion />
      <BlogsPreview />
      <DefiningMilestoneSection />
      <NewsPreview />
      <BackedBySection />
      <ComparisonSection />
      <NeedHelpSection />
      <PartnersSection />
    </div>
  )
}
