import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function Shell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed on mobile, static on desktop */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-200 ease-out",
          "md:relative md:translate-x-0 md:flex-shrink-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div
          className="flex items-center gap-3 h-14 px-4 md:hidden flex-shrink-0"
          style={{ borderBottom: "1px solid #111" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md text-white/50 hover:text-white transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <ShieldCheck className="h-4 w-4 text-white/70" />
          <span className="font-mono text-sm font-bold tracking-widest text-white/90">PROOFSTORE</span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
