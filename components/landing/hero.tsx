import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

export function Hero() {
  return (
    <section className="relative flex-col min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(to right, oklch(0.5 0 0) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.5 0 0) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Primary glow orb - center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full pointer-events-none blur-[100px] animate-glow-pulse"
        style={{
          background:
            "radial-gradient(ellipse, oklch(0.72 0.19 45 / 0.15) 0%, oklch(0.72 0.19 45 / 0.05) 40%, transparent 70%)",
        }}
      />

      {/* Secondary glow orb - top right */}
      <div
        className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 w-[500px] h-[500px] rounded-full pointer-events-none blur-[120px] animate-glow-pulse animation-delay-200"
        style={{
          background:
            "radial-gradient(circle, oklch(0.82 0.16 80 / 0.1) 0%, transparent 60%)",
        }}
      />

      {/* Tertiary glow orb - bottom left */}
      <div
        className="absolute bottom-0 left-0 -translate-x-1/4 translate-y-1/4 w-[400px] h-[400px] rounded-full pointer-events-none blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, oklch(0.65 0.15 25 / 0.08) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-surface/80 backdrop-blur-sm border border-border rounded-full px-4 py-1.5 mb-8 animate-slide-up opacity-0 animation-delay-100">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-muted-foreground">
            AI-Powered Content Creation
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight text-foreground text-balance leading-[1.1] mb-6 animate-slide-up opacity-0 animation-delay-200">
          Your ideas.{" "}
          <span className="gradient-text">Published</span>{" "}
          in seconds.
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10 text-pretty animate-slide-up opacity-0 animation-delay-300">
          Dump your raw thoughts into Levercast and watch AI transform them into
          polished LinkedIn and Twitter posts — ready to publish with one click.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up opacity-0 animation-delay-400">
          <Link
            href="/sign-up"
            className="group flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-md hover:opacity-90 transition-all text-sm shadow-[0_0_30px_-8px_oklch(0.72_0.19_45_/_0.4)] hover:shadow-[0_0_40px_-8px_oklch(0.72_0.19_45_/_0.6)] hover:scale-[1.02] active:scale-[0.98]"
          >
            Start for free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="#how-it-works"
            className="flex items-center gap-2 bg-surface/80 backdrop-blur-sm border border-border text-foreground font-medium px-6 py-3 rounded-md hover:border-muted-foreground transition-all text-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            See how it works
          </Link>
        </div>

        {/* Social proof */}
        <p className="mt-10 text-xs text-muted-foreground animate-fade-in opacity-0 animation-delay-500">
          No credit card required &nbsp;·&nbsp; Free to get started &nbsp;·&nbsp; Publish to LinkedIn & Twitter
        </p>
      </div>
    </section>
  )
}
