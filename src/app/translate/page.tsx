"use client";

import { useState, useEffect, useRef } from "react";

const LANGUAGES: Record<string, string> = {
  my: "Burmese (မြန်မာ)",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
  ar: "Arabic",
  hi: "Hindi",
  ru: "Russian",
  tr: "Turkish",
  vi: "Vietnamese",
  th: "Thai",
  pl: "Polish",
  nl: "Dutch",
  sv: "Swedish",
};

interface SamplePhrase {
  lang: string;
  native: string;
  user: string;
  label: string;
}

const SAMPLE_PHRASES: SamplePhrase[] = [
  {
    lang: "my",
    native: "မင်္ဂလာပါ သာယာသောနေ့လေးဖြစ်ပါစေ",
    user: "Hello, have a nice day",
    label: "🇲🇲 Burmese Greeting",
  },
  {
    lang: "es",
    native: "Me gustaría pedir un café con leche por favor",
    user: "I would like to order a coffee with milk please",
    label: "🇪🇸 Spanish Cafe Order",
  },
  {
    lang: "fr",
    native: "Je suis désolé pour le retard, la circulation était terrible",
    user: "I am sorry for the delay, traffic was terrible",
    label: "🇫🇷 French Apology",
  },
  {
    lang: "ja",
    native: "すみません、駅までどうやって行けばいいですか？",
    user: "Excuse me, how can I get to the station?",
    label: "🇯🇵 Japanese Directions",
  },
  {
    lang: "de",
    native: "Könnten Sie mir bitte mit meiner Tasche helfen?",
    user: "Could you please help me with my bag?",
    label: "🇩🇪 German Favor",
  },
];

interface TranslationResult {
  naturalTranslation: string;
  fluencyScore?: number;
  comparison: string;
  vocabulary: string[];
  tips?: string[];
  fallback?: boolean;
  error?: string;
}

