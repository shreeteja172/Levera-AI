import { SkeletonBlock } from "@/components/ui/skeleton-block";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white relative">
      <header className="flex h-14 items-center justify-between border-b border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 px-6 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
          <SkeletonBlock width="120px" height="16px" rounded="rounded-lg" />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 pt-6 pb-32 space-y-6">
        <div className="max-w-2xl mx-auto h-full flex flex-col justify-center items-center text-center space-y-6 py-12 animate-pulse">
          <div className="space-y-3 flex flex-col items-center">
            <SkeletonBlock width="320px" height="40px" rounded="rounded-lg" className="bg-zinc-200 dark:bg-zinc-800" />
            <SkeletonBlock width="440px" height="16px" rounded="rounded-lg" className="bg-zinc-200/60 dark:bg-zinc-800/60" />
          </div>

          <div className="w-full max-w-3xl">
            <div className="w-full h-24 bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-850 rounded-2xl p-4 flex flex-col justify-between">
              <SkeletonBlock width="40%" height="14px" rounded="rounded-md" className="bg-zinc-200 dark:bg-zinc-800" />
              <div className="flex justify-between items-center pt-2 border-t border-zinc-200/50 dark:border-zinc-850/50">
                <SkeletonBlock width="120px" height="24px" rounded="rounded-lg" className="bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-9 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-850" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl pt-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/40 dark:bg-zinc-900/10 h-12"
              >
                <SkeletonBlock width="75%" height="12px" rounded="rounded-md" className="bg-zinc-200/60 dark:bg-zinc-800/60" />
                <div className="w-3.5 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
