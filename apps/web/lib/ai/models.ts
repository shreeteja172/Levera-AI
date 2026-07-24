import { createOpenAI } from "@ai-sdk/openai";
import { createGroq } from "@ai-sdk/groq";
import type { LanguageModel } from "ai";
import { SUPPORTED_MODELS } from "./model-list";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const zhipu = createOpenAI({
  apiKey: process.env.ZHIPU_API_KEY,
  baseURL: "https://open.bigmodel.cn/api/paas/v4/",
});

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export function getModel(provider: string, model: string): LanguageModel {
  const isSupported = SUPPORTED_MODELS.some(
    (m) => m.provider === provider && m.id === model,
  );

  let targetProvider = provider;
  let targetModel = model;

  if (!isSupported) {
    console.warn(
      `Requested unsupported model: ${provider}/${model}. Falling back to default.`,
    );
    targetProvider = "groq";
    targetModel = "openai/gpt-oss-120b";
  }

  if (targetProvider === "openrouter" && !process.env.OPENROUTER_API_KEY) {
    targetProvider = "groq";
    targetModel = "openai/gpt-oss-120b";
  }

  switch (targetProvider) {
    case "groq":
      return groq(targetModel);

    case "openai":
      return openai(targetModel);

    case "zhipu":
      return zhipu(targetModel);

    case "openrouter":
      return openrouter(targetModel);

    default:
      throw new Error(`Unknown provider: ${targetProvider}`);
  }
}
