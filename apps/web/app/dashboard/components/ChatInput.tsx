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

const MAX_TEXTAREA_HEIGHT = 160;

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

  const isBusy = !mounted || loading || chatLoading || sessionPending;
  const canSend = !isBusy && !isLanguageUnset && inputMessage.trim().length > 0;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const fullHeight = textarea.scrollHeight;
    textarea.style.height = `${Math.min(fullHeight, MAX_TEXTAREA_HEIGHT)}px`;
    textarea.style.overflowY =
      fullHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
  }, [inputMessage]);

  return (
    <div
      className={`w-full ${className} mx-auto relative flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-2 focus-within:border-zinc-300 dark:focus-within:border-white/25 transition-colors pointer-events-auto shadow-lg shadow-black/5 dark:shadow-black/40`}
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
        disabled={isBusy || isLanguageUnset}
        placeholder={
          isLanguageUnset
            ? "Select a preferred programming language to start chatting..."
            : "Type a message or paste a DSA problem description..."
        }
        rows={1}
        className="w-full resize-none outline-none border-none bg-transparent py-3 px-3 text-[15px] leading-relaxed text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <div className="flex items-center justify-between border-t border-zinc-200/70 dark:border-white/10 mt-1 pt-2 px-2">
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
                  disabled={isBusy}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/25 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
              disabled={isBusy}
              onClick={() => onToggleHintMode(!hintMode)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${
                hintMode
                  ? "bg-[#FF5A1F]/10 border-[#FF5A1F]/30 text-[#FF5A1F] hover:bg-[#FF5A1F]/15 hover:border-[#FF5A1F]/50"
                  : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/25 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
              title="Progressive Hint Mode: Unlocks clues step-by-step instead of showing code solutions immediately."
            >
              <Lightbulb
                size={13.5}
                className={
                  hintMode ? "fill-[#FF5A1F]/20 text-[#FF5A1F]" : "text-zinc-500"
                }
              />
              <span className="hidden sm:inline">
                Hint Mode: {hintMode ? "ON" : "OFF"}
              </span>
            </button>
          )}
        </div>

        {isLanguageUnset ? (
          <button
            onClick={() => setOnboardingOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF5A1F] hover:bg-[#ff6b33] text-white text-xs transition-colors cursor-pointer"
          >
            Select Language
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            <span
              className={`hidden sm:block text-[11px] text-zinc-400 dark:text-zinc-600 transition-opacity duration-200 ${
                canSend ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden="true"
            >
              Enter to send
            </span>
            <button
              onClick={() => onSendMessage()}
              disabled={!canSend}
              aria-label="Send message"
              title={canSend ? "Send message" : "Type a message to send"}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${
                canSend
                  ? "bg-[#FF5A1F] text-white hover:bg-[#ff6b33] cursor-pointer"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
              }`}
            >
              <Send size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
