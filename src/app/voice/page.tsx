"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface Message { role: "user" | "coach"; content: string; }

function getRecognition() {
  if (typeof window === "undefined") return null;
  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognitionAPI) return null;
  return new SpeechRecognitionAPI();
}

export default function VoicePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [ttsMode, setTtsMode] = useState<"browser" | "voivoice">("browser");
  const [asrMode] = useState<"browser" | "voivoice">("browser");
  const [supported] = useState(() => {
    if (typeof window === "undefined") return true;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  });

  const recRef = useRef<ReturnType<typeof getRecognition>>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Initialize browser SpeechRecognition ────────────────────────────

  useEffect(() => {
    const rec = getRecognition();
    if (!rec) return;
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (event: unknown) => {
      const e = event as {
        resultIndex: number;
        results: { length: number; [index: number]: { isFinal: boolean; [index: number]: { transcript: string } } };
      };
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          final += e.results[i][0].transcript;
        }
      }
      if (final) {
        setTranscript(final);
        setIsRecording(false);
      }
    };

    rec.onerror = () => {
      setIsRecording(false);
    };

    rec.onend = () => {
      setIsRecording(false);
    };

    recRef.current = rec;
  }, []);

  // ── Record audio ────────────────────────────────────────────────────

  const startRecording = () => {
    setTranscript("");
    setIsRecording(true);
    if (recRef.current) {
      try { recRef.current.start(); } catch { /* already started */ }
    }
  };

  const stopRecording = () => {
    if (recRef.current) {
      try { recRef.current.stop(); } catch { /* already stopped */ }
    }
    setIsRecording(false);
  };

  // ── Browser TTS fallback ────────────────────────────────────────────

  const speakViaBrowser = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();

      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.85;
      u.pitch = 1.05;
      u.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find((v) =>
        v.name.includes("Samantha") ||
        v.name.includes("Google US English") ||
        v.name.includes("Female") ||
        v.name.includes("Natural")
      ) || voices.find((v) => v.lang.startsWith("en")) || null;
      if (preferred) u.voice = preferred;

      window.speechSynthesis.speak(u);
    }
  };

  // ── VoiVoice TTS ────────────────────────────────────────────────────

  const speakViaTts = useCallback(async (text: string) => {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        setTtsMode("browser");
        speakViaBrowser(text);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(url);
      setTtsMode("voivoice");

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(() => {});
      }
    } catch {
      setTtsMode("browser");
      speakViaBrowser(text);
    }
  }, [audioUrl]);

  // ── Get warm feedback + TTS ─────────────────────────────────────────

  const getFeedback = useCallback(async () => {
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
        const clean = d.response.replace(/[*🎙️🔊💬📝💛🌱]/g, "").replace(/\*\*/g, "").trim();
        setMessages((p) => [...p, { role: "coach", content: d.response }]);
        speakViaTts(clean);
      }
    } catch {
      setMessages((p) => [
        ...p,
        { role: "coach", content: "Sorry, I couldn't reach the voice coach. Take a breath and try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [transcript, loading, speakViaTts]);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // ── Unsupported browser fallback ────────────────────────────────────

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
          Speak naturally — I&apos;ll listen warmly and guide you
        </p>
        <div className="mt-2 flex items-center justify-center gap-3 text-[10px] text-text-muted">
          <span className={`inline-flex items-center gap-1 ${asrMode === "voivoice" ? "text-accent-500" : ""}`}>
            🎙️ {asrMode === "voivoice" ? "VoiVoice ASR" : "Browser ASR"}
          </span>
          <span>·</span>
          <span className={`inline-flex items-center gap-1 ${ttsMode === "voivoice" ? "text-accent-500" : ""}`}>
            🔊 {ttsMode === "voivoice" ? "VoiVoice TTS" : "Browser TTS"}
          </span>
        </div>
      </div>

      {/* Chat history */}
      <div className="flex-1 glass-heavy p-4 mb-4 min-h-[300px] max-h-[400px] overflow-y-auto space-y-3">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-sm text-text-muted">
            Tap the mic and speak something in English 💛
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

      {/* Transcript area */}
      <div className="text-center">
        <div className="glass rounded-2xl p-4 mb-4 min-h-[60px] flex items-center justify-center shadow-sm">
          <p className={`text-base ${transcript ? "text-text-primary" : "text-text-muted"}`}>
            {transcript || (isRecording ? "Listening..." : loading ? "Transcribing..." : "Tap the mic to start")}
          </p>
        </div>

        {/* Mic button */}
        <button
          onClick={toggleRecording}
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

        {/* Hidden audio player for TTS */}
        <audio ref={audioRef} className="hidden" controls={false} />

        {/* Action buttons — show when transcript is ready */}
        {transcript && !isRecording && (
          <div className="flex gap-3 justify-center mt-4">
            <button
              onClick={getFeedback}
              disabled={loading}
              className="btn-gradient px-6 py-2.5 rounded-xl text-sm font-semibold"
            >
              💛 Get Warm Feedback
            </button>
            <button
              onClick={toggleRecording}
              disabled={loading}
              className="glass rounded-xl px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              🔄 Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