export default function TranslatePage() {
  const [lang, setLang] = useState("my");
  const [native, setNative] = useState("");
  const [translation, setTranslation] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoTranslating, setAutoTranslating] = useState(false);
  const [autoTranslated, setAutoTranslated] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);

  // Reference to track manual user edits in the English box
  const userManuallyEdited = useRef(false);

  // ── Debounced Auto-Translation Effect ──────────────────────────────────
  useEffect(() => {
    if (!native.trim()) {
      if (!userManuallyEdited.current) {
        setTranslation("");
      }
      setAutoTranslating(false);
      setAutoTranslated(false);
      return;
    }

    // Skip auto-translation if user manually edited the English translation after typing
    if (userManuallyEdited.current) {
      return;
    }

    setAutoTranslating(true);
    const timer = setTimeout(async () => {
      try {
        const r = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "auto",
            nativeText: native.trim(),
            nativeLanguage: LANGUAGES[lang] || lang,
          }),
        });
        const data = await r.json();
        if (data.translation && !userManuallyEdited.current) {
          setTranslation(data.translation);
          setAutoTranslated(true);
        }
      } catch (err) {
        console.error("Auto-translate fetch error:", err);
      } finally {
        setAutoTranslating(false);
      }
    }, 550);

    return () => clearTimeout(timer);
  }, [native, lang]);

  const handleSampleClick = (sample: SamplePhrase) => {
    userManuallyEdited.current = false;
    setLang(sample.lang);
    setNative(sample.native);
    setTranslation(sample.user);
    setAutoTranslated(true);
    setResult(null);
    setErrorMsg(null);
  };

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback */
    }
  };

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading) return;

    if (!native.trim() && !translation.trim()) {
      setErrorMsg("Please write text in your language box, or click a 'Quick Sample' above!");
      return;
    }
    if (!native.trim()) {
      setErrorMsg(`Please enter a sentence in ${LANGUAGES[lang] || "your native language"}.`);
      return;
    }
    if (!translation.trim()) {
      setErrorMsg("Please wait for auto-translation or write your English translation attempt.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const r = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nativeText: native.trim(),
          userTranslation: translation.trim(),
          nativeLanguage: LANGUAGES[lang] || lang,
        }),
      });

      const data = await r.json();

      if (!r.ok || data.error) {
        setResult({
          naturalTranslation: translation.trim(),
          fluencyScore: 75,
          comparison: data.error || "Unable to reach translation server. Try again in a moment.",
          vocabulary: [],
          tips: ["Ensure your device is connected to the internet."],
          fallback: true,
        });
      } else {
        setResult({
          naturalTranslation: data.naturalTranslation || translation.trim(),
          fluencyScore: typeof data.fluencyScore === "number" ? data.fluencyScore : 85,
          comparison: data.comparison || "Translation evaluated successfully.",
          vocabulary: Array.isArray(data.vocabulary) ? data.vocabulary : [],
          tips: Array.isArray(data.tips) ? data.tips : [],
          fallback: Boolean(data.fallback),
        });
      }
    } catch (err) {
      console.error("Translation submit error:", err);
      setErrorMsg("Failed to connect to translation server. Please check your network.");
      setResult({
        naturalTranslation: translation.trim(),
        fluencyScore: 70,
        comparison: "Offline mode. Please check your internet connection.",
        vocabulary: [],
        tips: [],
        fallback: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  const score = result?.fluencyScore ?? 85;
  const scoreColor = score >= 85 ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" : score >= 70 ? "text-amber-500 bg-amber-500/10 border-amber-500/30" : "text-rose-500 bg-rose-500/10 border-rose-500/30";

  return (
    <div className="relative mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="gradient-blob gradient-blob-1" />
        <div className="gradient-blob gradient-blob-2" />
      </div>

      {/* Page Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-500/10 px-3.5 py-1 text-xs font-semibold text-accent-600 dark:text-accent-400 mb-3 border border-accent-500/20">
          <span>🌐 Instant AI Translation & Coach</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Translate, Compare & Master English
        </h1>
        <p className="mt-2 text-sm sm:text-base text-text-secondary max-w-xl mx-auto">
          Type in your native language to get an instant English translation, adjust your phrasing, and click <strong>Compare & Learn</strong> for AI coaching feedback.
        </p>
      </div>

      {/* Quick Sample Presets */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Try a Quick Sample (Click to auto-fill)
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PHRASES.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSampleClick(s)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:border-accent-500/40 hover:bg-[var(--bg-panel)] transition-all shadow-sm active:scale-95"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={submit}>
        {/* Inputs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6" onKeyDown={handleKeyDown}>
          {/* Native Text Input */}
          <div className="glass p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                  <span>🗣️ Your Language</span>
                </label>
                <select
                  value={lang}
                  onChange={(e) => {
                    setLang(e.target.value);
                    userManuallyEdited.current = false;
                  }}
                  className="glass-input text-xs py-1 px-2.5 rounded-lg border-[var(--border-card)] bg-[var(--bg-panel)] text-text-primary font-medium focus:ring-2 focus:ring-accent-500/30"
                >
                  {Object.entries(LANGUAGES).map(([code, name]) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                value={native}
                onChange={(e) => {
                  setNative(e.target.value);
                  userManuallyEdited.current = false;
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder={`Write a sentence or phrase in ${LANGUAGES[lang]}...`}
                rows={4}
                className="glass-input w-full resize-y text-sm leading-relaxed"
              />
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-text-muted">
              <span>{native.trim().length} chars</span>
              {native && (
                <button
                  type="button"
                  onClick={() => {
                    setNative("");
                    setTranslation("");
                    userManuallyEdited.current = false;
                    setAutoTranslated(false);
                  }}
                  className="hover:text-error transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* English Translation Input */}
          <div className="glass p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                  <span>🇬🇧 Your English Translation</span>
                </label>
                <span className="text-[11px] text-text-muted">
                  {autoTranslating ? (
                    <span className="inline-flex items-center gap-1 text-accent-500 font-semibold animate-pulse">
                      <span className="pulse-dot" /> Auto-translating...
                    </span>
                  ) : autoTranslated ? (
                    <span className="text-emerald-500 font-medium">✓ Auto-translated (Edit anytime)</span>
                  ) : (
                    "Press ⌘+Enter to submit"
                  )}
                </span>
              </div>
              <textarea
                value={translation}
                onChange={(e) => {
                  setTranslation(e.target.value);
                  userManuallyEdited.current = true;
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder={autoTranslating ? "Translating into English..." : "Auto-translates as you type, or write your attempt..."}
                rows={4}
                className="glass-input w-full resize-y text-sm leading-relaxed"
              />
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-text-muted">
              <span>{translation.trim().length} chars</span>
              {translation && (
                <button
                  type="button"
                  onClick={() => {
                    setTranslation("");
                    userManuallyEdited.current = true;
                  }}
                  className="hover:text-error transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center mb-6">
          <button
            type="submit"
            disabled={loading}
            className="btn-gradient px-8 py-3.5 text-base font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 cursor-pointer active:scale-98"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Comparing & Analyzing...
              </span>
            ) : (
              "✨ Compare & Learn"
            )}
          </button>
        </div>
      </form>

      {/* Error / Validation Notice */}
      {errorMsg && (
        <div className="mb-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 p-4 text-sm text-amber-900 dark:text-amber-200 text-center font-medium shadow-sm animate-fade-in">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Banner alert for simulated fallback */}
          {result.fallback && (
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between">
              <span>💡 Operating in fallback coaching mode.</span>
            </div>
          )}

          {/* Natural Translation Banner Card */}
          <div className="glass p-6 border-l-4 border-l-accent-500 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌐</span>
                <h3 className="text-base font-bold text-text-primary">Natural English Translation</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${scoreColor}`}>
                  🎯 Fluency: {score}/100
                </span>
                <button
                  type="button"
                  onClick={() => speakText(result.naturalTranslation)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-[var(--border-card)] bg-[var(--bg-panel)] text-text-secondary hover:text-accent-600 transition-colors ${speaking ? "animate-pulse border-accent-500 text-accent-600" : ""}`}
                  title="Listen to pronunciation"
                >
                  🔊 {speaking ? "Speaking..." : "Listen"}
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(result.naturalTranslation)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-[var(--border-card)] bg-[var(--bg-panel)] text-text-secondary hover:text-accent-600 transition-colors"
                  title="Copy translation"
                >
                  {copied ? "✓ Copied" : "📋 Copy"}
                </button>
              </div>
            </div>
            <p className="text-base sm:text-lg font-semibold text-text-primary bg-accent-500/5 border border-accent-500/15 rounded-xl p-4 leading-relaxed">
              "{result.naturalTranslation}"
            </p>
          </div>

          {/* Side-by-side comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-2">
                Your Translation
              </span>
              <p className="text-sm text-text-primary bg-[var(--bg-panel)] rounded-xl p-3 border border-[var(--border-card)] leading-relaxed">
                "{translation}"
              </p>
            </div>
            <div className="glass p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-2">
                Original ({LANGUAGES[lang] || lang})
              </span>
              <p className="text-sm text-text-primary bg-[var(--bg-panel)] rounded-xl p-3 border border-[var(--border-card)] leading-relaxed">
                "{native}"
              </p>
            </div>
          </div>

          {/* Detailed Coaching Analysis */}
          <div className="glass p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📊</span>
              <h3 className="text-base font-bold text-text-primary">Coaching & Nuance Analysis</h3>
            </div>
            <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap rounded-xl bg-[var(--bg-panel)]/50 p-4 border border-[var(--border-card)]">
              {result.comparison}
            </div>
          </div>

          {/* Key Vocabulary */}
          {result.vocabulary && result.vocabulary.length > 0 && (
            <div className="glass p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">📝</span>
                <h3 className="text-base font-bold text-text-primary">Key Vocabulary & Expressions</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.vocabulary.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 rounded-xl bg-accent-500/5 border border-accent-500/15 p-3 text-xs text-text-primary"
                  >
                    <span className="text-accent-500 font-bold shrink-0">•</span>
                    <span className="font-medium leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pro Coaching Tips */}
          {result.tips && result.tips.length > 0 && (
            <div className="glass p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">💡</span>
                <h3 className="text-base font-bold text-text-primary">Pro Coaching Tips</h3>
              </div>
              <ul className="space-y-2">
                {result.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-text-secondary">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/10 text-amber-600 font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reset Action */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setNative("");
                setTranslation("");
                userManuallyEdited.current = false;
                setAutoTranslated(false);
                setErrorMsg(null);
              }}
              className="inline-flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-5 py-2.5 text-xs font-semibold text-text-secondary hover:text-accent-600 hover:border-accent-300 transition-all shadow-sm"
            >
              🔄 Try Another Translation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



