import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import React, { type ReactElement } from "react";
import { CvPdfDocument, type CvPdfData } from "./pdf-document";
import { slugify } from "@/lib/slug";

export type RenderedCv = {
  filename: string;
  base64: string;
  byteLength: number;
};

export async function renderTailoredCvPdf(args: {
  cvData: CvPdfData;
  company: string;
}): Promise<RenderedCv> {
  const docElement = React.createElement(CvPdfDocument, { data: args.cvData }) as ReactElement<DocumentProps>;
  const pdfBuffer = await renderToBuffer(docElement);

  const today = new Date().toISOString().slice(0, 10);
  const slug = slugify(`${args.cvData.name}-${args.company}`);
  const filename = `cv-${slug}-${today}.pdf`;

  return {
    filename,
    base64: pdfBuffer.toString("base64"),
    byteLength: pdfBuffer.byteLength,
  };
}
