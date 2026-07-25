import type { Page } from "@playwright/test";

/** Mock SpeechRecognition + speechSynthesis for voice coach e2e tests. */
export async function mockVoiceBrowserApis(page: Page) {
  await page.addInitScript(() => {
    class MockSpeechRecognition {
      continuous = false;
      interimResults = true;
      lang = "en-US";
      onresult: ((event: unknown) => void) | null = null;
      onerror: (() => void) | null = null;
      onend: (() => void) | null = null;

      start() {
        setTimeout(() => {
          this.onresult?.({
            resultIndex: 0,
            results: [
              {
                isFinal: true,
                0: { transcript: "I go to school yesterday" },
              },
            ],
          });
          this.onend?.();
        }, 50);
      }

      stop() {
        this.onend?.();
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).SpeechRecognition = MockSpeechRecognition;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).webkitSpeechRecognition = MockSpeechRecognition;

    class MockSpeechSynthesisUtterance {
      lang = "en-US";
      rate = 1;
      pitch = 1;
      volume = 1;
      voice: SpeechSynthesisVoice | null = null;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      onpause: (() => void) | null = null;
      onresume: (() => void) | null = null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

    let speaking = false;
    let paused = false;
    let currentUtterance: MockSpeechSynthesisUtterance | null = null;

    const synthesis = {
      get speaking() {
        return speaking;
      },
      get paused() {
        return paused;
      },
      getVoices: () =>
        [{ name: "Google US English", lang: "en-US" }] as SpeechSynthesisVoice[],
      cancel: () => {
        speaking = false;
        paused = false;
        currentUtterance?.onend?.();
        currentUtterance = null;
      },
      pause: () => {
        if (speaking && !paused) {
          paused = true;
          currentUtterance?.onpause?.();
        }
      },
      resume: () => {
        if (paused) {
          paused = false;
          currentUtterance?.onresume?.();
        }
      },
      speak: (utterance: MockSpeechSynthesisUtterance) => {
        currentUtterance = utterance;
        speaking = true;
        paused = false;
        setTimeout(() => utterance.onstart?.(), 0);
      },
    };

    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: synthesis,
    });
  });
}

export async function mockCoachApi(page: Page) {
  await page.route("**/api/coach", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        response:
          "Nice try! You said **I go to school yesterday**. The correct form is **I went to school yesterday**.",
      }),
    });
  });
}

export async function mockTtsApiFailure(page: Page) {
  await page.route("**/api/tts", async (route) => {
    await route.fulfill({ status: 503, body: "TTS unavailable" });
  });
}
