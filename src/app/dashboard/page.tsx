"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ErrorItem { topic: string; count: number; percentage: number; }
interface MasteryScore { topic: string; correct: number; total: number; }
interface ProgressData { totalSessions: number; totalMessages: number; streakDays: number; errorSummary: { totalErrors: number; topErrors: ErrorItem[] }; masteryScores: MasteryScore[]; vocabulary: string[]; writingStats: { totalSubmissions: number; avgWordCount: number }; levels: Record<string,string>; recentEntries: Array<{ timestamp: number; mode: string; userText: string }>; }

const TOPIC_LABELS: Record<string,string> = {"past-tense":"Past Tense","present-tense":"Present Tense","future-tense":"Future Tense","prepositions":"Prepositions","articles":"Articles","plurals":"Plurals","modal-verbs":"Modal Verbs","conditionals":"Conditionals","subject-verb-agreement":"Subject-Verb Agreement","word-order":"Word Order","phrasal-verbs":"Phrasal Verbs","idioms":"Idioms","passive-voice":"Passive Voice","comparatives":"Comparatives"};
const LEVEL_LABELS: Record<string,string> = {A1:"Beginner",A2:"Elementary",B1:"Intermediate",B2:"Upper Int.",C1:"Advanced",C2:"Proficient"};

export default function DashboardPage() {
  const [data,setData]=useState<ProgressData|null>(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{fetch("/api/progress").then(r=>r.json()).then(d=>{setData(d);setLoading(false);}).catch(()=>setLoading(false));},[]);

  if(loading)return <div className="flex items-center justify-center min-h-[60vh]"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-accent-400 animate-bounce"/><span className="h-2 w-2 rounded-full bg-accent-500 animate-bounce"/><span className="h-2 w-2 rounded-full bg-accent-600 animate-bounce"/></div></div>;

  return <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <div className="mb-8"><h1 className="text-2xl sm:text-3xl font-bold text-text-primary">📊 Your Progress</h1><p className="mt-1.5 text-sm text-text-secondary">Track your English learning journey.</p></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[
        {l:"Sessions",v:data?.totalSessions||0,icon:"📅",accent:"bg-purple-50 text-purple-500"},
        {l:"Messages",v:data?.totalMessages||0,icon:"💬",accent:"bg-blue-50 text-blue-500"},
        {l:"🔥 Day Streak",v:data?.streakDays||0,icon:"🔥",accent:"bg-amber-50 text-amber-500"},
        {l:"Words Learned",v:data?.vocabulary?.length||0,icon:"📚",accent:"bg-green-50 text-green-500"},
      ].map(s=><div key={s.l} className="bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-sm hover:-translate-y-1 hover:shadow-md transition-all group">
        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${s.accent} text-lg mb-2 group-hover:scale-110 transition-transform`}>{s.icon}</span>
        <div className="text-2xl font-bold text-text-primary">{s.v}</div>
        <div className="text-[11px] text-text-muted mt-0.5 font-medium">{s.l}</div>
      </div>)}
    </div>
    {data?.levels&&<div className="glass p-5 mb-8"><h2 className="text-sm font-semibold text-text-primary mb-3">Your CEFR Levels</h2><div className="flex gap-4 flex-wrap">{Object.entries(data.levels).map(([mode,level])=><div key={mode} className="flex items-center gap-2"><span className="text-sm text-text-secondary">{mode==="grammar"?"📝":mode==="vocabulary"?"📚":"✍️"} {mode}</span><span className="inline-flex items-center rounded-full bg-accent-500/10 border border-accent-200 px-2.5 py-0.5 text-xs font-bold text-accent-600">{level} · {LEVEL_LABELS[level]||level}</span></div>)}</div></div>}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="glass p-5"><h2 className="text-sm font-semibold text-text-primary mb-4">🔍 Common Mistakes</h2>{data?.errorSummary?.topErrors?.length?<div className="space-y-3">{data.errorSummary.topErrors.slice(0,6).map(err=><div key={err.topic}><div className="flex justify-between text-xs mb-1"><span className="text-text-secondary font-medium">{TOPIC_LABELS[err.topic]||err.topic}</span><span className="text-text-muted">{err.count}x · {err.percentage}%</span></div><div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-accent-500 rounded-full h-1.5" style={{width:`${Math.min(err.percentage,100)}%`}}/></div></div>)}</div>:<p className="text-sm text-text-muted">Start coaching to see common mistakes.</p>}</div>
      <div className="glass p-5"><h2 className="text-sm font-semibold text-text-primary mb-4">🎯 Mastery Tracker</h2>{data?.masteryScores?.length?<div className="space-y-3">{data.masteryScores.filter(m=>m.total>1).slice(0,6).map(m=>{const pct=Math.round((m.correct/m.total)*100);return <div key={m.topic}><div className="flex justify-between text-xs mb-1"><span className="text-text-secondary font-medium">{TOPIC_LABELS[m.topic]||m.topic}</span><span className={pct>=70?"text-success":pct>=40?"text-warning":"text-error"}>{pct}%</span></div><div className="w-full bg-gray-100 rounded-full h-1.5"><div className={`rounded-full h-1.5 ${pct>=70?"bg-success":pct>=40?"bg-warning":"bg-error"}`} style={{width:`${pct}%`}}/></div></div>})}</div>:<p className="text-sm text-text-muted">Complete coaching sessions to build mastery.</p>}</div>
      {data?.writingStats&&data.writingStats.totalSubmissions>0&&<div className="glass p-5"><h2 className="text-sm font-semibold text-text-primary mb-4">✍️ Writing Stats</h2><div className="flex items-center gap-6"><div><div className="text-2xl font-bold gradient-text">{data.writingStats.totalSubmissions}</div><div className="text-[11px] text-text-muted">Submissions</div></div><div><div className="text-2xl font-bold gradient-text">{data.writingStats.avgWordCount}</div><div className="text-[11px] text-text-muted">Avg Words</div></div></div></div>}
      {data?.vocabulary&&data.vocabulary.length>0&&<div className="glass p-5"><h2 className="text-sm font-semibold text-text-primary mb-4">📚 Vocabulary</h2><div className="flex flex-wrap gap-1.5">{data.vocabulary.slice(0,30).map(w=><span key={w} className="inline-flex rounded-full bg-accent-500/10 border border-accent-200 px-2.5 py-0.5 text-[11px] text-accent-600">{w}</span>)}</div></div>}
    </div>
    {data?.recentEntries&&data.recentEntries.length>0&&<div className="glass p-5 mb-8"><h2 className="text-sm font-semibold text-text-primary mb-4">🕐 Recent Activity</h2><div className="space-y-2">{data.recentEntries.slice(0,5).map((e,i)=><div key={i} className="flex items-start gap-3 text-xs"><span className="text-text-muted shrink-0 w-16">{new Date(e.timestamp).toLocaleDateString()}</span><span className="capitalize text-accent-600 font-medium shrink-0 w-20">{e.mode==="grammar"?"📝 Gram":e.mode==="vocabulary"?"📚 Vocab":"✍️ Write"}</span><span className="text-text-secondary truncate">&ldquo;{e.userText.slice(0,60)}&rdquo;</span></div>)}</div></div>}
    {(!data||data.totalMessages===0)&&<div className="text-center py-12"><p className="text-text-muted mb-4">No data yet — start coaching!</p><Link href="/skill" className="btn-gradient">Open English Coach</Link></div>}
  </div>;
}
