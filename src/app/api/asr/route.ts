import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/asr
 * Body: FormData with audio file (field name: "file")
 * Returns: { text: string }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const audio = formData.get("file") || formData.get("audio");

    if (!audio || !(audio instanceof Blob)) {
      return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
    }

    const proxyUrl = process.env.VIBE_PROXY || "https://proxy.vibecode.tours";
    const apiKey = process.env.VIBE_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "VIBE_KEY not configured" }, { status: 500 });
    }

    // Forward to proxy ASR endpoint (OpenAI-compatible format)
    const proxyForm = new FormData();
    proxyForm.append("file", audio, "recording.wav");
    proxyForm.append("model", "mimo-v2.5-asr");

    const response = await fetch(`${proxyUrl}/v1/audio/transcriptions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
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
