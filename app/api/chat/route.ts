import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { SYSTEM_PROMPT } from '@/app/(dashboard)/bai-tap-1/_lib/system-prompt';

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Robustly map UI messages directly to the CoreMessage format expected by streamText
  const modelMessages = messages.map((msg: any) => {
    let text = msg.content;
    if (!text && msg.parts) {
      text = msg.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
    }
    return {
      role: msg.role,
      content: text || ''
    };
  });

  const recentMessages = modelMessages.slice(-20); // Tăng giới hạn tin nhắn gần đây

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: SYSTEM_PROMPT,
    messages: recentMessages,
  });

  return result.toUIMessageStreamResponse();
}
