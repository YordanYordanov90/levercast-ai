import { ScrollReveal } from "./scroll-reveal"

const steps = [
  {
    number: "01",
    title: "Dump your idea",
    description:
      "Open the editor and type your raw thought — no structure needed. You can also attach an image.",
  },
  {
    number: "02",
    title: "Choose a template",
    description:
      "Pick from AI templates tuned for storytelling, product updates, tips, or announcements.",
  },
  {
    number: "03",
    title: "Review & edit",
    description:
      "The AI generates platform-specific posts instantly. Tweak inline until it sounds exactly like you.",
  },
  {
    number: "04",
    title: "Publish everywhere",
    description:
      "Hit publish once. Your post goes live on LinkedIn, Twitter/X, and any other connected platform.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-28 px-6 border-t border-border overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none blur-[100px] opacity-30"
        style={{
          background: "radial-gradient(circle, oklch(0.72 0.19 45 / 0.1) 0%, transparent 70%)",
        }}
      />
      
      <div className="relative max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              How it works
            </p>
            <h2 className="text-3xl md:text-5xl font-bold font-display text-foreground text-balance">
              From idea to published{" "}
              <span className="gradient-text">in 4 steps</span>
            </h2>
          </div>
        </ScrollReveal>

        {/* Steps */}
        <div className="relative">
          {/* Connector line - desktop */}
          <div className="hidden lg:block absolute top-8 left-[calc(12.5%+1rem)] right-[calc(12.5%+1rem)] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <ScrollReveal key={step.number} delay={idx * 100}>
                <div className="relative flex flex-col items-start lg:items-center text-left lg:text-center">
                  {/* Number badge */}
                  <div
                    className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mb-5 relative z-10 bg-background backdrop-blur-sm ${
                      idx === 0
                        ? "border-primary shadow-[0_0_20px_-5px_oklch(0.72_0.19_45_/_0.3)]"
                        : idx === steps.length - 1
                        ? "border-accent-gold shadow-[0_0_20px_-5px_oklch(0.82_0.16_80_/_0.3)]"
                        : "border-border"
                    }`}
                  >
                    <span
                      className={`font-bold text-lg ${
                        idx === 0
                          ? "text-primary"
                          : idx === steps.length - 1
                          ? "text-accent-gold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.number}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
