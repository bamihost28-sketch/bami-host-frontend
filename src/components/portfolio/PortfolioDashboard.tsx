import { useState, useEffect, useRef } from "react";
import { useGetPersonalFinanceQuery, useSavePersonalFinanceMutation } from "@/services/personalFinanceApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  Plus,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  AlertTriangle,
  Target,
  Banknote,
  Building,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Wallet
} from "lucide-react";
import { BusinessPortfolioOverview } from "@/components/dashboard/BusinessPortfolioOverview";

interface Investment {
  id: string;
  name: string;
  type: 'tbills' | 'stocks' | 'bonds' | 'mutual_funds';
  symbol: string;
  amount: number;
  currentValue: number;
  purchasePrice: number;
  quantity: number;
  purchaseDate: string;
  maturityDate?: string;
  interestRate?: number;
  performance: number;
  sector?: string;
  risk: 'low' | 'medium' | 'high';
}

export const PortfolioDashboard = () => {
  const [timeRange, setTimeRange] = useState("1M");
  const [showValues, setShowValues] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");

  // Mock investment data
  const [investments, setInvestments] = useState<Investment[]>([
    {
      id: "1",
      name: "Nigerian Treasury Bills 365-day",
      type: "tbills",
      symbol: "NTB-365",
      amount: 1000000,
      currentValue: 1180000,
      purchasePrice: 1000000,
      quantity: 1,
      purchaseDate: "2024-01-15",
      maturityDate: "2025-01-15",
      interestRate: 18.0,
      performance: 18.0,
      risk: "low"
    },
    {
      id: "2",
      name: "Dangote Cement",
      type: "stocks",
      symbol: "DANGCEM",
      amount: 500000,
      currentValue: 575000,
      purchasePrice: 250.0,
      quantity: 2000,
      purchaseDate: "2024-02-20",
      performance: 15.0,
      sector: "Materials",
      risk: "medium"
    },
    {
      id: "3",
      name: "Federal Government Bond 2034",
      type: "bonds",
      symbol: "FGN-2034",
      amount: 750000,
      currentValue: 765000,
      purchasePrice: 750000,
      quantity: 1,
      purchaseDate: "2024-01-10",
      maturityDate: "2034-01-10",
      interestRate: 15.5,
      performance: 2.0,
      risk: "low"
    },
    {
      id: "4",
      name: "GTBank",
      type: "stocks",
      symbol: "GTCO",
      amount: 300000,
      currentValue: 285000,
      purchasePrice: 30.0,
      quantity: 10000,
      purchaseDate: "2024-03-01",
      performance: -5.0,
      sector: "Financial",
      risk: "medium"
    },
    {
      id: "5",
      name: "Stanbic Equity Fund",
      type: "mutual_funds",
      symbol: "STBEQ",
      amount: 200000,
      currentValue: 224000,
      purchasePrice: 200000,
      quantity: 1,
      purchaseDate: "2024-02-01",
      performance: 12.0,
      risk: "medium"
    }
  ]);

  // ── Backend persistence (portfolio slice): load on mount, autosave ──
  const { data: pf, isSuccess: pfLoaded } = useGetPersonalFinanceQuery();
  const [savePf] = useSavePersonalFinanceMutation();
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!pfLoaded || hydratedRef.current) return;
    hydratedRef.current = true;
    const inv = pf?.exists ? pf.portfolio?.investments : null;
    if (Array.isArray(inv) && inv.length) setInvestments(inv as Investment[]);
  }, [pfLoaded, pf]);
  useEffect(() => {
    if (!hydratedRef.current) return;
    const t = setTimeout(() => savePf({ portfolio: { ...(pf?.portfolio || {}), investments } }), 1200);
    return () => clearTimeout(t);
  }, [investments]);

  const totalPortfolioValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalGains = totalPortfolioValue - totalInvested;
  const totalReturn = ((totalPortfolioValue - totalInvested) / totalInvested) * 100;

  const portfolioByType = investments.reduce((acc, inv) => {
    if (!acc[inv.type]) acc[inv.type] = { value: 0, count: 0 };
    acc[inv.type].value += inv.currentValue;
    acc[inv.type].count += 1;
    return acc;
  }, {} as Record<string, { value: number; count: number }>);

  const formatCurrency = (amount: number) => {
    return showValues ? `₦${amount.toLocaleString()}` : "••••••";
  };

  const getPerformanceColor = (performance: number) => {
    if (performance > 0) return "text-green-600";
    if (performance < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getPerformanceIcon = (performance: number) => {
    if (performance > 0) return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    if (performance < 0) return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getInvestmentIcon = (type: string) => {
    switch (type) {
      case 'tbills':
        return <Banknote className="h-5 w-5" />;
      case 'stocks':
        return <TrendingUp className="h-5 w-5" />;
      case 'bonds':
        return <Landmark className="h-5 w-5" />;
      case 'mutual_funds':
        return <Building className="h-5 w-5" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  const getInvestmentTypeLabel = (type: string) => {
    switch (type) {
      case 'tbills':
        return 'Treasury Bills';
      case 'stocks':
        return 'Stocks';
      case 'bonds':
        return 'Bonds';
      case 'mutual_funds':
        return 'Mutual Funds';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Business Portfolio (moved from Owner overview) */}
      <BusinessPortfolioOverview />

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold">Investment Portfolio</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Track your investments across T-Bills, stocks, bonds, and mutual funds
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
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1D">1D</SelectItem>
              <SelectItem value="1W">1W</SelectItem>
              <SelectItem value="1M">1M</SelectItem>
              <SelectItem value="3M">3M</SelectItem>
              <SelectItem value="1Y">1Y</SelectItem>
              <SelectItem value="ALL">All</SelectItem>
            </SelectContent>
          </Select>
          
          <Button size="sm" className="flex items-center justify-center gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            <span className="hidden xs:inline">Add Investment</span>
            <span className="xs:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPortfolioValue)}</div>
            <div className="flex items-center gap-1 text-sm">
              {getPerformanceIcon(totalReturn)}
              <span className={getPerformanceColor(totalReturn)}>
                {totalReturn > 0 ? "+" : ""}{totalReturn.toFixed(2)}%
              </span>
              <span className="text-muted-foreground">vs invested</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvested)}</div>
            <p className="text-sm text-muted-foreground">
              Across {investments.length} investments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gains/Loss</CardTitle>
            {totalGains >= 0 ? 
              <ArrowUpRight className="h-4 w-4 text-green-600" /> : 
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            }
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(totalGains)}`}>
              {totalGains >= 0 ? "+" : ""}{formatCurrency(Math.abs(totalGains))}
            </div>
            <p className="text-sm text-muted-foreground">
              {totalGains >= 0 ? "Profit" : "Loss"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Performer</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.max(...investments.map(i => i.performance)).toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">
              {investments.find(i => i.performance === Math.max(...investments.map(inv => inv.performance)))?.name.split(' ')[0]}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="holdings" className="text-xs sm:text-sm">Holdings</TabsTrigger>
          <TabsTrigger value="performance" className="text-xs sm:text-sm">Performance</TabsTrigger>
          <TabsTrigger value="allocation" className="text-xs sm:text-sm">Allocation</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Portfolio Allocation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Portfolio Allocation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(portfolioByType).map(([type, data]) => {
                  const percentage = (data.value / totalPortfolioValue) * 100;
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getInvestmentIcon(type)}
                          <span className="font-medium">{getInvestmentTypeLabel(type)}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(data.value)}</div>
                          <div className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investments.slice(0, 4).map((investment) => (
                    <div key={investment.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getInvestmentIcon(investment.type)}
                        <div>
                          <div className="font-medium">{investment.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(investment.purchaseDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(investment.currentValue)}</div>
                        <div className={`text-sm flex items-center gap-1 ${getPerformanceColor(investment.performance)}`}>
                          {getPerformanceIcon(investment.performance)}
                          {investment.performance > 0 ? "+" : ""}{investment.performance.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Risk Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['low', 'medium', 'high'].map((risk) => {
                  const riskInvestments = investments.filter(i => i.risk === risk);
                  const riskValue = riskInvestments.reduce((sum, i) => sum + i.currentValue, 0);
                  const riskPercentage = (riskValue / totalPortfolioValue) * 100;
                  
                  return (
                    <div key={risk} className="text-center">
                      <div className={`text-2xl font-bold ${
                        risk === 'low' ? 'text-green-600' : 
                        risk === 'medium' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {riskPercentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">{risk} Risk</div>
                      <div className="text-xs text-muted-foreground">{riskInvestments.length} investments</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Holdings Tab */}
        <TabsContent value="holdings">
          <Card>
            <CardHeader>
              <CardTitle>All Holdings</CardTitle>
              <CardDescription>
                Detailed view of your investment portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {investments.map((investment) => (
                  <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        {getInvestmentIcon(investment.type)}
                      </div>
                      <div>
                        <div className="font-medium">{investment.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {investment.symbol} • {getInvestmentTypeLabel(investment.type)}
                          {investment.sector && ` • ${investment.sector}`}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>Bought: {new Date(investment.purchaseDate).toLocaleDateString()}</span>
                          {investment.maturityDate && (
                            <span>Matures: {new Date(investment.maturityDate).toLocaleDateString()}</span>
                          )}
                          {investment.interestRate && (
                            <span>Rate: {investment.interestRate}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(investment.currentValue)}</div>
                      <div className={`text-sm flex items-center gap-1 justify-end ${getPerformanceColor(investment.performance)}`}>
                        {getPerformanceIcon(investment.performance)}
                        {investment.performance > 0 ? "+" : ""}{investment.performance.toFixed(1)}%
                      </div>
                      <Badge 
                        variant={
                          investment.risk === 'low' ? 'secondary' : 
                          investment.risk === 'medium' ? 'outline' : 'destructive'
                        }
                        className="mt-1"
                      >
                        {investment.risk} risk
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    Your portfolio has outperformed the NGX All-Share Index by 3.2% over the past year.
                    Treasury Bills contribute 62% of your stable income.
                  </AlertDescription>
                </Alert>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">+15.2%</div>
                    <div className="text-sm text-muted-foreground">YTD Return</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">12.8%</div>
                    <div className="text-sm text-muted-foreground">Avg Annual Return</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">8.5%</div>
                    <div className="text-sm text-muted-foreground">Portfolio Volatility</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Allocation Tab */}
        <TabsContent value="allocation">
          <Card>
            <CardHeader>
              <CardTitle>Asset Allocation Analysis</CardTitle>
              <CardDescription>
                Review your portfolio balance and diversification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert>
                  <Target className="h-4 w-4" />
                  <AlertDescription>
                    Your portfolio is well-diversified across asset classes. Consider increasing equity exposure for higher growth potential.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-4">Current Allocation</h3>
                    <div className="space-y-3">
                      {Object.entries(portfolioByType).map(([type, data]) => {
                        const percentage = (data.value / totalPortfolioValue) * 100;
                        return (
                          <div key={type} className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              {getInvestmentIcon(type)}
                              {getInvestmentTypeLabel(type)}
                            </span>
                            <span className="font-medium">{percentage.toFixed(1)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-4">Recommended Allocation</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Banknote className="h-4 w-4" />
                          Treasury Bills
                        </span>
                        <span className="text-muted-foreground">30-40%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Stocks
                        </span>
                        <span className="text-muted-foreground">40-50%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Landmark className="h-4 w-4" />
                          Bonds
                        </span>
                        <span className="text-muted-foreground">10-20%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Mutual Funds
                        </span>
                        <span className="text-muted-foreground">5-15%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};