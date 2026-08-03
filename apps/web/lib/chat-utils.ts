export interface ParsedContent {
  type: "text" | "solutions" | "hints";
  text?: string;
  brute?: string;
  better?: string;
  optimal?: string;
  hint1?: string;
  hint2?: string;
  pattern?: string;
  pseudocode?: string;
}

export function parseMessageContent(content: string): ParsedContent[] {
  let cleanContent = content
    .replace(/<problem>([\s\S]*?)<\/problem>/g, "")
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .trim();

  if (cleanContent.includes("<think>")) {
    cleanContent = cleanContent.substring(0, cleanContent.indexOf("<think>")).trim();
  }

  const hintsStartIndex = cleanContent.indexOf("<hints>");
  const solutionsStartIndex = cleanContent.indexOf("<solutions>");

  if (hintsStartIndex === -1 && solutionsStartIndex === -1) {
    return [{ type: "text", text: cleanContent }];
  }

  const parts: ParsedContent[] = [];

  const firstBlockStart =
    hintsStartIndex !== -1 && solutionsStartIndex !== -1
      ? Math.min(hintsStartIndex, solutionsStartIndex)
      : hintsStartIndex !== -1
        ? hintsStartIndex
        : solutionsStartIndex;

  const textBefore = cleanContent.substring(0, firstBlockStart);
  if (textBefore.trim()) {
    parts.push({ type: "text", text: textBefore });
  }

  const extractTagContent = (
    contentStr: string,
    tagName: string,
  ): string | undefined => {
    const startTag = `<${tagName}>`;
    const endTag = `</${tagName}>`;
    const startIdx = contentStr.indexOf(startTag);
    if (startIdx === -1) return undefined;

    const endIdx = contentStr.indexOf(endTag, startIdx);
    if (endIdx !== -1) {
      return contentStr.substring(startIdx + startTag.length, endIdx).trim();
    } else {
      const remaining = contentStr.substring(startIdx + startTag.length);
      const nextTagMatch =
        /<(brute|better|optimal|hint1|hint2|pattern|pseudocode|hints|solutions)>/g.exec(
          remaining,
        );
      if (nextTagMatch) {
        return remaining.substring(0, nextTagMatch.index).trim();
      }
      return remaining.trim();
    }
  };

  if (hintsStartIndex !== -1) {
    const hintsEndTagIndex = cleanContent.indexOf("</hints>", hintsStartIndex);
    let hintsContent = "";
    if (hintsEndTagIndex !== -1) {
      hintsContent = cleanContent.substring(
        hintsStartIndex + "<hints>".length,
        hintsEndTagIndex,
      );
    } else {
      if (solutionsStartIndex !== -1 && solutionsStartIndex > hintsStartIndex) {
        hintsContent = cleanContent.substring(
          hintsStartIndex + "<hints>".length,
          solutionsStartIndex,
        );
      } else {
        hintsContent = cleanContent.substring(
          hintsStartIndex + "<hints>".length,
        );
      }
    }

    const hint1 = extractTagContent(hintsContent, "hint1");
    const hint2 = extractTagContent(hintsContent, "hint2");
    const pattern = extractTagContent(hintsContent, "pattern");
    const pseudocode = extractTagContent(hintsContent, "pseudocode");

    if (
      hint1 !== undefined ||
      hint2 !== undefined ||
      pattern !== undefined ||
      pseudocode !== undefined
    ) {
      parts.push({
        type: "hints",
        hint1,
        hint2,
        pattern,
        pseudocode,
      });
    }
  }

  let textAfter = "";
  if (solutionsStartIndex !== -1) {
    const solutionsEndTagIndex = cleanContent.indexOf(
      "</solutions>",
      solutionsStartIndex,
    );
    let solutionsContent = "";

    if (solutionsEndTagIndex !== -1) {
      solutionsContent = cleanContent.substring(
        solutionsStartIndex + "<solutions>".length,
        solutionsEndTagIndex,
      );
      textAfter = cleanContent.substring(
        solutionsEndTagIndex + "</solutions>".length,
      );
    } else {
      solutionsContent = cleanContent.substring(
        solutionsStartIndex + "<solutions>".length,
      );
    }

    const brute = extractTagContent(solutionsContent, "brute");
    const better = extractTagContent(solutionsContent, "better");
    const optimal = extractTagContent(solutionsContent, "optimal");

    if (brute !== undefined || better !== undefined || optimal !== undefined) {
      parts.push({
        type: "solutions",
        brute,
        better,
        optimal,
      });
    }
  }

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

  const parsed = parseMessageContent(content);
  const solutions = parsed.find((part) => part.type === "solutions");
  const hints = parsed.find((part) => part.type === "hints");

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
    hints: hints
      ? {
          hint1: hints.hint1 || null,
          hint2: hints.hint2 || null,
          pattern: hints.pattern || null,
          pseudocode: hints.pseudocode || null,
        }
      : null,
    language,
  };
}
