import { cn } from "@/lib/utils";

/**
 * Subtle dotted grid background used behind hero sections.
 * Pure CSS — radial dots fading to background at edges.
 */
export function GridBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 -z-10",
        "[background-image:radial-gradient(circle_at_1px_1px,_var(--border)_1px,_transparent_0)]",
        "[background-size:24px_24px]",
        "[mask-image:radial-gradient(ellipse_at_center,_black_30%,_transparent_70%)]",
        className
      )}
    />
  );
}
