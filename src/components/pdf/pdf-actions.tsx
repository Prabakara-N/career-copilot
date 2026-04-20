"use client";

import { Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadBase64Pdf, previewBase64Pdf } from "@/lib/pdf-utils";

type Props = {
  filename: string;
  base64: string;
  size?: "default" | "sm" | "lg";
};

/**
 * Two-button action row for any generated PDF: Preview (new tab) + Download.
 * Used by tool-indicator (chat) and the report page.
 */
export function PdfActions({ filename, base64, size = "sm" }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button size={size} variant="outline" onClick={() => previewBase64Pdf(base64)} className="gap-1.5">
        <Eye className="size-3.5" />
        Preview
      </Button>
      <Button size={size} onClick={() => downloadBase64Pdf(filename, base64)} className="gap-1.5">
        <Download className="size-3.5" />
        Download
      </Button>
      <span className="self-center text-xs text-muted-foreground truncate max-w-[200px]">{filename}</span>
    </div>
  );
}
