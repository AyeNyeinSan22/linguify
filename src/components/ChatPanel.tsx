"use client";

import { useRef, useEffect } from "react";
import FeedbackCards, { hasStructuredMarkers } from "@/components/FeedbackCards";

interface Message {
  role: "user" | "coach";
  content: string;
  meta?: string;
}

export default function ChatPanel({
  messages,
  isLoading,
  streamingText,
  onFeedbackComplete,
}: {
  messages: Message[];
  isLoading: boolean;
  streamingText?: string | null;
  onFeedbackComplete?: (section: string, messageIndex: number) => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  return (
    <div className="glass-heavy flex flex-col gap-4 p-5 min-h-[420px] max-h-[540px] overflow-y-auto bg-[#FAFAFA]">
      {messages.length === 0 && !streamingText && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-[var(--text-muted)]">
            Send a message to start your session.
          </p>
        </div>
      )}

      {messages.map((msg, i) => {
        const isStructuredCoach =
          msg.role === "coach" && hasStructuredMarkers(msg.content);

        return (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {isStructuredCoach ? (
              <div className="max-w-[90%] w-full">
                {msg.meta && (
                  <span className="mb-2 block text-[11px] font-medium opacity-60 text-[var(--text-muted)]">
                    {msg.meta}
                  </span>
                )}
                <FeedbackCards
                  content={msg.content}
                  onComplete={(section) => onFeedbackComplete?.(section, i)}
                />
              </div>
            ) : (
              <div
                className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "chat-bubble-user"
                    : "chat-bubble-coach"
                }`}
              >
                {msg.meta && (
                  <span className="mb-1.5 block text-[11px] font-medium opacity-60">
                    {msg.meta}
                  </span>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            )}
          </div>
        );
      })}

      {streamingText && (
        <div className="flex justify-start">
          <div className="chat-bubble-coach max-w-[80%] px-4 py-3 text-sm leading-relaxed">
            <p className="whitespace-pre-wrap">
              {streamingText}
              <span className="streaming-cursor" />
            </p>
          </div>
        </div>
      )}

      {isLoading && !streamingText && (
        <div className="flex justify-start">
          <div className="chat-bubble-coach flex items-center gap-1.5 px-5 py-3.5">
            <span className="h-2 w-2 rounded-full bg-accent-400 animate-bounce [animation-delay:0ms]" />
            <span className="h-2 w-2 rounded-full bg-accent-500 animate-bounce [animation-delay:150ms]" />
            <span className="h-2 w-2 rounded-full bg-accent-600 animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
