import { Chat } from "@/components/chat/chat";
import { ProtectedPage } from "@/components/protected-page";

export default function ChatPage() {
  return (
    <ProtectedPage>
      <Chat />
    </ProtectedPage>
  );
}
