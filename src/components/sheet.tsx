"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  side?: "bottom" | "left";
  children: ReactNode;
};

/**
 * Bottom sheet / side drawer built on the native <dialog> element, which gives
 * us focus trapping, Escape-to-close and an inert background for free.
 */
export function Sheet({ open, onClose, title, description, side = "bottom", children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Next.js keeps pages mounted (hidden) after navigation; close the sheet
  // when this page is hidden so it isn't open when the user comes back.
  const onCloseRef = useRef(onClose);
  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  });
  useLayoutEffect(() => () => onCloseRef.current(), []);

  const position =
    side === "bottom"
      ? "mt-auto mb-0 w-full max-w-none rounded-t-3xl"
      : "ml-0 mr-auto h-full max-h-none w-80 max-w-[85vw]";

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="sheet-title"
      className={`${position} bg-white p-0 text-zinc-950 shadow-xl backdrop:bg-black/30`}
    >
      <div className="mx-auto max-w-md p-4">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <h2 id="sheet-title" className="text-lg font-bold">
              {title}
            </h2>
            {description && <p className="text-sm text-zinc-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-xl p-2 hover:bg-zinc-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
