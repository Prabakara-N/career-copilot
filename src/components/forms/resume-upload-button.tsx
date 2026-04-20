"use client";

import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import type { ResumeParsed } from "@/lib/schemas/resume-parsed";

type Props = {
  /** Called with the full structured parse result when upload succeeds. */
  onParsed: (parsed: ResumeParsed) => void;
  size?: "default" | "sm" | "lg";
  label?: string;
};

const ACCEPT = ".pdf,.txt,.md,.markdown,application/pdf,text/plain,text/markdown";

export function ResumeUploadButton({ onParsed, size = "sm", label = "Upload resume (PDF)" }: Props) {
  const { getIdToken } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      const token = await getIdToken();
      if (!token) {
        toast.error("Sign in to use resume parsing.");
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || !json.ok || !json.parsed) {
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
      onParsed(json.parsed as ResumeParsed);
      toast.success("Resume parsed — review and save.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Resume parse failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <Button
        type="button"
        variant="outline"
        size={size}
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="gap-1.5"
      >
        {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
        {busy ? "Parsing…" : label}
      </Button>
    </>
  );
}
