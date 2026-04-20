"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Aceternity-style gradient text with subtle shine animation.
 * Uses concrete hex/oklch colors (not CSS vars) so the gradient is always visible
 * regardless of theme tokens.
 */
export function ShineText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={cn(
        "inline-block bg-clip-text text-transparent",
        "[background-image:linear-gradient(110deg,#3b82f6,40%,#a78bfa,55%,#06b6d4,80%,#3b82f6)]",
        "[background-size:200%_100%]",
        "animate-shine",
        className
      )}
    >
      {children}
    </motion.span>
  );
}
