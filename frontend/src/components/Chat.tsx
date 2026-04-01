import { Message } from "./Message";
import type { Message as MessageType } from "../types";

interface ChatProps {
  messages: MessageType[];
  loading: boolean;
}

export function Chat({ messages, loading }: ChatProps) {
  if (messages.length === 0 && !loading) {
    return (
      <main className="flex-1 overflow-y-auto px-6 py-4">
        <div className="flex items-center justify-center h-full text-zinc-600">
          <div className="text-center space-y-2">
            <p className="text-lg">Ask me about music</p>
            <p className="text-sm">
              Try: "What is the latest release from Kings of Leon?"
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
      {messages.map((msg, i) => (
        <Message key={i} message={msg} />
      ))}
      {loading && (
        <div className="max-w-2xl mr-auto">
          <div className="rounded-lg px-4 py-3 text-sm bg-zinc-800 text-zinc-400 animate-pulse">
            Thinking...
          </div>
        </div>
      )}
    </main>
  );
}
