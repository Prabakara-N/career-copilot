"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, UserRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { CvPdfData } from "@/lib/cv/pdf-document";
import type { ResumeParsed } from "@/lib/schemas/resume-parsed";
import { resumeParsedToCvData } from "@/lib/ai/resume-to-cv-data";
import { DEFAULT_CV_DATA } from "@/lib/cv/default-cv-data";

type Source = "profile" | "upload";

interface ResumeSourcePickerProps {
  getIdToken: () => Promise<string | null>;
  onReady: (args: { source: Source; cvData: CvPdfData }) => void;
}

export function ResumeSourcePicker({ getIdToken, onReady }: ResumeSourcePickerProps) {
  const [selected, setSelected] = useState<Source | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleProfile = () => {
    setSelected("profile");
    onReady({ source: "profile", cvData: DEFAULT_CV_DATA });
  };

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const token = await getIdToken();
      if (!token) {
        toast.error("Sign in required");
        return;
      }
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        toast.error(json.error ?? "Parse failed");
        return;
      }
      const parsed = json.parsed as ResumeParsed;
      const cvData = resumeParsedToCvData(parsed);
      setSelected("upload");
      onReady({ source: "upload", cvData });
      toast.success("Resume parsed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Parse failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">1. Pick your resume</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button
          variant={selected === "profile" ? "default" : "outline"}
          onClick={handleProfile}
          disabled={uploading}
          className="gap-2"
        >
          <UserRound className="size-4" />
          Use profile resume
        </Button>
        <Button
          variant={selected === "upload" ? "default" : "outline"}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="gap-2"
        >
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {uploading ? "Parsing…" : "Upload PDF or TXT"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt,.md,.markdown"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
      </CardContent>
    </Card>
  );
}
