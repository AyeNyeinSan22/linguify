"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface Message { role: "user" | "coach"; content: string; }

function getRecognition() {
  if (typeof window === "undefined") return null;
  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognitionAPI) return null;
  return new SpeechRecognitionAPI();
}

// Inline the event type since global types may not be picked up
interface SpeechResultEvent {
  resultIndex: number;
  results: { length: number; [index: number]: { isFinal: boolean; [index: number]: { transcript: string } } };
}

export default function VoicePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [supported] = useState(() => {
    if (typeof window === "undefined") return true;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  });
  const recRef = useRef<ReturnType<typeof getRecognition>>(null);

  // Initialize recognition once on mount
  useEffect(() => {
    const rec = getRecognition();
    if (!rec) return;
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (event: unknown) => {
      const e = event as SpeechResultEvent;
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          final += e.results[i][0].transcript;
        }
      }
      if (final) setTranscript(final);
    };

    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);

    recRef.current = rec;
  }, []);

  const start = () => {
    if (!recRef.current) return;
    setTranscript("");
    setIsRecording(true);
    recRef.current.start();
  };

  const stop = () => {
    if (!recRef.current) return;
    recRef.current.stop();
    setIsRecording(false);
  };

  const send = useCallback(async () => {
    const t = transcript.trim();
    if (!t || loading) return;
    setMessages((p) => [...p, { role: "user", content: t }]);
    setTranscript("");
    setLoading(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: t, mode: "voice" }),
      });
      const d = await res.json();
      if (d.response) {
        setMessages((p) => [...p, { role: "coach", content: d.response }]);
        // Speak feedback aloud
        if (typeof window !== "undefined" && window.speechSynthesis) {
          const u = new SpeechSynthesisUtterance(
            d.response.replace(/[#*🎙️🔊💬📝]/g, "").replace(/\*\*/g, "")
          );
          u.lang = "en-US";
          u.rate = 0.9;
          window.speechSynthesis.speak(u);
        }
      }
    } catch {
      setMessages((p) => [
        ...p,
        { role: "coach", content: "Sorry, couldn't reach voice coach." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [transcript, loading]);

  if (!supported) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="text-5xl mb-4">🎤</div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Voice Coach</h1>
        <p className="text-sm text-text-secondary mb-4">
          Your browser doesn&apos;t support speech recognition.
        </p>
        <p className="text-xs text-text-muted">
          Try Chrome, Edge, or Safari on a device with a microphone.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-8 sm:py-12 flex flex-col min-h-[80vh]">
      <div className="mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
          🎤 Voice Coach
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Speak — AI listens and gives pronunciation feedback
        </p>
      </div>

      <div className="flex-1 glass-heavy p-4 mb-4 min-h-[300px] max-h-[400px] overflow-y-auto space-y-3 bg-[#FAFAFA]">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-sm text-text-muted">
            Tap the mic and say something in English!
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
                m.role === "user" ? "chat-bubble-user" : "chat-bubble-coach"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="chat-bubble-coach flex items-center gap-1.5 px-5 py-3.5">
              <span className="h-2 w-2 rounded-full bg-accent-400 animate-bounce [animation-delay:0ms]" />
              <span className="h-2 w-2 rounded-full bg-accent-500 animate-bounce [animation-delay:150ms]" />
              <span className="h-2 w-2 rounded-full bg-accent-600 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 min-h-[60px] flex items-center justify-center shadow-sm">
          <p className={`text-lg ${transcript ? "text-text-primary" : "text-text-muted"}`}>
            {transcript || (isRecording ? "Listening..." : "Your speech will appear here")}
          </p>
        </div>

        <button
          onClick={isRecording ? stop : start}
          className={`inline-flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ${
            isRecording
              ? "bg-error shadow-lg shadow-error/30 scale-110 animate-pulse"
              : "bg-accent-500 shadow-lg shadow-accent-500/20 hover:scale-105"
          }`}
        >
          <span className="text-3xl text-white">🎤</span>
        </button>
        <p className="mt-2 text-[11px] text-text-muted">
          {isRecording ? "Tap to stop" : "Tap to speak"}
        </p>

        {transcript && !isRecording && (
          <button onClick={send} disabled={loading} className="btn-gradient mt-4">
            Send for Feedback
          </button>
        )}
      </div>
    </div>
  );
}
