"use client";

import { useEffect, useState } from "react";
import { Plus, MessageSquare, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import {
  subscribeToChatList,
  deleteChat,
  type ChatListItem,
} from "@/lib/firebase/chats";

type Props = {
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
  onNew: () => void;
  open: boolean;
  onClose: () => void;
};

function formatTimestamp(ts: ChatListItem["updatedAt"]): string {
  if (!ts) return "";
  const d = ts.toDate();
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString();
}

export function ChatSidebar({ activeChatId, onSelect, onNew, open, onClose }: Props) {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setChats([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const unsub = subscribeToChatList(
      user.uid,
      (items) => {
        setChats(items);
        setLoading(false);
      },
      (err) => {
        console.error("chat list subscribe failed:", err);
        setError(
          err.message.toLowerCase().includes("permission")
            ? "Permission denied reading chats. Check Firestore rules for users/{uid}/chats."
            : err.message
        );
        setLoading(false);
      }
    );
    return unsub;
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (!user) return;
    if (!confirm("Delete this chat? This cannot be undone.")) return;
    await deleteChat(user.uid, chatId);
    if (chatId === activeChatId) onNew();
  };

  return (
    <>
      {/* Mobile backdrop (covers everything when sidebar open on mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — fixed at left edge of viewport, slides in/out */}
      <aside
        className={cn(
          "fixed inset-y-0 top-14 left-0 z-40 flex w-72 flex-col border-r bg-background transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b px-3 py-3">
          <h2 className="text-sm font-semibold">Chats</h2>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="default" onClick={onNew} className="gap-1.5">
              <Plus className="size-3.5" />
              New
            </Button>
            {/* Mobile-only close. Desktop users collapse via the chat-header toggle. */}
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              aria-label="Close sidebar"
              title="Close sidebar"
              className="md:hidden"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-0.5 p-2">
            {!user ? (
              <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                Sign in to see your chat history.
              </p>
            ) : loading ? (
              <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                Loading…
              </p>
            ) : error ? (
              <div className="px-3 py-4">
                <p className="text-xs text-destructive break-words">{error}</p>
                <p className="mt-2 text-[10px] text-muted-foreground">
                  Open devtools console for full details.
                </p>
              </div>
            ) : chats.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                No chats yet. Start one to see it here.
              </p>
            ) : (
              chats.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelect(c.id)}
                  className={cn(
                    "group flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-muted",
                    activeChatId === c.id && "bg-muted"
                  )}
                >
                  <MessageSquare className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{c.title}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {formatTimestamp(c.updatedAt)}
                    </div>
                  </div>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleDelete(e, c.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") handleDelete(e as unknown as React.MouseEvent, c.id);
                    }}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Delete chat"
                  >
                    <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                  </span>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
