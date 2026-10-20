import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ChangeForm } from "@/components/change-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export default function NewChangePage() {
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
          <p className="text-sm font-medium tracking-wide text-[#1a4a5c] uppercase">
            Change management
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl tracking-tight text-[#143a48]">
            Submit a change request
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Normal, standard, and emergency changes with impact, CAB votes, and
            rollback plans before production windows.
          </p>
        </header>
        <div className="rounded-xl border border-[#1a4a5c]/12 bg-white/85 p-5 sm:p-6">
          <ChangeForm />
        </div>
      </div>
    </AppShell>
  );
}
