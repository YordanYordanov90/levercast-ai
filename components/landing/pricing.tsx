import { Check } from "lucide-react"
import Link from "next/link"
import { ScrollReveal } from "./scroll-reveal"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying Levercast and casual creators.",
    features: [
      "5 AI-formatted posts per month",
      "LinkedIn & Twitter previews",
      "2 templates",
      "Manual publish",
    ],
    cta: "Get started free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "For entrepreneurs who post consistently and want to grow.",
    features: [
      "Unlimited AI-formatted posts",
      "All platforms + future integrations",
      "Unlimited templates",
      "One-click publishing",
      "Post history & status tracking",
      "Priority support",
    ],
    cta: "Start Pro free for 14 days",
    highlight: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "per month",
    description: "For agencies and teams managing multiple brands.",
    features: [
      "Everything in Pro",
      "Up to 5 team members",
      "Brand voice customization",
      "Advanced analytics",
      "Dedicated onboarding",
    ],
    cta: "Contact us",
    highlight: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="relative py-28 px-6 border-t border-border overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none blur-[120px] opacity-40"
        style={{
          background: "radial-gradient(circle, oklch(0.72 0.19 45 / 0.08) 0%, transparent 70%)",
        }}
      />
      
      <div className="relative max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Pricing
            </p>
            <h2 className="text-3xl md:text-5xl font-bold font-display text-foreground text-balance">
              Simple, honest pricing
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
              No hidden fees. No long-term contracts. Cancel anytime.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, index) => (
            <ScrollReveal key={plan.name} delay={index * 100}>
              <div
                className={`rounded-xl border p-7 flex flex-col gap-6 relative ${
                  plan.highlight
                    ? "border-primary/50 bg-surface/80 backdrop-blur-sm shadow-[0_0_60px_-15px_oklch(0.72_0.19_45_/_0.35)] card-corner-accent"
                    : "border-border bg-surface/50 backdrop-blur-sm"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    Most popular
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">{plan.name}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground text-sm mb-1">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-foreground">
                      <Check
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          plan.highlight ? "text-primary" : "text-accent-gold"
                        }`}
                      />
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link
                  href="#"
                  className={`block text-center text-sm font-semibold py-2.5 rounded-md transition-all ${
                    plan.highlight
                      ? "bg-primary text-primary-foreground hover:opacity-90 shadow-[0_0_20px_-5px_oklch(0.72_0.19_45_/_0.4)] hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-surface-raised border border-border text-foreground hover:border-muted-foreground hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
