"use client";

import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Option<V extends string> = { value: V; label: string };

type Props<V extends string> = {
  label: string;
  options: readonly Option<V>[];
  value: V[];
  onChange: (value: V[]) => void;
  hint?: string;
};

/**
 * Multi-select pill toggle — click a pill to toggle it in/out of the array.
 */
export function PillToggle<V extends string>({
  label,
  options,
  value,
  onChange,
  hint,
}: Props<V>) {
  const toggle = (v: V) => {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else onChange([...value, v]);
  };

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors cursor-pointer",
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input hover:bg-muted hover:text-foreground"
              )}
            >
              {active && <Check className="size-3.5" />}
              {opt.label}
            </button>
          );
        })}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
