"use client";

import { cn } from "@/lib/utils";

/**
 * Aceternity-style border beam — a short glowing arc travels around the card's
 * perimeter only (not the background). Uses conic-gradient + mask to clip to
 * the border ring. Requires @property --beam-angle registered in globals.css.
 */
export function BorderBeam({
  className,
  duration = 6,
  colorFrom = "#3b82f6",
  colorTo = "#a78bfa",
}: {
  className?: string;
  duration?: number;
  colorFrom?: string;
  colorTo?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] p-[1.5px]",
        className
      )}
      style={{
        background: `conic-gradient(from var(--beam-angle), transparent 0deg, transparent 320deg, ${colorFrom} 340deg, ${colorTo} 360deg)`,
        WebkitMask:
          "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor",
        mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        maskComposite: "exclude",
        animation: `border-beam ${duration}s linear infinite`,
      }}
    />
  );
}
