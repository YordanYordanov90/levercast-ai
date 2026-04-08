import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ScrollReveal } from "./scroll-reveal"

export function CTA() {
  return (
    <section className="relative py-28 px-6 border-t border-border overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none blur-[100px] animate-glow-pulse"
        style={{
          background: "radial-gradient(ellipse, oklch(0.72 0.19 45 / 0.12) 0%, oklch(0.82 0.16 80 / 0.06) 50%, transparent 80%)",
        }}
      />
      
      <div className="relative max-w-3xl mx-auto text-center">
        <ScrollReveal>
          <h2 className="text-3xl md:text-5xl font-bold font-display text-foreground text-balance mb-5">
            Start building your{" "}
            <span className="gradient-text">audience today</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-xl mx-auto text-pretty">
            Join entrepreneurs who&apos;ve stopped procrastinating on social media. 
            Get your first AI-formatted post ready in under 2 minutes.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#"
              className="group flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-md hover:opacity-90 transition-all text-sm shadow-[0_0_30px_-8px_oklch(0.72_0.19_45_/_0.4)] hover:shadow-[0_0_40px_-8px_oklch(0.72_0.19_45_/_0.6)] hover:scale-[1.02] active:scale-[0.98]"
            >
              Get started — it&apos;s free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <p className="mt-6 text-xs text-muted-foreground">
            No credit card required &nbsp;·&nbsp; Cancel anytime
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
