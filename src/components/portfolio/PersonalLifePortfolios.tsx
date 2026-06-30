import { useState } from "react";
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
import { BamiHostLogo } from "@/components/brand";
import { AddGoalModal } from "./AddGoalModal";
import {
  UtensilsCrossed,
  Heart,
  Home,
  Users,
  Car,
  GraduationCap,
  Star,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Plus,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  Activity,
  Shield,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface LifeCategoryMetrics {
  id: string;
  name: string;
  category: 'food' | 'healthcare' | 'shelter' | 'family' | 'transport' | 'education' | 'self-branding';
  monthlyBudget: number;
  monthlySpent: number;
  yearlyBudget: number;
  yearlySpent: number;
  goals: LifeGoal[];
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trends: {
    spending: number; // percentage change from last month
    goalProgress: number; // percentage completion
  };
  recommendations: string[];
}

interface LifeGoal {
  id: string;
  title: string;
  targetAmount?: number;
  currentAmount?: number;
  targetDate: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  description: string;
}

export const PersonalLifePortfolios = () => {
  const [timeRange, setTimeRange] = useState("1M");
  const [showValues, setShowValues] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [lifeCategories, setLifeCategories] = useState<LifeCategoryMetrics[]>([

    {
      id: "food",
      name: "Food & Nutrition",
      category: "food",
      monthlyBudget: 150000,
      monthlySpent: 125000,
      yearlyBudget: 1800000,
      yearlySpent: 1250000,
      status: "good",
      trends: {
        spending: -8.5,
        goalProgress: 75
      },
      goals: [
        {
          id: "f1",
          title: "Reduce dining out by 30%",
          currentAmount: 45000,
          targetAmount: 60000,
          targetDate: "2024-12-31",
          status: "in-progress",
          priority: "medium",
          description: "Focus on home cooking to save money and eat healthier"
        },
        {
          id: "f2",
          title: "Start meal prep routine",
          targetDate: "2024-11-30",
          status: "in-progress",
          priority: "high",
          description: "Prepare meals for the week every Sunday"
        }
      ],
      recommendations: [
        "Bami Host tip: You're spending 17% less than budgeted - excellent financial discipline!",
        "Consider investing saved money in quality cooking equipment for long-term savings",
        "Pro tip: Track nutritional goals alongside financial ones for complete wellness"
      ]
    },
    {
      id: "healthcare",
      name: "Healthcare & Wellness",
      category: "healthcare",
      monthlyBudget: 80000,
      monthlySpent: 95000,
      yearlyBudget: 960000,
      yearlySpent: 950000,
      status: "warning",
      trends: {
        spending: 18.8,
        goalProgress: 40
      },
      goals: [
        {
          id: "h1",
          title: "Build health emergency fund",
          currentAmount: 200000,
          targetAmount: 500000,
          targetDate: "2024-12-31",
          status: "in-progress",
          priority: "high",
          description: "Emergency fund for unexpected medical expenses"
        },
        {
          id: "h2",
          title: "Complete annual health checkup",
          targetDate: "2024-10-31",
          status: "not-started",
          priority: "high",
          description: "Comprehensive health screening and preventive care"
        }
      ],
      recommendations: [
        "Bami Host alert: You're over budget by 19% - time to review non-essential health expenses",
        "Smart move: Consider upgrading to health insurance with better coverage",
        "Investment tip: Preventive care today reduces long-term medical costs significantly"
      ]
    },
    {
      id: "shelter",
      name: "Shelter & Housing",
      category: "shelter",
      monthlyBudget: 400000,
      monthlySpent: 400000,
      yearlyBudget: 4800000,
      yearlySpent: 4800000,
      status: "good",
      trends: {
        spending: 0,
        goalProgress: 65
      },
      goals: [
        {
          id: "s1",
          title: "Save for house down payment",
          currentAmount: 3250000,
          targetAmount: 5000000,
          targetDate: "2025-06-30",
          status: "in-progress",
          priority: "high",
          description: "20% down payment for dream home"
        },
        {
          id: "s2",
          title: "Home improvement fund",
          currentAmount: 150000,
          targetAmount: 800000,
          targetDate: "2024-12-31",
          status: "in-progress",
          priority: "medium",
          description: "Renovation and maintenance fund"
        }
      ],
      recommendations: [
        "Bami Host celebrates: Perfect budget control - you're mastering this category!",
        "Smart upgrade: Consider energy-efficient improvements to slash utility costs",
        "House fund momentum: You're progressing excellently - maintain this consistency"
      ]
    },
    {
      id: "family",
      name: "Family & Relationships",
      category: "family",
      monthlyBudget: 100000,
      monthlySpent: 85000,
      yearlyBudget: 1200000,
      yearlySpent: 850000,
      status: "excellent",
      trends: {
        spending: -15,
        goalProgress: 90
      },
      goals: [
        {
          id: "fa1",
          title: "Family vacation fund",
          currentAmount: 450000,
          targetAmount: 500000,
          targetDate: "2024-12-15",
          status: "in-progress",
          priority: "medium",
          description: "Annual family trip to create lasting memories"
        },
        {
          id: "fa2",
          title: "Children's education savings",
          currentAmount: 1200000,
          targetAmount: 2000000,
          targetDate: "2025-12-31",
          status: "in-progress",
          priority: "high",
          description: "Future educational expenses for children"
        }
      ],
      recommendations: [
        "Bami Host gold star: Excellent family financial management - 15% under budget!",
        "Family milestone: Your relationship goals are progressing beautifully",
        "Growth hack: Set up automatic savings for children's education fund"
      ]
    },
    {
      id: "transport",
      name: "Transport & Mobility",
      category: "transport",
      monthlyBudget: 120000,
      monthlySpent: 140000,
      yearlyBudget: 1440000,
      yearlySpent: 1400000,
      status: "warning",
      trends: {
        spending: 16.7,
        goalProgress: 30
      },
      goals: [
        {
          id: "t1",
          title: "Car maintenance fund",
          currentAmount: 75000,
          targetAmount: 250000,
          targetDate: "2024-11-30",
          status: "in-progress",
          priority: "medium",
          description: "Regular maintenance and unexpected repairs"
        },
        {
          id: "t2",
          title: "Upgrade to hybrid vehicle",
          currentAmount: 800000,
          targetAmount: 3500000,
          targetDate: "2025-08-31",
          status: "in-progress",
          priority: "low",
          description: "More fuel-efficient and environmentally friendly car"
        }
      ],
      recommendations: [
        "Bami Host checkpoint: Transportation costs are 17% over budget - time for optimization",
        "Eco-friendly tip: Try carpooling or public transport to reduce costs and carbon footprint",
        "Data-driven approach: Track fuel efficiency and maintenance patterns for better planning"
      ]
    },
    {
      id: "education",
      name: "Education & Skills",
      category: "education",
      monthlyBudget: 75000,
      monthlySpent: 65000,
      yearlyBudget: 900000,
      yearlySpent: 650000,
      status: "good",
      trends: {
        spending: -13.3,
        goalProgress: 55
      },
      goals: [
        {
          id: "e1",
          title: "Professional certification",
          currentAmount: 150000,
          targetAmount: 300000,
          targetDate: "2024-11-30",
          status: "in-progress",
          priority: "high",
          description: "Industry certification to advance career"
        },
        {
          id: "e2",
          title: "Online course subscriptions",
          currentAmount: 45000,
          targetAmount: 100000,
          targetDate: "2024-12-31",
          status: "in-progress",
          priority: "medium",
          description: "Continuous learning through online platforms"
        }
      ],
      recommendations: [
        "Bami Host opportunity: 13% under budget - perfect chance to invest in more skill development",
        "Career trajectory: Your professional development is excellently on track",
        "Strategic move: Explore employer-sponsored training to maximize your learning ROI"
      ]
    },
    {
      id: "self-branding",
      name: "Self-Branding & Growth",
      category: "self-branding",
      monthlyBudget: 50000,
      monthlySpent: 45000,
      yearlyBudget: 600000,
      yearlySpent: 450000,
      status: "good",
      trends: {
        spending: -10,
        goalProgress: 70
      },
      goals: [
        {
          id: "sb1",
          title: "Professional website development",
          currentAmount: 85000,
          targetAmount: 150000,
          targetDate: "2024-10-31",
          status: "in-progress",
          priority: "high",
          description: "Personal brand website and portfolio"
        },
        {
          id: "sb2",
          title: "Networking events fund",
          currentAmount: 25000,
          targetAmount: 75000,
          targetDate: "2024-12-31",
          status: "in-progress",
          priority: "medium",
          description: "Professional events and conferences"
        }
      ],
      recommendations: [
        "Bami Host momentum: Solid progress on personal branding - keep building your empire!",
        "Digital presence: Consider amplifying your social media for greater professional visibility",
        "Hustle strategy: Network strategically within your industry for exponential growth"
      ]
    }
  ]);

  const handleAddGoal = (newGoal: any) => {
    // This would typically involve API calls to persist the new goal
    console.log('New Bami Host goal added:', newGoal);
    // For now, we'll just log it. In a real app, you'd update the state
    // and sync with your backend
  };

  const categoryIds = lifeCategories.map(cat => cat.id);

  const totalMonthlyBudget = lifeCategories.reduce((sum, cat) => sum + cat.monthlyBudget, 0);
  const totalMonthlySpent = lifeCategories.reduce((sum, cat) => sum + cat.monthlySpent, 0);
  const totalYearlyBudget = lifeCategories.reduce((sum, cat) => sum + cat.yearlyBudget, 0);
  const totalYearlySpent = lifeCategories.reduce((sum, cat) => sum + cat.yearlySpent, 0);
  const budgetUtilization = (totalMonthlySpent / totalMonthlyBudget) * 100;
  const totalGoals = lifeCategories.reduce((sum, cat) => sum + cat.goals.length, 0);
  const completedGoals = lifeCategories.reduce((sum, cat) => 
    sum + cat.goals.filter(g => g.status === 'completed').length, 0
  );

  const formatCurrency = (amount: number) => {
    return showValues ? `₦${amount.toLocaleString()}` : "••••••";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent': return 'secondary';
      case 'good': return 'outline';
      case 'warning': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'secondary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food': return <UtensilsCrossed className="h-5 w-5" />;
      case 'healthcare': return <Heart className="h-5 w-5" />;
      case 'shelter': return <Home className="h-5 w-5" />;
      case 'family': return <Users className="h-5 w-5" />;
      case 'transport': return <Car className="h-5 w-5" />;
      case 'education': return <GraduationCap className="h-5 w-5" />;
      case 'self-branding': return <Star className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getPerformanceIcon = (trend: number) => {
    if (trend > 0) return <ArrowUpRight className="h-4 w-4 text-red-600" />;
    if (trend < 0) return <ArrowDownRight className="h-4 w-4 text-green-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in-progress': return 'text-blue-600';
      case 'overdue': return 'text-red-600';
      case 'not-started': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const selectedCategoryData = selectedCategory ? 
    lifeCategories.find(cat => cat.id === selectedCategory) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <BamiHostLogo variant="compact" showTagline={false} className="mx-auto sm:mx-0" />
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-bold">Personal Life Portfolios</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Your comprehensive life management across all aspects of personal growth
              </p>
            </div>
          </div>
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
              <SelectItem value="1W">1W</SelectItem>
              <SelectItem value="1M">1M</SelectItem>
              <SelectItem value="3M">3M</SelectItem>
              <SelectItem value="6M">6M</SelectItem>
              <SelectItem value="1Y">1Y</SelectItem>
            </SelectContent>
          </Select>
          
          <AddGoalModal onAddGoal={handleAddGoal} categories={categoryIds} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMonthlyBudget)}</div>
            <div className="flex items-center gap-1 text-sm">
              <span className={budgetUtilization > 100 ? 'text-red-600' : 'text-green-600'}>
                {budgetUtilization.toFixed(1)}% utilized
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spent</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMonthlySpent)}</div>
            <p className="text-sm text-muted-foreground">
              Across 7 life categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGoals}</div>
            <p className="text-sm text-muted-foreground">
              {completedGoals} completed this year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Good</div>
            <p className="text-sm text-muted-foreground">
              {lifeCategories.filter(cat => cat.status === 'excellent' || cat.status === 'good').length}/7 categories healthy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Life Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lifeCategories.map((category) => {
          const budgetUsage = (category.monthlySpent / category.monthlyBudget) * 100;
          const activeGoals = category.goals.filter(g => g.status === 'in-progress').length;
          
          return (
            <Card key={category.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedCategory(category.id)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {getCategoryIcon(category.category)}
                  {category.name}
                </CardTitle>
                <Badge variant={getStatusBadge(category.status)}>
                  {category.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">Monthly Budget</span>
                      <span className="text-sm font-medium">{formatCurrency(category.monthlyBudget)}</span>
                    </div>
                    <Progress value={Math.min(budgetUsage, 100)} className="h-2" />
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-muted-foreground">
                        Spent: {formatCurrency(category.monthlySpent)}
                      </span>
                      <span className={`text-xs ${budgetUsage > 100 ? 'text-red-600' : 'text-green-600'}`}>
                        {budgetUsage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {activeGoals} active goals
                    </span>
                    <span className="flex items-center gap-1">
                      {getPerformanceIcon(category.trends.spending)}
                      {Math.abs(category.trends.spending).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Category View */}
      {selectedCategoryData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getCategoryIcon(selectedCategoryData.category)}
                {selectedCategoryData.name} - Detailed View
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setSelectedCategory(null)}>
                Close
              </Button>
            </div>
            <CardDescription>
              Comprehensive breakdown of your {selectedCategoryData.name.toLowerCase()} portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="goals">Goals</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Budget vs Spending</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span>Monthly</span>
                            <span>{formatCurrency(selectedCategoryData.monthlySpent)} / {formatCurrency(selectedCategoryData.monthlyBudget)}</span>
                          </div>
                          <Progress 
                            value={(selectedCategoryData.monthlySpent / selectedCategoryData.monthlyBudget) * 100} 
                            className="h-2" 
                          />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span>Yearly</span>
                            <span>{formatCurrency(selectedCategoryData.yearlySpent)} / {formatCurrency(selectedCategoryData.yearlyBudget)}</span>
                          </div>
                          <Progress 
                            value={(selectedCategoryData.yearlySpent / selectedCategoryData.yearlyBudget) * 100} 
                            className="h-2" 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Spending Trend</span>
                          <span className={`flex items-center gap-1 ${
                            selectedCategoryData.trends.spending > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {getPerformanceIcon(selectedCategoryData.trends.spending)}
                            {selectedCategoryData.trends.spending > 0 ? '+' : ''}{selectedCategoryData.trends.spending.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Goal Progress</span>
                          <span className="text-blue-600">{selectedCategoryData.trends.goalProgress}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Status</span>
                          <Badge variant={getStatusBadge(selectedCategoryData.status)}>
                            {selectedCategoryData.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="goals" className="space-y-4">
                {selectedCategoryData.goals.map((goal) => (
                  <Card key={goal.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{goal.title}</h3>
                            <Badge variant={
                              goal.priority === 'high' ? 'destructive' :
                              goal.priority === 'medium' ? 'outline' : 'secondary'
                            }>
                              {goal.priority} priority
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                          {goal.targetAmount && goal.currentAmount && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
                              </div>
                              <Progress 
                                value={(goal.currentAmount / goal.targetAmount) * 100} 
                                className="h-2" 
                              />
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due: {new Date(goal.targetDate).toLocaleDateString()}
                            </span>
                            <span className={`flex items-center gap-1 ${getGoalStatusColor(goal.status)}`}>
                              {goal.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                              {goal.status === 'in-progress' && <Clock className="h-3 w-3" />}
                              {goal.status === 'overdue' && <AlertTriangle className="h-3 w-3" />}
                              {goal.status.replace('-', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                <Alert>
                  <BarChart3 className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Bami Host AI Insights for {selectedCategoryData.name}</strong>
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  {selectedCategoryData.recommendations.map((rec, index) => (
                    <Alert key={index}>
                      <AlertDescription>{rec}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};