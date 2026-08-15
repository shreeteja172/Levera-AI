import { cn } from "@/lib/utils";

interface SkeletonBlockProps {
  width?: string;
  height?: string;
  className?: string;
  rounded?: string;
}

export function SkeletonBlock({
  width = "100%",
  height = "16px",
  className,
  rounded = "rounded-md",
}: SkeletonBlockProps) {
  return (
    <div
      className={cn("animate-pulse bg-zinc-200/60 dark:bg-zinc-800/60", rounded, className)}
      style={{ width, height }}
    />
  );
}
