"use client";

import { useState } from "react";

const LANGUAGES: Record<string,string> = {my:"Burmese (မြန်မာ)",es:"Spanish",fr:"French",de:"German",it:"Italian",pt:"Portuguese",ja:"Japanese",ko:"Korean",zh:"Chinese",ar:"Arabic",hi:"Hindi",ru:"Russian",tr:"Turkish",vi:"Vietnamese",th:"Thai",pl:"Polish",nl:"Dutch",sv:"Swedish"};

export default function TranslatePage() {
  const [lang,setLang]=useState("my");
  const [native,setNative]=useState("");
  const [translation,setTranslation]=useState("");
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState<{naturalTranslation:string;comparison:string;vocabulary:string[];fallback?:boolean}|null>(null);

  const submit=async()=>{
    if(!native.trim()||!translation.trim()||loading)return;
    setLoading(true);
    try{const r=await fetch("/api/translate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({nativeText:native.trim(),userTranslation:translation.trim(),nativeLanguage:LANGUAGES[lang]})});setResult(await r.json());}
    catch{setResult({naturalTranslation:"Failed to connect.",comparison:"Please try again.",vocabulary:[],fallback:true});}
    finally{setLoading(false);}
  };

  return <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <div className="mb-8 text-center"><h1 className="text-2xl sm:text-3xl font-bold text-text-primary">🌍 Translation Coach</h1><p className="mt-1.5 text-sm text-text-secondary">Translate into English — AI compares and coaches</p></div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <div className="glass p-5">
        <div className="flex items-center justify-between mb-3"><label className="text-xs font-semibold text-text-primary">Your Language</label><select value={lang} onChange={e=>setLang(e.target.value)} className="glass-input text-xs py-1 px-2 rounded-lg">{Object.entries(LANGUAGES).map(([c,n])=><option key={c} value={c}>{n}</option>)}</select></div>
        <textarea value={native} onChange={e=>setNative(e.target.value)} placeholder={`Write in ${LANGUAGES[lang]}...`} className="glass-input w-full min-h-[120px] resize-y" />
      </div>
      <div className="glass p-5"><label className="text-xs font-semibold text-text-primary mb-3 block">Your English Translation</label><textarea value={translation} onChange={e=>setTranslation(e.target.value)} placeholder="Write your English translation..." className="glass-input w-full min-h-[120px] resize-y" /></div>
    </div>
    <div className="text-center mb-8"><button onClick={submit} disabled={!native.trim()||!translation.trim()||loading} className="btn-gradient">{loading?"Analyzing...":"Compare & Learn"}</button></div>
    {result&&<div className="space-y-6">
      <div className="glass p-5"><h3 className="text-sm font-semibold text-text-primary mb-3">🌐 Natural Translation</h3><p className="text-sm text-text-primary bg-blue-50 rounded-lg p-3 leading-relaxed">{result.naturalTranslation}</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="glass p-5"><h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Your Translation</h3><p className="text-sm text-text-secondary">{translation}</p></div><div className="glass p-5"><h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Original ({LANGUAGES[lang]})</h3><p className="text-sm text-text-secondary">{native}</p></div></div>
      <div className="glass p-5"><h3 className="text-sm font-semibold text-text-primary mb-3">📊 Full Analysis</h3><div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{result.comparison}</div></div>
      {result.vocabulary.length>0&&<div className="glass p-5"><h3 className="text-sm font-semibold text-text-primary mb-3">📝 Key Vocabulary</h3><div className="flex flex-wrap gap-2">{result.vocabulary.map((v,i)=><span key={i} className="inline-flex rounded-full bg-accent-500/10 border border-accent-200 px-3 py-1 text-xs text-accent-600">{v}</span>)}</div></div>}
      <div className="text-center"><button onClick={()=>{setResult(null);setNative("");setTranslation("");}} className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-medium text-text-secondary hover:text-accent-600 hover:border-accent-300 transition-colors">Try Another Translation</button></div>
    </div>}
  </div>;
}
