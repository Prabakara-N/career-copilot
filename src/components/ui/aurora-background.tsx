"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * Aceternity-style aurora gradient background.
 * Pure CSS — no JS animation, just multi-layer conic gradients with motion.
 */
export function AuroraBackground({
  className,
  children,
  showRadialGradient = true,
}: {
  className?: string;
  children?: ReactNode;
  showRadialGradient?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden bg-background",
        className
      )}
    >
      <div
        className={cn(
          `pointer-events-none absolute -inset-[10px] opacity-50 will-change-transform`,
          `[--white-gradient:repeating-linear-gradient(100deg,var(--background)_0%,var(--background)_7%,transparent_10%,transparent_12%,var(--background)_16%)]`,
          `[--dark-gradient:repeating-linear-gradient(100deg,#000_0%,#000_7%,transparent_10%,transparent_12%,#000_16%)]`,
          `[--aurora:repeating-linear-gradient(100deg,#3b82f6_10%,#a78bfa_15%,#93c5fd_20%,#06b6d4_25%,#7c3aed_30%)]`,
          `[background-image:var(--white-gradient),var(--aurora)] dark:[background-image:var(--dark-gradient),var(--aurora)]`,
          `[background-size:300%,_200%] [background-position:50%_50%,50%_50%]`,
          `filter blur-[10px] invert dark:invert-0`,
          `after:[background-image:var(--white-gradient),var(--aurora)] after:dark:[background-image:var(--dark-gradient),var(--aurora)] after:[background-size:200%,_100%] after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference`,
          `after:absolute after:inset-0 after:content-[""]`,
          showRadialGradient && `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]`
        )}
      ></div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
