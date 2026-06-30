import { useState, useEffect, useRef } from "react";
import { useGetPersonalFinanceQuery, useSavePersonalFinanceMutation } from "@/services/personalFinanceApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PieChart,
  Home,
  ShoppingCart,
  Gamepad2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
  Plus,
  Settings,
  RefreshCw,
  Calendar,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
  Calculator
} from "lucide-react";

interface BudgetItem {
  id: string;
  name: string;
  category: 'needs' | 'wants' | 'savings';
  allocated: number;
  spent: number;
  budgetMonth: string;
}

interface MonthlyBudget {
  month: string;
  totalIncome: number;
  needs: BudgetItem[];
  wants: BudgetItem[];
  savings: BudgetItem[];
}

export const SplitTracker = () => {
  const [currentMonth, setCurrentMonth] = useState("2024-09");
  const [showValues, setShowValues] = useState(true);
  const [monthlyIncome, setMonthlyIncome] = useState(500000);
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [newIncomeAmount, setNewIncomeAmount] = useState(monthlyIncome.toString());

  // ── Backend persistence (budget slice): load income on mount, autosave ──
  const { data: pf, isSuccess: pfLoaded } = useGetPersonalFinanceQuery();
  const [savePf] = useSavePersonalFinanceMutation();
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!pfLoaded || hydratedRef.current) return;
    hydratedRef.current = true;
    const inc = pf?.exists ? (pf.budget?.monthlyIncome) : null;
    if (typeof inc === "number" && inc > 0) { setMonthlyIncome(inc); setNewIncomeAmount(String(inc)); }
  }, [pfLoaded, pf]);
  useEffect(() => {
    if (!hydratedRef.current) return;
    const t = setTimeout(() => savePf({ budget: { ...(pf?.budget || {}), monthlyIncome } }), 1000);
    return () => clearTimeout(t);
  }, [monthlyIncome]);

  // Mock budget data based on 50/30/20 rule
  const budgetData: MonthlyBudget = {
    month: currentMonth,
    totalIncome: monthlyIncome,
    needs: [
      { id: "1", name: "Rent/Mortgage", category: "needs", allocated: 120000, spent: 120000, budgetMonth: currentMonth },
      { id: "2", name: "Groceries", category: "needs", allocated: 50000, spent: 42000, budgetMonth: currentMonth },
      { id: "3", name: "Utilities", category: "needs", allocated: 25000, spent: 22000, budgetMonth: currentMonth },
      { id: "4", name: "Transportation", category: "needs", allocated: 30000, spent: 28000, budgetMonth: currentMonth },
      { id: "5", name: "Insurance", category: "needs", allocated: 15000, spent: 15000, budgetMonth: currentMonth },
      { id: "6", name: "Phone", category: "needs", allocated: 10000, spent: 8500, budgetMonth: currentMonth }
    ],
    wants: [
      { id: "7", name: "Dining Out", category: "wants", allocated: 40000, spent: 35000, budgetMonth: currentMonth },
      { id: "8", name: "Entertainment", category: "wants", allocated: 25000, spent: 18000, budgetMonth: currentMonth },
      { id: "9", name: "Shopping", category: "wants", allocated: 35000, spent: 42000, budgetMonth: currentMonth },
      { id: "10", name: "Hobbies", category: "wants", allocated: 20000, spent: 15000, budgetMonth: currentMonth },
      { id: "11", name: "Personal Care", category: "wants", allocated: 15000, spent: 12000, budgetMonth: currentMonth },
      { id: "12", name: "Subscriptions", category: "wants", allocated: 15000, spent: 14500, budgetMonth: currentMonth }
    ],
    savings: [
      { id: "13", name: "Emergency Fund", category: "savings", allocated: 40000, spent: 40000, budgetMonth: currentMonth },
      { id: "14", name: "Investment", category: "savings", allocated: 30000, spent: 30000, budgetMonth: currentMonth },
      { id: "15", name: "Retirement", category: "savings", allocated: 20000, spent: 20000, budgetMonth: currentMonth },
      { id: "16", name: "Vacation Fund", category: "savings", allocated: 10000, spent: 8000, budgetMonth: currentMonth }
    ]
  };

  const needsTotal = budgetData.needs.reduce((sum, item) => sum + item.allocated, 0);
  const needsSpent = budgetData.needs.reduce((sum, item) => sum + item.spent, 0);
  const wantsTotal = budgetData.wants.reduce((sum, item) => sum + item.allocated, 0);
  const wantsSpent = budgetData.wants.reduce((sum, item) => sum + item.spent, 0);
  const savingsTotal = budgetData.savings.reduce((sum, item) => sum + item.allocated, 0);
  const savingsSpent = budgetData.savings.reduce((sum, item) => sum + item.spent, 0);

  const totalAllocated = needsTotal + wantsTotal + savingsTotal;
  const totalSpent = needsSpent + wantsSpent + savingsSpent;
  const remainingBudget = totalAllocated - totalSpent;

  // Calculate ideal 50/30/20 split
  const idealNeeds = monthlyIncome * 0.5;
  const idealWants = monthlyIncome * 0.3;
  const idealSavings = monthlyIncome * 0.2;

  const formatCurrency = (amount: number) => {
    return showValues ? `₦${amount.toLocaleString()}` : "••••••";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'needs':
        return <Home className="h-5 w-5 text-blue-600" />;
      case 'wants':
        return <ShoppingCart className="h-5 w-5 text-green-600" />;
      case 'savings':
        return <Target className="h-5 w-5 text-purple-600" />;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'needs':
        return 'text-blue-600';
      case 'wants':
        return 'text-green-600';
      case 'savings':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage <= 80) return 'bg-green-500';
    if (percentage <= 95) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getBudgetStatus = (allocated: number, spent: number) => {
    const percentage = (spent / allocated) * 100;
    if (percentage <= 80) return { status: 'good', color: 'text-green-600', icon: <CheckCircle className="h-4 w-4" /> };
    if (percentage <= 100) return { status: 'warning', color: 'text-yellow-600', icon: <AlertTriangle className="h-4 w-4" /> };
    return { status: 'over', color: 'text-red-600', icon: <AlertTriangle className="h-4 w-4" /> };
  };

  const updateIncome = () => {
    const newIncome = parseFloat(newIncomeAmount);
    if (newIncome > 0) {
      setMonthlyIncome(newIncome);
      setIsIncomeDialogOpen(false);
    }
  };

  const CategoryCard = ({ 
    title, 
    category, 
    items, 
    allocated, 
    spent, 
    ideal, 
    percentage 
  }: {
    title: string;
    category: 'needs' | 'wants' | 'savings';
    items: BudgetItem[];
    allocated: number;
    spent: number;
    ideal: number;
    percentage: number;
  }) => {
    const spentPercentage = (spent / allocated) * 100;
    const vs50_30_20 = ((allocated / ideal) - 1) * 100;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getCategoryIcon(category)}
              <span className={getCategoryColor(category)}>{title}</span>
              <Badge variant="outline">{percentage}%</Badge>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{formatCurrency(spent)}</div>
              <div className="text-xs text-muted-foreground">of {formatCurrency(allocated)}</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className={spentPercentage > 100 ? 'text-red-600' : spentPercentage > 90 ? 'text-yellow-600' : 'text-green-600'}>
                {spentPercentage.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={Math.min(spentPercentage, 100)} 
              className="h-2"
            />
            {spentPercentage > 100 && (
              <div className="text-xs text-red-600">
                Over budget by {formatCurrency(spent - allocated)}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {items.slice(0, 3).map((item) => {
              const itemPercentage = (item.spent / item.allocated) * 100;
              const itemStatus = getBudgetStatus(item.allocated, item.spent);
              
              return (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={itemStatus.color}>
                      {itemStatus.icon}
                    </div>
                    <span className="truncate">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(item.spent)}</div>
                    <div className={`text-xs ${itemPercentage > 100 ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {itemPercentage.toFixed(0)}%
                    </div>
                  </div>
                </div>
              );
            })}
            {items.length > 3 && (
              <div className="text-xs text-muted-foreground text-center pt-2">
                +{items.length - 3} more items
              </div>
            )}
          </div>

          <div className="pt-2 border-t">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">vs 50/30/20 rule</span>
              <span className={vs50_30_20 > 10 ? 'text-red-600' : vs50_30_20 < -10 ? 'text-green-600' : 'text-yellow-600'}>
                {vs50_30_20 > 0 ? '+' : ''}{vs50_30_20.toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold">50/30/20 Budget Tracker</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Track your budget allocation: <span className="hidden sm:inline">50% Needs • 30% Wants • 20% Savings & Investments</span>
            <span className="sm:hidden">Smart budget allocation tracking</span>
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowValues(!showValues)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            {showValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="hidden xs:inline">{showValues ? "Hide Values" : "Show Values"}</span>
          </Button>
          
          <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center justify-center gap-2 w-full sm:w-auto">
                <Calculator className="h-4 w-4" />
                <span className="hidden xs:inline">Set Income</span>
                <span className="xs:hidden">Income</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Monthly Income</DialogTitle>
                <DialogDescription>
                  Set your monthly after-tax income to calculate the 50/30/20 budget allocation.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="income">Monthly Income (₦)</Label>
                  <Input
                    id="income"
                    type="number"
                    value={newIncomeAmount}
                    onChange={(e) => setNewIncomeAmount(e.target.value)}
                    placeholder="Enter your monthly income"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsIncomeDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={updateIncome}>
                  Update Income
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Select value={currentMonth} onValueChange={setCurrentMonth}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-09">Sep 2024</SelectItem>
              <SelectItem value="2024-08">Aug 2024</SelectItem>
              <SelectItem value="2024-07">Jul 2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Income & Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyIncome)}</div>
            <p className="text-sm text-muted-foreground">After-tax income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budgeted</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAllocated)}</div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-muted-foreground">
                {((totalAllocated / monthlyIncome) * 100).toFixed(1)}% of income
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
            <div className="flex items-center gap-1 text-sm">
              {totalSpent > totalAllocated ? (
                <ArrowUpRight className="h-4 w-4 text-red-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-green-600" />
              )}
              <span className={totalSpent > totalAllocated ? "text-red-600" : "text-green-600"}>
                {((totalSpent / totalAllocated) * 100).toFixed(1)}% of budget
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            {remainingBudget >= 0 ? 
              <CheckCircle className="h-4 w-4 text-green-600" /> : 
              <AlertTriangle className="h-4 w-4 text-red-600" />
            }
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(remainingBudget))}
            </div>
            <p className="text-sm text-muted-foreground">
              {remainingBudget >= 0 ? 'Under budget' : 'Over budget'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="needs" className="text-xs sm:text-sm">Needs <span className="hidden sm:inline">(50%)</span></TabsTrigger>
          <TabsTrigger value="wants" className="text-xs sm:text-sm">Wants <span className="hidden sm:inline">(30%)</span></TabsTrigger>
          <TabsTrigger value="savings" className="text-xs sm:text-sm">Savings <span className="hidden sm:inline">(20%)</span></TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* 50/30/20 Overview Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <CategoryCard
              title="Needs"
              category="needs"
              items={budgetData.needs}
              allocated={needsTotal}
              spent={needsSpent}
              ideal={idealNeeds}
              percentage={50}
            />
            <CategoryCard
              title="Wants"
              category="wants"
              items={budgetData.wants}
              allocated={wantsTotal}
              spent={wantsSpent}
              ideal={idealWants}
              percentage={30}
            />
            <CategoryCard
              title="Savings & Investments"
              category="savings"
              items={budgetData.savings}
              allocated={savingsTotal}
              spent={savingsSpent}
              ideal={idealSavings}
              percentage={20}
            />
          </div>

          {/* Budget Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Budget Analysis & Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {needsTotal > idealNeeds && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Your essential expenses exceed the recommended 50% of income. Consider reviewing your needs budget or increasing your income.
                    </AlertDescription>
                  </Alert>
                )}
                
                {wantsSpent > wantsTotal && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      You're overspending on wants. Consider cutting back on discretionary spending to stay within the 30% allocation.
                    </AlertDescription>
                  </Alert>
                )}
                
                {savingsSpent >= savingsTotal && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Great job maintaining your savings rate! You're on track with the 20% savings goal.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {((needsSpent / monthlyIncome) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Actual Needs</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {((wantsSpent / monthlyIncome) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Actual Wants</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-lg font-bold text-purple-600">
                      {((savingsSpent / monthlyIncome) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Actual Savings</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="needs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-blue-600" />
                Essential Needs (50% of Income)
              </CardTitle>
              <CardDescription>
                Housing, food, utilities, transportation, and other necessities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-700 rounded-lg">
                  <div>
                    <div className="font-medium">Ideal Budget: {formatCurrency(idealNeeds)}</div>
                    <div className="text-sm text-muted-foreground">
                      Current Budget: {formatCurrency(needsTotal)} ({((needsTotal/monthlyIncome)*100).toFixed(1)}%)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">Spent: {formatCurrency(needsSpent)}</div>
                    <div className="text-sm text-muted-foreground">
                      {((needsSpent/needsTotal)*100).toFixed(1)}% of budget
                    </div>
                  </div>
                </div>
                
                {budgetData.needs.map((item) => {
                  const itemPercentage = (item.spent / item.allocated) * 100;
                  const itemStatus = getBudgetStatus(item.allocated, item.spent);
                  
                  return (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={itemStatus.color}>
                          {itemStatus.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <Progress 
                            value={Math.min(itemPercentage, 100)} 
                            className="h-1 mt-2"
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(item.spent)}</div>
                        <div className="text-sm text-muted-foreground">
                          of {formatCurrency(item.allocated)}
                        </div>
                        <div className={`text-xs ${itemPercentage > 100 ? 'text-red-600' : itemPercentage > 90 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {itemPercentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wants">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-green-600" />
                Discretionary Wants (30% of Income)
              </CardTitle>
              <CardDescription>
                Entertainment, dining out, hobbies, and other lifestyle expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium">Ideal Budget: {formatCurrency(idealWants)}</div>
                    <div className="text-sm text-muted-foreground">
                      Current Budget: {formatCurrency(wantsTotal)} ({((wantsTotal/monthlyIncome)*100).toFixed(1)}%)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">Spent: {formatCurrency(wantsSpent)}</div>
                    <div className="text-sm text-muted-foreground">
                      {((wantsSpent/wantsTotal)*100).toFixed(1)}% of budget
                    </div>
                  </div>
                </div>
                
                {budgetData.wants.map((item) => {
                  const itemPercentage = (item.spent / item.allocated) * 100;
                  const itemStatus = getBudgetStatus(item.allocated, item.spent);
                  
                  return (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={itemStatus.color}>
                          {itemStatus.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <Progress 
                            value={Math.min(itemPercentage, 100)} 
                            className="h-1 mt-2"
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(item.spent)}</div>
                        <div className="text-sm text-muted-foreground">
                          of {formatCurrency(item.allocated)}
                        </div>
                        <div className={`text-xs ${itemPercentage > 100 ? 'text-red-600' : itemPercentage > 90 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {itemPercentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="savings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Savings & Investments (20% of Income)
              </CardTitle>
              <CardDescription>
                Emergency fund, investments, retirement, and future goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                  <div>
                    <div className="font-medium">Ideal Budget: {formatCurrency(idealSavings)}</div>
                    <div className="text-sm text-muted-foreground">
                      Current Budget: {formatCurrency(savingsTotal)} ({((savingsTotal/monthlyIncome)*100).toFixed(1)}%)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">Saved: {formatCurrency(savingsSpent)}</div>
                    <div className="text-sm text-muted-foreground">
                      {((savingsSpent/savingsTotal)*100).toFixed(1)}% of goal
                    </div>
                  </div>
                </div>
                
                {budgetData.savings.map((item) => {
                  const itemPercentage = (item.spent / item.allocated) * 100;
                  const itemStatus = getBudgetStatus(item.allocated, item.spent);
                  
                  return (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={itemStatus.color}>
                          {itemStatus.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <Progress 
                            value={Math.min(itemPercentage, 100)} 
                            className="h-1 mt-2"
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(item.spent)}</div>
                        <div className="text-sm text-muted-foreground">
                          of {formatCurrency(item.allocated)}
                        </div>
                        <div className={`text-xs ${itemPercentage < 80 ? 'text-red-600' : itemPercentage < 100 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {itemPercentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};