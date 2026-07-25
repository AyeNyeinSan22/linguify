import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { toFile } from "groq-sdk";

/**
 * POST /api/asr
 * Body: FormData with audio file (field name: "file" or "audio")
 * Returns: { text: string }
 *
 * Primary: Groq Whisper (whisper-large-v3-turbo)
 * Fallback: VIBE_PROXY if GROQ_API_KEY not available
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const audio = formData.get("file") || formData.get("audio");

    if (!audio || !(audio instanceof Blob)) {
      return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
    }

    // ── Primary: Groq Whisper ────────────────────────────────────────────
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey && groqKey !== "YOUR_GROQ_KEY_HERE") {
      try {
        const groq = new Groq({ apiKey: groqKey });

        // Determine filename with extension for MIME sniffing
        const mimeType = audio.type || "audio/webm";
        const extMap: Record<string, string> = {
          "audio/webm": "webm",
          "audio/ogg": "ogg",
          "audio/mp4": "mp4",
          "audio/mpeg": "mp3",
          "audio/mp3": "mp3",
          "audio/wav": "wav",
          "audio/x-wav": "wav",
          "audio/flac": "flac",
          "audio/m4a": "m4a",
          "video/webm": "webm",
        };
        const ext = extMap[mimeType] || "webm";
        const fileName = `recording.${ext}`;

        const audioBuffer = Buffer.from(await audio.arrayBuffer());
        const file = await toFile(audioBuffer, fileName, { type: mimeType });

        const transcription = await groq.audio.transcriptions.create({
          file,
          model: "whisper-large-v3-turbo",
          response_format: "json",
          language: "en",
        });

        const text = transcription.text?.trim() || "";
        return NextResponse.json({ text });
      } catch (groqErr: any) {
        console.error("[asr] Groq Whisper error:", groqErr?.message || groqErr);
        // fall through to legacy proxy
      }
    }

    // ── Fallback: Legacy VIBE_PROXY ──────────────────────────────────────
    const proxyUrl = process.env.VIBE_PROXY || "https://proxy.vibecode.tours";
    const vibeKey = process.env.VIBE_KEY;

    if (!vibeKey) {
      return NextResponse.json(
        { error: "No transcription service configured. Set GROQ_API_KEY in .env." },
        { status: 500 }
      );
    }

    const proxyForm = new FormData();
    proxyForm.append("file", audio, "recording.wav");
    proxyForm.append("model", "mimo-v2.5-asr");

    const response = await fetch(`${proxyUrl}/v1/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${vibeKey}` },
      body: proxyForm,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[asr] Proxy error:", response.status, errorText.slice(0, 200));
      return NextResponse.json({ error: "Transcription failed" }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json({ text: data.text || "" });
  } catch (err) {
    console.error("[asr] Error:", err);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
