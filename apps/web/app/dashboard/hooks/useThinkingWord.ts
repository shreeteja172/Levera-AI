import { useState, useEffect } from "react";

export function useThinkingWord(loading: boolean) {
  const [thinkingWord, setThinkingWord] = useState("thinking");

  useEffect(() => {
    if (!loading) {
      setThinkingWord("thinking");
      return;
    }

    const words = [
      "thinking",
      "traversing",
      "untangling",
      "backtracking",
      "narrowing it down",
      "pruning branches",
      "recursing",
      "weighing trade-offs",
      "converging",
      "memoizing",
      "partitioning",
      "chasing pointers",
      "pondering",
      "triangulating",
      "unwinding the stack",
      "reckoning",
      "hunting the pattern",
      "optimizing",
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % words.length;
      setThinkingWord(words[currentIndex]!);
    }, 2000);

    return () => clearInterval(interval);
  }, [loading]);

  return thinkingWord;
}
