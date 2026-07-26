import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/tts
 * Body: { text: string }
 * Returns: audio/wav stream from VoiVoice TTS
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get("text");
    if (!text) {
      return NextResponse.json({ error: "Missing 'text'" }, { status: 400 });
    }

    const proxyUrl = process.env.VIBE_PROXY || "https://proxy.vibecode.tours";
    const apiKey = process.env.VIBE_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "VIBE_KEY not configured" }, { status: 500 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      const response = await fetch(`${proxyUrl}/v1/audio/speech`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mimo-v2.5-tts",
          input: text,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return NextResponse.json({ error: "TTS failed" }, { status: 502 });
      }

      const contentType = response.headers.get("Content-Type") || "audio/wav";
      return new NextResponse(response.body, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "no-cache",
        },
      });
    } catch (fetchErr: any) {
      if (fetchErr.name === "AbortError") {
        console.error("[tts] Proxy timeout after 5s");
        return NextResponse.json({ error: "TTS timeout" }, { status: 504 });
      }
      throw fetchErr;
    }
  } catch (err) {
    return NextResponse.json({ error: "TTS failed" }, { status: 500 });
  }
}

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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${proxyUrl}/v1/audio/speech`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mimo-v2.5-tts",
          input: text,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[tts] Proxy error:", response.status, errorText.slice(0, 200));
        return NextResponse.json({ error: "TTS failed" }, { status: 502 });
      }

      const contentType = response.headers.get("Content-Type") || "audio/wav";
      return new NextResponse(response.body, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "no-cache",
        },
      });
    } catch (fetchErr: any) {
      if (fetchErr.name === "AbortError") {
        return NextResponse.json({ error: "TTS timeout" }, { status: 504 });
      }
      throw fetchErr;
    }
  } catch (err) {
    console.error("[tts] Error:", err);
    return NextResponse.json({ error: "TTS failed" }, { status: 500 });
  }
}
