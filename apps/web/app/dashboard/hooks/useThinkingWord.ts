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
      "cogitating",
      "sleuthing",
      "mulling",
      "weighing",
      "honing",
      "fathoming",
      "sifting",
      "crystalising",
      "musing",
      "pondering",
      "contemplating",
      "figuring",
      "reckoning",
      "untangling",
      "triangluating",
      "picturing",
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % words.length;
      setThinkingWord(words[currentIndex]!);
    }, 1500);

    return () => clearInterval(interval);
  }, [loading]);

  return thinkingWord;
}
