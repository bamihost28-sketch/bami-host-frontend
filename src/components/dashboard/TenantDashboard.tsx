import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader, Calendar, Receipt, Wallet, Plus, TrendingUp, CreditCard, Building2, Copy, CheckCircle2, ImageIcon, Upload } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/providers/ToastProvider";
import { useAuth } from "@/contexts/AuthContext";
import { useGetDashboardOverviewQuery, useGetMyBillingQuery, usePayBillingMutation, useGetMyPaymentHistoryQuery, useGetIssuesQuery, type TenantPaymentRecord } from "@/services/estatesApi";
import {
  useGetWalletBalanceQuery,
  useDepositMutation,
  useWithdrawMutation,
  useTransferToUserMutation,
  useAddFundsMutation,
} from "@/services";
import { useGetBankInfoQuery, useSubmitDepositMutation } from "@/services/bankDepositsApi";

// Import refactored components
import { OverviewCards } from "./tenant/OverviewCards";
import { WalletBalanceCard } from "./tenant/WalletBalanceCard";
import { QuickActions } from "./tenant/QuickActions";
import { NotificationsTab } from "./tenant/NotificationsTab";
import { MaintenanceList } from "./tenant/MaintenanceList";
import { ReportIssueDialog } from "./tenant/ReportIssueDialog";
import { BillingItemList } from "./tenant/BillingItemList";
import { PaymentSummary } from "./tenant/PaymentSummary";
import { ReceiptsTab } from "./tenant/ReceiptsTab";
import { formatCurrency, formatDate } from "./tenant/utils";

