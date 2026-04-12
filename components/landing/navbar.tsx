"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Menu, X } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const { isSignedIn } = useUser()

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
      
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setScrollProgress(Math.min(100, Math.max(0, scrollPercent)))
    }
    
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    
    window.addEventListener("scroll", onScroll, { passive: true })
    document.addEventListener("keydown", onKeyDown)
    onScroll()
    return () => {
      window.removeEventListener("scroll", onScroll)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-[0_4px_30px_-10px_oklch(0_0_0/0.1)]" 
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-md bg-linear-to-br from-primary to-accent-gold flex items-center justify-center shadow-[0_0_15px_-3px_oklch(0.72_0.19_45/0.4)]">
            <Zap className="w-4 h-4 text-primary-foreground" fill="currentColor" />
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground">Levercast</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-px after:bg-primary after:transition-all hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="text-sm bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-md hover:opacity-90 transition-all shadow-[0_0_20px_-5px_oklch(0.72_0.19_45/0.4)] hover:shadow-[0_0_25px_-5px_oklch(0.72_0.19_45/0.6)] hover:scale-[1.02] active:scale-[0.98]"
              >
                Get started free
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-muted-foreground hover:text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div id="mobile-nav" className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border px-6 pb-6 pt-2 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
              <div className="flex items-center justify-between">
                <span className="text-sm">Account</span>
                <UserButton />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="text-sm bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-md text-center hover:opacity-90 transition-opacity shadow-[0_0_20px_-5px_oklch(0.72_0.19_45/0.4)]"
                onClick={() => setMobileOpen(false)}
              >
                Get started free
              </Link>
            </>
          )}
        </div>
      )}

      {/* Scroll progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-border overflow-hidden">
        <div 
          className="h-full bg-linear-to-r from-primary to-accent-gold transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    </header>
  )
}
