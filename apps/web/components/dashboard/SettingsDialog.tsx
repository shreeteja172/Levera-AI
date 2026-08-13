"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PROGRAMMING_LANGUAGES,
  type ProgrammingLanguage,
} from "@/lib/constants/programming-languages";
import axios from "axios";
import { toast } from "react-hot-toast";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { data: sessionData, refetch } = useSession();
  const currentLang = (sessionData?.user as any)?.preferredLanguage as
    ProgrammingLanguage | undefined;

  const [selectedLang, setSelectedLang] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentLang) {
      setSelectedLang(currentLang);
    }
  }, [currentLang, open]);

  const handleSave = async () => {
    if (!selectedLang) {
      toast.error("Please select a language");
      return;
    }
    setLoading(true);
    try {
      await axios.patch("/api/user/preferences", {
        preferredLanguage: selectedLang,
      });
      toast.success("Preferences updated successfully");
      await refetch();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update preferences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border border-zinc-900 text-zinc-100 p-6 rounded-2xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-semibold text-white tracking-tight">
            Settings
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-400">
            Customize your experience on Levera.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Preferred Programming Language
            </label>
            <Select
              value={selectedLang}
              onValueChange={(value) => setSelectedLang(value ?? "")}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language..." />
              </SelectTrigger>
              <SelectContent>
                {PROGRAMMING_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-end gap-2 pt-2">
          <button
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-zinc-850 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 text-sm font-medium transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Save Changes
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
