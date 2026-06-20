"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { sm2, getDueCards, getCardStats, type Flashcard } from "@/lib/flashcard-engine";

const TOPIC_LABELS: Record<string,string> = {"past-tense":"Past Tense","present-tense":"Present Tense","articles":"Articles","prepositions":"Prepositions","conditionals":"Conditionals","modal-verbs":"Modal Verbs","subject-verb-agreement":"Subject-Verb Agreement","general":"General"};
const STORAGE_KEY = "linguify-flashcards";
function load(): Flashcard[] { try{const r=localStorage.getItem(STORAGE_KEY);return r?JSON.parse(r):[];}catch{return[];} }
function save(c:Flashcard[]){localStorage.setItem(STORAGE_KEY,JSON.stringify(c));}

export default function FlashcardsPage() {
  const [cards,setCards]=useState<Flashcard[]>(()=>load());
  const [idx,setIdx]=useState(0);
  const [flipped,setFlipped]=useState(false);
  const [loaded]=useState(true);
  const due=getDueCards(cards), stats=getCardStats(cards), card=due[idx];

  const rate = useCallback((q:number)=>{
    if(!card)return;
    const u=sm2(q,card); const n=cards.map(c=>c.id===u.id?u:c);
    setCards(n); save(n); setFlipped(false);
  },[cards,card]);

  if(!loaded)return <div className="flex items-center justify-center min-h-[60vh]"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-accent-400 animate-bounce"/><span className="h-2 w-2 rounded-full bg-accent-500 animate-bounce"/><span className="h-2 w-2 rounded-full bg-accent-600 animate-bounce"/></div></div>;

  return <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-8 sm:py-12">
    <div className="mb-8 text-center"><h1 className="text-2xl sm:text-3xl font-bold text-text-primary">🃏 Flashcards</h1><p className="mt-1.5 text-sm text-text-secondary">Spaced repetition review</p></div>
    <div className="flex justify-center gap-4 mb-8">
      {[{l:"Due",v:stats.due,c:"text-error"},{l:"Learning",v:stats.learning,c:"text-warning"},{l:"Mastered",v:stats.mastered,c:"text-success"},{l:"Total",v:stats.total,c:"text-accent-600"}].map(s=><div key={s.l} className="bg-white border border-gray-100 rounded-2xl px-3 py-1.5 text-center min-w-[80px] shadow-sm"><div className={`text-lg font-bold ${s.c}`}>{s.v}</div><div className="text-[10px] text-text-muted">{s.l}</div></div>)}
    </div>
    {card?<div className="space-y-6">
      <div className="text-center text-xs text-text-muted">{idx+1} of {due.length} due</div>
      <div onClick={()=>setFlipped(!flipped)} className="cursor-pointer select-none"><div className={`relative w-full bg-white border border-gray-100 rounded-3xl shadow-sm p-8 transition-colors ${flipped?"bg-blue-50/50 border-accent-200":""}`} style={{minHeight:"280px"}}>
        <div className="absolute top-4 left-4"><span className="inline-flex rounded-full bg-accent-500/10 px-2.5 py-0.5 text-[10px] font-medium text-accent-600">{TOPIC_LABELS[card.topic]||card.topic}</span></div>
        <div className="flex items-center justify-center h-full min-h-[240px]">
          {!flipped?<div className="text-center"><p className="text-xs text-text-muted uppercase tracking-wide mb-3">Fix this sentence</p><p className="text-lg sm:text-xl font-semibold text-text-primary leading-relaxed">&ldquo;{card.front}&rdquo;</p><p className="mt-4 text-xs text-text-muted">Tap to reveal</p></div>
          :<div className="text-left w-full"><p className="text-xs text-text-muted uppercase tracking-wide mb-3">Correction & Explanation</p><div className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{card.back}</div></div>}
        </div>
      </div></div>
      {flipped&&<div className="flex justify-center gap-2">
        {[{q:0,l:"Forgot",c:"text-error"},{q:2,l:"Hard",c:"text-warning"},{q:4,l:"Good",c:"text-accent-600"},{q:5,l:"Easy",c:"text-success"}].map(b=><button key={b.q} onClick={()=>rate(b.q)} className={`px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-medium ${b.c} hover:bg-gray-50 transition-colors`}>{b.q} · {b.l}</button>)}
      </div>}
      {!flipped&&<div className="flex justify-center"><button onClick={()=>{setFlipped(false);setIdx(p=>(p+1)%Math.max(due.length,1));}} className="text-xs text-text-muted hover:text-accent-600 transition-colors">Skip →</button></div>}
    </div>:<div className="text-center py-16"><div className="text-5xl mb-4">🎉</div><h2 className="text-lg font-semibold text-text-primary mb-2">No cards to review!</h2><p className="text-sm text-text-secondary mb-6">{stats.total===0?"Start coaching to generate flashcards.":"All caught up!"}</p>{stats.total===0&&<Link href="/skill" className="btn-gradient">Start Coaching</Link>}</div>}
  </div>;
}
