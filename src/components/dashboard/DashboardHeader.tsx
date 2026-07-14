import { Bell, Settings, User, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useGetNotificationCountQuery } from "@/services/notificationsApi";

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
    <header className={`h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300 print:hidden ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden" 
            onClick={onMenuClick}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg md:text-xl bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent tracking-tight">Bami Host</span>
              {user && (
                <span className="hidden sm:block text-xs text-muted-foreground -mt-1">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Portal
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="hidden sm:flex relative">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
          
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <Settings className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center space-x-1 md:space-x-2">
            {user && (
              <span className="text-sm font-medium hidden md:block">{user.name}</span>
            )}
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <User className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Logout button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout}
            className="flex items-center justify-center p-2 sm:px-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 hover:text-red-500 border border-red-500/20 hover:border-red-500/30 transition-all duration-200 btn-interactive"
            title="Logout from Bami Host"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
