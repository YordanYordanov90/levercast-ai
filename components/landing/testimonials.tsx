import { ScrollReveal } from "./scroll-reveal"

const testimonials = [
  {
    quote:
      "I used to spend 45 minutes writing a single LinkedIn post. With Levercast it takes me 3 minutes. It's become part of my daily routine.",
    name: "Sarah K.",
    role: "Founder, SaaS Startup",
    initials: "SK",
    accentPrimary: true,
  },
  {
    quote:
      "The platform previews are a game-changer. I can see exactly how the post will look before I hit publish. No more formatting surprises.",
    name: "Marcus T.",
    role: "Content Marketer",
    initials: "MT",
    accentPrimary: false,
  },
  {
    quote:
      "I capture ideas on my phone in 30 seconds, then format and publish from my laptop. The workflow is seamless.",
    name: "Priya R.",
    role: "Entrepreneur & Speaker",
    initials: "PR",
    accentPrimary: true,
  },
]

export function Testimonials() {
  return (
    <section className="relative py-28 px-6 border-t border-border overflow-hidden">
      {/* Background glow */}
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
              Testimonials
            </p>
            <h2 className="text-3xl md:text-5xl font-bold font-display text-foreground text-balance">
              Entrepreneurs already love it
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <ScrollReveal key={t.name} delay={index * 100}>
              <div
                className="rounded-xl border border-border bg-surface/50 backdrop-blur-sm p-6 flex flex-col gap-5 hover:border-muted-foreground/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed flex-1">{`"${t.quote}"`}</p>
                {/* Author */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                      t.accentPrimary
                        ? "bg-primary/15 text-primary"
                        : "bg-accent-gold/15 text-accent-gold"
                    }`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
