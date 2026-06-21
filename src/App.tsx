import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PageLoaderProvider, usePageLoader } from "@/contexts/PageLoaderContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageLoader } from "@/components/PageLoader";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import { LoginPage } from "@/components/auth/LoginPage";
import { RegistrationPage } from "@/components/auth/RegistrationPage";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { DepositVerification } from "@/components/wallet/DepositVerification";
import { PaymentVerification } from "@/components/wallet/PaymentVerification";

// Lazy-loaded page components for code splitting
const About = lazy(() => import("./pages/About"));
const Projects = lazy(() => import("./pages/Projects"));
const Product = lazy(() => import("./pages/Product"));
const EntrepreneurGuide = lazy(() => import("./pages/EntrepreneurGuide"));
const EstateMarketplace = lazy(() => import("./pages/EstateMarketplace"));
const PropertyDetails = lazy(() => import("./pages/PropertyDetails"));
const EstateList = lazy(() => import("./pages/EstateList"));
const VendorProfile = lazy(() => import("./pages/VendorProfile"));
const EquipmentDetails = lazy(() => import("./pages/EquipmentDetails"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));

// Loading skeleton component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-pulse space-y-4 w-full max-w-md px-4">
      <div className="h-12 bg-muted rounded" />
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded w-5/6" />
      </div>
    </div>
  </div>
);

// Route change detector component
const RouteChangeDetector: React.FC = () => {
  const location = useLocation();
  const { showLoader, hideLoader } = usePageLoader();

  useEffect(() => {
    showLoader();
    const timer = setTimeout(() => {
      hideLoader();
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname, showLoader, hideLoader]);

  return null;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
});

// Inner app component with page loader context access
const AppContent: React.FC = () => {
  const { isLoading } = usePageLoader();

  return (
    <>
      <PageLoader isLoading={isLoading} />
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="dark" storageKey="bami-hustle-theme">
            <ToastProvider>
              <TooltipProvider>
                <AuthProvider>
                  <Toaster />
                  <CookieConsent />
                  <BrowserRouter>
                    <RouteChangeDetector />
                    <Suspense fallback={<LoadingFallback />}>
                      <Routes>
                        {/* Public routes - critical pages loaded immediately */}
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegistrationPage />} />

                        {/* Public routes - lazy-loaded for code splitting */}
                        <Route path="/about" element={<About />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/product" element={<Product />} />
                        <Route path="/entrepreneur-guide" element={<EntrepreneurGuide />} />
                        <Route path="/marketplace/estate" element={<EstateMarketplace />} />
                        <Route path="/marketplace/estate/all" element={<EstateList />} />
                        <Route path="/marketplace/estate/:id" element={<PropertyDetails />} />
                        <Route path="/marketplace/vendor/:id" element={<VendorProfile />} />
                        <Route path="/marketplace/equipment/:id" element={<EquipmentDetails />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/terms" element={<Terms />} />

                        {/* Authenticated app */}
                        <Route path="/app" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard/*" element={<Index />} />
                        
                        {/* Paystack callback routes (outside dashboard) */}
                        <Route path="/wallet/verify" element={<DepositVerification />} />
                        <Route path="/payment/verify" element={<PaymentVerification />} />

                        {/* Catch-all for 404 */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </BrowserRouter>
                </AuthProvider>
              </TooltipProvider>
            </ToastProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </>
  );
};

const App = () => (
  <PageLoaderProvider>
    <AppContent />
  </PageLoaderProvider>
);

export default App;
