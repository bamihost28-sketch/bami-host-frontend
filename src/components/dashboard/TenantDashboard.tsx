import { useState } from "react";
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
import { AlertCircle, Loader, Calendar, Receipt, Wallet, CreditCard, Plus } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { useAuth } from "@/contexts/AuthContext";
import { useGetDashboardOverviewQuery, useGetMyBillingQuery, usePayBillingMutation, useGetPaymentTransactionsQuery } from "@/services/estatesApi";
import { TENANT_DEMO_DATA } from "@/data/demoData";
import {
  useGetWalletBalanceQuery,
  useDepositMutation,
  useWithdrawMutation,
  useTransferToUserMutation,
} from "@/services";
import { usePaystackDeposit } from "@/hooks/useWallet";

// Import refactored components
import { OverviewCards } from "./tenant/OverviewCards";
import { WalletBalanceCard } from "./tenant/WalletBalanceCard";
import { QuickActions } from "./tenant/QuickActions";
import { NoticeCard } from "./tenant/NoticeCard";
import { MaintenanceList } from "./tenant/MaintenanceList";
import { BillingItemList } from "./tenant/BillingItemList";
import { PaymentMethodSelector } from "./tenant/PaymentMethodSelector";
import { PaymentSummary } from "./tenant/PaymentSummary";
import { VisitorList } from "./tenant/VisitorList";
import { DocumentList } from "./tenant/DocumentList";
import { ComplaintList } from "./tenant/ComplaintList";
import { formatCurrency, formatDate } from "./tenant/utils";

