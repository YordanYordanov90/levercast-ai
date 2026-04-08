import { Sparkles } from "lucide-react"

function SidebarItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <div
      className={`rounded-md px-3 py-2 text-xs font-medium transition-colors ${
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-surface"
      }`}
    >
      {label}
    </div>
  )
}

function PlatformCard({ platform, color }: { platform: string; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className={`text-xs font-bold mb-2 ${color}`}>{platform}</div>
      <div className="space-y-1.5">
        <div className="h-2 rounded bg-border w-full" />
        <div className="h-2 rounded bg-border w-4/5" />
        <div className="h-2 rounded bg-border w-3/5" />
      </div>
    </div>
  )
}

export function AppPreview() {
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-2xl">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-border" />
          <div className="w-3 h-3 rounded-full bg-border" />
          <div className="w-3 h-3 rounded-full bg-border" />
        </div>
        <div className="flex-1 mx-4">
          <div className="bg-surface rounded-md px-3 py-1 text-xs text-muted-foreground text-center max-w-xs mx-auto">
            app.levercast.io/new-post
          </div>
        </div>
      </div>

      {/* App UI */}
      <div className="flex" style={{ minHeight: 340 }}>
        {/* Sidebar */}
        <div className="hidden sm:flex flex-col w-48 border-r border-border bg-background p-3 gap-1">
          <SidebarItem label="New Post" active />
          <SidebarItem label="Recent Posts" />
          <SidebarItem label="Templates" />
          <SidebarItem label="Settings" />
        </div>

        {/* Main area */}
        <div className="flex-1 p-5 flex flex-col gap-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Content Input
          </div>
          {/* Textarea mock */}
          <div className="rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground leading-relaxed flex-1">
            <span className="text-foreground">
              Just wrapped up a 3-month sprint launching our new product. Key
              lesson: talk to customers every single week, not just at launch.
              The feedback loop saves months of wasted work...
            </span>
            <span className="animate-pulse text-primary ml-0.5">|</span>
          </div>

          {/* Platform previews row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PlatformCard platform="LinkedIn" color="text-[#0A66C2]" />
            <PlatformCard platform="Twitter / X" color="text-foreground" />
          </div>

          {/* Publish button */}
          <div className="flex justify-end">
            <button className="flex items-center gap-2 bg-primary text-primary-foreground text-xs font-bold px-5 py-2 rounded-md hover:opacity-90 transition-opacity">
              <Sparkles className="w-3.5 h-3.5" />
              Publish All
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
