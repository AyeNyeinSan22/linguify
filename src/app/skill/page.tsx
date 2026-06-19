"use client";

import { useState, useCallback, useEffect } from "react";
import ChatPanel from "@/components/ChatPanel";

type Mode = "grammar" | "vocabulary" | "writing";

const MODES: { key: Mode; label: string; icon: string; desc: string }[] = [
  { key: "grammar", label: "Grammar", icon: "📝", desc: "Grammar explanations and corrections" },
  { key: "vocabulary", label: "Vocabulary", icon: "📚", desc: "Learn words in context with examples" },
  { key: "writing", label: "Writing", icon: "✍️", desc: "Feedback on clarity, tone, structure" },
];

const LEVEL_META: Record<string, { label: string; icon: string }> = {
  A1: { label: "Beginner", icon: "🌱" }, A2: { label: "Elementary", icon: "🌿" },
  B1: { label: "Intermediate", icon: "🎯" }, B2: { label: "Upper Int.", icon: "🚀" },
  C1: { label: "Advanced", icon: "💎" }, C2: { label: "Proficient", icon: "👑" },
};

interface DailyPrompt { id: number; level: string; category: string; text: string; hint?: string; }
interface Message { role: "user" | "coach"; content: string; meta?: string; }

export default function SkillPage() {
  const [mode, setMode] = useState<Mode>("grammar");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [dailyPrompt, setDailyPrompt] = useState<DailyPrompt | null>(null);
  const [levels, setLevels] = useState<Record<string, string> | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    fetch("/api/prompts").then(r=>r.json()).then(d=>{if(d.prompt)setDailyPrompt(d.prompt);}).catch(()=>{});
    fetch("/api/progress").then(r=>r.json()).then(d=>{if(d.levels)setLevels(d.levels);if(d.streakDays)setStreak(d.streakDays);}).catch(()=>{});
  }, []);

  const resetSession = useCallback(() => { setSessionId(null); setMessages([]); setInput(""); setStreamingText(null); }, []);

  const handleSend = async (textOverride?: string) => {
    const text = (textOverride || input).trim(); if (!text || loading) return;
    setMessages(p=>[...p,{role:"user",content:text}]); setInput(""); setLoading(true); setStreamingText(null);
    try {
      const body: Record<string,unknown> = {message:text,mode,stream:true}; if(sessionId)body.sessionId=sessionId;
      const response = await fetch("/api/coach",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      if(response.ok && response.headers.get("Content-Type")?.includes("text/event-stream")){
        const reader = response.body?.getReader(); if(!reader)throw new Error("No stream");
        const decoder = new TextDecoder(); let buffer = "", accumulated = "";
        while(true){
          const {done,value}=await reader.read(); if(done)break;
          buffer+=decoder.decode(value,{stream:true});
          const lines=buffer.split("\n"); buffer=lines.pop()||"";
          for(const line of lines){
            if(!line.startsWith("data: "))continue;
            try{const event=JSON.parse(line.slice(6));
              if(event.type==="token"){accumulated+=event.text;setStreamingText(accumulated);}
              else if(event.type==="done"){setMessages(p=>[...p,{role:"coach",content:accumulated,meta:event.label}]);setStreamingText(null);if(event.sessionId)setSessionId(event.sessionId);
                fetch("/api/flashcards",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"generate",mode,userText:text,coachResponse:accumulated})}).then(r=>r.json()).then(d=>{if(d.cards?.length)try{const ex=JSON.parse(localStorage.getItem("linguify-flashcards")||"[]");localStorage.setItem("linguify-flashcards",JSON.stringify([...ex,...d.cards]));}catch{}}).catch(()=>{});
              }else if(event.type==="error"){setMessages(p=>[...p,{role:"coach",content:`Sorry: ${event.message}`}]);setStreamingText(null);}
            }catch{}
          }
        }
      }else{const d=await response.json();if(d.sessionId)setSessionId(d.sessionId);setMessages(p=>[...p,{role:"coach",content:d.response,meta:d.label}]);}
    }catch{setMessages(p=>[...p,{role:"coach",content:"Sorry, couldn't reach the coach."}]);setStreamingText(null);}
    finally{setLoading(false);}
  };

  const handleStartPrompt = () => { if(!dailyPrompt)return; setMode("writing"); setInput(dailyPrompt.text); };
  const hour = new Date().getHours();
  const greeting = hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";
  const hasChat = messages.length>0||streamingText;

  return (
    <div className="flex flex-col flex-1">
      <div className="mx-auto w-full max-w-6xl flex-1 flex flex-col gap-6 px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{greeting}, Learner! <span className="text-xl">📖</span></h1>
            <p className="mt-1 text-sm text-text-secondary">{streak>0?`🔥 ${streak}-day streak — `:""}Your AI English Coach is ready</p>
          </div>
          {sessionId&&<button onClick={resetSession} className="rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-accent-600 transition-all hover:bg-gray-50 hover:border-accent-500/30">+ New Session</button>}
        </div>
        {levels&&(
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(levels).map(([m,level])=>{
              const meta=LEVEL_META[level]||LEVEL_META.B1;
              return <div key={m} className="glass p-4 text-center">
                <span className="text-2xl block mb-1">{meta.icon}</span>
                <div className="text-[10px] uppercase tracking-wide text-text-muted font-medium">{m}</div>
                <div className="inline-flex items-center rounded-full bg-accent-500/10 text-accent-600 px-2.5 py-0.5 text-[10px] font-bold mt-1">{level} · {meta.label}</div>
              </div>;
            })}
          </div>
        )}
        {sessionId&&(<div className="flex items-center gap-2 rounded-xl border border-accent-200 bg-accent-50 px-4 py-2 text-xs text-accent-700"><span className="pulse-dot" />Session active</div>)}
        {dailyPrompt&&!hasChat&&(
          <div className="glass p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1"><span className="text-xs font-semibold text-accent-600">🎯 Daily Prompt</span><span className="inline-flex rounded-full bg-accent-500/10 px-2 py-0.5 text-[10px] text-accent-600">{dailyPrompt.level}</span><span className="text-[10px] text-text-muted">{dailyPrompt.category}</span></div>
                <p className="text-sm text-text-primary font-medium leading-relaxed">{dailyPrompt.text}</p>
                {dailyPrompt.hint&&<p className="mt-1.5 text-[11px] text-text-muted italic">💡 {dailyPrompt.hint}</p>}
              </div>
              <button onClick={handleStartPrompt} className="btn-gradient shrink-0 text-xs px-3 py-1.5">Write ✍️</button>
            </div>
          </div>
        )}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {MODES.map(m=><button key={m.key} onClick={()=>setMode(m.key)} className={`flex-shrink-0 pill ${mode===m.key?"pill-active":""}`}><span className="block text-lg">{m.icon}</span><div><span className="block text-xs font-semibold text-text-primary">{m.label}</span><span className="mt-0.5 block text-[11px] text-text-muted leading-snug">{m.desc}</span></div></button>)}
        </div>
        <ChatPanel messages={messages} isLoading={loading} streamingText={streamingText} />
        <div className="flex gap-2">
          <input type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSend()} placeholder={mode==="grammar"?"Type a sentence…":mode==="vocabulary"?'Ask about a word…':"Paste a paragraph…"} className="glass-input flex-1" />
          <button onClick={()=>handleSend()} disabled={!input.trim()||loading} className="btn-gradient shrink-0">Send</button>
        </div>
        <details className="glass-details p-4 mt-auto">
          <summary className="cursor-pointer text-xs font-semibold text-text-muted select-none">How AI Coaching Works</summary>
          <ul className="mt-3 space-y-2 text-xs text-text-secondary">
            <li>🔍 <strong className="text-text-primary">Correction</strong> — your sentence, refined</li>
            <li>📖 <strong className="text-text-primary">Explanation</strong> — the rule, clearly stated</li>
            <li>📝 <strong className="text-text-primary">Examples</strong> — real-world usage</li>
            <li>🎯 <strong className="text-text-primary">Next Step</strong> — practice exercise</li>
            <li className="mt-1.5 text-accent-600">⚡ Responses stream in real time. 🃏 Mistakes become flashcards.</li>
          </ul>
        </details>
      </div>
    </div>
  );
}
