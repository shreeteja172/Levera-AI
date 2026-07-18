console.log("🚀 Levera Scraper Loaded");

export interface ProblemData {
  title: string;
  slug: string;
  difficulty: string;
  description: string;
  examples: string[];
  constraints: string[];
  url: string;
}

function getTitle(): string {
  return (
    document.querySelector('div[data-cy="question-title"]')?.textContent?.trim() ||
    document.title.replace(" - LeetCode", "")
  );
}

function getDifficulty(): string {
  const difficulty =
    [...document.querySelectorAll("div,span,p")].find((el) =>
      ["Easy", "Medium", "Hard"].includes(el.textContent?.trim() || "")
    )?.textContent || "";

  return difficulty.trim();
}

function getDescription(): string {
  const container = document.querySelector(
    '[data-track-load="description_content"]'
  );

  if (!container) return "";

  return container.textContent?.trim() || "";
}

function getExamples(description: string): string[] {
  const matches = description.match(/Example\s*\d*:[\s\S]*?(?=Example\s*\d*:|Constraints:|$)/g);

  return matches ?? [];
}

function getConstraints(description: string): string[] {
  const match = description.match(/Constraints:[\s\S]*$/);

  if (!match) return [];

  return match[0]
    .replace("Constraints:", "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

function scrapeProblem(): ProblemData {
  const description = getDescription();

  return {
    title: getTitle(),
    slug: location.pathname.split("/")[2] ?? "",
    difficulty: getDifficulty(),
    description,
    examples: getExamples(description),
    constraints: getConstraints(description),
    url: location.href,
  };
}

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.type === "GET_PROBLEM") {
    const problem = scrapeProblem();

    console.log("📄 Problem scraped:", problem);

    sendResponse(problem);
  }

  return true;
});