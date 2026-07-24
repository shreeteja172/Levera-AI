export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  logoProvider: string;
}

export const SUPPORTED_MODELS: ModelOption[] = [
  {
    id: "openai/gpt-oss-120b",
    name: "GPT OSS 120B",
    provider: "groq",
    logoProvider: "groq",
  },
  /*
  {
    id: "llama-3.3-70b-versatile",
    name: "Llama 3.3 70B",
    provider: "groq",
    logoProvider: "groq",
  },
  {
    id: "llama-3.1-8b-instant",
    name: "Llama 3.1 8B",
    provider: "groq",
    logoProvider: "groq",
  },
  {
    id: "mixtral-8x7b-32768",
    name: "Mixtral 8x7B",
    provider: "groq",
    logoProvider: "groq",
  },
  */
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    logoProvider: "openai",
  },
  /*
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    logoProvider: "openai",
  },
  */
  {
    id: "glm-4-flash",
    name: "GLM-4 Flash",
    provider: "zhipu",
    logoProvider: "zhipuai",
  },
  /*
  {
    id: "glm-4",
    name: "GLM-4",
    provider: "zhipu",
    logoProvider: "zhipuai",
  },
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
