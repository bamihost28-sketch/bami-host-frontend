import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { OwnerDashboard } from '@/components/dashboard/OwnerDashboard';
import { Big7Dashboard } from '@/components/dashboard/Big7Dashboard';
import { ManagerDashboard } from '@/components/dashboard/ManagerDashboard';
import { VendorDashboard } from '@/components/dashboard/VendorDashboard';
import { CustomerDashboard } from '@/components/dashboard/CustomerDashboard';
import { TenantDashboard } from '@/components/dashboard/TenantDashboard';
import { WalletDashboard } from '@/components/dashboard/WalletDashboard';
import { WalletPage, DepositVerification } from '@/components/wallet';
import { EstateManagement } from '@/components/dashboard/business/EstateManagement';
import { EstateDetailPage } from '@/components/dashboard/business/EstateDetailPage';
import { AddPropertyPage } from '@/components/dashboard/business/AddPropertyPage';
import { TenantDetailPage } from '@/components/dashboard/business/TenantDetailPage';
import { FillingStationManagement } from '@/components/dashboard/business/FillingStationManagement';
import { EquipmentManagement } from '@/components/dashboard/business/EquipmentManagement';
import { VendorOnboarding } from '@/components/dashboard/business/VendorOnboarding';
import { AccountingManagement } from '@/components/dashboard/business/AccountingManagement';
import { CRMDashboard } from '@/components/dashboard/CRMDashboard';
import { LibraryDashboard } from '@/components/dashboard/LibraryDashboardStub';
import { AssistantDashboard } from '@/components/dashboard/AssistantDashboard';
import { ReportsDashboard } from '@/components/dashboard/ReportsDashboard';
import { GreenThemeShowcase } from '@/components/GreenThemeShowcase';
import { ProtectedComponent } from '@/components/auth/ProtectedComponent';
import { PaymentSuccessPage } from '@/components/dashboard/PaymentSuccessPage';
import { SettingsPage } from '@/components/auth/SettingsPage';
import { PortfolioDashboard, PersonalLifePortfolios } from '@/components/portfolio';
import { SplitTracker } from '@/components/budget/SplitTracker';
import { GoalsDashboard } from '@/components/goals/GoalsDashboard';
import { Big5Dashboard } from '@/components/big5/Big5Dashboard';
import StrategicHiringPlanner from '@/components/hiring/StrategicHiringPlanner';
import ManagingLikeABoss from '@/components/management/ManagingLikeABoss';
import CandidateManagement from '@/components/hiring/CandidateManagement';
import { AdminPeople } from '@/components/dashboard/AdminPeople';
import { BusinessTypeManagement } from '@/components/dashboard/BusinessTypeManagement';
import { SuperAdminTransactions } from '@/components/dashboard/SuperAdminTransactions';
import AdminMeterPage from '@/components/dashboard/meters/AdminMeterPage';
import BillionaireOS from '@/components/billionaire/BillionaireOS';
import ScalableImpactPlanner from '@/components/scalable-impact/ScalableImpactPlanner';
import { Subscription } from '@/components/dashboard/Subscription';

