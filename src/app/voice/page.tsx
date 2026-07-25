"use client";

import { useState, useRef, useCallback } from "react";

interface Message { role: "user" | "coach"; content: string; }

export default function VoicePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [supported] = useState(() => {
    if (typeof window === "undefined") return true;
    return !!(navigator.mediaDevices?.getUserMedia);
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Record audio ────────────────────────────────────────────────────

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach((t) => t.stop());

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await transcribeAudio(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      alert("Microphone access is needed for voice practice.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // ── Transcribe via VoiVoice ASR ─────────────────────────────────────

  const transcribeAudio = async (blob: Blob) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const res = await fetch("/api/asr", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.text) {
        setTranscript(data.text);
      } else {
        setTranscript("(Could not hear clearly — try again?)");
      }
    } catch {
      setTranscript("(Transcription failed — check mic and try again)");
    } finally {
      setLoading(false);
    }
  };

  // ── Browser TTS fallback ────────────────────────────────────────────

  const speakViaBrowser = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.85;
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
        speakViaBrowser(text);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(url);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(() => {});
      }
    } catch {
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
        // Strip emoji and markdown for cleaner reading
        const clean = d.response.replace(/[*🎙️🔊💬📝💛🌱]/g, "").replace(/\*\*/g, "").trim();
        setMessages((p) => [...p, { role: "coach", content: d.response }]);

        // Speak feedback aloud via VoiVoice TTS
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

  // ── Unsupporting browser fallback ───────────────────────────────────

  if (!supported) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="text-5xl mb-4">🎤</div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Voice Coach</h1>
        <p className="text-sm text-text-secondary mb-4">
          Your browser doesn&apos;t support audio recording.
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

        {/* Action buttons */}
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

        {/* Hidden audio player for TTS */}
        <audio ref={audioRef} className="hidden" controls={false} />
      </div>
    </div>
  );
}
