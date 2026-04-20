"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "./field-error";

type Props = {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  max?: number;
};

/**
 * Chip/tag input — type a value, press Enter or comma to add as a chip.
 * Click × on a chip to remove. Backspace on empty input removes the last chip.
 */
export function ChipsInput({ label, value, onChange, placeholder, error, hint, max }: Props) {
  const [draft, setDraft] = useState("");

  const addChip = (raw: string) => {
    const trimmed = raw.trim().replace(/,$/, "").trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) return;
    if (max && value.length >= max) return;
    onChange([...value, trimmed]);
    setDraft("");
  };

  const removeChip = (chip: string) => onChange(value.filter((c) => c !== chip));

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addChip(draft);
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      e.preventDefault();
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div
        className={`flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-2 py-1.5 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30 ${
          error ? "border-destructive" : ""
        }`}
      >
        {value.map((chip) => (
          <Badge key={chip} variant="secondary" className="gap-1 rounded-md px-2 py-1">
            {chip}
            <button
              type="button"
              onClick={() => removeChip(chip)}
              className="rounded-full transition-colors hover:text-destructive"
              aria-label={`Remove ${chip}`}
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        <Input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => draft.trim() && addChip(draft)}
          placeholder={value.length === 0 ? placeholder : "Add more…"}
          className="h-7 flex-1 min-w-[120px] border-0 bg-transparent px-1 py-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
      </div>
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      <FieldError message={error} />
    </div>
  );
}