export const TenantDashboard: React.FC = () => {
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [depositForm, setDepositForm] = useState({ amount: "" });
  const [withdrawForm, setWithdrawForm] = useState({ amount: "", description: "" });
  const [transferForm, setTransferForm] = useState({ amount: "", recipient: "", recipientAccount: "", bank: "", description: "" });
  const [selectedBillingItems, setSelectedBillingItems] = useState<string[]>([]);
  const [billingDialogOpen, setBillingDialogOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [rentPaymentMonths, setRentPaymentMonths] = useState<6 | 12>(12);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  // Fetch dashboard overview from API
  const { data: overviewData, isLoading: overviewLoading } = useGetDashboardOverviewQuery();
  const { data: billingData } = useGetMyBillingQuery();
  const [payBilling, { isLoading: isPaying }] = usePayBillingMutation();
  const tenantId = overviewData?.data?.data?.apartment?.id;
  const { data: transactionsData, isLoading: transactionsLoading } = useGetMyPaymentHistoryQuery(
    { tenantId: tenantId!, page: 1, limit: 20 },
    { skip: !tenantId }
  );
  const { data: issuesData, isLoading: issuesLoading } = useGetIssuesQuery();

  // Wallet Transaction API Hooks
  const { data: walletResponse, isLoading: walletLoading, refetch: refetchWallet } = useGetWalletBalanceQuery();
  const [deposit, { isLoading: isDepositing }] = useDepositMutation();
  const [withdraw, { isLoading: isWithdrawing }] = useWithdrawMutation();
  const [transferToUser, { isLoading: isTransferringUser }] = useTransferToUserMutation();
  const [addFunds, { isLoading: isAddingFunds }] = useAddFundsMutation();
  
  // Bank deposit hooks
  const { data: bankInfoData } = useGetBankInfoQuery();
  const bankInfo = bankInfoData?.data;
  const [submitDeposit, { isLoading: isSubmittingDeposit }] = useSubmitDepositMutation();
  const [depositProofFile, setDepositProofFile] = useState<File | null>(null);
  const [depositProofPreview, setDepositProofPreview] = useState<string | null>(null);
  const [depositCopied, setDepositCopied] = useState<string | null>(null);
  const [depositSubmitted, setDepositSubmitted] = useState(false);
  const depositFileRef = useRef<HTMLInputElement>(null);

  // Get API data
  const apiUser = overviewData?.data?.user;
  const apiApartment = overviewData?.data?.data?.apartment;
  const apiBilling = overviewData?.data?.data?.billing;
  const apiYearlyPayment = overviewData?.data?.data?.yearlyPayment;
  const apiWallet = overviewData?.data?.data?.wallet;

  // Normalize billing response into a flat shape for the UI
  const charges = billingData?.data?.charges;
  const billingSummary = billingData?.data?.summary;

  const recurringItems = (charges?.recurring || []).map(item => ({
    code: item.code,
    label: item.label,
    amount: item.effectiveAmount,
    frequency: item.frequency,
    isOverdue: item.isOverdue,
    daysUntilDue: item.daysUntilDue as number | null,
    isIncreased: item.isIncreased,
    storedAmount: item.storedAmount,
  }));

  const oneTimeItems = (charges?.oneTime || [])
    .filter(item => !item.isPaid)
    .map(item => ({
      code: item.code,
      label: item.label,
      amount: item.amount,
      frequency: "once",
    }));

  const utilityItems = (charges?.utilityBills || [])
    .filter(item => !item.isPaid)
    .map((item, i) => ({
      code: item.id || `utility_${i}`,
      label: item.label,
      amount: item.amount,
      frequency: item.frequency || "once",
      isOverdue: item.isOverdue,
      daysOverdue: item.daysOverdue,
      daysUntilDue: item.daysUntilDue,
    }));

  // Get Wallet Data from API — prefer live query, fall back to overview balance instantly
  const walletData = walletResponse?.data;
  const walletBalance = walletData?.balance ?? apiWallet?.balance ?? 0;
  const isWalletLoading = walletLoading && apiWallet === undefined;

  const totalDue = billingSummary?.totalOutstanding || 0;

  // Use API data or fallback to demo data
  const tenantInfo = apiApartment ? {
    name: apiApartment.tenantName,
    apartmentNumber: apiApartment.unit,
    estateName: apiApartment.estate,
    leaseStatus: apiApartment.status,
    leaseStartDate: apiApartment.entryDate,
    monthlyRent: apiApartment.rentAmount,
    rentDueDay: 25,
    outstandingBalance: apiBilling?.totalPending || 0,
    nextPaymentDue: apiApartment.nextDueDate,
    id: apiApartment.id,
    email: apiUser?.email || "",
    phone: authUser?.phone || "",
    serviceCharge: apiApartment.serviceChargeAmount,
    meterNumber: apiApartment.meterNumber,
  } : {
    name: authUser?.name || "Valued Tenant",
    apartmentNumber: "Flat 4B",
    estateName: "Rose Garden Estate",
    leaseStatus: "active",
    leaseStartDate: "",
    monthlyRent: 250000,
    rentDueDay: 25,
    outstandingBalance: 0,
    nextPaymentDue: "2025-05-25",
    id: "",
    email: authUser?.email || "",
    phone: authUser?.phone || "",
  };

  const displayName = tenantInfo?.name || authUser?.name || "Valued Tenant";
  const firstName = displayName?.split(" ")[0] || "Valued";
  // Prefer billing endpoint's daysUntilDue (already accounts for projection logic).
  // Fall back to computing from nextPaymentDue only when billing data isn't loaded yet.
  const daysUntilRentDue = billingSummary?.daysUntilDue !== undefined && billingSummary.daysUntilDue !== null
    ? billingSummary.daysUntilDue
    : tenantInfo?.nextPaymentDue
    ? Math.ceil((new Date(tenantInfo.nextPaymentDue).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 30;

  const handleSelectBillingItem = (itemCode: string) => {
    let newSelection = [...selectedBillingItems];

    if (newSelection.includes(itemCode)) {
      newSelection = newSelection.filter(item => item !== itemCode);
      if (itemCode === "rent") {
        newSelection = newSelection.filter(item => item !== "service_charge");
      }
    } else {
      newSelection.push(itemCode);
      if (itemCode === "rent" && !newSelection.includes("service_charge")) {
        newSelection.push("service_charge");
      }
    }

    setSelectedBillingItems(newSelection);
  };

  const calculateSelectedTotal = () => {
    // When locked for initial payment, use the pre-calculated 12-month total from the API
    if (billingSummary?.requiresInitialPayment && billingSummary?.initialPayment?.total) {
      return billingSummary.initialPayment.total;
    }
    let total = 0;
    allBillingItems.forEach((item) => {
      if (selectedBillingItems.includes(item.code)) {
        const months =
          !billingSummary?.requiresInitialPayment &&
          (item.code === "rent" || item.code === "service_charge")
            ? rentPaymentMonths
            : 1;
        total += item.amount * months;
      }
    });
    return total;
  };

  const handlePaySelectedBilling = async () => {
    try {
      if (selectedBillingItems.length === 0) {
        toast("Error: Please select items to pay");
        return;
      }

      const totalAmount = calculateSelectedTotal();

      if (totalAmount > walletBalance) {
        toast(`Error: Insufficient wallet balance. You need ₦${(totalAmount - walletBalance).toLocaleString()} more`);
        return;
      }

      setIsProcessingPayment(true);
      toast("Processing: Payment in progress...");

      await payBilling({
        itemIds: selectedBillingItems,
        paymentMethod: "wallet",
        ...(selectedBillingItems.includes("rent") && { durationMonths: rentPaymentMonths }),
      }).unwrap();

      toast("Success: Payment completed from your wallet");
      setSelectedBillingItems([]);
      refetchWallet();
    } catch (error: any) {
      toast(error?.data?.message || "Error: Payment failed. Please try again");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleTopUpWallet = async () => {
    const amount = parseFloat(topUpAmount);
    if (!amount || amount <= 0) {
      toast("Error: Please enter a valid amount");
      return;
    }
    try {
      await addFunds({ amount }).unwrap();
      toast(`Success: ₦${amount.toLocaleString()} added to your wallet`);
      setTopUpAmount("");
      refetchWallet();
    } catch (error: any) {
      toast(`Error: ${error?.data?.message || "Failed to add funds"}`);
    }
  };

  const handleReportMaintenance = () => setMaintenanceDialogOpen(true);
  const handleOpenDeposit = () => {
    setDepositForm({ amount: "" });
    setDepositProofFile(null);
    setDepositProofPreview(null);
    setDepositSubmitted(false);
    setDepositDialogOpen(true);
  };

  const handleOpenWithdraw = () => {
    setWithdrawForm({ amount: "", description: "" });
    setWithdrawDialogOpen(true);
  };

  const handleOpenTransfer = () => {
    setTransferForm({ amount: "", recipient: "", recipientAccount: "", bank: "", description: "" });
    setTransferDialogOpen(true);
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositForm.amount);
    if (!amount || amount < 100) {
      toast("Error: Minimum deposit is ₦100");
      return;
    }
    if (!depositProofFile) {
      toast("Error: Please upload your proof of payment screenshot");
      return;
    }
    try {
      const formData = new FormData();
      formData.append('amount', String(amount));
      formData.append('proof', depositProofFile);
      await submitDeposit(formData).unwrap();
      setDepositSubmitted(true);
    } catch (error: any) {
      toast(`Error: ${error?.data?.message || "Failed to submit deposit"}`);
    }
  };

  const handleDepositFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDepositProofFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setDepositProofPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDepositCopy = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setDepositCopied(key);
    setTimeout(() => setDepositCopied(null), 2000);
  };

  const handleWithdraw = async () => {
    if (!withdrawForm.amount || parseFloat(withdrawForm.amount) <= 0) {
      toast("Error: Please enter a valid amount");
      return;
    }
    const amount = parseFloat(withdrawForm.amount);
    if (amount > walletBalance) {
      toast("Error: Insufficient wallet balance");
      return;
    }
    try {
      await withdraw({
        amount,
        description: withdrawForm.description || "Wallet withdrawal",
        bankDetails: { accountName: "", accountNumber: "", bankName: "" },
      }).unwrap();
      toast(`Success: ₦${amount.toLocaleString()} withdrawal submitted`);
      setWithdrawDialogOpen(false);
      setWithdrawForm({ amount: "", description: "" });
      refetchWallet();
    } catch (error: any) {
      toast(`Error: ${error?.data?.message || "Withdrawal failed"}`);
    }
  };

  const handleTransfer = async () => {
    if (!transferForm.amount || parseFloat(transferForm.amount) <= 0) {
      toast("Error: Please enter a valid amount");
      return;
    }
    if (!transferForm.recipient || !transferForm.recipientAccount) {
      toast("Error: Please fill in recipient details");
      return;
    }
    const amount = parseFloat(transferForm.amount);
    if (amount > walletBalance) {
      toast("Error: Insufficient wallet balance");
      return;
    }
    try {
      await transferToUser({
        amount,
        recipientEmail: transferForm.recipient,
        description: transferForm.description || "Transfer to user",
      }).unwrap();
      toast(`Success: ₦${amount.toLocaleString()} transferred to ${transferForm.recipient}`);
      setTransferDialogOpen(false);
      setTransferForm({ amount: "", recipient: "", recipientAccount: "", bank: "", description: "" });
      refetchWallet();
    } catch (error: any) {
      toast(`Error: ${error?.data?.message || "Transfer failed"}`);
    }
  };

  const outstandingItems = [
    ...(apiApartment?.rentOutstanding && apiApartment.rentOutstanding > 0
      ? [{ code: "outstanding_rent", label: "Rent Arrears", amount: apiApartment.rentOutstanding, frequency: "once" as const }]
      : []),
    ...(apiApartment?.serviceChargeOutstanding && apiApartment.serviceChargeOutstanding > 0
      ? [{ code: "outstanding_service_charge", label: "Service Charge Arrears", amount: apiApartment.serviceChargeOutstanding, frequency: "once" as const }]
      : []),
  ];

  const allBillingItems = [...recurringItems, ...oneTimeItems, ...outstandingItems, ...utilityItems];

  const isInitialPaymentLocked = !!billingSummary?.requiresInitialPayment;

  // Items with rent/service_charge amounts scaled by selected duration (for PaymentSummary display)
  const billingItemsForPayment = allBillingItems.map(item =>
    !isInitialPaymentLocked && (item.code === "rent" || item.code === "service_charge")
      ? { ...item, amount: item.amount * rentPaymentMonths }
      : item
  );

  // When initial payment is required, lock all items as selected — none can be individually deselected
  useEffect(() => {
    if (isInitialPaymentLocked && charges) {
      const allCodes = [
        ...(charges.recurring || []).map(i => i.code),
        ...(charges.oneTime || []).filter(i => !i.isPaid).map(i => i.code),
      ];
      setSelectedBillingItems(allCodes);
    }
  }, [isInitialPaymentLocked, charges]);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="dashboard-tabs-list">
          <TabsTrigger value="overview">Home</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="maintenance">Complaints</TabsTrigger>
          <TabsTrigger value="notices">Notices</TabsTrigger>
          <TabsTrigger value="documents">Docs</TabsTrigger>

          <TabsTrigger value="utilities">Services</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div>
                <CardTitle className="text-xl sm:text-2xl text-slate-900 dark:text-white">Welcome back, {firstName}!</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">Here's your home overview</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <OverviewCards
                tenantInfo={tenantInfo}
                daysUntilRentDue={daysUntilRentDue}
              />
              {((apiApartment?.rentOutstanding ?? 0) + (apiApartment?.serviceChargeOutstanding ?? 0)) > 0 && (
                <Alert className="mb-4 border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertTitle className="text-red-800 dark:text-red-300 font-semibold">Outstanding Balance</AlertTitle>
                  <AlertDescription className="text-red-700 dark:text-red-400 text-sm space-y-1">
                    {(apiApartment?.rentOutstanding ?? 0) > 0 && (
                      <div>Rent: <strong>{formatCurrency(apiApartment!.rentOutstanding!)}</strong></div>
                    )}
                    {(apiApartment?.serviceChargeOutstanding ?? 0) > 0 && (
                      <div>Service charge: <strong>{formatCurrency(apiApartment!.serviceChargeOutstanding!)}</strong></div>
                    )}
                    <div className="mt-1 text-xs opacity-80">Please contact the estate office or pay via the Billing tab to clear this balance.</div>
                  </AlertDescription>
                </Alert>
              )}
              
              <WalletBalanceCard
                balance={walletBalance}
                isLoading={isWalletLoading}
                totalEarnings={apiWallet?.totalEarnings}
                totalSpent={apiWallet?.totalSpent}
                onDeposit={handleOpenDeposit}
                onWithdraw={handleOpenWithdraw}
                onTransfer={handleOpenTransfer}
                isDepositing={isDepositing}
                isWithdrawing={isWithdrawing}
                isTransferring={isTransferringUser}
              />

              <QuickActions
                onReportMaintenance={handleReportMaintenance}
                onContactLandlord={() => setContactDialogOpen(true)}
              />
            </CardContent>
          </Card>

          {/* Apartment Details */}
          {apiApartment && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-lg text-slate-900 dark:text-white">{apiApartment.unit}</CardTitle>
                    <CardDescription>{apiApartment.estate}{apiApartment.estateAddress ? ` · ${apiApartment.estateAddress}` : ""}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={
                      apiApartment.status === 'evicted'
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 capitalize"
                        : apiApartment.status === 'pending'
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 capitalize"
                        : apiApartment.status === 'occupied'
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 capitalize"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 capitalize"
                    }>
                      {apiApartment.status}
                    </Badge>
                    {apiApartment.tenantType && (
                      <Badge variant="outline" className="capitalize">{apiApartment.tenantType}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Specs row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {apiApartment.bedrooms !== undefined && (
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 border p-3 text-center">
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{apiApartment.bedrooms}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Bedroom{apiApartment.bedrooms !== 1 ? "s" : ""}</p>
                    </div>
                  )}
                  {apiApartment.bathrooms !== undefined && (
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 border p-3 text-center">
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{apiApartment.bathrooms}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Bathroom{apiApartment.bathrooms !== 1 ? "s" : ""}</p>
                    </div>
                  )}
                  {apiApartment.area !== undefined && (
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 border p-3 text-center">
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{apiApartment.area}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">m²</p>
                    </div>
                  )}
                  {apiApartment.unitType && apiApartment.unitType !== "N/A" && (
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 border p-3 text-center">
                      <p className="text-xl font-bold text-slate-900 dark:text-white truncate">{apiApartment.unitType}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Type</p>
                    </div>
                  )}
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-blue-100 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 p-3">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Monthly Rent</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(apiApartment.rentAmount)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">per month</p>
                  </div>
                  <div className="rounded-lg border border-purple-100 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10 p-3">
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Service Charge</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(apiApartment.serviceChargeAmount)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">per month</p>
                  </div>
                </div>

                {/* Description */}
                {apiApartment.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {apiApartment.description}
                  </p>
                )}

                {/* Amenities */}
                {apiApartment.amenities && Object.values(apiApartment.amenities).some(Boolean) && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(apiApartment.amenities)
                        .filter(([, v]) => v)
                        .map(([key]) => {
                          const labels: Record<string, string> = {
                            wifi: "Wi-Fi", pool: "Pool", gym: "Gym", parking: "Parking",
                            ac: "A/C", security: "Security", petFriendly: "Pet Friendly",
                            balcony: "Balcony", laundry: "Laundry",
                          };
                          return (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {labels[key] ?? key}
                            </Badge>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Meta info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Entry Date</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(apiApartment.entryDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Next Due</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(apiApartment.nextDueDate)}</span>
                    </div>
                    {apiApartment.meterNumber && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Meter No.</span>
                        <span className="font-mono text-sm text-slate-800 dark:text-slate-200">{apiApartment.meterNumber}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {apiApartment.tenantEmail && (
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-500 dark:text-slate-400 shrink-0">Email</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{apiApartment.tenantEmail}</span>
                      </div>
                    )}
                    {apiApartment.tenantPhone && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Phone</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{apiApartment.tenantPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Annual Payment Summary */}
          {apiYearlyPayment && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Annual Payment Summary
                </CardTitle>
                <CardDescription>Your payments this year and projections for renewal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Current Year */}
                  <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {apiYearlyPayment.currentYear.year} — This Year
                      </p>
                      {apiYearlyPayment.currentYear.isFirstTime && (
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-[10px]">
                          First Payment
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2 text-sm mb-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Projected Rent</span>
                        <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(apiYearlyPayment.currentYear.rent)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Projected Service Charge</span>
                        <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(apiYearlyPayment.currentYear.serviceCharge)}</span>
                      </div>
                      {(apiYearlyPayment.currentYear.other ?? 0) > 0 && (
                        apiYearlyPayment.currentYear.otherBreakdown?.length ? (
                          apiYearlyPayment.currentYear.otherBreakdown.map((item) => (
                            <div key={item.code} className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                              <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(item.amount)}</span>
                            </div>
                          ))
                        ) : (
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">One-Time Fees</span>
                            <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(apiYearlyPayment.currentYear.other!)}</span>
                          </div>
                        )
                      )}
                      {apiYearlyPayment.currentYear.outstanding !== undefined && (
                        <div className="flex justify-between text-sm pt-1 border-t border-green-200 dark:border-green-800/50">
                          <span className="text-slate-500 dark:text-slate-400">Outstanding</span>
                          <span className="font-medium text-amber-700 dark:text-amber-400">{formatCurrency(apiYearlyPayment.currentYear.outstanding)}</span>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-green-200 dark:border-green-800 pt-2 flex justify-between">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {(apiYearlyPayment.currentYear.outstanding ?? 0) > 0 ? "Paid So Far" : "Total Paid"}
                      </span>
                      <span className="font-bold text-green-700 dark:text-green-400 text-lg">
                        {formatCurrency(apiYearlyPayment.currentYear.paid?.total ?? apiYearlyPayment.currentYear.totalPaid ?? 0)}
                      </span>
                    </div>
                  </div>

                  {/* Next Year */}
                  <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {apiYearlyPayment.nextYear.year} — Renewal
                      </p>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-[10px]">
                        Projected
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm mb-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Rent</span>
                        <div className="text-right">
                          <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(apiYearlyPayment.nextYear.projectedRent)}</span>
                          <span className="block text-xs text-slate-400 dark:text-slate-500">{formatCurrency(apiYearlyPayment.nextYear.monthlyRent)}/mo</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Service Charge</span>
                        <div className="text-right">
                          <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(apiYearlyPayment.nextYear.projectedServiceCharge)}</span>
                          <span className="block text-xs text-slate-400 dark:text-slate-500">{formatCurrency(apiYearlyPayment.nextYear.monthlyServiceCharge)}/mo</span>
                        </div>
                      </div>
                      {apiYearlyPayment.nextYear.projectedOther !== undefined && apiYearlyPayment.nextYear.projectedOther > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">One-Time Fees</span>
                          <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(apiYearlyPayment.nextYear.projectedOther)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 pt-1 border-t border-blue-100 dark:border-blue-800/50">
                        <span>Renewal starts</span>
                        <span>{formatDate(apiYearlyPayment.nextYear.renewalStartDate)}</span>
                      </div>
                    </div>
                    <div className="border-t border-blue-200 dark:border-blue-800 pt-2 flex justify-between">
                      <span className="font-semibold text-slate-900 dark:text-white">Projected Total</span>
                      <span className="font-bold text-blue-700 dark:text-blue-400 text-lg">{formatCurrency(apiYearlyPayment.nextYear.projectedTotal)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="billing" className="space-y-5">
          {/* Initial Payment Banner — new tenants only */}
          {billingSummary?.requiresInitialPayment && billingSummary?.initialPayment && (
            <div className="rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-amber-900 dark:text-amber-200 text-base">Initial Payment Required</h3>
                    <Badge className="bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-100 text-[10px] px-1.5 py-0">New Tenant</Badge>
                  </div>
                  <p className="text-sm text-amber-800 dark:text-amber-300 mb-4">{billingSummary.initialPayment.note}</p>

                  <div className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden border border-amber-200 dark:border-amber-800 divide-y divide-amber-100 dark:divide-slate-700 mb-4">
                    {[
                      { label: "12-Month Rent", amount: billingSummary.initialPayment.rent12Months },
                      { label: "12-Month Service Charge", amount: billingSummary.initialPayment.serviceCharge12Months },
                      { label: "Caution Fee", amount: billingSummary.initialPayment.cautionFee },
                      { label: "Legal Fee", amount: billingSummary.initialPayment.legalFee },
                    ].filter(r => r.amount > 0).map(row => (
                      <div key={row.label} className="flex justify-between px-4 py-2.5 text-sm">
                        <span className="text-slate-600 dark:text-slate-300">{row.label}</span>
                        <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(row.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between px-4 py-3 bg-amber-50 dark:bg-amber-900/30">
                      <span className="font-semibold text-slate-900 dark:text-white">Total Initial Payment</span>
                      <span className="font-bold text-amber-700 dark:text-amber-300 text-lg">{formatCurrency(billingSummary.initialPayment.total)}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white h-11"
                    onClick={() => {
                      const allCodes = [...recurringItems, ...oneTimeItems].map(i => i.code);
                      setSelectedBillingItems(allCodes);
                    }}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Initial Amount — {formatCurrency(billingSummary.initialPayment.total)}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          {billingSummary && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4">
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide">Monthly Recurring</p>
                  <p className="text-xl font-bold text-blue-900 dark:text-blue-100 mt-1">{formatCurrency(billingSummary.recurringMonthly)}</p>
                  <p className="text-[11px] text-blue-500 dark:text-blue-400 mt-0.5">per month</p>
                </div>
                <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 p-4">
                  <p className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold uppercase tracking-wide">One-Time Fees</p>
                  <p className="text-xl font-bold text-orange-900 dark:text-orange-100 mt-1">{formatCurrency(billingSummary.oneTimeUnpaid)}</p>
                  <p className="text-[11px] text-orange-500 dark:text-orange-400 mt-0.5">unpaid</p>
                </div>
                <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 p-4">
                  <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wide">Utility Bills</p>
                  <p className="text-xl font-bold text-purple-900 dark:text-purple-100 mt-1">{formatCurrency(billingSummary.utilityUnpaid)}</p>
                  <p className="text-[11px] text-purple-500 dark:text-purple-400 mt-0.5">outstanding</p>
                </div>
                <div className={`rounded-lg border p-4 ${
                  billingSummary.isOverdue
                    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    : "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800"
                }`}>
                  <p className={`text-[11px] font-semibold uppercase tracking-wide ${
                    billingSummary.isOverdue ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                  }`}>Total Outstanding</p>
                  <p className={`text-xl font-bold mt-1 ${
                    billingSummary.isOverdue ? "text-red-900 dark:text-red-100" : "text-green-900 dark:text-green-100"
                  }`}>{formatCurrency(billingSummary.totalOutstanding)}</p>
                  {billingSummary.isOverdue ? (
                    <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">Overdue: {formatCurrency(billingSummary.overdueAmount)}</p>
                  ) : billingSummary.daysUntilDue !== null ? (
                    <p className="text-[11px] text-green-500 dark:text-green-400 mt-0.5">Due in {billingSummary.daysUntilDue}d</p>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-0.5">No due date yet</p>
                  )}
                </div>
              </div>

              {/* Arrears banner — shown when tenant has unpaid balance from before current cycle */}
              {(billingSummary.onboardingOutstanding ?? 0) > 0 && (
                <div className="rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Arrears Balance</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Unpaid balance carried over from a previous period. Contact the estate office to resolve.</p>
                  </div>
                  <p className="text-lg font-bold text-amber-800 dark:text-amber-300 shrink-0">{formatCurrency(billingSummary.onboardingOutstanding)}</p>
                </div>
              )}
            </div>
          )}

          {/* Billing Items Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-lg text-slate-900 dark:text-white">Billing Items</CardTitle>
                  <CardDescription>
                    {isInitialPaymentLocked
                      ? "All items must be paid together as initial payment"
                      : "Select items to pay"}
                  </CardDescription>
                </div>
                {totalDue > 0 && (
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Total Due: {formatCurrency(totalDue)}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recurring Charges */}
              {recurringItems.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Monthly Recurring Charges
                  </h3>
                  <div className="space-y-2">
                    {recurringItems.map((item) => {
                      const isChecked = selectedBillingItems.includes(item.code);
                      const isRentOrServiceCharge = item.code === "rent" || item.code === "service_charge";
                      const isTooEarlyToPay = isRentOrServiceCharge
                        && !item.isOverdue
                        && item.daysUntilDue !== null
                        && item.daysUntilDue > 60;
                      const isDisabled = isInitialPaymentLocked || isTooEarlyToPay || (item.code === "service_charge" && !selectedBillingItems.includes("rent"));
                      return (
                        <div
                          key={item.code}
                          className={`flex items-center justify-between p-3 sm:p-4 border rounded-lg transition-colors ${
                            isDisabled && !isInitialPaymentLocked ? "opacity-50 cursor-not-allowed" : isInitialPaymentLocked ? "cursor-default" : "cursor-pointer"
                          } ${
                            isChecked
                              ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20"
                              : item.isOverdue
                              ? "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                          onClick={() => !isDisabled && handleSelectBillingItem(item.code)}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => !isDisabled && handleSelectBillingItem(item.code)}
                              disabled={isDisabled}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-slate-900 dark:text-white">{item.label}</p>
                                {item.isIncreased && (
                                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-[10px] px-1.5 py-0 gap-0.5">
                                    <TrendingUp className="h-2.5 w-2.5" />
                                    Increased
                                  </Badge>
                                )}
                                {item.isOverdue && (
                                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-[10px] px-1.5 py-0">
                                    Overdue
                                  </Badge>
                                )}
                                {isTooEarlyToPay && (
                                  <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 text-[10px] px-1.5 py-0">
                                    Not yet due
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1)}
                                </p>
                                {item.code === "service_charge" && (
                                  <p className="text-xs text-slate-400">(Required with Rent)</p>
                                )}
                                {isTooEarlyToPay && item.daysUntilDue !== null ? (
                                  <p className="text-xs text-slate-400 dark:text-slate-500">
                                    Payment opens in {item.daysUntilDue - 60}d
                                  </p>
                                ) : item.daysUntilDue !== null && !item.isOverdue ? (
                                  <p className="text-xs text-blue-500 dark:text-blue-400 flex items-center gap-0.5">
                                    <Calendar className="h-3 w-3" />
                                    Due in {item.daysUntilDue}d
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(item.amount)}</p>
                            {item.isIncreased && item.storedAmount !== item.amount && (
                              <p className="text-xs text-slate-400 line-through">{formatCurrency(item.storedAmount)}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Payment Duration Picker — shown when rent is selected (non-initial payment only) */}
              {!isInitialPaymentLocked && selectedBillingItems.includes("rent") && (
                <div className="rounded-lg border border-blue-100 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 p-4">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Payment Duration
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {([6, 12] as const).map(months => {
                      const rentAmt = recurringItems.find(i => i.code === "rent")?.amount || 0;
                      const scAmt = selectedBillingItems.includes("service_charge")
                        ? (recurringItems.find(i => i.code === "service_charge")?.amount || 0)
                        : 0;
                      const optionTotal = (rentAmt + scAmt) * months;
                      const isSelected = rentPaymentMonths === months;
                      return (
                        <button
                          key={months}
                          type="button"
                          onClick={() => setRentPaymentMonths(months)}
                          className={`rounded-lg p-3 text-left transition-all ${
                            isSelected
                              ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-600 ring-offset-1 dark:ring-offset-slate-900"
                              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
                          }`}
                        >
                          <p className="font-semibold text-sm">{months} Months</p>
                          <p className={`text-xs mt-0.5 ${isSelected ? "text-blue-100" : "text-slate-400 dark:text-slate-500"}`}>
                            {formatCurrency(optionTotal)}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* One-Time Charges */}
              {oneTimeItems.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-green-600" />
                    One-Time Charges
                  </h3>
                  <BillingItemList
                    items={oneTimeItems}
                    selectedItems={selectedBillingItems}
                    onToggleItem={handleSelectBillingItem}
                    disabledCondition={isInitialPaymentLocked ? () => true : undefined}
                  />
                </div>
              )}

              {/* Arrears (Outstanding Rent / Service Charge) */}
              {outstandingItems.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    Outstanding Arrears
                  </h3>
                  <BillingItemList
                    items={outstandingItems}
                    selectedItems={selectedBillingItems}
                    onToggleItem={handleSelectBillingItem}
                    disabledCondition={isInitialPaymentLocked ? () => true : undefined}
                  />
                </div>
              )}

              {/* Utility Bills */}
              {utilityItems.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-orange-500" />
                    Utility Bills
                  </h3>
                  <div className="space-y-2">
                    {utilityItems.map(item => {
                      const isChecked = selectedBillingItems.includes(item.code);
                      return (
                        <div
                          key={item.code}
                          className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                            isChecked
                              ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20"
                              : item.isOverdue
                              ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                              : "bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/20"
                          }`}
                          onClick={() => handleSelectBillingItem(item.code)}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => handleSelectBillingItem(item.code)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{item.label}</p>
                              {item.isOverdue ? (
                                <p className="text-xs text-red-600 dark:text-red-400">{item.daysOverdue}d overdue</p>
                              ) : item.daysUntilDue !== null && item.daysUntilDue !== undefined ? (
                                <p className="text-xs text-slate-500 dark:text-slate-400">Due in {item.daysUntilDue}d</p>
                              ) : null}
                            </div>
                          </div>
                          <p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(item.amount)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Payment Summary + Pay Button */}
              {selectedBillingItems.length > 0 && (
                <div className="space-y-4 pt-2 border-t">
                  {calculateSelectedTotal() > walletBalance && (
                    <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800/40 p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-red-800 dark:text-red-300">Insufficient wallet balance</p>
                          <p className="text-sm text-red-700 dark:text-red-400">
                            You need {formatCurrency(calculateSelectedTotal() - walletBalance)} more to complete this payment.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="number"
                          placeholder={`Min: ₦${Math.ceil(calculateSelectedTotal() - walletBalance).toLocaleString()}`}
                          value={topUpAmount}
                          onChange={(e) => setTopUpAmount(e.target.value)}
                          className="h-9 text-sm"
                          min={0}
                        />
                        <Button
                          size="sm"
                          onClick={handleTopUpWallet}
                          disabled={isAddingFunds || !topUpAmount}
                          className="bg-green-600 hover:bg-green-700 shrink-0"
                        >
                          {isAddingFunds ? (
                            <><Loader className="h-3 w-3 mr-1.5 animate-spin" />Adding...</>
                          ) : (
                            <><Plus className="h-3 w-3 mr-1.5" />Top Up</>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {isInitialPaymentLocked ? (
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 text-sm text-amber-800 dark:text-amber-300 text-center">
                      Full initial payment breakdown shown above — all items required
                    </div>
                  ) : (
                    <PaymentSummary
                      selectedItems={selectedBillingItems}
                      allItems={billingItemsForPayment}
                      totalAmount={calculateSelectedTotal()}
                      rentMonths={rentPaymentMonths}
                    />
                  )}

                  <Button
                    onClick={handlePaySelectedBilling}
                    disabled={
                      selectedBillingItems.length === 0 ||
                      isProcessingPayment ||
                      calculateSelectedTotal() > walletBalance
                    }
                    className="w-full bg-green-600 hover:bg-green-700 h-12"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Wallet className="h-5 w-5 mr-2" />
                        Pay {formatCurrency(calculateSelectedTotal())} from Wallet
                      </>
                    )}
                  </Button>

                  {selectedBillingItems.includes("rent") && selectedBillingItems.includes("service_charge") && (
                    <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="ml-2 text-blue-800 dark:text-blue-300">
                        Service Charge is automatically included with your rent payment as per your lease agreement.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {selectedBillingItems.length === 0 && recurringItems.length === 0 && oneTimeItems.length === 0 && outstandingItems.length === 0 && utilityItems.length === 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No billing items available</p>
                </div>
              )}

              {selectedBillingItems.length === 0 && (recurringItems.length > 0 || oneTimeItems.length > 0 || outstandingItems.length > 0 || utilityItems.length > 0) && (
                <div className="text-center py-5 text-slate-400 dark:text-slate-500 border-t">
                  <p className="text-sm">Select items above to proceed with payment</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-slate-900 dark:text-white">Issue Reports</CardTitle>
                  <CardDescription>Track the progress of your reported issues</CardDescription>
                </div>
                <Button onClick={handleReportMaintenance} className="self-start sm:self-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {issuesLoading ? (
                <p className="text-sm text-slate-500 text-center py-4">Loading issues...</p>
              ) : (
                <MaintenanceList requests={issuesData?.data || []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notices" className="space-y-6">
          <NotificationsTab />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="h-5 w-5 text-blue-600" />
                Payment Receipts
              </CardTitle>
              <CardDescription>All your payment receipts — click a receipt to expand the full breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ReceiptsTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utilities" className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-yellow-500" />
                Utility Bills
              </CardTitle>
              <CardDescription>Outstanding utility charges for your unit</CardDescription>
            </CardHeader>
            <CardContent>
              {utilityItems.length > 0 ? (
                <div className="space-y-3">
                  {utilityItems.map(item => (
                    <div
                      key={item.code}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        item.isOverdue
                          ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                          : 'bg-slate-50 dark:bg-slate-800/60'
                      }`}
                    >
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{item.label}</p>
                        {item.isOverdue ? (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                            {item.daysOverdue} day{item.daysOverdue !== 1 ? 's' : ''} overdue
                          </p>
                        ) : item.daysUntilDue !== null && item.daysUntilDue !== undefined ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Due in {item.daysUntilDue} day{item.daysUntilDue !== 1 ? 's' : ''}
                          </p>
                        ) : null}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(item.amount)}</p>
                        {item.isOverdue && (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-[10px] mt-1">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center pt-2">
                    To pay utility bills, go to the{" "}
                    <button
                      className="text-blue-600 hover:underline font-medium"
                      onClick={() => setActiveTab('billing')}
                    >
                      Billing tab
                    </button>.
                  </p>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium text-slate-700 dark:text-slate-300">No pending utility bills</p>
                  <p className="text-sm mt-1">Your utility charges will appear here when raised by the estate.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Transaction History</CardTitle>
              <CardDescription>Your payment records</CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <p className="text-center py-8 text-slate-500">Loading transactions...</p>
              ) : transactionsData?.data && transactionsData.data.length > 0 ? (
                <div className="space-y-3">
                  {transactionsData.data.map((item) => (
                    <div key={item.paymentId} className="flex items-start justify-between p-4 border rounded-lg gap-3">
                      <div className="min-w-0">
                        <p className="font-medium capitalize">
                          {item.paymentType?.replace(/_/g, ' ') || 'Payment'}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {formatDate(item.paymentDate || item.createdAt)} · {item.paymentMethod?.replace(/_/g, ' ') || 'N/A'}
                        </p>
                        {item.description && (
                          <p className="text-xs text-slate-400 mt-1 truncate">{item.description}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(item.amount)}
                        </p>
                        <Badge className={
                          item.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          item.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-slate-500">No transactions found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ReportIssueDialog
        open={maintenanceDialogOpen}
        onClose={() => setMaintenanceDialogOpen(false)}
      />

      {/* Deposit Dialog */}
      <Dialog open={depositDialogOpen} onOpenChange={(o) => { setDepositDialogOpen(o); if (!o) { setDepositForm({ amount: "" }); setDepositProofFile(null); setDepositProofPreview(null); setDepositSubmitted(false); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Funds to Wallet</DialogTitle>
            <DialogDescription>
              Transfer to the UBA account below, then upload your proof of payment.
            </DialogDescription>
          </DialogHeader>

          {depositSubmitted ? (
            <div className="text-center space-y-3 py-4">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
              <p className="font-semibold">Deposit Submitted!</p>
              <p className="text-sm text-muted-foreground">An admin will review your proof and credit your wallet shortly.</p>
              <Button className="w-full" onClick={() => setDepositDialogOpen(false)}>Done</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Bank account details */}
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 text-green-800 dark:text-green-300 text-sm font-semibold">
                  <Building2 className="h-4 w-4" />
                  Transfer to this UBA account:
                </div>
                {bankInfo ? (
                  [
                    { label: 'Bank', value: bankInfo.bankName },
                    { label: 'Account Number', value: bankInfo.accountNumber },
                    { label: 'Account Name', value: bankInfo.accountName },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between gap-2 bg-white dark:bg-card rounded p-2 border">
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                        <p className="text-sm font-bold font-mono truncate">{value}</p>
                      </div>
                      <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => handleDepositCopy(value, label)}>
                        {depositCopied === label ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="animate-pulse space-y-2">
                    {[1, 2, 3].map((i) => <div key={i} className="h-9 bg-green-100 dark:bg-green-900/30 rounded" />)}
                  </div>
                )}
              </div>

              {/* Amount input */}
              <div>
                <label className="text-sm font-medium">Amount Transferred (₦)</label>
                <Input
                  type="number"
                  min="100"
                  placeholder="Enter exact amount sent (min ₦100)"
                  value={depositForm.amount}
                  onChange={(e) => setDepositForm({ amount: e.target.value })}
                  className="mt-1"
                />
              </div>

              {/* Proof upload */}
              <div>
                <label className="text-sm font-medium">Proof of Payment</label>
                <input
                  ref={depositFileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleDepositFileChange}
                />
                {depositProofPreview ? (
                  <div className="relative mt-1 border rounded-lg overflow-hidden">
                    <img src={depositProofPreview} alt="Proof" className="w-full max-h-36 object-contain bg-slate-50" />
                    <Button size="sm" variant="secondary" className="absolute top-2 right-2" onClick={() => depositFileRef.current?.click()}>
                      Change
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => depositFileRef.current?.click()}
                    className="mt-1 w-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-5 text-center hover:border-green-500 transition-colors"
                  >
                    <ImageIcon className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-medium">Upload screenshot</p>
                    <p className="text-xs text-muted-foreground">JPEG, PNG or WEBP</p>
                  </button>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDepositDialogOpen(false)}>Cancel</Button>
                <Button
                  onClick={handleDeposit}
                  disabled={isSubmittingDeposit || !depositForm.amount || !depositProofFile}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmittingDeposit ? (
                    <><Loader className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                  ) : (
                    <><Upload className="mr-2 h-4 w-4" />Submit Deposit</>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              Enter the amount you want to withdraw from your wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Amount (₦)</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={withdrawForm.amount}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (Optional)</label>
              <Input
                placeholder="Reason for withdrawal"
                value={withdrawForm.description}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleWithdraw} disabled={isWithdrawing}>
              {isWithdrawing ? "Processing..." : "Withdraw"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Landlord Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Contact Estate Office</DialogTitle>
            <DialogDescription>
              Reach out to your estate management for any enquiries.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {apiApartment && (
              <div className="rounded-lg border bg-slate-50 dark:bg-slate-800/60 p-4 space-y-2 text-sm">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-0.5">Estate</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{apiApartment.estate}</p>
                </div>
                {apiApartment.estateAddress && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-0.5">Address</p>
                    <p className="text-slate-700 dark:text-slate-300">{apiApartment.estateAddress}</p>
                  </div>
                )}
              </div>
            )}
            <p className="text-sm text-slate-600 dark:text-slate-400">
              For maintenance issues, use the <strong>Complaints</strong> tab. For urgent matters, please visit the estate office directly or call the estate manager.
            </p>
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={() => setContactDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transfer Funds</DialogTitle>
            <DialogDescription>
              Send money to another user's wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Recipient Email</label>
              <Input
                placeholder="Enter recipient's email"
                value={transferForm.recipient}
                onChange={(e) => setTransferForm({ ...transferForm, recipient: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Amount (₦)</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={transferForm.amount}
                onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (Optional)</label>
              <Input
                placeholder="Reason for transfer"
                value={transferForm.description}
                onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTransfer} disabled={isTransferringUser}>
              {isTransferringUser ? "Processing..." : "Transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
