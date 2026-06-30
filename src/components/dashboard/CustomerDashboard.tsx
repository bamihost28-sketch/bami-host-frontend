import { useState, useEffect } from "react";
import { CUSTOMER_DEMO_DATA } from "@/data/demoData";
import {
  useGetWalletBalanceQuery,
  useGetOwnTransactionsQuery,
  useGetTransactionsListQuery,
  useDepositMutation,
  useWithdrawMutation,
  useTransferToUserMutation,
  useTransferToEstateMutation,
  useCreateTransactionMutation,
} from "@/services";

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [selectedContract, setSelectedContract] = useState<string | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<'installment' | 'full' | 'stage'>('installment');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('wallet');
  const [localCustomerData, setCustomerData] = useState(CUSTOMER_DEMO_DATA as any);
  const [loading, setLoading] = useState(false);
  const { success, error: toastError } = useToast();

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate penalty updates
      setCustomerData((prev: any) => ({
        ...prev,
        penalties: {
          ...prev.penalties,
          activePenalties: prev.penalties.activePenalties + (Math.random() > 0.8 ? 300 : 0)
        }
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNaira = (amount: number) => {
    return `₦${formatCurrency(amount)}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return dateString;
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'long' }).toLowerCase();
    const year = d.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Active</Badge>;
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case 'paid':
        return <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>;
      case 'late':
        return <Badge variant="destructive">Late</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">In Progress</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'late':
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-600" />;
      default:
        return <Calendar className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const amount = parseFloat(paymentAmount);
      if (amount > 0) {
        // Update customer data
        setCustomerData((prev: any) => ({
          ...prev,
          customer: {
            ...prev.customer,
            currentDue: Math.max(0, prev.customer.currentDue - amount),
            walletBalance: prev.customer.walletBalance - amount
          },
          paymentHistory: [
            {
              id: `pay_${Date.now()}`,
              contractId: selectedContract || 'general',
              date: new Date().toISOString().split('T')[0],
              description: `${paymentType === 'installment' ? 'Installment' : paymentType === 'full' ? 'Full' : 'Stage'} Payment`,
              amount: amount,
              type: paymentType,
              status: 'completed',
              method: selectedPaymentMethod,
              penalty: 0
            },
            ...prev.paymentHistory
          ]
        }));

        success(`Payment of ${formatNaira(amount)} processed successfully!`);
        setPaymentModalOpen(false);
        setPaymentAmount('');
      }
    } catch (error) {
      toastError('Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeStage = async (contractId: string, stageIndex: number) => {
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      setCustomerData((prev: any) => ({
        ...prev,
        contracts: prev.contracts.map((contract: any) =>
          contract.id === contractId
            ? {
              ...contract,
              deliveryStages: contract.deliveryStages.map((stage: any, index: number) =>
                index === stageIndex
                  ? {
                    ...stage,
                    customerAcknowledged: true,
                    acknowledgedDate: new Date().toISOString().split('T')[0],
                    customerNotes: 'Work approved and acknowledged by customer',
                    paymentReleased: true,
                    paymentReleaseDate: new Date().toISOString().split('T')[0]
                  }
                  : stage
              )
            }
            : contract
        )
      }));

      success('Stage acknowledged successfully! Payment released to vendor.');
    } catch (error) {
      toastError('Failed to acknowledge stage. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadStatement = () => {
    success('Statement download started. Check your downloads folder.');
  };

  const creditUtilization = (localCustomerData.customer.totalBalance / localCustomerData.customer.creditLimit) * 100;

  return (
    <div className="space-y-6">


      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="financial-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="financial-amount text-2xl font-bold">
              {formatNaira(localCustomerData.customer.totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Outstanding amount
            </p>
          </CardContent>
        </Card>

        <Card className="financial-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Due</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="financial-amount text-2xl font-bold text-warning">
              {formatNaira(localCustomerData.customer.currentDue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Due by {formatDate(localCustomerData.customer.nextPaymentDate)}
            </p>
          </CardContent>
        </Card>

        <Card className="financial-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Limit</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="financial-amount text-2xl font-bold text-success">
              {formatNaira(localCustomerData.customer.creditLimit)}
            </div>
            <p className="text-xs text-muted-foreground">
              {creditUtilization.toFixed(1)}% utilized
            </p>
          </CardContent>
        </Card>

        <Card className="financial-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Penalties</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="financial-amount text-2xl font-bold text-destructive">
              {formatNaira(localCustomerData.penalties.activePenalties)}
            </div>
            <p className="text-xs text-muted-foreground">
              Late payment fees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="financial-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 h-auto p-3 md:p-4 flex-col text-xs md:text-sm bg-green-600 hover:bg-green-700">
                  <CreditCard className="w-6 h-6" />
                  <span>Make Payment</span>
                  <span className="text-xs opacity-75">Pay current due amount</span>
                </Button>
              </DialogTrigger>
            </Dialog>

            <Button variant="outline" className="gap-2 h-auto p-3 md:p-4 flex-col text-xs md:text-sm hover:bg-blue-50">
              <Calendar className="w-5 h-5 md:w-6 md:h-6" />
              <span>Schedule Payment</span>
              <span className="text-xs opacity-75 hidden md:block">Set up auto-pay</span>
            </Button>

            <Button
              variant="outline"
              className="gap-2 h-auto p-3 md:p-4 flex-col text-xs md:text-sm hover:bg-gray-50"
              onClick={downloadStatement}
            >
              <Receipt className="w-5 h-5 md:w-6 md:h-6" />
              <span>Download Statement</span>
              <span className="text-xs opacity-75 hidden md:block">Get monthly report</span>
            </Button>

            <Button variant="outline" className="gap-2 h-auto p-3 md:p-4 flex-col text-xs md:text-sm hover:bg-purple-50">
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
              <span>Contact Support</span>
              <span className="text-xs opacity-75 hidden md:block">Get help & support</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Installment Plans */}
      <Card className="financial-card">
        <CardHeader>
          <CardTitle>Active Installment Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {localCustomerData.installmentPlans.map((plan) => (
              <div key={plan.id} className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-3">
                  <div className="flex items-start space-x-3 flex-1">
                    {getStatusIcon(plan.status)}
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground text-sm md:text-base">{plan.name}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {plan.status === 'active' ? `Next payment: ${formatDate(plan.nextDue)}` : 'Completed'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                    <div className="text-left sm:text-right">
                      <div className="financial-amount font-semibold text-sm md:text-base">
                        {formatNaira(plan.remainingAmount)}
                      </div>
                      <div className="text-xs md:text-sm text-muted-foreground">
                        of {formatNaira(plan.totalAmount)} remaining
                      </div>
                    </div>
                    {getStatusBadge(plan.status)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {((plan.paidAmount / plan.totalAmount) * 100).toFixed(0)}% paid
                    </span>
                  </div>
                  <Progress value={(plan.paidAmount / plan.totalAmount) * 100} className="h-2" />
                </div>

                {plan.status === 'active' && (
                  <div className="mt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-lg bg-primary/5 border border-primary/20 gap-3">
                    <div>
                      <div className="text-xs md:text-sm font-medium">Monthly Payment</div>
                      <div className="financial-amount text-base md:text-lg font-bold text-primary">
                        {formatNaira(plan.monthlyPayment)}
                      </div>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto">
                      <div className="text-xs md:text-sm font-medium">{plan.installmentsLeft} payments left</div>
                      <Button size="sm" className="mt-1 w-full sm:w-auto">
                        Pay Now
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card className="financial-card">
        <CardHeader>
          <CardTitle>Recent Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {localCustomerData.paymentHistory.map((payment, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-start justify-between p-3 rounded-lg border border-border gap-3">
                <div className="flex items-start space-x-3 flex-1">
                  {getStatusIcon(payment.status)}
                  <div className="flex-1">
                    <div className="font-medium text-foreground text-sm md:text-base">{payment.description}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">{formatDate(payment.date)}</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                  <div className="text-left sm:text-right">
                    <div className={`financial-amount font-semibold text-sm md:text-base ${payment.status === 'paid' ? 'text-success' : 'text-destructive'}`}>
                      {formatNaira(payment.amount)}
                    </div>
                    {payment.penalty > 0 && (
                      <div className="text-xs md:text-sm text-destructive">
                        +{formatNaira(payment.penalty)} penalty
                      </div>
                    )}
                  </div>
                  {getStatusBadge(payment.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Contracts with Delivery Tracking */}
      <Card className="financial-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Active Contracts & Delivery Tracking
          </CardTitle>
          <CardDescription>Track your project progress and acknowledge completed stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {localCustomerData.contracts.map((contract: any) => (
              <div key={contract.id} className="border border-border rounded-lg p-4 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{contract.projectName}</h3>
                    <p className="text-sm text-muted-foreground">Vendor: {contract.vendorName}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="text-sm">
                        <span className="font-medium">Total: </span>{formatNaira(contract.totalAmount)}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Payment: </span>
                        {contract.paymentOption === 'installment' ? 'Installments' : 'One-time'}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Due: </span>{formatDate(contract.expectedCompletionDate)}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(contract.status)}
                </div>

                {/* Delivery Stages */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Delivery Stages</h4>
                  {contract.deliveryStages.map((stage: any, stageIndex: number) => (
                    <div key={stageIndex} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(stage.status)}
                          <span className="font-medium">{stage.name}</span>
                          <span className="text-sm text-muted-foreground">({formatNaira(stage.amount)})</span>
                        </div>
                        {getStatusBadge(stage.status)}
                      </div>

                      {/* Vendor Proof Uploads */}
                      {stage.vendorProofUploads.length > 0 && (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium mb-2">Vendor Submissions:</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {stage.vendorProofUploads.map((proof: any) => (
                              <div key={proof.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                {proof.type === 'photo' && <Camera className="w-4 h-4" />}
                                {proof.type === 'video' && <Video className="w-4 h-4" />}
                                {proof.type === 'document' && <FileText className="w-4 h-4" />}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{proof.fileName}</p>
                                  <p className="text-xs text-muted-foreground">{formatDate(proof.uploadDate)}</p>
                                </div>
                                <Button size="sm" variant="outline">
                                  <Eye className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Customer Acknowledgment */}
                      {stage.status === 'in_progress' && stage.vendorProofUploads.length > 0 && !stage.customerAcknowledged && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm mb-2">Please review the vendor submissions and acknowledge if the work is completed satisfactorily.</p>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => acknowledgeStage(contract.id, stageIndex)}
                            disabled={loading}
                          >
                            {loading ? 'Processing...' : 'Acknowledge & Release Payment'}
                          </Button>
                        </div>
                      )}

                      {/* Acknowledgment Status */}
                      {stage.customerAcknowledged && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Acknowledged on {formatDate(stage.acknowledgedDate)}</span>
                          </div>
                          {stage.customerNotes && (
                            <p className="text-sm text-green-600 mt-1">{stage.customerNotes}</p>
                          )}
                          {stage.paymentReleased && (
                            <p className="text-xs text-green-500 mt-1">Payment released to vendor on {formatDate(stage.paymentReleaseDate)}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <TransactionsPanel
        formatCurrency={(amount: number) => `₦${formatCurrency(amount)}`}
        formatDate={(dateString: string | null) => {
          if (!dateString) return 'N/A';
          const d = new Date(dateString);
          if (Number.isNaN(d.getTime())) return dateString;
          return d.toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
        }}
        getStatusColor={(status: string) => {
          switch (status) {
            case 'completed':
            case 'paid':
              return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'pending':
              return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            default:
              return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200';
          }
        }}
      />

      {/* Payment Modal */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <BamiHostLogo variant="icon-only" />
              <div>
                <DialogTitle>Make Payment</DialogTitle>
                <DialogDescription>
                  Process your payment securely through Bami Host
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Payment Type */}
            <div className="space-y-2">
              <Label>Payment Type</Label>
              <Select value={paymentType} onValueChange={setPaymentType as any}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="installment">Monthly Installment</SelectItem>
                  <SelectItem value="full">Full Payment</SelectItem>
                  <SelectItem value="stage">Stage Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
              <div className="text-sm text-muted-foreground">
                Current due: {formatNaira(localCustomerData.customer.currentDue)}
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wallet">Wallet Balance ({formatNaira(localCustomerData.customer.walletBalance)})</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="ussd">USSD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Summary */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Payment Amount:</span>
                <span className="font-medium">{paymentAmount ? formatNaira(parseFloat(paymentAmount)) : '₦0'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Processing Fee:</span>
                <span className="font-medium">₦0</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span className="text-green-600">{paymentAmount ? formatNaira(parseFloat(paymentAmount)) : '₦0'}</span>
              </div>
            </div>

            <Alert>
              <Shield className="w-4 h-4" />
              <AlertDescription>
                Your payment is secured with bank-level encryption. Funds will be processed immediately.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handlePayment}
              disabled={loading || !paymentAmount || parseFloat(paymentAmount) <= 0}
            >
              {loading ? 'Processing...' : 'Process Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
