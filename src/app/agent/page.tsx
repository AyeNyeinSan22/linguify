"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ChatPanel from "@/components/ChatPanel";

interface DomainMeta { name: string; label: string; icon: string; description: string; dialogues: number; openings: number; }

const DOMAIN_STYLES: Record<string, { gradient: string; ring: string; border: string; bg: string }> = {
  restaurant: { gradient: "from-[#FF7043]/5 to-white", ring: "ring-[#FF7043]/40", border: "border-[#FF7043]", bg: "bg-[#FF7043]/8" },
  hotel:      { gradient: "from-[#26A69A]/5 to-white", ring: "ring-[#26A69A]/40", border: "border-[#26A69A]", bg: "bg-[#26A69A]/8" },
  train:      { gradient: "from-[#1E88E5]/5 to-white", ring: "ring-[#1E88E5]/40", border: "border-[#1E88E5]", bg: "bg-[#1E88E5]/8" },
  attraction: { gradient: "from-[#8E24AA]/5 to-white", ring: "ring-[#8E24AA]/40", border: "border-[#8E24AA]", bg: "bg-[#8E24AA]/8" },
  taxi:       { gradient: "from-[#FB8C00]/5 to-white", ring: "ring-[#FB8C00]/40", border: "border-[#FB8C00]", bg: "bg-[#FB8C00]/8" },
  hospital:   { gradient: "from-[#43A047]/5 to-white", ring: "ring-[#43A047]/40", border: "border-[#43A047]", bg: "bg-[#43A047]/8" },
};

interface Message { role: "user" | "coach"; content: string; meta?: string; }

