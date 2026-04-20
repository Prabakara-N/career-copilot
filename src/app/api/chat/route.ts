import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, stepCountIs, type UIMessage } from "ai";
import { CAREER_OPS_SYSTEM_PROMPT } from "@/lib/prompts/system";
import { buildCareerOpsTools } from "@/lib/ai/tools";
import { adminAuth } from "@/lib/firebase/admin";
import { getAiProvider } from "@/lib/ai/provider";

export const maxDuration = 60;

async function uidFromRequest(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const decoded = await adminAuth().verifyIdToken(authHeader.slice("Bearer ".length));
    return decoded.uid;
  } catch {
    return null;
  }
}

function getChatModel() {
  return getAiProvider() === "openai"
    ? openai("gpt-4o")
    : anthropic("claude-sonnet-4-5");
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const modelMessages = await convertToModelMessages(messages);

  let uid: string | null = null;
  try {
    uid = await uidFromRequest(req);
  } catch (err) {
    console.warn("uidFromRequest failed (likely no Firebase Admin creds):", err);
  }

  const tools = buildCareerOpsTools({ uid });

  const result = streamText({
    model: getChatModel(),
    system: CAREER_OPS_SYSTEM_PROMPT,
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
