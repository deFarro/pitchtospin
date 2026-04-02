import { useState } from "react";
import { Chat } from "./components/Chat";
import { useChat } from "./hooks/useChat";

function App() {
  const { messages, loading, sendMessage } = useChat();
  const [input, setInput] = useState("");

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="flex items-start gap-3">
          <img
            src="/favicon.svg"
            alt=""
            width={40}
            height={40}
            className="shrink-0 mt-0.5 rounded-md"
            aria-hidden
          />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">PitchToSpin</h1>
            <p className="text-sm text-zinc-500">
              Discover music with AI — powered by Discogs
            </p>
          </div>
        </div>
      </header>

      <Chat messages={messages} loading={loading} />

      <footer className="border-t border-zinc-800 px-6 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
            setInput("");
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
