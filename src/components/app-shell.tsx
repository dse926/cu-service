import Link from "next/link";
import { ORG } from "@/lib/labels";

export function AppShell({
  children,
  actions,
}: {
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="relative min-h-full">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#e8f0f2_0%,_#f4f6f7_45%,_#eef1f3_100%)]" />
        <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(26,74,92,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(26,74,92,0.06)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute -top-24 right-[-10%] h-80 w-80 rounded-full bg-[#1a4a5c]/10 blur-3xl" />
        <div className="absolute bottom-0 left-[-8%] h-72 w-72 rounded-full bg-[#2f5d4a]/10 blur-3xl" />
      </div>

      <header className="border-b border-[#1a4a5c]/12 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="group flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#1a4a5c] text-sm font-semibold tracking-tight text-[#f3f7f8] shadow-sm transition-transform duration-300 group-hover:scale-[1.03]">
              M
            </span>
            <span className="min-w-0">
              <span className="block truncate font-[family-name:var(--font-display)] text-lg leading-tight tracking-tight text-[#143a48]">
                {ORG.name}
              </span>
              <span className="block truncate text-xs text-[#1a4a5c]/70">
                {ORG.product} · {ORG.assets} assets
              </span>
            </span>
          </Link>
          {actions ? (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          ) : null}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
