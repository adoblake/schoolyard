"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Home, LogIn, MapPin, Menu, Plus, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/sheet";
import { RegionPicker } from "@/components/region-picker";
import { useSaved, useUserId } from "@/lib/client-store";
import type { Region } from "@/lib/types";

export function SiteHeader({ region }: { region: Region }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const { savedCount } = useSaved();
  const userId = useUserId();
  const close = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="rounded-xl p-2 hover:bg-zinc-100"
        >
          <Menu className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="text-center leading-tight"
          aria-label={`SchoolYard, ${region.label}. Change location`}
        >
          <div className="text-xl font-bold tracking-tight">SchoolYard</div>
          <div className="flex items-center justify-center gap-1 text-xs text-zinc-500">
            <MapPin className="h-3.5 w-3.5" aria-hidden /> {region.label}
          </div>
        </button>
        <Button asChild size="sm" className="rounded-xl">
          <Link href={`/${region.slug}/post`}>
            <Plus className="h-4 w-4" aria-hidden /> post
          </Link>
        </Button>
      </div>

      <Sheet open={menuOpen} onClose={close} title="SchoolYard" side="left">
        <nav className="flex flex-col gap-1 text-sm font-medium">
          <MenuLink href={`/${region.slug}`} onNavigate={close}>
            <Home className="h-4 w-4" aria-hidden /> Browse {region.name}
          </MenuLink>
          <MenuLink href={`/${region.slug}/saved`} onNavigate={close}>
            <Heart className="h-4 w-4" aria-hidden /> Saved listings
            {savedCount > 0 && (
              <span className="ml-auto rounded-full bg-zinc-900 px-2 text-xs text-white">{savedCount}</span>
            )}
          </MenuLink>
          <MenuLink href={`/${region.slug}/post`} onNavigate={close}>
            <Plus className="h-4 w-4" aria-hidden /> Post a listing
          </MenuLink>
          {userId ? (
            <MenuLink href={`/account?region=${region.slug}`} onNavigate={close}>
              <UserRound className="h-4 w-4" aria-hidden /> Account &amp; my listings
            </MenuLink>
          ) : (
            <MenuLink href={`/login?next=/${region.slug}`} onNavigate={close}>
              <LogIn className="h-4 w-4" aria-hidden /> Sign in with school email
            </MenuLink>
          )}
          <button
            type="button"
            onClick={() => {
              close();
              setPickerOpen(true);
            }}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-zinc-100"
          >
            <MapPin className="h-4 w-4" aria-hidden /> Change SchoolYard
          </button>
        </nav>
        <p className="mt-6 text-xs leading-5 text-zinc-500">
          Meet in busy public spots on campus, and don&apos;t pay before you&apos;ve seen the item.
        </p>
      </Sheet>

      <RegionPicker open={pickerOpen} onClose={() => setPickerOpen(false)} current={region} />
    </header>
  );
}

function MenuLink({
  href,
  onNavigate,
  children,
}: {
  href: string;
  onNavigate: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} onNavigate={onNavigate} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-zinc-100">
      {children}
    </Link>
  );
}
