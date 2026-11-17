"use client";

import Link from "next/link";
import { Sheet } from "@/components/sheet";
import { REGIONS } from "@/lib/data";
import type { Region } from "@/lib/types";
import { cn } from "@/lib/utils";

export function RegionPicker({
  open,
  onClose,
  current,
}: {
  open: boolean;
  onClose: () => void;
  current: Region;
}) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Choose your SchoolYard"
      description="Like city classifieds, but built around the colleges nearby."
    >
      <div className="space-y-2">
        {REGIONS.map((loc) => {
          const active = loc.slug === current.slug;
          return (
            <Link
              key={loc.slug}
              href={`/${loc.slug}`}
              onNavigate={onClose}
              aria-current={active ? "page" : undefined}
              className={cn(
                "block w-full rounded-2xl border p-4 text-left",
                active ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-white hover:bg-zinc-50",
              )}
            >
              <div className="font-bold">{loc.label}</div>
              <div className={cn("mt-1 text-sm", active ? "text-zinc-200" : "text-zinc-500")}>{loc.subtitle}</div>
              <div className={cn("mt-2 text-xs", active ? "text-zinc-300" : "text-zinc-400")}>
                {loc.schools.map((s) => s.name).join(" · ")}
              </div>
            </Link>
          );
        })}
      </div>
    </Sheet>
  );
}
