import type { Metadata } from "next"
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
import { FloatingCta } from "@/components/landing/FloatingCta"

export const metadata: Metadata = {
  title: "Levercast — AI-Powered Content Creation for Entrepreneurs",
  description:
    "Dump your raw ideas and watch AI transform them into polished LinkedIn and Twitter posts. Preview, edit, and publish with one click.",
  openGraph: {
    title: "Levercast — Your Ideas, Published in Seconds",
    description:
      "AI-powered content creation for busy entrepreneurs. From raw idea to published post in under 2 minutes.",
    type: "website",
    siteName: "Levercast",
  },
  twitter: {
    card: "summary_large_image",
    title: "Levercast — Your Ideas, Published in Seconds",
    description:
      "AI-powered content creation for busy entrepreneurs. From raw idea to published post in under 2 minutes.",
  },
}

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
      <FloatingCta targetId="pricing" />
    </main>
  )
}