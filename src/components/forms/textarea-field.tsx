"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FieldError } from "./field-error";
import { cn } from "@/lib/utils";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const TextareaField = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, error, hint, id, className, ...textareaProps }, ref) => {
    const inputId = id ?? textareaProps.name;
    return (
      <div className="space-y-1.5">
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <Textarea
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          className={cn(className)}
          {...textareaProps}
        />
        {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
        <FieldError message={error} />
      </div>
    );
  }
);
TextareaField.displayName = "TextareaField";
