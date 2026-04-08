import { ScrollReveal } from "./scroll-reveal"

const stats = [
  { value: "10k+", label: "Posts published" },
  { value: "2 min", label: "Average time to publish" },
  { value: "3×", label: "More content, same effort" },
  { value: "2", label: "Platforms supported" },
]

export function Stats() {
  return (
    <section className="relative border-y border-border py-14 px-6 overflow-hidden">
      {/* Subtle background accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent 0%, oklch(0.72 0.19 45 / 0.02) 50%, transparent 100%)",
        }}
      />
      
      <div className="relative max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-border">
          {stats.map((stat, index) => (
            <ScrollReveal key={stat.label} delay={index * 100}>
              <div className="flex flex-col items-center text-center px-6">
                <span className="text-3xl md:text-4xl font-bold font-display text-foreground mb-1">
                  {stat.value}
                </span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
