"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const filters = [
  { key: "all", label: "All open" },
  { key: "help_desk", label: "Help desk" },
  { key: "change_request", label: "Change management" },
  { key: "cab", label: "CAB queue" },
  { key: "critical", label: "Critical" },
] as const;

export function TicketFilters() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("view") ?? "all";

  return (
    <nav
      aria-label="Queue filters"
      className="flex flex-wrap gap-1.5"
    >
      {filters.map((filter) => {
        const href =
          filter.key === "all" ? pathname : `${pathname}?view=${filter.key}`;
        const isActive = active === filter.key;
        return (
          <Link
            key={filter.key}
            href={href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors duration-200",
              isActive
                ? "bg-[#1a4a5c] text-white shadow-sm"
                : "bg-white/80 text-[#143a48]/80 ring-1 ring-[#1a4a5c]/12 hover:bg-white hover:text-[#143a48]"
            )}
          >
            {filter.label}
          </Link>
        );
      })}
    </nav>
  );
}
