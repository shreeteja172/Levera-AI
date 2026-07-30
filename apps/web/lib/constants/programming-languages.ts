export const PROGRAMMING_LANGUAGES = [
  { value: "cpp", label: "C++" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
] as const;

export type ProgrammingLanguage =
  (typeof PROGRAMMING_LANGUAGES)[number]["value"];
