export interface ParsedContent {
  type: "text" | "solutions";
  text?: string;
  brute?: string;
  better?: string;
  optimal?: string;
}

export function parseMessageContent(content: string): ParsedContent[] {
  const cleanContent = content
    .replace(/<problem>([\s\S]*?)<\/problem>/g, "")
    .trim();
  const parts: ParsedContent[] = [];
  const regex = /<solutions>([\s\S]*?)<\/solutions>/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(cleanContent)) !== null) {
    const textBefore = cleanContent.substring(lastIndex, match.index);
    if (textBefore.trim()) {
      parts.push({ type: "text", text: textBefore });
    }

    const solutionsContent = match[1] ?? "";

    const bruteMatch = /<brute>([\s\S]*?)<\/brute>/.exec(solutionsContent);
    const betterMatch = /<better>([\s\S]*?)<\/better>/.exec(solutionsContent);
    const optimalMatch = /<optimal>([\s\S]*?)<\/optimal>/.exec(
      solutionsContent,
    );

    parts.push({
      type: "solutions",
      brute: bruteMatch?.[1]?.trim(),
      better: betterMatch?.[1]?.trim(),
      optimal: optimalMatch?.[1]?.trim(),
    });

    lastIndex = regex.lastIndex;
  }

  const textAfter = cleanContent.substring(lastIndex);
  if (textAfter.trim()) {
    parts.push({ type: "text", text: textAfter });
  }

  if (parts.length === 0) {
    parts.push({ type: "text", text: cleanContent });
  }

  return parts;
}

export function createSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function extractProblemData(content: string) {
  const problemMatch = /<problem>([\s\S]*?)<\/problem>/.exec(content);

  const solutions = parseMessageContent(content).find(
    (part) => part.type === "solutions",
  );

  let language = "cpp";
  const solutionText =
    solutions?.optimal || solutions?.better || solutions?.brute;
  if (solutionText) {
    const langMatch = /```(\w+)/.exec(solutionText);
    if (langMatch?.[1]) {
      const parsedLang = langMatch[1].toLowerCase();
      if (parsedLang === "py") {
        language = "python";
      } else if (parsedLang === "js") {
        language = "javascript";
      } else if (parsedLang === "ts") {
        language = "typescript";
      } else if (parsedLang === "cs") {
        language = "csharp";
      } else {
        language = parsedLang;
      }
    }
  }

  return {
    title: problemMatch?.[1]?.trim() || "Unknown Problem",
    brute: solutions?.brute || null,
    better: solutions?.better || null,
    optimal: solutions?.optimal || null,
    language,
  };
}
