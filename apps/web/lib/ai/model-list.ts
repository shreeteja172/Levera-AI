export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  logoProvider: string;
}

// The first entry is the default selection in the chat input.
export const SUPPORTED_MODELS: ModelOption[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    logoProvider: "openai",
  },
  {
    id: "openai/gpt-oss-120b",
    name: "GPT OSS 120B",
    provider: "groq",
    logoProvider: "groq",
  },
  {
    id: "openai/gpt-oss-20b",
    name: "GPT OSS 20B",
    provider: "groq",
    logoProvider: "groq",
  },
  {
    id: "qwen/qwen3.6-27b",
    name: "Qwen3.6 27B",
    provider: "groq",
    logoProvider: "qwen",
  },
  /*
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    logoProvider: "openai",
  },
  */
  /*
  {
    id: "glm-4-flash",
    name: "GLM-4 Flash",
    provider: "zhipu",
    logoProvider: "zhipuai",
  },
  */

  /*
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B (OR)",
    provider: "openrouter",
    logoProvider: "openrouter",
  },
  {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek V3 (OR)",
    provider: "openrouter",
    logoProvider: "deepseek",
  },
  */
];
