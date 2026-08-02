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

  const solutionsStartIndex = cleanContent.indexOf("<solutions>");
  if (solutionsStartIndex === -1) {
    return [{ type: "text", text: cleanContent }];
  }

  const parts: ParsedContent[] = [];

  const textBefore = cleanContent.substring(0, solutionsStartIndex);
  if (textBefore.trim()) {
    parts.push({ type: "text", text: textBefore });
  }

  const solutionsEndTagIndex = cleanContent.indexOf("</solutions>", solutionsStartIndex);
  let solutionsContent = "";
  let textAfter = "";

  if (solutionsEndTagIndex !== -1) {
    solutionsContent = cleanContent.substring(
      solutionsStartIndex + "<solutions>".length,
      solutionsEndTagIndex
    );
    textAfter = cleanContent.substring(solutionsEndTagIndex + "</solutions>".length);
  } else {
    solutionsContent = cleanContent.substring(solutionsStartIndex + "<solutions>".length);
  }

  const extractTagContent = (contentStr: string, tagName: string): string | undefined => {
    const startTag = `<${tagName}>`;
    const endTag = `</${tagName}>`;
    const startIdx = contentStr.indexOf(startTag);
    if (startIdx === -1) return undefined;

    const endIdx = contentStr.indexOf(endTag, startIdx);
    if (endIdx !== -1) {
      return contentStr.substring(startIdx + startTag.length, endIdx).trim();
    } else {
      const remaining = contentStr.substring(startIdx + startTag.length);
      const nextTagMatch = /<(brute|better|optimal)>/g.exec(remaining);
      if (nextTagMatch) {
        return remaining.substring(0, nextTagMatch.index).trim();
      }
      return remaining.trim();
    }
  };

  const brute = extractTagContent(solutionsContent, "brute");
  const better = extractTagContent(solutionsContent, "better");
  const optimal = extractTagContent(solutionsContent, "optimal");

  parts.push({
    type: "solutions",
    brute,
    better,
    optimal,
  });

  if (textAfter.trim()) {
    parts.push({ type: "text", text: textAfter });
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
