#!/usr/bin/env node
const readline = require("readline"), fs = require("fs"), path = require("path");

// Load .env
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  try { const raw = fs.readFileSync(envPath, "utf8");
    for (const line of raw.split("\n")) { const t = line.trim(); if (!t || t.startsWith("#")) continue; const eq = t.indexOf("="); if (eq === -1) continue; const k = t.slice(0, eq).trim(); const v = t.slice(eq + 1).trim(); if (!process.env[k]) process.env[k] = v; }
  } catch {}
}
loadEnv();

const SYSTEM_PROMPT = `You are an English language coach. For every message, respond:
🔍 **Correction** — corrected version or "Correct!"
📖 **Explanation** — grammar/vocab rule
📝 **Examples** — 1-2 examples
🎯 **Next Step** — one exercise. Be encouraging, 1-3 sentences per section. Mode: grammar/vocabulary/writing.`;

// Groq API call
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callGroq(messages) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "YOUR_GROQ_KEY_HERE") throw new Error("GROQ_API_KEY not set. Get a free key at https://console.groq.com/keys");
  const msgs = [{ role: "system", content: SYSTEM_PROMPT }, ...messages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }))];
  const resp = await fetch(GROQ_URL, { method: "POST", headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: msgs, max_tokens: 1024, temperature: 0.7 }) });
  if (!resp.ok) { const e = await resp.text(); throw new Error(`Groq ${resp.status}: ${e.slice(0, 200)}`); }
  const j = await resp.json();
  return j.choices?.[0]?.message?.content || "";
}

// Session store
const sessions = new Map();
function createSession(mode) { const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`; const s = { id, mode, messages: [], createdAt: Date.now() }; sessions.set(id, s); return s; }
function getSession(id) { const s = sessions.get(id); if (!s) return undefined; if (Date.now() - s.createdAt > 3600000) { sessions.delete(id); return undefined; } return s; }

// Tools
async function analyzeEnglish(params) {
  const text = (params.text || "").trim();
  if (!text) return { error: "Missing 'text'" };
  const validModes = ["grammar", "vocabulary", "writing"];
  let mode = params.mode || "grammar";
  if (!validModes.includes(mode)) { mode = text.split(/\s+/).length === 1 ? "vocabulary" : "grammar"; }
  let session = params.session_id ? getSession(params.session_id) : null;
  if (params.session_id && !session) return { error: "Session expired", code: "SESSION_EXPIRED" };
  if (!session) session = createSession(mode);
  session.messages.push({ role: "user", content: text });
  const analysis = await callGroq(session.messages.slice(-10));
  session.messages.push({ role: "assistant", content: analysis });
  return { session_id: session.id, mode, analysis, message_count: session.messages.length };
}

function getCoachModes() {
  return { modes: [{ key: "grammar", label: "Grammar Coach", icon: "📝", description: "Grammar explanations and corrections." }, { key: "vocabulary", label: "Vocabulary Coach", icon: "📚", description: "Learn words in context." }, { key: "writing", label: "Writing Coach", icon: "✍️", description: "Writing feedback." }] };
}

const TOOLS = [
  { name: "analyze_english", description: "Analyze English text with structured feedback.", inputSchema: { type: "object", properties: { text: { type: "string", description: "Text to analyze" }, mode: { type: "string", enum: ["grammar", "vocabulary", "writing"] }, session_id: { type: "string" } }, required: ["text"] } },
  { name: "get_coach_modes", description: "List coaching modes.", inputSchema: { type: "object", properties: {}, required: [] } },
];

function sendRpc(id, result) { process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n"); }
function sendErr(id, code, msg) { process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, error: { code, message: msg } }) + "\n"); }

async function handle(req) {
  const { id, method, params } = req;
  switch (method) {
    case "initialize": sendRpc(id, { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "linguify-skill", version: "0.1.0" } }); break;
    case "tools/list": sendRpc(id, { tools: TOOLS }); break;
    case "tools/call": {
      const { name, arguments: args } = params ?? {};
      try {
        let result;
        if (name === "analyze_english") result = await analyzeEnglish(args ?? {});
        else if (name === "get_coach_modes") result = getCoachModes();
        else { sendErr(id, -32601, `Unknown: ${name}`); return; }
        sendRpc(id, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], ...(result.error ? { isError: true } : {}) });
      } catch (err) { sendRpc(id, { content: [{ type: "text", text: `Error: ${err.message}. Get a free key at https://console.groq.com/keys` }], isError: true }); }
      break;
    }
  }
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
rl.on("line", l => { try { handle(JSON.parse(l)); } catch {} });
rl.on("close", () => process.exit(0));
process.stderr.write("[skill-server] Groq-ready (pid " + process.pid + ")\n");
