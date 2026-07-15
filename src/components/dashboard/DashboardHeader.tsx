import { Bell, Settings, LogOut, Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useGetNotificationCountQuery } from "@/services/notificationsApi";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DashboardHeaderProps {
  onMenuClick?: () => void;
  sidebarOpen?: boolean;
  sidebarCollapsed?: boolean;
}

export const DashboardHeader = ({ onMenuClick, sidebarOpen, sidebarCollapsed }: DashboardHeaderProps) => {
  const { user, logout } = useAuth();
  const { data: countData } = useGetNotificationCountQuery(undefined, { pollingInterval: 60000 });
  const unreadCount = countData?.unreadCount ?? 0;

  return (
    <header
      className={`h-[var(--header-height)] border-b border-border/60 bg-background/80 glass-subtle sticky top-0 z-40 transition-all duration-300 print:hidden ${
        sidebarCollapsed ? "md:ml-16" : "md:ml-64"
      }`}
    >
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left: Mobile menu */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 rounded-lg"
            onClick={onMenuClick}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>

          {/* Page context - mobile only (sidebar shows brand on desktop) */}
          <div className="md:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xs font-display">B</span>
            </div>
            <span className="text-sm font-semibold text-foreground font-display tracking-tight">Bami Host</span>
          </div>
        </div>

        {/* Right: Utility actions */}
        <div className="flex items-center gap-1">
          {/* Search trigger (decorative for now) */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center leading-none ring-2 ring-background">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </Button>

          {/* Divider */}
          <div className="hidden sm:block w-px h-5 bg-border mx-1" />

          {/* User */}
          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex flex-col items-end leading-none">
              <span className="text-sm font-medium text-foreground">{user?.name}</span>
              <span className="text-[11px] text-muted-foreground capitalize">{user?.role?.replace(/_/g, " ")}</span>
            </div>
            <Avatar className="h-8 w-8 ring-2 ring-background">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-xs font-semibold font-display">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Logout */}
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="hidden sm:flex h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
