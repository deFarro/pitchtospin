import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, history: messages }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Server error (${res.status})`);
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Something went wrong.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorMsg },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">PitchToSpin</h1>
        <p className="text-sm text-zinc-500">
          Discover music with AI — powered by Discogs
        </p>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-zinc-600">
            <div className="text-center space-y-2">
              <p className="text-lg">Ask me about music</p>
              <p className="text-sm">
                Try: "What is the latest release from Kings of Leon?"
              </p>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-2xl ${msg.role === "user" ? "ml-auto" : "mr-auto"}`}
          >
            <div
              className={`rounded-lg px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-800 text-zinc-200"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="max-w-2xl mr-auto">
            <div className="rounded-lg px-4 py-3 text-sm bg-zinc-800 text-zinc-400 animate-pulse">
              Thinking...
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-800 px-6 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-3 max-w-3xl mx-auto"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about artists, records, or your collection..."
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}

export default App;
