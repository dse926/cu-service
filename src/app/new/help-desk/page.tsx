import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { HelpDeskForm } from "@/components/help-desk-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export default function NewHelpDeskPage() {
  return (
    <AppShell
      actions={
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "border-[#1a4a5c]/20 bg-white/80"
          )}
        >
          <ArrowLeft data-icon="inline-start" />
          Queue
        </Link>
      }
    >
      <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <header>
          <p className="text-sm font-medium tracking-wide text-[#2f5d4a] uppercase">
            Help desk
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl tracking-tight text-[#143a48]">
            Open a request
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Password resets, access, hardware, and branch support for Meridian
            staff.
          </p>
        </header>
        <div className="rounded-xl border border-[#1a4a5c]/12 bg-white/85 p-5 sm:p-6">
          <HelpDeskForm />
        </div>
      </div>
    </AppShell>
  );
}
