"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none break-words [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_table]:text-xs [&_pre]:text-xs [&_pre]:whitespace-pre-wrap [&_pre]:break-all [&_code]:break-all [&_a]:break-all">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
