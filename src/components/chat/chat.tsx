"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion } from "framer-motion";
import { Send, Square, PanelLeft, PanelLeftOpen, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ChatMessage } from "./message";
import { ChatSidebar } from "./sidebar";
import { useAuth } from "@/components/auth-provider";
import { loadChat, saveChat, newChatId } from "@/lib/firebase/chats";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SUGGESTIONS = [
  {
    title: "Evaluate a posting",
    prompt: "Here is a job URL: [paste URL]. Fetch it, evaluate fit, and tell me if I should apply.",
  },
  {
    title: "Research a company",
    prompt: "Tell me about [company name] — funding, founders, recent news, Glassdoor sentiment.",
  },
  {
    title: "Tailor my CV",
    prompt: "Generate a tailored CV for this Job Description: [paste Job Description text]",
  },
  {
    title: "Spot red flags",
    prompt: "Look for red flags in this job posting before I waste time on it: [paste]",
  },
];

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 px-2 py-2 text-muted-foreground">
      <span className="text-xs">Claude is thinking</span>
      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}>●</motion.span>
      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}>●</motion.span>
      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}>●</motion.span>
    </div>
  );
}

export function Chat() {
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState<string>(() => newChatId());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user, getIdToken } = useAuth();

  const { messages, setMessages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      headers: async (): Promise<Record<string, string>> => {
        const token = await getIdToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  });

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const isStreaming = status === "submitted" || status === "streaming";

  // Persist chat to Firestore whenever messages change (only when signed in + not streaming)
  useEffect(() => {
    if (!user || messages.length === 0 || isStreaming) return;
    saveChat({ uid: user.uid, chatId, messages }).catch((err) => {
      console.error("saveChat failed:", err);
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(
        msg.toLowerCase().includes("permission")
          ? "Can't save chat — check your Firestore security rules allow users/{uid}/chats writes."
          : `Chat save failed: ${msg}`
      );
    });
  }, [messages, user, chatId, isStreaming]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setChatId(newChatId());
    setSidebarOpen(false);
  }, [setMessages]);

  const handleSelectChat = useCallback(
    async (id: string) => {
      if (!user) return;
      const chat = await loadChat(user.uid, id);
      if (!chat) return;
      setMessages(chat.messages);
      setChatId(id);
      setSidebarOpen(false);
    },
    [user, setMessages]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isStreaming) return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <div className="relative flex h-[calc(100vh-3.5rem)] overflow-hidden">
      <ChatSidebar
        activeChatId={chatId}
        onSelect={handleSelectChat}
        onNew={handleNewChat}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content — shifts right when sidebar is open on desktop */}
      <div
        className={cn(
          "flex flex-1 flex-col overflow-hidden transition-[margin] duration-200",
          sidebarOpen ? "md:ml-72" : "ml-0"
        )}
      >
        {/* Top bar with collapse/expand toggle */}
        <div className="flex items-center gap-2 border-b px-3 py-1.5">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Open sidebar"}
            title={sidebarOpen ? "Collapse sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <PanelLeft className="size-4" /> : <PanelLeftOpen className="size-4" />}
          </Button>
          {!sidebarOpen && (
            <span className="text-xs text-muted-foreground">Chats</span>
          )}
        </div>

        {/* Messages area — vertical scroll allowed but bar hidden, no horizontal scroll ever */}
        <div ref={scrollRef} className="flex-1 overflow-x-hidden overflow-y-auto scrollbar-hide px-4 py-6">
          <div className="mx-auto w-full max-w-3xl min-w-0">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-8 py-16 text-center">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                  <Rocket className="mx-auto size-10 text-primary" />
                  <h2 className="mt-3 text-2xl font-semibold">Career-Ops chat</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Paste a job URL, JD text, or describe what you need.
                  </p>
                </motion.div>

                <div className="grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
                  {SUGGESTIONS.map((s, i) => (
                    <motion.div
                      key={s.title}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                    >
                      <Card
                        className="cursor-pointer p-3 text-left transition-shadow hover:shadow-md"
                        onClick={() => setInput(s.prompt)}
                      >
                        <div className="text-sm font-medium">{s.title}</div>
                        <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{s.prompt}</div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {messages.map((m) => (
                  <ChatMessage key={m.id} message={m} />
                ))}
                {isStreaming && <ThinkingDots />}
                {error && (
                  <Card className="border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                    {error.message}
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <div className="border-t bg-background/80 p-4 backdrop-blur">
          <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Paste a job link, JD text, or ask anything…"
              className="min-h-[60px] max-h-[200px] resize-none"
              disabled={isStreaming}
            />
            <div className="flex flex-col gap-2">
              {isStreaming ? (
                <Button type="button" variant="outline" onClick={() => stop()} aria-label="Stop">
                  <Square className="size-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={!input.trim()} aria-label="Send">
                  <Send className="size-4" />
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
