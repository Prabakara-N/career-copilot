"use client";

import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import type { UIMessage } from "ai";
import { db } from "./client";

export type ChatDoc = {
  id: string;
  title: string;
  messages: UIMessage[];
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type ChatListItem = {
  id: string;
  title: string;
  updatedAt: Timestamp | null;
};

function chatsRef(uid: string) {
  return collection(db(), "users", uid, "chats");
}

function chatRef(uid: string, chatId: string) {
  return doc(db(), "users", uid, "chats", chatId);
}

/**
 * Real-time subscription to a user's chat list (id + title + updatedAt only).
 * Returns an unsubscribe function. `onError` fires on permission errors
 * (most commonly: Firestore rules don't allow reading the chats subcollection).
 */
export function subscribeToChatList(
  uid: string,
  onChange: (chats: ChatListItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(chatsRef(uid), orderBy("updatedAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const items: ChatListItem[] = snap.docs.map((d) => {
        const data = d.data() as Partial<ChatDoc>;
        return {
          id: d.id,
          title: data.title ?? "Untitled chat",
          updatedAt: data.updatedAt ?? null,
        };
      });
      onChange(items);
    },
    (err) => onError?.(err as Error)
  );
}

export async function loadChat(uid: string, chatId: string): Promise<ChatDoc | null> {
  const snap = await getDoc(chatRef(uid, chatId));
  if (!snap.exists()) return null;
  const data = snap.data() as Partial<ChatDoc>;
  return {
    id: chatId,
    title: data.title ?? "Untitled chat",
    messages: (data.messages ?? []) as UIMessage[],
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

/**
 * Save / update a chat. Auto-creates if it doesn't exist.
 * Title is derived from first user message if not yet set.
 */
export async function saveChat(args: {
  uid: string;
  chatId: string;
  messages: UIMessage[];
  title?: string;
}): Promise<void> {
  const ref = chatRef(args.uid, args.chatId);
  const existing = await getDoc(ref);

  // Derive title from first user message if creating fresh and no title supplied
  const derivedTitle =
    args.title ??
    (() => {
      const firstUser = args.messages.find((m) => m.role === "user");
      if (!firstUser) return "New chat";
      const text = firstUser.parts
        .filter((p) => p.type === "text")
        .map((p) => (p as { type: "text"; text: string }).text)
        .join(" ")
        .trim();
      return text.length > 60 ? text.slice(0, 57) + "…" : text || "New chat";
    })();

  if (existing.exists()) {
    await setDoc(
      ref,
      {
        messages: args.messages,
        updatedAt: serverTimestamp(),
        ...(args.title ? { title: args.title } : {}),
      },
      { merge: true }
    );
  } else {
    await setDoc(ref, {
      title: derivedTitle,
      messages: args.messages,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function deleteChat(uid: string, chatId: string): Promise<void> {
  await deleteDoc(chatRef(uid, chatId));
}

export function newChatId(): string {
  return doc(chatsRef("temp")).id;
}
