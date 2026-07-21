interface ProblemData {
  title: string;
  slug: string;
  difficulty: string;
  description: string;
  examples: string[];
  constraints: string[];
  url: string;
}

const EXPIRY_MS = 24 * 60 * 60 * 1000;
const activeControllers = new Map<string, AbortController>();

chrome.storage.session.get(null).then((allData) => {
  const updates: { [key: string]: any } = {};
  for (const [key, value] of Object.entries(allData)) {
    if (
      value &&
      typeof value === "object" &&
      (value as any).status === "loading"
    ) {
      updates[key] = {
        status: "error",
        problem: (value as any).problem || null,
        error: "Analysis was interrupted. Please try again.",
        timestamp: Date.now(),
      };
    }
  }
  if (Object.keys(updates).length > 0) {
    chrome.storage.session.set(updates);
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith("keepalive-")) {
    console.log("Keepalive ping for", alarm.name);
  }
});

async function pruneStaleEntries() {
  const allData = await chrome.storage.session.get(null);
  const now = Date.now();
  const keysToRemove: string[] = [];
  for (const [key, value] of Object.entries(allData)) {
    if (value && typeof value === "object" && (value as any).timestamp) {
      if (now - (value as any).timestamp > EXPIRY_MS) {
        keysToRemove.push(key);
      }
    }
  }
  if (keysToRemove.length > 0) {
    await chrome.storage.session.remove(keysToRemove);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_ANALYSIS") {
    const { slug, tabId } = message;
    if (slug && tabId) {
      analyzeProblemInBackground(slug, tabId);
    }
    return false;
  }
  return true;
});

async function analyzeProblemInBackground(slug: string, tabId: number) {
  const existing = await chrome.storage.session.get(slug);
  if (existing[slug] && (existing[slug] as any).status === "loading") {
    const oldController = activeControllers.get(slug);
    if (oldController) {
      oldController.abort();
      activeControllers.delete(slug);
    }
  }

  const controller = new AbortController();
  activeControllers.set(slug, controller);

  chrome.alarms.create(`keepalive-${slug}`, { periodInMinutes: 1 });

  await pruneStaleEntries().catch((err) =>
    console.error("Pruning error:", err),
  );

  let problem: ProblemData | null = null;
  try {
    await chrome.storage.session.set({
      [slug]: {
        status: "loading",
        problem: null,
        answer: "",
        error: "",
        timestamp: Date.now(),
      },
    });

    try {
      problem = await chrome.tabs.sendMessage(tabId, {
        type: "GET_PROBLEM",
      });
    } catch (err: any) {
      throw new Error(
        "Content script not loaded. Refresh the LeetCode page and try again.",
      );
    }

    if (!problem) {
      throw new Error("Failed to scrape problem details.");
    }

    await chrome.storage.session.set({
      [slug]: {
        status: "loading",
        problem,
        answer: "",
        error: "",
        timestamp: Date.now(),
      },
    });

    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
      throw new Error("API URL not configured in extension.");
    }

    const res = await fetch(`${apiUrl}/api/ai/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(problem),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with ${res.status}`);
    }

    const data = await res.json();
    if (!data.answer) {
      throw new Error("No answer returned from AI API.");
    }

    if (controller.signal.aborted) return;

    await chrome.storage.session.set({
      [slug]: {
        status: "success",
        problem,
        answer: data.answer,
        error: "",
        timestamp: Date.now(),
      },
    });
  } catch (err: any) {
    if (controller.signal.aborted) {
      console.log("Analysis for slug aborted:", slug);
      return;
    }

    const errorMsg = err.message || "Something went wrong";
    await chrome.storage.session.set({
      [slug]: {
        status: "error",
        problem,
        answer: "",
        error: errorMsg,
        timestamp: Date.now(),
      },
    });
  } finally {
    if (activeControllers.get(slug) === controller) {
      activeControllers.delete(slug);
    }
    chrome.alarms.clear(`keepalive-${slug}`);
  }
}
