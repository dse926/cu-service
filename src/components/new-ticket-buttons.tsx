import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GitBranchPlus, TicketPlus, Users } from "lucide-react";

export function NewTicketButtons() {
  return (
    <>
      <Link
        href="/teams/"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "text-[#1a4a5c]/80"
        )}
      >
        <Users data-icon="inline-start" />
        Teams
      </Link>
      <Link
        href="/new/help-desk"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "border-[#1a4a5c]/20 bg-white/80"
        )}
      >
        <TicketPlus data-icon="inline-start" />
        Help desk
      </Link>
      <Link
        href="/new/change"
        className={cn(
          buttonVariants({ variant: "default" }),
          "bg-[#1a4a5c] hover:bg-[#143a48]"
        )}
      >
        <GitBranchPlus data-icon="inline-start" />
        Change request
      </Link>
    </>
  );
}
