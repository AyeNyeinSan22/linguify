"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import ScenarioHeader from "@/components/ScenarioHeader";
import LessonList from "@/components/LessonList";
import CourseCard from "@/components/CourseCard";
import ChatPanel from "@/components/ChatPanel";

interface DomainDetail { name: string; label: string; icon: string; description: string; subtitle: string; dialogues: number; rating: number; reviews: number; students: number; }
interface Lesson { id: number; title: string; duration: string; completed?: boolean; }
interface Message { role: "user" | "coach"; content: string; meta?: string; }

// Domain accent colors for scenario headers
const DOMAIN_STYLES: Record<string, { gradient: string; accentColor: string; accentBg: string; accentBorder: string; color: string; bg: string; border: string }> = {
  restaurant: { gradient: "from-[#FF7043] via-[#F4511E] to-[#E64A19]", accentColor: "text-[#FF7043]", accentBg: "bg-[#FF7043]", accentBorder: "border-[#FF7043]", color: "text-[#FF7043]", bg: "bg-[#FF7043]/8", border: "border-[#FF7043]" },
  hotel:      { gradient: "from-[#26A69A] via-[#00897B] to-[#00695C]", accentColor: "text-[#26A69A]", accentBg: "bg-[#26A69A]", accentBorder: "border-[#26A69A]", color: "text-[#26A69A]", bg: "bg-[#26A69A]/8", border: "border-[#26A69A]" },
  train:      { gradient: "from-[#1E88E5] via-[#1565C0] to-[#0D47A1]", accentColor: "text-[#1E88E5]", accentBg: "bg-[#1E88E5]", accentBorder: "border-[#1E88E5]", color: "text-[#1E88E5]", bg: "bg-[#1E88E5]/8", border: "border-[#1E88E5]" },
  attraction: { gradient: "from-[#8E24AA] via-[#7B1FA2] to-[#6A1B9A]", accentColor: "text-[#8E24AA]", accentBg: "bg-[#8E24AA]", accentBorder: "border-[#8E24AA]", color: "text-[#8E24AA]", bg: "bg-[#8E24AA]/8", border: "border-[#8E24AA]" },
  taxi:       { gradient: "from-[#FB8C00] via-[#F57C00] to-[#EF6C00]", accentColor: "text-[#FB8C00]", accentBg: "bg-[#FB8C00]", accentBorder: "border-[#FB8C00]", color: "text-[#FB8C00]", bg: "bg-[#FB8C00]/8", border: "border-[#FB8C00]" },
  hospital:   { gradient: "from-[#43A047] via-[#388E3C] to-[#2E7D32]", accentColor: "text-[#43A047]", accentBg: "bg-[#43A047]", accentBorder: "border-[#43A047]", color: "text-[#43A047]", bg: "bg-[#43A047]/8", border: "border-[#43A047]" },
};

