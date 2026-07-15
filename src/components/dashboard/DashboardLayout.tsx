import { ReactNode, useState } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { AIChatWidget } from "@/components/skills/AIChatWidget";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

export const DashboardLayout = ({ children, currentView, onViewChange }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Skip navigation — visible on focus for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>
      <DashboardHeader
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
      />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar
          currentView={currentView}
          onViewChange={(view) => {
            onViewChange(view);
            if (window.innerWidth < 768) {
              setSidebarOpen(false);
            }
          }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(c => !c)}
        />
        <main
          id="main-content"
          className={cn(
            "flex-1 overflow-auto transition-all duration-300 ease-out print:ml-0 print:bg-white",
            sidebarCollapsed ? "md:ml-16" : "md:ml-64"
          )}
          style={{ minHeight: "calc(100vh - var(--header-height))" }}
        >
          <div
            key={currentView}
            className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto animate-fade-in print:p-0 print:max-w-none"
          >
            {children}
          </div>
        </main>
      </div>
      <AIChatWidget floating />
    </div>
  );
};
