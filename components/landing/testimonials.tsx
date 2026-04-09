import { Lightbulb, Zap, Users } from "lucide-react"
import { ScrollReveal } from "./scroll-reveal"

const useCases = [
  {
    icon: Lightbulb,
    quote:
      "Capture a product insight at 7am, format it for LinkedIn and X by 7:02. No copywriter, no back-and-forth \u2014 just ship.",
    name: "The Solo Founder",
    tag: "Idea \u2192 Post in 2 min",
    accentPrimary: true,
  },
  {
    icon: Zap,
    quote:
      "Draft three days of content in one sitting. Pick a template, paste your raw notes, and get platform-perfect posts every time.",
    name: "The Content Marketer",
    tag: "Batch creation made easy",
    accentPrimary: false,
  },
  {
    icon: Users,
    quote:
      "Your best ideas come at random moments. Dump them in Levercast and let AI handle the formatting. Come back later, review, and publish.",
    name: "The Busy Entrepreneur",
    tag: "Never lose an idea",
    accentPrimary: true,
  },
]

export function Testimonials() {
  return (
    <section className="relative py-28 px-6 border-t border-border overflow-hidden">
      <div
        className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] rounded-full pointer-events-none blur-[120px] opacity-30"
        style={{
          background: "radial-gradient(circle, oklch(0.82 0.16 80 / 0.1) 0%, transparent 70%)",
        }}
      />
      
      <div className="relative max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Use cases
            </p>
            <h2 className="text-3xl md:text-5xl font-bold font-display text-foreground text-balance">
              Built for how you{" "}
              <span className="gradient-text">actually work</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {useCases.map((t, index) => {
            const Icon = t.icon
            return (
              <ScrollReveal key={t.name} delay={index * 100}>
                <div
                  className="rounded-xl border border-border bg-surface/50 backdrop-blur-sm p-6 flex flex-col gap-5 hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
                >
                  <div
                    className="absolute top-0 left-0 w-1 h-full"
                    style={{
                      background: t.accentPrimary
                        ? "oklch(0.72 0.19 45)"
                        : "oklch(0.82 0.16 80)",
                    }}
                  />
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        t.accentPrimary
                          ? "bg-primary/15 text-primary"
                          : "bg-accent-gold/15 text-accent-gold"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        t.accentPrimary ? "text-primary" : "text-accent-gold"
                      }`}
                    >
                      {t.tag}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed flex-1">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