const DashboardRouter: React.FC = () => {
  const { user } = useAuth();
  const { canAccessNavigation } = usePermissions();
  const location = useLocation();

  const renderDashboard = () => {
    console.log('Rendering dashboard for user:', user);
    switch (user?.role) {
      case 'super_admin':
        return <OwnerDashboard />;
      case 'business_owner':
        return <ManagerDashboard />;
      case 'big7':
        return <Big7Dashboard />;
      case 'super_manager':
        return <ManagerDashboard />;
      case 'manager':
        return <ManagerDashboard />;
      case 'super_vendor':
        return <VendorDashboard />;
      case 'vendor':
        return <VendorDashboard />;
      case 'tenant':
        return <TenantDashboard />;
      case 'user':
        return <TenantDashboard />;
      case 'customer':
        return <CustomerDashboard />;
      default:
        return <CustomerDashboard />;
    }
  };

  // Get current view from pathname for sidebar highlighting
  const getCurrentView = () => {
    const pathname = location.pathname;
    if (pathname.includes('billionaire-os')) return 'billionaire-os';
    if (pathname.includes('ScalableImpactPlanner')) return 'scalable-impact-planner';
    if (pathname.includes('wallet')) return 'wallet';
    if (pathname.includes('portfolio')) return 'portfolio';
    if (pathname.includes('split-tracker')) return 'split-tracker';
    if (pathname.includes('tenant')) return 'estate';
    if (pathname.includes('estate')) return 'estate';
    if (pathname.includes('filling-station')) return 'filling-station';
    if (pathname.includes('equipment')) return 'equipment';
    if (pathname.includes('vendor-onboarding')) return 'vendor-onboarding';
    if (pathname.includes('personal-portfolios')) return 'personal-portfolios';
    if (pathname.includes('goals')) return 'goals';
    if (pathname.includes('defining-your-number')) return 'defining-your-number';
    if (pathname.includes('strategic-hiring-planner')) return 'strategic-hiring-planner';
    if (pathname.includes('managing-like-a-boss')) return 'managing-like-a-boss';
    if (pathname.includes('candidate-management')) return 'candidate-management';
    if (pathname.includes('contacts')) return 'contacts';
    if (pathname.includes('library')) return 'library';
    if (pathname.includes('assistant')) return 'assistant';
    if (pathname.includes('reports')) return 'reports';
    if (pathname.includes('transactions')) return 'transactions';
    if (pathname.includes('settings')) return 'settings';
    if (pathname.includes('theme-showcase')) return 'theme-showcase';
    if (pathname.includes('people')) return 'people';
    if (pathname.includes('business-types')) return 'business-types';
    if (pathname.includes('accounting')) return 'accounting';
    if (pathname.includes('subscription')) return 'subscription';
    return 'overview';
  };

  const ProtectedRoute: React.FC<{
    element: React.ReactElement;
    requiredPermissions?: string[];
    feature: string;
    showUpgradePrompt?: boolean;
    viewName: string;
  }> = ({ element, requiredPermissions, feature, showUpgradePrompt = true, viewName }) => {
    if (!canAccessNavigation(viewName)) {
      return (
        <ProtectedComponent
          feature={feature}
          showUpgradePrompt={showUpgradePrompt}
          className="max-w-2xl mx-auto mt-8"
        >
          <div className="text-center p-4">
            <h2 className="text-lg font-semibold text-destructive">Access Restricted</h2>
            <p className="text-muted-foreground">You don't have permission to access this feature.</p>
          </div>
        </ProtectedComponent>
      );
    }

    return (
      <ProtectedComponent
        requiredPermissions={requiredPermissions}
        feature={feature}
        showUpgradePrompt={showUpgradePrompt}
      >
        {element}
      </ProtectedComponent>
    );
  };

  return (
    <DashboardLayout currentView={getCurrentView()} onViewChange={() => { }}>
      <Routes>
        {/* Dashboard Overview */}
        <Route path="/" element={renderDashboard()} />
        <Route path="/overview" element={renderDashboard()} />

        {/* Scalable Impact Planner */}
        <Route
          path="/ScalableImpactPlanner"
          element={
            <ProtectedRoute
              element={<ScalableImpactPlanner />}
              requiredPermissions={['view_scalable_impact']}
              feature="Scalable Impact Planner"
              showUpgradePrompt={true}
              viewName="scalable-impact-planner"
            />
          }
        />

        {/* Wallet */}
        <Route
          path="/wallet"
          element={
            <ProtectedRoute
              element={<WalletDashboard />}
              requiredPermissions={['view_wallet']}
              feature="Wallet Dashboard"
              showUpgradePrompt={true}
              viewName="wallet"
            />
          }
        />

        {/* Wallet - Full Page */}
        <Route
          path="/wallet/manage"
          element={
            <ProtectedRoute
              element={<WalletPage />}
              requiredPermissions={['view_wallet']}
              feature="Wallet Management"
              showUpgradePrompt={true}
              viewName="wallet"
            />
          }
        />

        {/* Wallet - Deposit */}
        <Route
          path="/wallet/deposit"
          element={
            <ProtectedRoute
              element={<WalletPage />}
              requiredPermissions={['view_wallet']}
              feature="Wallet Deposit"
              showUpgradePrompt={true}
              viewName="wallet"
            />
          }
        />

        {/* Wallet - Paystack Verification */}
        <Route
          path="/wallet/verify"
          element={
            <ProtectedRoute
              element={<DepositVerification />}
              requiredPermissions={['view_wallet']}
              feature="Payment Verification"
              showUpgradePrompt={false}
              viewName="wallet"
            />
          }
        />

        {/* Portfolio */}
        <Route
          path="/portfolio"
          element={
            <ProtectedRoute
              element={<PortfolioDashboard />}
              requiredPermissions={['view_portfolio']}
              feature="Investment Portfolio"
              showUpgradePrompt={true}
              viewName="portfolio"
            />
          }
        />

        {/* Split Tracker */}
        <Route
          path="/split-tracker"
          element={
            <ProtectedRoute
              element={<SplitTracker />}
              requiredPermissions={['view_split_tracker']}
              feature="50/30/20 Split Tracker"
              showUpgradePrompt={true}
              viewName="split-tracker"
            />
          }
        />

        {/* Estate Management */}
        <Route
          path="/estate"
          element={
            <ProtectedRoute
              element={<EstateManagement />}
              requiredPermissions={['view_estate']}
              feature="Estate Management"
              showUpgradePrompt={true}
              viewName="estate"
            />
          }
        />
        <Route
          path="/estate/:estateId"
          element={
            <ProtectedRoute
              element={<EstateDetailPage />}
              requiredPermissions={['view_estate']}
              feature="Estate Management"
              showUpgradePrompt={true}
              viewName="estate"
            />
          }
        />
        <Route
          path="/estate/:estateId/add-unit"
          element={
            <ProtectedRoute
              element={<AddPropertyPage />}
              requiredPermissions={['view_estate']}
              feature="Estate Management"
              showUpgradePrompt={true}
              viewName="estate"
            />
          }
        />

        {/* Filling Station */}
        <Route
          path="/filling-station"
          element={
            <ProtectedRoute
              element={<FillingStationManagement />}
              requiredPermissions={['view_filling_station']}
              feature="Filling Station Management"
              showUpgradePrompt={true}
              viewName="filling-station"
            />
          }
        />

        {/* Equipment */}
        <Route
          path="/equipment"
          element={
            <ProtectedRoute
              element={<EquipmentManagement />}
              requiredPermissions={['view_equipment']}
              feature="Equipment Management"
              showUpgradePrompt={true}
              viewName="equipment"
            />
          }
        />

        <Route
          path="/vendor-onboarding"
          element={
            <ProtectedRoute
              element={<VendorOnboarding />}
              requiredPermissions={['view_estate']}
              feature="Vendor Management"
              showUpgradePrompt={true}
              viewName="vendor-onboarding"
            />
          }
        />

        {/* Personal Portfolios */}
        <Route
          path="/accounting"
          element={
            <ProtectedRoute
              element={<AccountingManagement />}
              requiredPermissions={['view_all_data']}
              feature="Accounting Management"
              showUpgradePrompt={true}
              viewName="accounting"
            />
          }
        />
        <Route
          path="/personal-portfolios"
          element={
            <ProtectedRoute
              element={<PersonalLifePortfolios />}
              requiredPermissions={['view_personal_portfolios']}
              feature="Personal Life Portfolios"
              showUpgradePrompt={true}
              viewName="personal-portfolios"
            />
          }
        />

        {/* Goals */}
        <Route
          path="/goals"
          element={
            <ProtectedRoute
              element={<GoalsDashboard />}
              requiredPermissions={['view_goals']}
              feature="Financial Goals"
              showUpgradePrompt={true}
              viewName="goals"
            />
          }
        />

        {/* Defining Your Number */}
        <Route
          path="/defining-your-number"
          element={
            <ProtectedRoute
              element={<Big5Dashboard />}
              requiredPermissions={['view_big5']}
              feature="Defining Your Number"
              showUpgradePrompt={false}
              viewName="defining-your-number"
            />
          }
        />


        {/* Strategic Hiring Planner */}
        <Route
          path="/strategic-hiring-planner"
          element={
            <ProtectedRoute
              element={<StrategicHiringPlanner />}
              requiredPermissions={['view_strategic_hiring', 'view_hiring_triggers']}
              feature="Strategic Hiring Planner"
              showUpgradePrompt={false}
              viewName="strategic-hiring-planner"
            />
          }
        />

        {/* Managing Like a Boss */}
        <Route
          path="/managing-like-a-boss"
          element={
            <ProtectedRoute
              element={<ManagingLikeABoss />}
              requiredPermissions={['view_managing_like_a_boss']}
              feature="Managing Like a Boss"
              showUpgradePrompt={false}
              viewName="managing-like-a-boss"
            />
          }
        />

        {/* Candidate Management */}
        <Route
          path="/candidate-management"
          element={
            <ProtectedRoute
              element={<CandidateManagement />}
              requiredPermissions={['view_strategic_hiring', 'manage_candidates']}
              feature="Candidate Management"
              showUpgradePrompt={false}
              viewName="candidate-management"
            />
          }
        />

        {/* CRM/Contacts */}
        <Route
          path="/contacts"
          element={
            <ProtectedRoute
              element={<CRMDashboard />}
              requiredPermissions={['view_contacts']}
              feature="CRM Dashboard"
              showUpgradePrompt={true}
              viewName="contacts"
            />
          }
        />

        {/* Library */}
        <Route
          path="/library"
          element={
            <ProtectedRoute
              element={<LibraryDashboard />}
              requiredPermissions={['view_library']}
              feature="Library Dashboard"
              showUpgradePrompt={true}
              viewName="library"
            />
          }
        />

        {/* Assistant */}
        <Route
          path="/assistant"
          element={
            <ProtectedRoute
              element={<AssistantDashboard />}
              requiredPermissions={['view_assistant']}
              feature="AI Assistant"
              showUpgradePrompt={true}
              viewName="assistant"
            />
          }
        />

        {/* Reports */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute
              element={<ReportsDashboard />}
              requiredPermissions={['view_reports']}
              feature="Reports Dashboard"
              showUpgradePrompt={true}
              viewName="reports"
            />
          }
        />

        {/* Transactions */}
        <Route
          path="/transactions"
          element={
            <ProtectedRoute
              element={<SuperAdminTransactions />}
              requiredPermissions={['view_all_data']}
              feature="Transactions"
              showUpgradePrompt={false}
              viewName="transactions"
            />
          }
        />

        {/* Smart Meters */}
        <Route
          path="/meters"
          element={
            <ProtectedRoute
              element={<AdminMeterPage />}
              requiredPermissions={['view_all_data']}
              feature="Smart Meters"
              showUpgradePrompt={false}
              viewName="meters"
            />
          }
        />

        {/* Billionaire OS */}
        <Route
          path="/billionaire-os"
          element={
            <ProtectedRoute
              element={<BillionaireOS />}
              feature="Billionaire OS"
              showUpgradePrompt={false}
              viewName="billionaire-os"
            />
          }
        />

        {/* Subscription */}
        <Route
          path="/subscription"
          element={
            <ProtectedRoute
              element={<Subscription />}
              feature="Subscription"
              showUpgradePrompt={false}
              viewName="subscription"
            />
          }
        />

        {/* Payment success (callback) */}
        <Route path="/payment/success" element={<PaymentSuccessPage />} />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute
              element={<SettingsPage />}
              requiredPermissions={['view_settings']}
              feature="Settings"
              showUpgradePrompt={true}
              viewName="settings"
            />
          }
        />

        {/* Theme Showcase */}
        <Route path="/theme-showcase" element={<GreenThemeShowcase />} />

        {/* People */}
        <Route path="/people" element={<AdminPeople />} />

        {/* Business Types */}
        <Route path="/business-types" element={<BusinessTypeManagement />} />

        {/* Tenant Detail */}
        <Route
          path="/tenant/:tenantId"
          element={
            <ProtectedRoute
              element={<TenantDetailPage />}
              requiredPermissions={['view_estate']}
              feature="Estate Management"
              showUpgradePrompt={true}
              viewName="estate"
            />
          }
        />

        {/* Redirect unknown paths to overview */}
        <Route path="*" element={<Navigate to="/dashboard/overview" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default DashboardRouter;