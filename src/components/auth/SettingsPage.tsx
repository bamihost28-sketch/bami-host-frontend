import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "./UserProfile";
import { useAuth } from "@/contexts/AuthContext";
import { SecuritySettings } from "../settings/SecuritySettings";
import { NotificationSettings } from "../settings/NotificationSettings";
import { AppearanceSettings } from "../settings/AppearanceSettings";
import { ChangeEmailModal } from "./ChangeEmailModal";
import "./settings-responsive.css";
import {
  Settings,
  User,
  Shield,
  Bell,
  Monitor,
  Palette,
  HelpCircle,
  FileText,
  CreditCard,
  Database,
  Zap,
  ChevronRight,
  ArrowLeft,
  Menu,
  X
} from "lucide-react";

type SettingSection =
  | 'profile'
  | 'security'
  | 'notifications'
  | 'appearance'
  | 'billing'
  | 'privacy'
  | 'help'
  | 'about'
  | 'integrations'
  | 'data';

export const SettingsPage = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<SettingSection>('profile');
  const [showSidebar, setShowSidebar] = useState(false); // Start with false on mobile
  const [showEmailModal, setShowEmailModal] = useState(false);


  const settingsSections = [
    {
      id: 'profile' as SettingSection,
      name: 'Profile & Account',
      description: 'Manage your personal information and account details',
      icon: User,
      component: UserProfile,
      available: true
    },
    {
      id: 'security' as SettingSection,
      name: 'Security & Privacy',
      description: 'Password, 2FA, and privacy settings',
      icon: Shield,
      component: SecuritySettings,
      available: true
    },
    {
      id: 'notifications' as SettingSection,
      name: 'Notifications',
      description: 'Email, SMS, and push notification preferences',
      icon: Bell,
      component: NotificationSettings,
      available: true
    },
    {
      id: 'appearance' as SettingSection,
      name: 'Appearance & Display',
      description: 'Theme, language, and display settings',
      icon: Palette,
      component: AppearanceSettings,
      available: true
    },
    {
      id: 'billing' as SettingSection,
      name: 'Billing & Subscriptions',
      description: 'Payment methods and subscription management',
      icon: CreditCard,
      component: null,
      available: user?.role === 'super_admin' || user?.role === 'big7'
    },
    {
      id: 'integrations' as SettingSection,
      name: 'Integrations & API',
      description: 'Third-party connections and API access',
      icon: Zap,
      component: null,
      available: user?.role === 'super_admin' || user?.role === 'manager'
    },
    {
      id: 'data' as SettingSection,
      name: 'Data & Export',
      description: 'Export data, backups, and data management',
      icon: Database,
      component: null,
      available: true
    },
    {
      id: 'help' as SettingSection,
      name: 'Help & Support',
      description: 'Documentation, tutorials, and support',
      icon: HelpCircle,
      component: null,
      available: true
    },
    {
      id: 'about' as SettingSection,
      name: 'About & Legal',
      description: 'Terms of service, privacy policy, and app info',
      icon: FileText,
      component: null,
      available: true
    }
  ];

  const availableSections = settingsSections.filter(section => section.available);
  const activeSettings = availableSections.find(section => section.id === activeSection);

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <UserProfile />;
      case 'security':
        return <SecuritySettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      default:
        // Placeholder content for other sections
        return (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveSection('profile')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Profile
              </Button>
            </div>

            <Card className="bg-slate-50 dark:bg-slate-800 shadow-xl border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {activeSettings?.icon && <activeSettings.icon className="h-6 w-6" />}
                  {activeSettings?.name}
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">{activeSettings?.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Monitor className="h-16 w-16 text-slate-500 dark:text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-slate-900 dark:text-white">Coming Soon</h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    This settings section is under development and will be available in a future update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.95), rgba(248, 250, 252, 0.95)), url('https://images.unsplash.com/photo-1560472355-536de3962603?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2126&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="flex flex-col md:flex-row min-h-screen overflow-hidden">
        {/* Mobile Header with Menu Toggle */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white/90 border-b">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2"
          >
            {showSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Overlay */}
        {showSidebar && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          settings-sidebar mobile-sidebar
          w-full md:w-72 lg:w-80 xl:w-96 min-w-0 border-r bg-slate-50 dark:bg-slate-800 p-4 md:p-6 shadow-lg overflow-auto
          md:relative md:translate-x-0 md:z-auto
          fixed top-0 left-0 z-50 h-full transition-transform duration-300 ease-in-out
          ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Settings className="h-6 w-6" />
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage your account and system preferences
              </p>
            </div>

            {/* User Info */}
            <Card className="backdrop-blur-sm bg-white/90 shadow-lg border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-slate-900 dark:text-white">{user?.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 truncate">{user?.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {user?.role && (
                    <Badge variant="secondary" className="text-xs capitalize">
                      {user.role.replace(/_/g, ' ')} Account
                    </Badge>
                  )}
                  {user?.role === 'super_admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => setShowEmailModal(true)}
                    >
                      Change Email
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Settings Navigation */}
            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                Account Settings
              </div>
              {availableSections.slice(0, 4).map((section) => (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "secondary" : "ghost"}
                  className="settings-button w-full justify-start h-auto p-3 min-w-0"
                  onClick={() => {
                    setActiveSection(section.id);
                    // Close sidebar on mobile after selection
                    if (window.innerWidth < 768) {
                      setShowSidebar(false);
                    }
                  }}
                >
                  <section.icon className="h-4 w-4 mr-2 sm:mr-3 flex-shrink-0" />
                  <div className="settings-button-content flex-1 text-left min-w-0 pr-1">
                    <div className="settings-section-title font-medium text-sm truncate text-slate-900 dark:text-white">{section.name}</div>
                    <div className="settings-description text-xs text-slate-500 dark:text-slate-400 line-clamp-2 break-words">{section.description}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-1 sm:ml-2 flex-shrink-0" />
                </Button>
              ))}
            </div>

            {/* Advanced Settings */}
            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                Advanced Settings
              </div>
              {availableSections.slice(4, 7).map((section) => (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "secondary" : "ghost"}
                  className="settings-button w-full justify-start h-auto p-3 min-w-0"
                  onClick={() => {
                    setActiveSection(section.id);
                    // Close sidebar on mobile after selection
                    if (window.innerWidth < 768) {
                      setShowSidebar(false);
                    }
                  }}
                >
                  <section.icon className="h-4 w-4 mr-2 sm:mr-3 flex-shrink-0" />
                  <div className="settings-button-content flex-1 text-left min-w-0 pr-1">
                    <div className="settings-section-title font-medium text-sm truncate text-slate-900 dark:text-white">{section.name}</div>
                    <div className="settings-description text-xs text-slate-500 dark:text-slate-400 line-clamp-2 break-words">{section.description}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-1 sm:ml-2 flex-shrink-0" />
                </Button>
              ))}
            </div>

            {/* Support & Legal */}
            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                Support & Legal
              </div>
              {availableSections.slice(7).map((section) => (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "secondary" : "ghost"}
                  className="settings-button w-full justify-start h-auto p-3 min-w-0"
                  onClick={() => {
                    setActiveSection(section.id);
                    // Close sidebar on mobile after selection
                    if (window.innerWidth < 768) {
                      setShowSidebar(false);
                    }
                  }}
                >
                  <section.icon className="h-4 w-4 mr-2 sm:mr-3 flex-shrink-0" />
                  <div className="settings-button-content flex-1 text-left min-w-0 pr-1">
                    <div className="settings-section-title font-medium text-sm truncate text-slate-900 dark:text-white">{section.name}</div>
                    <div className="settings-description text-xs text-slate-500 dark:text-slate-400 line-clamp-2 break-words">{section.description}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-1 sm:ml-2 flex-shrink-0" />
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          {renderContent()}
        </div>
      </div>

      {/* Email Change Modal */}
      <ChangeEmailModal open={showEmailModal} onOpenChange={setShowEmailModal} />
    </div>
  );
};