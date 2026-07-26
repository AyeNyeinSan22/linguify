"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface Message {
  role: "user" | "coach";
  content: string;
  source?: "mic" | "upload";
  fileName?: string;
}

function getRecognition() {
  if (typeof window === "undefined") return null;
  const SpeechRecognitionAPI =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognitionAPI) return null;
  return new SpeechRecognitionAPI();
}

const ACCEPTED_AUDIO = ".mp3,.mp4,.m4a,.wav,.webm,.ogg,.flac,.aac";
const MAX_FILE_MB = 25;

export default function VoicePage() {
  const [tab, setTab] = useState<"record" | "upload">("record");
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [speechQueue, setSpeechQueue] = useState<string[]>([]);
  const [isSpeakingQueue, setIsSpeakingQueue] = useState(false);
  const speechQueueRef = useRef<string[]>([]);
  const isSpeakingQueueRef = useRef(false);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTranscript, setUploadTranscript] = useState("");
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "transcribing" | "done" | "error"
  >("idle");
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // TTS
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [ttsMode, setTtsMode] = useState<"browser" | "voivoice">("browser");
  const [coachSpeaking, setCoachSpeaking] = useState(false);
  const [coachPaused, setCoachPaused] = useState(false);

  const recRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const transcriptRef = useRef("");
  const getFeedbackRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const loadingRef = useRef(false);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const resolveSpeechPromiseRef = useRef<(() => void) | null>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, streamingText]);

  // Track VoiVoice audio playback state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => {
      setCoachSpeaking(true);
      setCoachPaused(false);
    };
    const onPause = () => {
      if (audio.ended || audio.currentTime === 0) {
        setCoachSpeaking(false);
        setCoachPaused(false);
      } else {
        setCoachPaused(true);
      }
    };
    const onEnded = () => {
      setCoachSpeaking(false);
      setCoachPaused(false);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  useEffect(() => {
    const rec = getRecognition() as any;
    if (!rec) return;
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (event: any) => {
      let combined = "";
      for (let i = 0; i < event.results.length; i++) {
        combined += event.results[i][0].transcript;
      }
      setTranscript(combined);
      transcriptRef.current = combined;
    };

    rec.onstart = () => setIsRecording(true);
    rec.onerror = () => {
      setIsRecording(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
    rec.onend = () => {
      setIsRecording(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
    recRef.current = rec;
    return () => {
      if (rec) rec.abort();
    };
  }, [loading]); // Re-init to capture latest loading state

  // ── TTS helpers ──────────────────────────────────────────────────────
  const stopCoachVoice = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Clear speech queue and resolve pending promise to stop the loop
    speechQueueRef.current = [];
    isSpeakingQueueRef.current = false;
    setIsSpeakingQueue(false);
    if (resolveSpeechPromiseRef.current) {
      resolveSpeechPromiseRef.current();
      resolveSpeechPromiseRef.current = null;
    }

    if (audioRef.current) {
      const audio = audioRef.current;
      const playPromise = playPromiseRef.current;

      const doPause = () => {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch (e) {}
      };

      if (playPromise) {
        playPromise.then(doPause).catch(doPause);
      } else {
        doPause();
      }
    }

    setCoachSpeaking(false);
    setCoachPaused(false);
  }, []);

  const pauseCoachVoice = useCallback(() => {
    if (ttsMode === "browser") {
      if (
        typeof window !== "undefined" &&
        window.speechSynthesis.speaking &&
        !window.speechSynthesis.paused
      ) {
        window.speechSynthesis.pause();
        setCoachPaused(true);
      }
    } else if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, [ttsMode]);

  const resumeCoachVoice = useCallback(() => {
    if (ttsMode === "browser") {
      if (typeof window !== "undefined" && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setCoachPaused(false);
      }
    } else if (audioRef.current?.paused) {
      audioRef.current.play().catch(() => {});
    }
  }, [ttsMode]);

  const speakViaBrowser = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.85;
      u.pitch = 1.05;
      u.volume = 1;
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find(
          (v) =>
            v.name.includes("Samantha") ||
            v.name.includes("Google US English") ||
            v.name.includes("Female") ||
            v.name.includes("Natural")
        ) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        null;
      if (preferred) u.voice = preferred;
      u.onstart = () => {
        setCoachSpeaking(true);
        setCoachPaused(false);
      };
      u.onend = () => {
        setCoachSpeaking(false);
        setCoachPaused(false);
      };
      u.onerror = () => {
        setCoachSpeaking(false);
        setCoachPaused(false);
      };
      u.onpause = () => setCoachPaused(true);
      u.onresume = () => setCoachPaused(false);
      window.speechSynthesis.speak(u);
    }
  };

  const speakViaTts = useCallback(
    (text: string) => {
      return new Promise<void>((resolve) => {
        const cleanText = text.replace(/[🎙️🔊💬📝💛🌱]/g, "").trim();
        if (!cleanText) {
          resolve();
          return;
        }

        resolveSpeechPromiseRef.current = resolve;
        setTtsMode("voivoice");

        const url = `/api/tts?text=${encodeURIComponent(cleanText)}`;
        const audio = audioRef.current;
        if (audio) {
          const finished = () => {
            if (resolveSpeechPromiseRef.current === resolve) {
              resolveSpeechPromiseRef.current = null;
            }
            audio.onended = null;
            audio.onerror = null;
            resolve();
          };

          audio.onended = finished;
          audio.onerror = () => {
            console.error("TTS audio error");
            setTtsMode("browser");
            speakViaBrowser(cleanText);
            finished();
          };

          audio.src = url;
          const p = audio.play();
          playPromiseRef.current = p;

          if (p !== undefined) {
            p.then(() => {
              if (playPromiseRef.current === p) playPromiseRef.current = null;
            }).catch((err) => {
              if (playPromiseRef.current === p) playPromiseRef.current = null;
              if (err.name === "AbortError") {
                finished();
              } else {
                console.error("Play failed:", err);
                setTtsMode("browser");
                speakViaBrowser(cleanText);
                finished();
              }
            });
          }
        } else {
          resolve();
        }
      });
    },
    [speakViaBrowser]
  );

  const processSpeechQueue = useCallback(async () => {
    if (isSpeakingQueueRef.current || speechQueueRef.current.length === 0) return;
    isSpeakingQueueRef.current = true;
    setIsSpeakingQueue(true);

    while (speechQueueRef.current.length > 0) {
      const nextText = speechQueueRef.current.shift();
      if (nextText) {
        await speakViaTts(nextText);
      }
    }

    isSpeakingQueueRef.current = false;
    setIsSpeakingQueue(false);
  }, [speakViaTts]);

  const addToSpeechQueue = useCallback(
    (text: string) => {
      speechQueueRef.current.push(text);
      processSpeechQueue();
    },
    [processSpeechQueue]
  );

  // ── Send text to coach ───────────────────────────────────────────────
  const getFeedback = useCallback(
    async (text: string, source: "mic" | "upload", fileName?: string) => {
      const t = text.trim();
      if (!t || loading) return;

      setMessages((p) => [
        ...p,
        { role: "user", content: t, source, fileName },
      ]);
      if (source === "mic") {
        setTranscript("");
        transcriptRef.current = "";
      } else {
        setUploadTranscript("");
        setUploadFile(null);
        setUploadStatus("idle");
      }
      setLoading(true);
      setStreamingText(null);
      stopCoachVoice();
      speechQueueRef.current = [];
      isSpeakingQueueRef.current = false;

      try {
        const res = await fetch("/api/coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: t, mode: "voice", stream: true }),
        });

        if (res.ok && res.headers.get("Content-Type")?.includes("text/event-stream")) {
          const reader = res.body?.getReader();
          if (!reader) throw new Error("No reader");
          const decoder = new TextDecoder();
          let accumulated = "";
          let buffer = "";
          let lastSpokenIndex = 0;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              try {
                const event = JSON.parse(line.slice(6));
                if (event.type === "token") {
                  accumulated += event.text;
                  setStreamingText(accumulated);

                  // Check for completed sections/lines to speak immediately
                  const sections = accumulated.split("\n");
                  if (sections.length > lastSpokenIndex + 1) {
                    const newSection = sections[lastSpokenIndex].trim();
                    if (newSection) {
                      addToSpeechQueue(newSection);
                    }
                    lastSpokenIndex++;
                  }
                } else if (event.type === "done") {
                  const finalSections = accumulated.split("\n");
                  for (let i = lastSpokenIndex; i < finalSections.length; i++) {
                    const section = finalSections[i].trim();
                    if (section) addToSpeechQueue(section);
                  }

                  const display = accumulated.replace(/\*\*/g, "").replace(/\*/g, "").trim();
                  setMessages((p) => [...p, { role: "coach", content: display }]);
                  setStreamingText(null);
                }
              } catch (e) {}
            }
          }
        } else {
          const d = await res.json();
          if (d.response) {
            const display = d.response.replace(/\*\*/g, "").replace(/\*/g, "").trim();
            setMessages((p) => [...p, { role: "coach", content: display }]);
            const sections = display.split("\n");
            for (const s of sections) {
              if (s.trim()) addToSpeechQueue(s.trim());
            }
          }
        }
      } catch {
        setMessages((p) => [
          ...p,
          {
            role: "coach",
            content: "Sorry, I couldn't reach the voice coach. Take a breath and try again.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, addToSpeechQueue, stopCoachVoice]
  );

  useEffect(() => {
    getFeedbackRef.current = getFeedback;
  }, [getFeedback]);

  // ── Recording controls ───────────────────────────────────────────────
  const startRecording = () => {
    stopCoachVoice();
    setTranscript("");
    transcriptRef.current = "";
    setIsRecording(true);
    if (recRef.current) {
      try {
        recRef.current.start();
      } catch (e) {
        console.error("Mic start error:", e);
      }
    }
  };
  const stopRecording = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    const finalVal = transcriptRef.current.trim();

    if (recRef.current) {
      try {
        recRef.current.abort(); // Use abort for immediate stop
      } catch (e) {}
    }
    setIsRecording(false);

    // If we have a transcript, send it immediately when the user manually stops
    if (finalVal && !loading) {
      getFeedbackRef.current?.(finalVal, "mic");
      transcriptRef.current = "";
    }
  }, [loading]);

  const toggleRecording = () => (isRecording ? stopRecording() : startRecording());

  // ── Upload & transcribe ──────────────────────────────────────────────
  const processUploadedFile = async (file: File) => {
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_MB) {
      setUploadError(`File too large (${sizeMB.toFixed(1)} MB). Max is ${MAX_FILE_MB} MB.`);
      return;
    }

    setUploadFile(file);
    setUploadError(null);
    setUploadStatus("transcribing");
    setUploadTranscript("");

    try {
      const form = new FormData();
      form.append("file", file, file.name);

      const res = await fetch("/api/asr", {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setUploadError(data.error || "Transcription failed. Try a different audio file.");
        setUploadStatus("error");
        return;
      }

      const text = (data.text || "").trim();
      if (!text) {
        setUploadError("No speech detected in the audio. Try a clearer recording.");
        setUploadStatus("error");
        return;
      }

      setUploadTranscript(text);
      setUploadStatus("done");
    } catch (err) {
      console.error("Upload transcription error:", err);
      setUploadError("Failed to reach transcription server. Check your connection.");
      setUploadStatus("error");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processUploadedFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processUploadedFile(file);
  };

  const resetUpload = () => {
    setUploadFile(null);
    setUploadTranscript("");
    setUploadStatus("idle");
    setUploadError(null);
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-8 sm:py-12 flex flex-col min-h-[80vh]">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">🎤 Voice Coach</h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Speak or upload audio — get warm, personalised English coaching
        </p>
        <div className="mt-2 flex items-center justify-center gap-3 text-[10px] text-text-muted">
          <span className="inline-flex items-center gap-1">
            🎙️ Groq Whisper ASR
          </span>
          <span>·</span>
          <span className={`inline-flex items-center gap-1 ${ttsMode === "voivoice" ? "text-accent-500" : ""}`}>
            🔊 {ttsMode === "voivoice" ? "VoiVoice TTS" : "Browser TTS"}
          </span>
        </div>
        {coachSpeaking && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--border-card)] bg-[var(--bg-panel)] px-3 py-1.5">
            <span className="text-xs text-accent-500 animate-pulse">
              {coachPaused ? "⏸ Paused" : "🔊 Coach speaking…"}
            </span>
            <button
              type="button"
              onClick={coachPaused ? resumeCoachVoice : pauseCoachVoice}
              aria-label={coachPaused ? "Resume coach voice" : "Pause coach voice"}
              className="rounded-lg px-2.5 py-1 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-accent-500/10 transition-colors cursor-pointer"
            >
              {coachPaused ? "▶ Resume" : "⏸ Pause"}
            </button>
            <button
              type="button"
              onClick={stopCoachVoice}
              aria-label="Stop coach voice"
              className="rounded-lg px-2.5 py-1 text-xs font-medium text-text-secondary hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
            >
              ⏹ Stop
            </button>
          </div>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex rounded-2xl p-1 mb-5 bg-[var(--bg-panel)] border border-[var(--border-card)] gap-1">
        <button
          onClick={() => setTab("record")}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
            tab === "record"
              ? "bg-accent-500 text-white shadow"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          🎤 Record Live
        </button>
        <button
          onClick={() => setTab("upload")}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
            tab === "upload"
              ? "bg-accent-500 text-white shadow"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          📁 Upload Audio
        </button>
      </div>

      {/* Chat history */}
      <div className="flex-1 glass-heavy p-4 mb-4 min-h-[280px] max-h-[360px] overflow-y-auto space-y-3">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-sm text-text-muted">
            {tab === "record"
              ? "Tap the mic and speak something in English 💛"
              : "Upload an audio file and I'll transcribe & coach you 💛"}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
                m.role === "user" ? "chat-bubble-user" : "chat-bubble-coach"
              }`}
            >
              {m.role === "user" && m.source === "upload" && m.fileName && (
                <p className="text-[10px] opacity-60 mb-1">
                  📁 {m.fileName}
                </p>
              )}
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        {loading && !streamingText && (
          <div className="flex justify-start">
            <div className="chat-bubble-coach flex items-center gap-1.5 px-5 py-3.5">
              <span className="h-2 w-2 rounded-full bg-accent-400 animate-bounce [animation-delay:0ms]" />
              <span className="h-2 w-2 rounded-full bg-accent-500 animate-bounce [animation-delay:150ms]" />
              <span className="h-2 w-2 rounded-full bg-accent-600 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        {streamingText && (
          <div className="flex justify-start">
            <div className="max-w-[85%] px-4 py-3 text-sm leading-relaxed chat-bubble-coach">
              <p className="whitespace-pre-wrap">
                {streamingText}
                <span className="streaming-cursor" />
              </p>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Hidden audio for TTS */}
      <audio ref={audioRef} className="hidden" />

      {/* ── RECORD TAB ────────────────────────────────────────────────── */}
      {tab === "record" && (
        <div className="text-center">
          {/* Transcript display */}
          <div className="glass rounded-2xl p-4 mb-4 min-h-[60px] flex items-center justify-center shadow-sm">
            <p className={`text-base ${transcript ? "text-text-primary" : "text-text-muted"}`}>
              {transcript ||
                (isRecording
                  ? "Listening..."
                  : loading
                  ? "Thinking..."
                  : "Tap the mic to start")}
            </p>
          </div>

          {/* Big mic button */}
          <button
            onClick={toggleRecording}
            disabled={loading}
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 disabled:opacity-50 ${
              isRecording
                ? "bg-error shadow-lg shadow-error/30 scale-110 animate-pulse"
                : "bg-accent-500 shadow-lg shadow-accent-500/20 hover:scale-105"
            }`}
          >
            <span className="text-3xl text-white">{isRecording ? "⏹" : "🎤"}</span>
          </button>
          <p className="mt-2 text-[11px] text-text-muted">
            {isRecording ? "Tap to stop" : "Tap to speak"}
          </p>

          {transcript && !isRecording && (
            <div className="flex gap-3 justify-center mt-4">
              <button
                onClick={() => getFeedback(transcript, "mic")}
                disabled={loading}
                className="btn-gradient px-6 py-2.5 rounded-xl text-sm font-semibold"
              >
                💛 Get Feedback
              </button>
              <button
                onClick={() => { setTranscript(""); startRecording(); }}
                disabled={loading}
                className="glass rounded-xl px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                🔄 Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── UPLOAD TAB ────────────────────────────────────────────────── */}
      {tab === "upload" && (
        <div className="space-y-4">
          {/* Dropzone */}
          {uploadStatus === "idle" && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                dragOver
                  ? "border-accent-500 bg-accent-500/10 scale-[1.02]"
                  : "border-[var(--border-card)] hover:border-accent-400 hover:bg-accent-500/5"
              }`}
            >
              <div className="text-5xl mb-3">🎵</div>
              <p className="text-sm font-semibold text-text-primary mb-1">
                Drop audio here or click to browse
              </p>
              <p className="text-xs text-text-muted">
                MP3, M4A, WAV, WEBM, OGG, FLAC, AAC · Max {MAX_FILE_MB} MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_AUDIO}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* Transcribing spinner */}
          {uploadStatus === "transcribing" && (
            <div className="glass rounded-2xl p-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <svg className="animate-spin h-6 w-6 text-accent-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm font-semibold text-text-primary">Transcribing audio...</span>
              </div>
              {uploadFile && (
                <p className="text-xs text-text-muted">📁 {uploadFile.name}</p>
              )}
              <p className="text-xs text-text-muted mt-1">Powered by Groq Whisper</p>
            </div>
          )}

          {/* Error state */}
          {uploadStatus === "error" && (
            <div className="glass rounded-2xl p-6 text-center border border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/30">
              <div className="text-3xl mb-2">⚠️</div>
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-300 mb-4">
                {uploadError}
              </p>
              <button
                onClick={resetUpload}
                className="glass rounded-xl px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                🔄 Try Another File
              </button>
            </div>
          )}

          {/* Done — transcript preview + actions */}
          {uploadStatus === "done" && uploadTranscript && (
            <div className="space-y-3">
              <div className="glass rounded-2xl p-5 border-l-4 border-l-accent-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    📝 Transcription
                  </span>
                  {uploadFile && (
                    <span className="text-[10px] text-text-muted bg-[var(--bg-panel)] px-2 py-0.5 rounded-full border border-[var(--border-card)]">
                      {uploadFile.name}
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                  {uploadTranscript}
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() =>
                    getFeedback(uploadTranscript, "upload", uploadFile?.name)
                  }
                  disabled={loading}
                  className="btn-gradient px-6 py-2.5 rounded-xl text-sm font-semibold"
                >
                  💛 Get Coaching Feedback
                </button>
                <button
                  onClick={resetUpload}
                  disabled={loading}
                  className="glass rounded-xl px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  📁 Upload Another
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
