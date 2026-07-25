import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/tts
 * Body: { text: string }
 * Returns: audio/wav stream from VoiVoice TTS
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { text } = await request.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing 'text'" }, { status: 400 });
    }

    const proxyUrl = process.env.VIBE_PROXY || "https://proxy.vibecode.tours";
    const apiKey = process.env.VIBE_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "VIBE_KEY not configured" }, { status: 500 });
    }

    const response = await fetch(`${proxyUrl}/v1/audio/speech`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mimo-v2.5-tts",
        input: text,
        voice: "alloy",
        response_format: "wav",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[tts] Proxy error:", response.status, errorText.slice(0, 200));
      return NextResponse.json({ error: "TTS failed" }, { status: 502 });
    }

    // Stream the audio back
    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": String(audioBuffer.byteLength),
      },
    });
  } catch (err) {
    console.error("[tts] Error:", err);
    return NextResponse.json({ error: "TTS failed" }, { status: 500 });
  }
}