function AgentPageContent() {
  const searchParams = useSearchParams();
  const scenarioParam = searchParams.get("scenario");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionGoal, setSessionGoal] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [mwDomains, setMwDomains] = useState<DomainMeta[]>([]);
  const [mwLoading, setMwLoading] = useState<Record<string,boolean>>({});
  const [mwError, setMwError] = useState<string|null>(null);
  const [activeDomain, setActiveDomain] = useState<string|null>(scenarioParam||null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const resetSession = useCallback(()=>{setSessionId(null);setMessages([]);setSessionGoal("");setInput("");setStarted(false);setActiveDomain(null);},[]);

  const handleMultiWOZ = useCallback(async (domain: DomainMeta) => {
    setMwLoading(p=>({...p,[domain.name]:true})); setActiveDomain(domain.name);
    try {
      const res=await fetch("/api/scenarios",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({domain:domain.name,type:"roleplay"})});
      const d=await res.json();
      if(d.error){setMessages([{role:"coach",content:`Couldn't load scenario. ${d.error}`}]);setStarted(true);return;}
      setSessionGoal(`Practice a ${domain.label} conversation — ${d.scenario.numTurns}-turn dialogue`);
      setMessages([{role:"coach",content:`${domain.icon} **${domain.label} Scenario**\n\n${d.scenario.context}\n\n**Your turn:** ${d.scenario.prompt}`,meta:`🏙️ ${domain.label} · ${d.scenario.numTurns} turns`}]);
      setStarted(true);
    }catch{setMessages([{role:"coach",content:"Sorry, couldn't load scenario."}]);setStarted(true);}
    finally{setMwLoading(p=>({...p,[domain.name]:false}));}
  },[]);

  useEffect(()=>{fetch("/api/scenarios").then(r=>r.json()).then(d=>{if(d.domains){setMwDomains(d.domains);if(scenarioParam){const m=d.domains.find((x:DomainMeta)=>x.name===scenarioParam);if(m)handleMultiWOZ(m);}}else{setMwError(d.error||"Failed to load scenarios.");}}).catch(()=>setMwError("Could not reach the server. Please try again later."));},[scenarioParam, handleMultiWOZ]);
  useEffect(()=>{chatEndRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);

  const handleSend = async () => {
    const text=input.trim(); if(!text||loading)return;
    setMessages(p=>[...p,{role:"user",content:text}]); setInput(""); setLoading(true);
    try{const body:Record<string,unknown>={message:text,mode:"multiwoz"};if(sessionId)body.sessionId=sessionId;const res=await fetch("/api/practice",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const d=await res.json();if(d.code==="SESSION_EXPIRED"){setMessages(p=>[...p,{role:"coach",content:"Session expired."}]);setSessionId(null);return;}if(d.sessionId)setSessionId(d.sessionId);setMessages(p=>[...p,{role:"coach",content:d.response,meta:d.messageCount?`Msg ${d.messageCount}`:undefined}]);}catch{setMessages(p=>[...p,{role:"coach",content:"Sorry, couldn't reach coach."}]);}finally{setLoading(false);}
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="mx-auto w-full max-w-6xl flex-1 flex flex-col gap-6 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl sm:text-3xl font-bold text-text-primary"><span className="mr-2">🏙️</span>Practice Coach</h1><p className="mt-1.5 text-sm text-text-secondary">Real-world English conversations from Cambridge, UK — MultiWOZ 2.2 dataset.</p></div>
          {sessionId&&<button onClick={resetSession} className="rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-accent-600 transition-all hover:bg-gray-50 hover:border-accent-500/30">+ New Session</button>}
        </div>
        {sessionId&&(<div className="flex items-center gap-2 rounded-xl border border-accent-200 bg-accent-50 px-4 py-2 text-xs text-accent-700"><span className="pulse-dot" />Session active</div>)}
        {!started&&messages.length===0&&mwDomains.length>0&&(
          <section className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-8"><h2 className="text-lg sm:text-xl font-bold text-text-primary">Choose a real-world scenario</h2><p className="mt-2 text-sm text-text-secondary max-w-md mx-auto">Each scenario from real MultiWOZ 2.2 dialogues — practice English as it&apos;s actually spoken.</p></div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mwDomains.map(domain=>{
                const style=DOMAIN_STYLES[domain.name]||DOMAIN_STYLES.restaurant;
                const isActive = activeDomain===domain.name;
                return <button key={domain.name} onClick={()=>handleMultiWOZ(domain)} disabled={mwLoading[domain.name]}
                  className={`relative overflow-hidden bg-white rounded-2xl border-l-4 ${style.border} group p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${isActive?`ring-2 ${style.ring} shadow-lg`:""} disabled:opacity-50 disabled:cursor-wait`}>
                  <span className="absolute -bottom-2 -right-2 text-6xl opacity-[0.04] select-none pointer-events-none">{domain.icon}</span>
                  <div className="relative">
                    <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${style.bg} text-2xl`}>{domain.icon}</span>
                    <h3 className="mt-3 text-base font-bold text-text-primary">{domain.label}</h3>
                    <p className="mt-1.5 text-[12px] text-text-secondary leading-relaxed">{domain.description}</p>
                    <div className="mt-3 flex items-center gap-2"><span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-text-secondary">{domain.dialogues.toLocaleString()} dialogues</span>{mwLoading[domain.name]&&<span className="flex items-center gap-1 text-[10px] text-text-muted"><span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />Loading...</span>}</div>
                  </div>
                </button>;
              })}
            </div>
            <p className="mt-6 text-center text-[11px] text-text-muted">Powered by <span className="font-medium text-text-secondary">MultiWOZ 2.2</span> · 8,437 dialogues · 7 domains · Cambridge, UK</p>
          </section>
        )}
        {!started&&messages.length===0&&mwError&&(<div className="flex-1 flex items-center justify-center"><div className="text-center"><div className="text-4xl mb-3">⚠️</div><p className="text-sm text-red-600 font-medium">{mwError}</p><button onClick={()=>{setMwError(null);fetch("/api/scenarios").then(r=>r.json()).then(d=>{if(d.domains)setMwDomains(d.domains);else setMwError(d.error||"Failed to load scenarios.");}).catch(()=>setMwError("Could not reach the server."));}} className="btn-gradient mt-4 text-xs">Retry</button></div></div>)}
        {!started&&messages.length===0&&mwDomains.length===0&&!mwError&&(<div className="flex-1 flex items-center justify-center"><div className="text-center"><div className="flex items-center justify-center gap-1.5 mb-3"><span className="h-2 w-2 rounded-full bg-accent-400 animate-bounce"/><span className="h-2 w-2 rounded-full bg-accent-500 animate-bounce"/><span className="h-2 w-2 rounded-full bg-accent-600 animate-bounce"/></div><p className="text-sm text-text-muted">Loading scenarios…</p></div></div>)}
        {sessionGoal&&(<div className="rounded-xl border border-accent-200 bg-accent-50 px-4 py-3 text-sm text-accent-800"><span className="font-semibold">🎯 Goal:</span> {sessionGoal}</div>)}
        {started&&messages.length>0&&(<><ChatPanel messages={messages} isLoading={loading} /><div className="flex gap-2"><input type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSend()} placeholder="Type your response…" className="glass-input flex-1" /><button onClick={handleSend} disabled={!input.trim()||loading} className="btn-gradient shrink-0">Send</button></div></>)}
        <details className="glass-details p-4 mt-auto">
          <summary className="cursor-pointer text-xs font-semibold text-text-muted select-none">How Practice Coach Works</summary>
          <ul className="mt-3 space-y-1.5 text-xs text-text-secondary"><li>1️⃣ Choose a real-world scenario</li><li>2️⃣ Read the opening prompt</li><li>3️⃣ Type your response — AI coaches you</li><li className="mt-1.5 text-accent-600">🏙️ All scenarios from authentic Cambridge, UK dialogues.</li></ul>
        </details>
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}

export default function AgentPage() {
  return <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-text-muted">Loading...</div>}><AgentPageContent /></Suspense>;
}
