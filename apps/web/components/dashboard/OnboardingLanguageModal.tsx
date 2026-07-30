"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  PROGRAMMING_LANGUAGES,
  type ProgrammingLanguage,
} from "@/lib/constants/programming-languages";
import axios from "axios";
import { toast } from "react-hot-toast";

interface OnboardingLanguageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function OnboardingLanguageModal({
  open,
  onOpenChange,
  onSuccess,
}: OnboardingLanguageModalProps) {
  const [loading, setLoading] = useState(false);

  const handleSelectLanguage = async (lang: ProgrammingLanguage) => {
    setLoading(true);
    try {
      await axios.patch("/api/user/preferences", { preferredLanguage: lang });
      toast.success("Preferred language saved");
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save preference");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border border-zinc-900 text-zinc-100 p-6 rounded-2xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-semibold text-white tracking-tight">
            Choose Preferred Language
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-400">
            Select your programming language. Levera AI will generate code
            examples in this language.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {PROGRAMMING_LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              disabled={loading}
              onClick={() => handleSelectLanguage(lang.value)}
              className="flex items-center justify-center p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-orange-500/10 hover:border-orange-500/30 text-zinc-300 hover:text-white transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {lang.label}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
