"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "./field-error";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
};

export const TextField = forwardRef<HTMLInputElement, Props>(
  ({ label, required, error, hint, id, ...inputProps }, ref) => {
    const inputId = id ?? inputProps.name;
    return (
      <div className="space-y-1.5">
        <Label htmlFor={inputId}>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
        <Input ref={ref} id={inputId} aria-invalid={!!error} {...inputProps} />
        {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
        <FieldError message={error} />
      </div>
    );
  }
);
TextField.displayName = "TextField";
