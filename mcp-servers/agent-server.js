#!/usr/bin/env node
const readline = require("readline"), fs = require("fs"), path = require("path");

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  try { const raw = fs.readFileSync(envPath, "utf8");
    for (const line of raw.split("\n")) { const t = line.trim(); if (!t || t.startsWith("#")) continue; const eq = t.indexOf("="); if (eq === -1) continue; const k = t.slice(0, eq).trim(); const v = t.slice(eq + 1).trim(); if (!process.env[k]) process.env[k] = v; }
  } catch {}
}
loadEnv();

const SYSTEM_PROMPT = `You are a Practice Coach. Run interactive English sessions: Role-play (real scenarios), Drills (grammar/vocab), Guided Conversation (free dialogue with tips). Set goals, practice 5-10 min, debrief every ~4 messages (🟢what went well, 🟡improve, 🔵tip). Energetic, supportive, sandwich method. 2-5 sentences.`;

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

const sessions = new Map();
function createSession(mode, scenario) { const id = `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`; const s = { id, mode, scenario, messages: [], createdAt: Date.now() }; sessions.set(id, s); return s; }
function getSession(id) { const s = sessions.get(id); if (!s) return; if (Date.now() - s.createdAt > 3600000) { sessions.delete(id); return; } return s; }

async function runPractice(params) {
  const text = (params.text || "").trim();
  if (!text) return { error: "Missing 'text'" };
  const validModes = ["roleplay", "drill", "conversation"];
  const mode = validModes.includes(params.mode) ? params.mode : "conversation";
  let session = params.session_id ? getSession(params.session_id) : null;
  if (params.session_id && !session) return { error: "Session expired", code: "SESSION_EXPIRED" };
  if (!session) session = createSession(mode, params.scenario || null);
  session.messages.push({ role: "user", content: text });
  const response = await callGroq(session.messages.slice(-10));
  session.messages.push({ role: "assistant", content: response });
  const debriefDue = session.messages.length > 3 && session.messages.length % 8 === 0;
  return { session_id: session.id, mode, scenario: session.scenario, response, message_count: session.messages.length, debrief_due: debriefDue, debrief_hint: debriefDue ? "Ask for a debrief" : undefined };
}

function getPracticeScenarios() {
  return { scenarios: [
    { key: "roleplay", title: "Role-Play", icon: "🎭", description: "Real-world scenarios.", example_prompts: ["You are at a café. Order a coffee and ask about Wi‑Fi.", "Job interview — introduce yourself."] },
    { key: "drill", title: "Quick Drill", icon: "⚡", description: "Grammar/vocab exercises.", example_prompts: ["Fill in: 'If I ___ (know) earlier, I would have come.'", "Correct: 'She don't like coffee.'"] },
    { key: "conversation", title: "Guided Conversation", icon: "💬", description: "Free dialogue with tips.", example_prompts: ["Tell me about your favorite hobby.", "Describe your last vacation."] },
  ]};
}

const TOOLS = [
  { name: "run_practice", description: "Start/continue a practice session.", inputSchema: { type: "object", properties: { text: { type: "string", description: "Your message." }, mode: { type: "string", enum: ["roleplay", "drill", "conversation"] }, session_id: { type: "string" }, scenario: { type: "string" } }, required: ["text"] } },
  { name: "get_practice_scenarios", description: "List scenarios.", inputSchema: { type: "object", properties: {}, required: [] } },
];

function sendRpc(id, result) { process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n"); }
function sendErr(id, code, msg) { process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, error: { code, message: msg } }) + "\n"); }

async function handle(req) {
  const { id, method, params } = req;
  switch (method) {
    case "initialize": sendRpc(id, { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "linguify-agent", version: "0.1.0" } }); break;
    case "tools/list": sendRpc(id, { tools: TOOLS }); break;
    case "tools/call": {
      const { name, arguments: args } = params ?? {};
      try {
        let result;
        if (name === "run_practice") result = await runPractice(args ?? {});
        else if (name === "get_practice_scenarios") result = getPracticeScenarios();
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
process.stderr.write("[agent-server] Groq-ready (pid " + process.pid + ")\n");