export default function ScenarioDetailPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = use(params);
  const router = useRouter();
  const [detail,setDetail] = useState<DomainDetail|null>(null);
  const [lessons,setLessons] = useState<Lesson[]>([]);
  const [related,setRelated] = useState<DomainDetail[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState<string|null>(null);
  const [chatStarted,setChatStarted] = useState(false);
  const [messages,setMessages] = useState<Message[]>([]);
  const [input,setInput] = useState("");
  const [chatLoading,setChatLoading] = useState(false);
  const [sessionId,setSessionId] = useState<string|null>(null);

  useEffect(()=>{
    fetch(`/api/scenarios?domain=${domain}`).then(r=>r.json()).then(d=>{if(d.domain){setDetail(d.domain);setLessons(d.lessons||[]);}else{setError(d.error||"Failed to load scenario.");}setLoading(false);}).catch(()=>{setError("Could not reach the server. Please try again later.");setLoading(false);});
    fetch("/api/scenarios").then(r=>r.json()).then(d=>{if(d.domains)setRelated(d.domains.filter((x:DomainDetail)=>x.name!==domain).slice(0,3));}).catch(()=>{});
  },[domain]);

  const startPractice = async (lessonTitle?: string) => {
    const topicHint = lessonTitle ? ` Focus on: ${lessonTitle}.` : "";
    try{const r=await fetch("/api/scenarios",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({domain,type:"roleplay"})});const d=await r.json();if(d.scenario){const extra=topicHint?`\n\n📌 **Lesson focus:** ${lessonTitle}`:"";setMessages([{role:"coach",content:`**${d.domainInfo?.label||domain}**${extra}\n\n${d.scenario.context}\n\n**Your turn:** ${d.scenario.prompt}`,meta:`🏙️ ${d.domainInfo?.label||domain}${lessonTitle?" · "+lessonTitle:""}`}]);setChatStarted(true);}else{setMessages([{role:"coach",content:`Couldn't load scenario: ${d.error||"Unknown error"}`}]);setChatStarted(true);}}catch{setMessages([{role:"coach",content:"Could not reach the server. Please try again."}]);setChatStarted(true);}
  };

  const handleStart = () => startPractice();
  const handleStartLesson = (lesson: { id: number; title: string; duration: string }) => startPractice(lesson.title);

  const handleSend = async () => {
    const text = input.trim(); if(!text||chatLoading)return;
    setMessages(p=>[...p,{role:"user",content:text}]); setInput(""); setChatLoading(true);
    try{const body:Record<string,unknown>={message:text,mode:"multiwoz"};if(sessionId)body.sessionId=sessionId;const r=await fetch("/api/practice",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const d=await r.json();if(d.sessionId)setSessionId(d.sessionId);setMessages(p=>[...p,{role:"coach",content:d.response}]);}catch{setMessages(p=>[...p,{role:"coach",content:"Sorry, something went wrong."}]);}finally{setChatLoading(false);}
  };

  if(loading)return <div className="flex items-center justify-center min-h-[60vh]"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-accent-400 animate-bounce [animation-delay:0ms]"/><span className="h-2 w-2 rounded-full bg-accent-500 animate-bounce [animation-delay:150ms]"/><span className="h-2 w-2 rounded-full bg-accent-600 animate-bounce [animation-delay:300ms]"/></div></div>;
  if(error)return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4"><div className="text-5xl">⚠️</div><h2 className="text-lg font-semibold text-red-600">Something went wrong</h2><p className="text-sm text-text-secondary">{error}</p><button onClick={()=>router.push("/agent")} className="btn-gradient">Browse Scenarios</button></div>;
  if(!detail)return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4"><div className="text-5xl">🔍</div><h2 className="text-lg font-semibold text-text-primary">Not found</h2><p className="text-sm text-text-secondary">&quot;{domain}&quot; doesn&apos;t exist.</p><button onClick={()=>router.push("/agent")} className="btn-gradient">Browse Scenarios</button></div>;

  const style = DOMAIN_STYLES[domain] || DOMAIN_STYLES.restaurant;

  return <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-8">
    <ScenarioHeader icon={detail.icon} title={detail.label} subtitle={detail.subtitle} duration="5-10 min" dialogues={detail.dialogues} students={detail.students} rating={detail.rating} reviews={detail.reviews} accentColor={style.accentColor} accentBg={style.accentBg} gradient={style.gradient} onStart={handleStart} />
    <div className={`grid gap-8 ${chatStarted?"lg:grid-cols-2":""}`}>
      <div className="space-y-6">
        <div className="glass p-6"><h2 className="text-base font-bold text-text-primary mb-3">📖 About This Scenario</h2><p className="text-sm text-text-secondary leading-relaxed">{detail.description}</p></div>
        <div><h2 className="text-base font-bold text-text-primary mb-3">📋 Lessons ({lessons.length})</h2><LessonList lessons={lessons} onStartLesson={handleStartLesson} /></div>
      </div>
      {chatStarted&&<div className="flex flex-col gap-4"><div className="flex items-center gap-2"><span className="pulse-dot"/><span className="text-sm font-semibold text-text-primary">Practice Session</span></div><ChatPanel messages={messages} isLoading={chatLoading} /><div className="flex gap-2"><input type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSend()} placeholder="Type your response…" className="glass-input flex-1"/><button onClick={handleSend} disabled={!input.trim()||chatLoading} className="btn-gradient shrink-0">Send</button></div></div>}
    </div>
    {!chatStarted&&related.length>0&&<section><h2 className="text-base font-bold text-text-primary mb-4">🔗 You Might Also Like</h2><div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{related.map(d=>{const c=DOMAIN_STYLES[d.name]||DOMAIN_STYLES.restaurant;return <CourseCard key={d.name} icon={d.icon} title={d.label} dialogues={d.dialogues} rating={d.rating} accentColor={c.color} accentBg={c.bg} accentBorder={c.border} href={`/scenario/${d.name}`}/>;})}</div></section>}
  </div>;
}