export const TenantDashboard: React.FC = () => {
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [visitorDialogOpen, setVisitorDialogOpen] = useState(false);
  const [complaintDialogOpen, setComplaintDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ 
    type: "rent",
    amount: 0,
    month: ""
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [depositForm, setDepositForm] = useState({ amount: "" });
  const [withdrawForm, setWithdrawForm] = useState({ amount: "", description: "" });
  const [transferForm, setTransferForm] = useState({ amount: "", recipient: "", recipientAccount: "", bank: "", description: "" });
  const [selectedBillingItems, setSelectedBillingItems] = useState<string[]>([]);
  const [billingDialogOpen, setBillingDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "paystack">("wallet");

  // Fetch dashboard overview from API
  const { data: overviewData, isLoading: overviewLoading } = useGetDashboardOverviewQuery();
  const { data: billingData } = useGetMyBillingQuery();
  const [payBilling, { isLoading: isPaying }] = usePayBillingMutation();
  const { data: transactionsData, isLoading: transactionsLoading } = useGetPaymentTransactionsQuery({ page: 1, limit: 20 });

  // Wallet Transaction API Hooks
  const { data: walletResponse, isLoading: walletLoading, refetch: refetchWallet } = useGetWalletBalanceQuery();
  const [deposit, { isLoading: isDepositing }] = useDepositMutation();
  const [withdraw, { isLoading: isWithdrawing }] = useWithdrawMutation();
  const [transferToUser, { isLoading: isTransferringUser }] = useTransferToUserMutation();
  
  // Paystack Deposit Hook
  const { initializeDeposit, isInitializing } = usePaystackDeposit();

  // Get API data
  const apiUser = overviewData?.data?.user;
  const apiApartment = overviewData?.data?.data?.apartment;
  const apiBilling = overviewData?.data?.data?.billing;
  const billingItems = billingData?.data;
  
  // Get Wallet Data from API
  const walletData = walletResponse?.data;
  const walletBalance = walletData?.balance || 0;

  // Calculate totals from billing
  const recurringTotal = billingItems?.recurring?.reduce((sum: number, item: any) => sum + item.amount, 0) || 0;
  const oneTimeTotal = billingItems?.oneTime?.reduce((sum: number, item: any) => sum + item.amount, 0) || 0;
  const totalDue = recurringTotal + oneTimeTotal;

  // Use API data or fallback to demo data
  const tenantInfo = apiApartment ? {
    name: apiApartment.tenantName,
    apartmentNumber: apiApartment.unit,
    estateName: apiApartment.estate,
    leaseStatus: apiApartment.status,
    leaseEndDate: apiApartment.nextDueDate,
    monthlyRent: apiApartment.rentAmount,
    rentDueDay: 25,
    outstandingBalance: apiBilling?.totalPending || 0,
    nextPaymentDue: apiApartment.nextDueDate,
    id: apiApartment.id,
    email: apiUser?.email || "",
    phone: authUser?.phone || "",
    serviceCharge: apiApartment.serviceChargeAmount,
  } : {
    name: authUser?.name || "Valued Tenant",
    apartmentNumber: "Flat 4B",
    estateName: "Rose Garden Estate",
    leaseStatus: "active",
    leaseEndDate: "2026-12-31",
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
  const daysUntilRentDue = tenantInfo?.nextPaymentDue 
    ? Math.ceil((new Date(tenantInfo.nextPaymentDue).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 30;

  const handlePayRent = () => {
    setPaymentForm({ type: "rent", amount: tenantInfo.monthlyRent, month: "Current Month" });
    setPaymentDialogOpen(true);
  };

  const handleProcessPayment = async () => {
    try {
      setIsProcessingPayment(true);
      
      if (!paymentForm.amount || paymentForm.amount <= 0) {
        toast("Error: Please enter a valid amount");
        return;
      }

      toast("Processing: Payment in progress...");

      const paymentTypeMap: Record<string, string> = {
        'rent': 'rent',
        'service_charge': 'service_charge',
        'caution_fee': 'caution_fee',
        'legal_fee': 'legal_fee',
      };

      const result = await payBilling({
        billingCode: paymentTypeMap[paymentForm.type] || paymentForm.type,
        amount: paymentForm.amount,
        paymentType: paymentForm.type,
      }).unwrap();

      if (result.authorizationUrl) {
        window.location.href = result.authorizationUrl;
      } else {
        toast("Success: Payment received");
        setPaymentDialogOpen(false);
        setPaymentForm({ type: "rent", amount: 0, month: "" });
      }
    } catch (error: any) {
      toast(error?.data?.message || "Error: Payment failed. Please try again");
    } finally {
      setIsProcessingPayment(false);
    }
  };

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
    let total = 0;
    const allItems = [...(billingItems?.recurring || []), ...(billingItems?.oneTime || [])];
    allItems.forEach((item: any) => {
      if (selectedBillingItems.includes(item.code)) {
        total += item.amount;
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

      if (paymentMethod === "wallet" && totalAmount > walletBalance) {
        toast(`Error: Insufficient wallet balance. You need ₦${(totalAmount - walletBalance).toLocaleString()} more`);
        return;
      }

      setIsProcessingPayment(true);
      toast("Processing: Payment in progress...");

      if (paymentMethod === "wallet") {
        // For wallet payments, send itemIds array format
        const result = await payBilling({
          itemIds: selectedBillingItems,
          paymentMethod: "wallet",
        }).unwrap();

        toast("Success: Payment completed from your wallet");
        setBillingDialogOpen(false);
        setSelectedBillingItems([]);
        refetchWallet();
      } else {
        // For Paystack payments, send the original format
        const result = await payBilling({
          billingCode: selectedBillingItems[0],
          amount: totalAmount,
          paymentType: selectedBillingItems.join(","),
          paymentMethod: paymentMethod,
        }).unwrap();

        if (result.authorizationUrl) {
          window.location.href = result.authorizationUrl;
        } else {
          toast("Success: Payment received");
          setBillingDialogOpen(false);
          setSelectedBillingItems([]);
        }
      }
    } catch (error: any) {
      toast(error?.data?.message || "Error: Payment failed. Please try again");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleReportMaintenance = () => setMaintenanceDialogOpen(true);
  const handleGenerateVisitorPass = () => setVisitorDialogOpen(true);

  const handleOpenDeposit = () => {
    setDepositForm({ amount: "" });
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
    if (!depositForm.amount || parseFloat(depositForm.amount) <= 0) {
      toast("Error: Please enter a valid amount");
      return;
    }
    try {
      await initializeDeposit(parseFloat(depositForm.amount));
      setDepositDialogOpen(false);
      setDepositForm({ amount: "" });
    } catch (error: any) {
      toast(`Error: ${error?.data?.message || "Deposit failed"}`);
    }
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

  const allBillingItems = [...(billingItems?.recurring || []), ...(billingItems?.oneTime || [])];

  return (
    <div className="p-6 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap w-full gap-1 dashboard-tabs-list">
          <TabsTrigger value="overview">Home</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="maintenance">Issues</TabsTrigger>
          <TabsTrigger value="visitors">Visitors</TabsTrigger>
          <TabsTrigger value="notices">Notices</TabsTrigger>
          <TabsTrigger value="documents">Docs</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
          <TabsTrigger value="utilities">Utilities</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-slate-900 dark:text-white">Welcome back, {firstName}!</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">Here's your home overview</CardDescription>
                </div>
                <Badge className={`${tenantInfo.leaseStatus === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"} border`}>
                  {tenantInfo.leaseStatus === "active" ? "Active Lease" : "Lease Expiring"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <OverviewCards 
                tenantInfo={tenantInfo}
                daysUntilRentDue={daysUntilRentDue}
                totalDue={totalDue}
                recurringCount={billingItems?.recurring?.length || 0}
              />
              
              <WalletBalanceCard 
                balance={walletBalance}
                isLoading={walletLoading}
                onDeposit={handleOpenDeposit}
                onWithdraw={handleOpenWithdraw}
                onTransfer={handleOpenTransfer}
                isDepositing={isDepositing}
                isWithdrawing={isWithdrawing}
                isTransferring={isTransferringUser}
              />

              <QuickActions 
                onPayRent={handlePayRent}
                onReportMaintenance={handleReportMaintenance}
                onGenerateVisitorPass={handleGenerateVisitorPass}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NoticeCard notices={TENANT_DEMO_DATA.notices.slice(0, 3)} />
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 dark:text-white">Maintenance Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <MaintenanceList requests={TENANT_DEMO_DATA.maintenanceRequests.slice(0, 3)} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-slate-900 dark:text-white">Your Billing Items</CardTitle>
                  <CardDescription>Select and pay for the services you use</CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Total Due: {formatCurrency(totalDue)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recurring Items */}
              {billingItems?.recurring && billingItems.recurring.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Monthly Recurring Charges
                  </h3>
                  <BillingItemList 
                    items={billingItems.recurring}
                    selectedItems={selectedBillingItems}
                    onToggleItem={handleSelectBillingItem}
                    disabledItem="rent"
                  />
                </div>
              )}

              {/* One-Time Items */}
              {billingItems?.oneTime && billingItems.oneTime.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-green-600" />
                    One-Time Charges
                  </h3>
                  <BillingItemList 
                    items={billingItems.oneTime}
                    selectedItems={selectedBillingItems}
                    onToggleItem={handleSelectBillingItem}
                  />
                </div>
              )}

              {/* Payment Summary & Method */}
              {selectedBillingItems.length > 0 && (
                <div className="space-y-4">
                  <PaymentMethodSelector 
                    paymentMethod={paymentMethod}
                    onMethodChange={setPaymentMethod}
                    walletBalance={walletBalance}
                  />

                  {paymentMethod === "wallet" && calculateSelectedTotal() > walletBalance && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="ml-2 text-red-800">
                        Insufficient wallet balance. You need ₦{((calculateSelectedTotal() - walletBalance)).toLocaleString()} more.
                      </AlertDescription>
                    </Alert>
                  )}

                  <PaymentSummary 
                    selectedItems={selectedBillingItems}
                    allItems={allBillingItems}
                    totalAmount={calculateSelectedTotal()}
                  />

                  <Button
                    onClick={handlePaySelectedBilling}
                    disabled={
                      selectedBillingItems.length === 0 ||
                      isProcessingPayment ||
                      (paymentMethod === "wallet" && calculateSelectedTotal() > walletBalance)
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
                        {paymentMethod === "wallet" ? (
                          <>
                            <Wallet className="h-5 w-5 mr-2" />
                            Pay {formatCurrency(calculateSelectedTotal())} from Wallet
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-5 w-5 mr-2" />
                            Pay {formatCurrency(calculateSelectedTotal())} with Paystack
                          </>
                        )}
                      </>
                    )}
                  </Button>

                  {selectedBillingItems.includes("rent") && selectedBillingItems.includes("service_charge") && (
                    <Alert className="border-blue-200 bg-blue-50">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="ml-2 text-blue-800">
                        Service Charge is automatically included with your rent payment as per your lease agreement.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {selectedBillingItems.length === 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Select items above to proceed with payment</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Submit Maintenance Request</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleReportMaintenance}>
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Your Requests</CardTitle>
              <CardDescription>{TENANT_DEMO_DATA.maintenanceRequests.length} requests</CardDescription>
            </CardHeader>
            <CardContent>
              <MaintenanceList requests={TENANT_DEMO_DATA.maintenanceRequests} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visitors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Generate Visitor Access</CardTitle>
              <CardDescription>Create temporary access codes for your visitors</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleGenerateVisitorPass}>
                <Plus className="h-4 w-4 mr-2" />
                New Visitor Pass
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <VisitorList 
                visitors={TENANT_DEMO_DATA.visitors}
                showPendingActions={true}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Visitor History</CardTitle>
            </CardHeader>
            <CardContent>
              <VisitorList visitors={TENANT_DEMO_DATA.visitors} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notices" className="space-y-6">
          <NoticeCard notices={TENANT_DEMO_DATA.notices} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Your Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentList documents={TENANT_DEMO_DATA.documents} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complaints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Submit Complaint</CardTitle>
              <CardDescription>Report issues not related to maintenance</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setComplaintDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Complaint
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Complaint History</CardTitle>
            </CardHeader>
            <CardContent>
              <ComplaintList complaints={TENANT_DEMO_DATA.complaints} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Transaction History</CardTitle>
              <CardDescription>View your wallet transactions and payments</CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <p className="text-center py-8 text-slate-500">Loading transactions...</p>
              ) : transactionsData?.data && transactionsData.data.length > 0 ? (
                <div className="space-y-3">
                  {transactionsData.data.map((item: any) => {
                    const isPayment = item.recordType === 'payment';
                    const isWithdrawal = !isPayment && (item.type === 'withdrawal' || item.type === 'payment');
                    
                    return (
                      <div key={item._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium capitalize">
                            {isPayment 
                              ? (item.paymentType?.replace('_', ' ') || 'Payment')
                              : (item.type || 'Transaction')
                            }
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {formatDate(item.date || item.createdAt)} • {isPayment ? (item.paymentMethod || 'N/A') : (item.method || 'N/A')}
                          </p>
                          {item.description && (
                            <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                          )}
                          {item.tenant && (
                            <p className="text-xs text-slate-400 mt-1">Tenant: {item.tenant.tenantName}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${isWithdrawal ? 'text-red-600' : 'text-green-600'}`}>
                            {isWithdrawal ? '-' : '+'}
                            {formatCurrency(item.amount)}
                          </p>
                          <Badge className={
                            (isPayment ? item.paymentStatus : item.status) === 'completed' ? 'bg-green-100 text-green-800' : 
                            (isPayment ? item.paymentStatus : item.status) === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }>
                            {isPayment ? item.paymentStatus : item.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center py-8 text-slate-500">No transactions found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Deposit Dialog */}
      <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deposit Funds</DialogTitle>
            <DialogDescription>
              Enter the amount you want to deposit into your wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Amount (₦)</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={depositForm.amount}
                onChange={(e) => setDepositForm({ amount: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDepositDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeposit} disabled={isInitializing}>
              {isInitializing ? "Initializing..." : "Deposit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent>
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

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
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
