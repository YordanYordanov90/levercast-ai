import { Navbar } from '@/components/landing/navbar'
import { Hero } from '@/components/landing/hero'
import { AppPreview } from '@/components/landing/app-preview'
import { Stats } from '@/components/landing/stats'
import { Features } from '@/components/landing/features'
import { HowItWorks } from '@/components/landing/how-it-works'
import { Testimonials } from '@/components/landing/testimonials'
import { Pricing } from '@/components/landing/pricing'
import { CTA } from '@/components/landing/cta'
import { Footer } from '@/components/landing/footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      
      {/* App Preview Section - Separated from Hero with proper spacing */}
      <section className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 -mt-12 sm:-mt-16 lg:-mt-20 pb-24">
        <AppPreview />
      </section>
      
      <Stats />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  )
}