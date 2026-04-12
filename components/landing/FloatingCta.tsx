"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useUser } from "@clerk/nextjs"

export interface FloatingCtaProps {
  targetId?: string
  href?: string
  label?: string
}

export function FloatingCta({
  targetId = "pricing",
  href = "/sign-up",
  label = "Get started",
}: FloatingCtaProps) {
  const { isSignedIn } = useUser()
  const [visible, setVisible] = useState(false)
  const targetElRef = useRef<HTMLElement | null>(null)
  const rafIdRef = useRef<number | null>(null)

  useEffect(() => {
    targetElRef.current = document.getElementById(targetId)

    const updateVisibility = () => {
      const el = targetElRef.current
      if (!el) {
        setVisible(false)
        return
      }

      const rect = el.getBoundingClientRect()
      // Show only after user reaches end of section (bottom enters viewport)
      setVisible(rect.bottom <= window.innerHeight)
      rafIdRef.current = null
    }

    const onScroll = () => {
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(updateVisibility)
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    updateVisibility() // Initial check
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [targetId])

  if (isSignedIn) return null

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <Link
        href={href}
        className="group flex items-center gap-1.5 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-full text-xs shadow-[0_0_20px_-5px_oklch(0.72_0.19_45/0.4)] hover:shadow-[0_0_30px_-5px_oklch(0.72_0.19_45/0.6)] hover:scale-[1.05] active:scale-[0.95] transition-all"
      >
        {label}
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  )
}

