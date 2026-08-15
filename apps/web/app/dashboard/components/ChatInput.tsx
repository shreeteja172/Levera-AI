import React, { useRef, useEffect } from "react";
import { Send, ChevronDown, Lightbulb } from "lucide-react";
import { SUPPORTED_MODELS, type ModelOption } from "@/lib/ai/model-list";
import {
  ModelSelector,
  ModelSelectorTrigger,
  ModelSelectorContent,
  ModelSelectorInput,
  ModelSelectorList,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorItem,
  ModelSelectorName,
  ModelSelectorLogo,
} from "@/components/ai-elements/model-selector";

interface ChatInputProps {
  className?: string;
  inputMessage: string;
  setInputMessage: (val: string) => void;
  loading: boolean;
  chatLoading: boolean;
  sessionPending: boolean;
  isLanguageUnset: boolean;
  mounted: boolean;
  selectedModel: ModelOption;
  setSelectedModel: (model: ModelOption) => void;
  isModelSelectorOpen: boolean;
  setIsModelSelectorOpen: (open: boolean) => void;
  onSendMessage: () => void;
  setOnboardingOpen: (open: boolean) => void;
  hintMode: boolean;
  onToggleHintMode: (val: boolean) => void;
}

export function ChatInput({
  className = "max-w-5xl",
  inputMessage,
  setInputMessage,
  loading,
  chatLoading,
  sessionPending,
  isLanguageUnset,
  mounted,
  selectedModel,
  setSelectedModel,
  isModelSelectorOpen,
  setIsModelSelectorOpen,
  onSendMessage,
  setOnboardingOpen,
  hintMode,
  onToggleHintMode,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [inputMessage]);

  return (
    <div
      className={`w-full ${className} mx-auto relative flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl p-2 focus-within:border-zinc-300 dark:focus-within:border-zinc-800 transition-all pointer-events-auto shadow-2xl`}
    >
      <textarea
        ref={textareaRef}
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
          }
        }}
        disabled={
          !mounted ||
          loading ||
          chatLoading ||
          sessionPending ||
          isLanguageUnset
        }
        placeholder={
          isLanguageUnset
            ? "Select a preferred programming language to start chatting..."
            : "Type a message or paste a DSA problem description..."
        }
        rows={1}
        className="w-full max-h-32 resize-none outline-none border-none bg-transparent py-2.5 px-3 text-sm text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <div className="flex items-center justify-between border-t border-zinc-200/70 dark:border-zinc-850/50 mt-1 pt-2 px-2">
        <div className="flex items-center gap-2">
          <ModelSelector
            open={isModelSelectorOpen}
            onOpenChange={
              chatLoading || sessionPending ? () => {} : setIsModelSelectorOpen
            }
          >
            <ModelSelectorTrigger
              render={
                <button
                  disabled={
                    !mounted || chatLoading || loading || sessionPending
                  }
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ModelSelectorLogo
                    provider={selectedModel.logoProvider}
                    className="size-3.5"
                  />
                  <span className="font-medium">{selectedModel.name}</span>
                  <ChevronDown size={12} className="text-zinc-500" />
                </button>
              }
            />
            <ModelSelectorContent className="w-[300px]">
              <ModelSelectorInput placeholder="Search models..." />
              <ModelSelectorList>
                <ModelSelectorEmpty>No model found.</ModelSelectorEmpty>
                <ModelSelectorGroup heading="Available Models">
                  {SUPPORTED_MODELS.map((model) => (
                    <ModelSelectorItem
                      key={model.id}
                      value={model.name}
                      onSelect={() => {
                        setSelectedModel(model);
                        setIsModelSelectorOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition-colors text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white data-[selected=true]:bg-zinc-100 dark:data-[selected=true]:bg-zinc-900/80 data-[selected=true]:text-zinc-900 dark:data-[selected=true]:text-white"
                    >
                      <ModelSelectorLogo
                        provider={model.logoProvider}
                        className="size-3.5"
                      />
                      <ModelSelectorName>{model.name}</ModelSelectorName>
                    </ModelSelectorItem>
                  ))}
                </ModelSelectorGroup>
              </ModelSelectorList>
            </ModelSelectorContent>
          </ModelSelector>

          {mounted && !isLanguageUnset && (
            <button
              disabled={loading || chatLoading || sessionPending}
              onClick={() => onToggleHintMode(!hintMode)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${
                hintMode
                  ? "bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500/15 hover:border-orange-500/40 shadow-sm shadow-orange-500/5 scale-102 hover:scale-105"
                  : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:scale-[1.01]"
              }`}
              title="Progressive Hint Mode: Unlocks clues step-by-step instead of showing code solutions immediately."
            >
              <Lightbulb
                size={13.5}
                className={
                  hintMode
                    ? "fill-orange-500/20 text-orange-600 dark:text-orange-400 animate-pulse"
                    : "text-zinc-500"
                }
              />
              <span className="hidden sm:inline font-semibold">
                Hint Mode: {hintMode ? "ON" : "OFF"}
              </span>
            </button>
          )}
        </div>

        {isLanguageUnset ? (
          <button
            onClick={() => setOnboardingOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-lg shadow-orange-600/10"
          >
            Select Language
          </button>
        ) : (
          <button
            onClick={onSendMessage}
            disabled={
              !mounted ||
              loading ||
              chatLoading ||
              sessionPending ||
              !inputMessage.trim()
            }
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-white hover:bg-orange-500 disabled:opacity-30 disabled:hover:bg-orange-600 transition-colors shadow-lg shadow-orange-600/10 cursor-pointer animate-in fade-in zoom-in duration-200"
          >
            <Send size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
