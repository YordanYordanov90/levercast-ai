import { Zap, FileText, Eye, Send, Layers, RefreshCw } from "lucide-react"
import { ScrollReveal } from "./scroll-reveal"

const features = [
  {
    icon: Zap,
    title: "Instant AI Formatting",
    description:
      "Paste your raw ideas and watch AI reformat them into platform-perfect posts in under 3 seconds.",
    accent: "primary",
  },
  {
    icon: Eye,
    title: "Live Styled Previews",
    description:
      "See exactly how your post will look on LinkedIn and Twitter before you publish — no surprises.",
    accent: "gold",
  },
  {
    icon: Send,
    title: "One-Click Publishing",
    description:
      "Connect your accounts via OAuth once. Then publish to all platforms simultaneously with a single click.",
    accent: "primary",
  },
  {
    icon: FileText,
    title: "Smart Templates",
    description:
      "Choose from a library of LLM-powered templates tuned for thought leadership, product launches, and more.",
    accent: "gold",
  },
  {
    icon: Layers,
    title: "Post Management",
    description:
      "Keep all your content organized with draft, pending, and published status — everything in one place.",
    accent: "primary",
  },
  {
    icon: RefreshCw,
    title: "Inline Editing",
    description:
      "Not quite right? Edit the AI-generated output inline before publishing without leaving the screen.",
    accent: "gold",
  },
]

export function Features() {
  return (
    <section id="features" className="relative py-28 px-6 overflow-hidden">
      {/* Subtle gradient divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none blur-[120px] opacity-30"
        style={{
          background: "radial-gradient(circle, oklch(0.72 0.19 45 / 0.1) 0%, transparent 70%)",
        }}
      />
      
      <div className="relative max-w-6xl mx-auto">
        {/* Section header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Features
            </p>
            <h2 className="text-3xl md:text-5xl font-bold font-display text-foreground text-balance">
              Everything you need to{" "}
              <span className="gradient-text">scale your voice</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
              Built for busy entrepreneurs who can&apos;t afford to spend hours on social media.
            </p>
          </div>
        </ScrollReveal>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <ScrollReveal key={feature.title} delay={index *50}>
                <div
                  className="group relative rounded-xl border border-border bg-surface/50 backdrop-blur-sm p-6 hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_30px_-10px_oklch(0.72_0.19_45_/_0.15)] hover:scale-[1.02] active:scale-[0.98] card-corner-accent"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                      feature.accent === "primary"
                        ? "bg-primary/10"
                        : "bg-accent-gold/10"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        feature.accent === "primary"
                          ? "text-primary"
                          : "text-accent-gold"
                      }`}
                    />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-base">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
