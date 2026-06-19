/**
 * Daily Writing Prompts — curated bank organized by CEFR level.
 * Prompt index rotates daily based on epoch days.
 */

export interface Prompt {
  id: number;
  level: string;      // A1, A2, B1, B2, C1, C2
  category: string;    // daily-life, opinion, storytelling, business, academic
  text: string;
  hint?: string;
}

const PROMPTS: Prompt[] = [
  // ── A1 (Beginner) ──────────────────────────────────────────────────
  { id: 1, level: "A1", category: "daily-life", text: "Describe your morning routine. What do you do from the moment you wake up?", hint: "Use words like: first, then, after that." },
  { id: 2, level: "A1", category: "daily-life", text: "What did you eat for breakfast today? Describe it.", hint: "Use simple past tense: I ate..., I drank..." },
  { id: 3, level: "A1", category: "daily-life", text: "Describe your family. Who are the people in your family?", hint: "Use: I have..., There is/are..., My mother/father is..." },
  { id: 4, level: "A1", category: "daily-life", text: "What is your favorite food? Describe how it looks and tastes.", hint: "Use adjectives: delicious, sweet, hot, cold, spicy." },
  { id: 5, level: "A1", category: "daily-life", text: "Describe the room you are in right now.", hint: "Use: There is/are..., It has..., The color is..." },
  { id: 6, level: "A1", category: "daily-life", text: "What do you do on weekends?", hint: "Use simple present: I go..., I watch..., I meet..." },
  { id: 7, level: "A1", category: "daily-life", text: "Describe your best friend. What does he/she look like?", hint: "Use adjectives: tall, short, friendly, kind, funny." },
  { id: 8, level: "A1", category: "daily-life", text: "What clothes are you wearing today?", hint: "Use: I am wearing a blue shirt, black pants..." },
  { id: 9, level: "A1", category: "daily-life", text: "Describe your pet or an animal you like.", hint: "Use: It is..., It has..., It can..." },
  { id: 10, level: "A1", category: "daily-life", text: "What is the weather like today?", hint: "Use: It is sunny/rainy/cloudy, The temperature is..." },
  { id: 11, level: "A1", category: "daily-life", text: "Write three sentences about your favorite hobby.", hint: "Use: I like..., I enjoy..., My hobby is..." },
  { id: 12, level: "A1", category: "daily-life", text: "Describe your daily commute. How do you get to work or school?", hint: "Use: I take the bus..., I walk..., It takes... minutes." },
  { id: 13, level: "A1", category: "storytelling", text: "Write about your last birthday. What did you do?", hint: "Use past simple: I celebrated..., My friends came..." },
  { id: 14, level: "A1", category: "storytelling", text: "Describe a happy memory from your childhood.", hint: "Use: When I was young..., I remember..." },

  // ── A2 (Elementary) ─────────────────────────────────────────────────
  { id: 15, level: "A2", category: "daily-life", text: "Describe your favorite restaurant. What do you usually order there?", hint: "Use: The food is..., I usually order..., The atmosphere is..." },
  { id: 16, level: "A2", category: "daily-life", text: "Explain how to make your favorite simple meal.", hint: "Use sequence words: first, next, then, finally." },
  { id: 17, level: "A2", category: "travel", text: "Describe your last vacation. Where did you go and what did you do?", hint: "Use past tense: I visited..., I saw..., We stayed..." },
  { id: 18, level: "A2", category: "travel", text: "You are at a hotel reception. Write a dialogue where you check in.", hint: "Use: I have a reservation..., Could I have...?, What time is...?" },
  { id: 19, level: "A2", category: "daily-life", text: "Write an email to a friend inviting them to a party this weekend.", hint: "Include: when, where, what to bring." },
  { id: 20, level: "A2", category: "opinion", text: "What is your favorite season and why?", hint: "Use: I prefer... because..., In summer/winter I can..." },
  { id: 21, level: "A2", category: "daily-life", text: "Describe your neighborhood. What places are near your home?", hint: "Use: There is a park near..., Next to my house there is..." },
  { id: 22, level: "A2", category: "opinion", text: "What kind of music do you like? Describe your favorite artist or band.", hint: "Use: I enjoy listening to..., Their music makes me feel..." },
  { id: 23, level: "A2", category: "storytelling", text: "Write about a time you got lost. What happened?", hint: "Use: I was walking when..., Suddenly..., Finally..." },
  { id: 24, level: "A2", category: "daily-life", text: "Describe your shopping habits. Where and how often do you shop?", hint: "Use frequency adverbs: usually, sometimes, rarely, often." },
  { id: 25, level: "A2", category: "travel", text: "Write a short review of a place you visited recently.", hint: "Include: what you liked, what you didn't like, if you recommend it." },
  { id: 26, level: "A2", category: "opinion", text: "Do you prefer movies or books? Explain why.", hint: "Use comparing words: better than, more interesting, I prefer... because..." },
  { id: 27, level: "A2", category: "storytelling", text: "Tell a short story about a surprising event in your life.", hint: "Start with: One day..., Suddenly..., In the end..." },

  // ── B1 (Intermediate) ───────────────────────────────────────────────
  { id: 28, level: "B1", category: "opinion", text: "Should students wear uniforms in school? Give your opinion with reasons.", hint: "Structure: Introduction, 2-3 reasons, conclusion." },
  { id: 29, level: "B1", category: "business", text: "Write a short cover letter for a job you would like to have.", hint: "Include: introduction, your skills, why you want the job." },
  { id: 30, level: "B1", category: "opinion", text: "Are smartphones making us less social? Discuss.", hint: "Use: On one hand..., On the other hand..., In my opinion..." },
  { id: 31, level: "B1", category: "daily-life", text: "Describe a skill you would like to learn and why it interests you.", hint: "Use: I've always wanted to..., It would help me..." },
  { id: 32, level: "B1", category: "storytelling", text: "Write about a time you faced a challenge and how you overcame it.", hint: "Structure: the situation, the challenge, your actions, the result." },
  { id: 33, level: "B1", category: "opinion", text: "Is it better to live in a big city or a small town? Compare.", hint: "Use comparing phrases: whereas, while, in contrast, on the other hand." },
  { id: 34, level: "B1", category: "business", text: "Write an email to your manager requesting time off for a personal reason.", hint: "Be polite: I would like to request..., I assure you that..." },
  { id: 35, level: "B1", category: "travel", text: "Plan a weekend trip for a group of friends. Describe the itinerary.", hint: "Use future forms: We will.../We're going to..., You should bring..." },
  { id: 36, level: "B1", category: "opinion", text: "Do you think social media has more positive or negative effects?", hint: "Give balanced arguments with examples." },
  { id: 37, level: "B1", category: "daily-life", text: "Describe a tradition from your culture that is important to you.", hint: "Explain when it happens, what people do, and why it matters." },
  { id: 38, level: "B1", category: "storytelling", text: "Tell the story of how you met your best friend.", hint: "Use: I remember..., At first..., Over time..., Now we..." },
  { id: 39, level: "B1", category: "opinion", text: "Should children learn a second language from an early age?", hint: "Discuss benefits and potential challenges." },
  { id: 40, level: "B1", category: "daily-life", text: "Describe your ideal day. What would you do from morning to night?", hint: "Use: I would start my day by..., Then I'd..., In the evening..." },

  // ── B2 (Upper Intermediate) ─────────────────────────────────────────
  { id: 41, level: "B2", category: "opinion", text: "Argue for or against remote work. Use specific examples.", hint: "Structure: thesis statement, 3 body paragraphs, conclusion." },
  { id: 42, level: "B2", category: "business", text: "Write a proposal for a new project at your company or university.", hint: "Include: problem statement, proposed solution, benefits, timeline." },
  { id: 43, level: "B2", category: "opinion", text: "Is artificial intelligence a threat or an opportunity for society?", hint: "Use: While AI offers..., it also poses risks such as..." },
  { id: 44, level: "B2", category: "academic", text: "Summarize a news article you read recently and give your opinion.", hint: "First paragraph: summary. Second: your analysis and opinion." },
  { id: 45, level: "B2", category: "opinion", text: "Should governments invest more in public transportation? Argue your case.", hint: "Use evidence: studies show..., for example in [country]..." },
  { id: 46, level: "B2", category: "storytelling", text: "Write a personal narrative about a turning point in your life.", hint: "Focus on descriptive details, emotions, and reflection." },
  { id: 47, level: "B2", category: "academic", text: "Explain a complex topic you know well to someone who knows nothing about it.", hint: "Start simple, build complexity, use analogies." },
  { id: 48, level: "B2", category: "opinion", text: "Do you think university education should be free? Discuss.", hint: "Consider economic, social, and practical perspectives." },
  { id: 49, level: "B2", category: "business", text: "Write a professional email responding to a customer complaint.", hint: "Acknowledge the issue, explain the solution, maintain a positive tone." },
  { id: 50, level: "B2", category: "opinion", text: "What is the biggest challenge facing your generation? Explain.", hint: "Be specific, use examples, propose possible solutions." },
  { id: 51, level: "B2", category: "academic", text: "Compare two different approaches to learning a language. Which is more effective?", hint: "Use compare/contrast structure, evidence from experience." },
  { id: 52, level: "B2", category: "storytelling", text: "Describe a time you had to make a difficult decision. What did you learn?", hint: "Explain the context, the options, your reasoning, the outcome." },

  // ── C1 (Advanced) ───────────────────────────────────────────────────
  { id: 53, level: "C1", category: "opinion", text: "Write a persuasive essay on whether technology makes us more or less free.", hint: "Address counterarguments, use sophisticated transitions." },
  { id: 54, level: "C1", category: "academic", text: "Analyze the impact of climate change on global migration patterns.", hint: "Use academic vocabulary, cite trends, propose solutions." },
  { id: 55, level: "C1", category: "business", text: "Write a strategic recommendation memo for a company entering a new market.", hint: "Include: market analysis, risks, competitive strategy, financial outlook." },
  { id: 56, level: "C1", category: "opinion", text: "Critically evaluate the concept of 'work-life balance' in modern society.", hint: "Challenge assumptions, consider cultural and economic factors." },
  { id: 57, level: "C1", category: "academic", text: "Write an analysis of a film, book, or artwork that had a strong impact on you.", hint: "Discuss themes, techniques, context, and personal interpretation." },
  { id: 58, level: "C1", category: "opinion", text: "Is democracy the best form of government? Argue with nuance.", hint: "Acknowledge strengths and weaknesses, avoid oversimplification." },
  { id: 59, level: "C1", category: "business", text: "Draft a speech for a graduation ceremony. Make it inspiring.", hint: "Use rhetorical devices, personal anecdotes, universal themes." },
  { id: 60, level: "C1", category: "academic", text: "Explain a scientific or technological concept in a way that is both accurate and accessible.", hint: "Define terms, use metaphors, connect to everyday experience." },

  // ── C2 (Proficient) ─────────────────────────────────────────────────
  { id: 61, level: "C2", category: "opinion", text: "Write a philosophical reflection on the nature of consciousness and identity.", hint: "Engage with philosophical traditions, develop original insights." },
  { id: 62, level: "C2", category: "academic", text: "Critique a widely accepted theory or practice in your field of expertise.", hint: "Identify gaps, propose alternatives, maintain scholarly tone." },
  { id: 63, level: "C2", category: "opinion", text: "Explore the ethical implications of human genetic engineering.", hint: "Balance scientific possibility with moral philosophy." },
  { id: 64, level: "C2", category: "business", text: "Write an op-ed on an economic policy issue that affects your country.", hint: "Use data, historical context, and persuasive rhetoric." },
  { id: 65, level: "C2", category: "academic", text: "Craft a literary analysis comparing the narrative styles of two authors.", hint: "Analyze technique, voice, structure, and thematic depth." },
];

// ── Daily prompt selection ───────────────────────────────────────────────

function daysSinceEpoch(): number {
  return Math.floor(Date.now() / 86400000);
}

export function getTodayPrompt(level?: string): Prompt {
  const pool = level
    ? PROMPTS.filter((p) => p.level === level)
    : PROMPTS;
  const index = daysSinceEpoch() % pool.length;
  return pool[index];
}

export function getPromptsByLevel(level: string, count = 5): Prompt[] {
  const pool = PROMPTS.filter((p) => p.level === level);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getPromptById(id: number): Prompt | undefined {
  return PROMPTS.find((p) => p.id === id);
}

export function getAllLevels(): string[] {
  return ["A1", "A2", "B1", "B2", "C1", "C2"];
}

export function getLevelLabels(): Record<string, string> {
  return {
    A1: "Beginner",
    A2: "Elementary",
    B1: "Intermediate",
    B2: "Upper Intermediate",
    C1: "Advanced",
    C2: "Proficient",
  };
}
