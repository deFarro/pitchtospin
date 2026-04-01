import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message as MessageType } from "../types";

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`max-w-2xl ${isUser ? "ml-auto" : "mr-auto"}`}>
      <div
        className={`rounded-lg px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-indigo-600 text-white"
            : "bg-zinc-800 text-zinc-200"
        }`}
      >
        {isUser ? (
          message.content
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc ml-4 mb-2 last:mb-0">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 last:mb-0">{children}</ol>,
              li: ({ children }) => <li className="mb-0.5">{children}</li>,
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline hover:text-indigo-300">
                  {children}
                </a>
              ),
              code: ({ className, children }) => {
                const isBlock = className?.includes("language-");
                return isBlock ? (
                  <pre className="bg-zinc-900 rounded p-3 my-2 overflow-x-auto last:mb-0">
                    <code className="text-xs">{children}</code>
                  </pre>
                ) : (
                  <code className="bg-zinc-900 rounded px-1.5 py-0.5 text-xs">{children}</code>
                );
              },
              pre: ({ children }) => <>{children}</>,
              h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-zinc-600 pl-3 my-2 text-zinc-400 italic">
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-2">
                  <table className="min-w-full text-xs border-collapse">{children}</table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border border-zinc-700 px-2 py-1 text-left font-semibold bg-zinc-900">{children}</th>
              ),
              td: ({ children }) => (
                <td className="border border-zinc-700 px-2 py-1">{children}</td>
              ),
              hr: () => <hr className="border-zinc-700 my-3" />,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
