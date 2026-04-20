"use client";

import type { UIMessage } from "ai";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Markdown } from "./markdown";
import { ToolIndicator } from "./tool-indicator";

export function ChatMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[88%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-blue-500/15 border border-blue-500/35 text-foreground rounded-br-sm dark:bg-blue-500/20"
            : "bg-muted/50 rounded-bl-sm"
        )}
      >
        {message.parts.map((part, i) => {
          if (part.type === "text") {
            if (isUser) {
              return (
                <p key={i} className="whitespace-pre-wrap text-sm leading-relaxed">
                  {part.text}
                </p>
              );
            }
            return <Markdown key={i}>{part.text}</Markdown>;
          }

          if (part.type === "reasoning") {
            return (
              <details key={i} className="my-2 text-xs text-muted-foreground">
                <summary className="cursor-pointer">reasoning</summary>
                <div className="mt-1 whitespace-pre-wrap">{part.text}</div>
              </details>
            );
          }

          if (part.type.startsWith("tool-")) {
            const toolPart = part as {
              type: string;
              state: "input-streaming" | "input-available" | "output-available" | "output-error";
              input?: unknown;
              output?: unknown;
              errorText?: string;
            };
            const toolName = toolPart.type.slice("tool-".length);
            return (
              <ToolIndicator
                key={i}
                toolName={toolName}
                state={toolPart.state}
                input={toolPart.input}
                output={toolPart.output}
                errorText={toolPart.errorText}
              />
            );
          }

          return null;
        })}
      </div>
    </motion.div>
  );
}
