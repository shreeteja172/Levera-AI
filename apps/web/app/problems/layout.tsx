import { TooltipProvider } from "@/components/ui/tooltip";

export default function ProblemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-zinc-950 text-zinc-200">
        {children}
      </div>
    </TooltipProvider>
  );
}
