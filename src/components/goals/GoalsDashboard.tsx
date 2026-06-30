import { useState, useEffect, useRef } from "react";
import { useGetPersonalFinanceQuery, useSavePersonalFinanceMutation } from "@/services/personalFinanceApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Target,
  Plus,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  Flag,
  Home,
  Car,
  GraduationCap,
  Plane,
  Heart,
  Building,
  Briefcase,
  Gift,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Play,
  Pause,
  Trophy,
  Star,
  Zap
} from "lucide-react";

interface FinancialGoal {
  id: string;
  title: string;
  description: string;
  category: 'emergency' | 'education' | 'housing' | 'travel' | 'retirement' | 'business' | 'debt' | 'other';
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  monthlyContribution: number;
  createdDate: string;
  tags: string[];
}

export const GoalsDashboard = () => {
  const [showValues, setShowValues] = useState(true);
  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("active");

  // Goals — seeded with examples, then hydrated from + saved to the backend.
  const [goals, setGoals] = useState<FinancialGoal[]>([
    {
      id: "1",
      title: "Emergency Fund",
      description: "6 months of living expenses for financial security",
      category: "emergency",
      targetAmount: 1500000,
      currentAmount: 850000,
      targetDate: "2025-06-30",
      priority: "high",
      status: "active",
      monthlyContribution: 100000,
      createdDate: "2024-01-15",
      tags: ["security", "essential"]
    },
    {
      id: "2",
      title: "New Car Fund",
      description: "Save for a reliable family car",
      category: "other",
      targetAmount: 3500000,
      currentAmount: 1200000,
      targetDate: "2025-12-31",
      priority: "medium",
      status: "active",
      monthlyContribution: 150000,
      createdDate: "2024-02-01",
      tags: ["transportation", "family"]
    },
    {
      id: "3",
      title: "Home Down Payment",
      description: "20% down payment for dream home in Lekki",
      category: "housing",
      targetAmount: 10000000,
      currentAmount: 2800000,
      targetDate: "2026-12-31",
      priority: "high",
      status: "active",
      monthlyContribution: 250000,
      createdDate: "2023-06-15",
      tags: ["property", "investment"]
    },
    {
      id: "4",
      title: "European Vacation",
      description: "Dream family trip to Europe for 2 weeks",
      category: "travel",
      targetAmount: 2000000,
      currentAmount: 450000,
      targetDate: "2025-07-15",
      priority: "low",
      status: "active",
      monthlyContribution: 80000,
      createdDate: "2024-03-01",
      tags: ["vacation", "family", "experience"]
    },
    {
      id: "5",
      title: "Children's Education",
      description: "University fund for children's higher education",
      category: "education",
      targetAmount: 8000000,
      currentAmount: 1800000,
      targetDate: "2030-09-01",
      priority: "high",
      status: "active",
      monthlyContribution: 120000,
      createdDate: "2023-01-10",
      tags: ["education", "children", "future"]
    },
    {
      id: "6",
      title: "Debt Freedom",
      description: "Pay off all credit card and personal loans",
      category: "debt",
      targetAmount: 800000,
      currentAmount: 650000,
      targetDate: "2024-12-31",
      priority: "high",
      status: "active",
      monthlyContribution: 80000,
      createdDate: "2024-01-01",
      tags: ["debt", "freedom"]
    }
  ]);

  // ── Backend persistence: load on mount, debounced autosave ──
  const { data: pf, isSuccess: pfLoaded } = useGetPersonalFinanceQuery();
  const [savePf] = useSavePersonalFinanceMutation();
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!pfLoaded || hydratedRef.current) return;
    hydratedRef.current = true;
    if (pf?.exists && Array.isArray(pf.goals) && pf.goals.length) setGoals(pf.goals as FinancialGoal[]);
  }, [pfLoaded, pf]);
  useEffect(() => {
    if (!hydratedRef.current) return;
    const t = setTimeout(() => savePf({ goals }), 1200);
    return () => clearTimeout(t);
  }, [goals]);

  // New-goal form state
  const [newGoal, setNewGoal] = useState({
    title: "", description: "", targetAmount: "", monthlyContribution: "",
    category: "other", priority: "medium", targetDate: "",
  });
  const handleCreateGoal = () => {
    if (!newGoal.title.trim() || !newGoal.targetAmount) { setIsAddGoalDialogOpen(false); return; }
    const g: FinancialGoal = {
      id: Date.now().toString(), title: newGoal.title, description: newGoal.description,
      category: newGoal.category as FinancialGoal["category"],
      targetAmount: Number(newGoal.targetAmount), currentAmount: 0,
      targetDate: newGoal.targetDate, priority: newGoal.priority as FinancialGoal["priority"],
      status: "active", monthlyContribution: Number(newGoal.monthlyContribution) || 0,
      createdDate: new Date().toISOString().slice(0, 10), tags: [],
    };
    setGoals(prev => [...prev, g]);
    setNewGoal({ title: "", description: "", targetAmount: "", monthlyContribution: "", category: "other", priority: "medium", targetDate: "" });
    setIsAddGoalDialogOpen(false);
  };

  const totalTargetAmount = goals.filter(g => g.status === 'active').reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrentAmount = goals.filter(g => g.status === 'active').reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalMonthlyContribution = goals.filter(g => g.status === 'active').reduce((sum, goal) => sum + goal.monthlyContribution, 0);
  const overallProgress = (totalCurrentAmount / totalTargetAmount) * 100;

  const formatCurrency = (amount: number) => {
    return showValues ? `₦${amount.toLocaleString()}` : "••••••";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'emergency':
        return <Target className="h-5 w-5 text-red-600" />;
      case 'housing':
        return <Home className="h-5 w-5 text-blue-600" />;
      case 'education':
        return <GraduationCap className="h-5 w-5 text-purple-600" />;
      case 'travel':
        return <Plane className="h-5 w-5 text-green-600" />;
      case 'retirement':
        return <Clock className="h-5 w-5 text-orange-600" />;
      case 'business':
        return <Briefcase className="h-5 w-5 text-indigo-600" />;
      case 'debt':
        return <DollarSign className="h-5 w-5 text-gray-600" />;
      default:
        return <Flag className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'emergency':
        return 'text-red-600';
      case 'housing':
        return 'text-blue-600';
      case 'education':
        return 'text-purple-600';
      case 'travel':
        return 'text-green-600';
      case 'retirement':
        return 'text-orange-600';
      case 'business':
        return 'text-indigo-600';
      case 'debt':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4 text-green-600" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const calculateDaysUntilTarget = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateMonthsToComplete = (currentAmount: number, targetAmount: number, monthlyContribution: number) => {
    if (monthlyContribution <= 0) return Infinity;
    const remaining = targetAmount - currentAmount;
    return Math.ceil(remaining / monthlyContribution);
  };

  const getProgressStatus = (currentAmount: number, targetAmount: number, targetDate: string) => {
    const progress = (currentAmount / targetAmount) * 100;
    const daysLeft = calculateDaysUntilTarget(targetDate);
    
    if (progress >= 100) return { status: 'completed', color: 'text-green-600', message: 'Goal achieved!' };
    if (daysLeft < 0) return { status: 'overdue', color: 'text-red-600', message: 'Past target date' };
    if (progress >= 80) return { status: 'on-track', color: 'text-green-600', message: 'On track' };
    if (progress >= 50) return { status: 'moderate', color: 'text-yellow-600', message: 'Making progress' };
    return { status: 'behind', color: 'text-red-600', message: 'Needs attention' };
  };

  const filteredGoals = goals.filter(goal => {
    const priorityMatch = filterPriority === 'all' || goal.priority === filterPriority;
    const statusMatch = filterStatus === 'all' || goal.status === filterStatus;
    return priorityMatch && statusMatch;
  });

  const GoalCard = ({ goal }: { goal: FinancialGoal }) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const daysLeft = calculateDaysUntilTarget(goal.targetDate);
    const monthsToComplete = calculateMonthsToComplete(goal.currentAmount, goal.targetAmount, goal.monthlyContribution);
    const progressStatus = getProgressStatus(goal.currentAmount, goal.targetAmount, goal.targetDate);
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getCategoryIcon(goal.category)}
              <div>
                <CardTitle className="text-lg">{goal.title}</CardTitle>
                <CardDescription className="text-sm">{goal.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(goal.priority)}>
                {goal.priority}
              </Badge>
              <div className="flex items-center gap-1">
                {getStatusIcon(goal.status)}
                <span className="text-xs text-muted-foreground capitalize">{goal.status}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <div className="flex items-center gap-2">
                <span className={progressStatus.color}>{progressStatus.message}</span>
                <span className="font-medium">{progress.toFixed(1)}%</span>
              </div>
            </div>
            <Progress value={Math.min(progress, 100)} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatCurrency(goal.currentAmount)}</span>
              <span>{formatCurrency(goal.targetAmount)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Monthly Contribution</div>
              <div className="font-medium">{formatCurrency(goal.monthlyContribution)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Target Date</div>
              <div className="font-medium">{new Date(goal.targetDate).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{daysLeft >= 0 ? `${daysLeft} days left` : `${Math.abs(daysLeft)} days overdue`}</span>
            <span>{monthsToComplete === Infinity ? 'No contributions' : `${monthsToComplete} months to complete`}</span>
          </div>

          <div className="flex flex-wrap gap-1">
            {goal.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Edit className="h-3 w-3" />
                Edit
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Plus className="h-3 w-3" />
                Add Funds
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="text-red-600">
              <Trash2 className="h-3 w-3" />
            </Button>
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
          <h1 className="text-2xl sm:text-3xl font-bold">Financial Goals</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Track and achieve your financial objectives with smart planning
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
          
          <Dialog open={isAddGoalDialogOpen} onOpenChange={setIsAddGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center justify-center gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                <span className="hidden xs:inline">Add New Goal</span>
                <span className="xs:hidden">Add Goal</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Financial Goal</DialogTitle>
                <DialogDescription>
                  Set up a new savings goal to track your progress.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-title">Goal Title</Label>
                  <Input id="goal-title" placeholder="e.g., Emergency Fund" value={newGoal.title} onChange={(e) => setNewGoal(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal-description">Description</Label>
                  <Textarea id="goal-description" placeholder="Brief description of your goal" value={newGoal.description} onChange={(e) => setNewGoal(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target-amount">Target Amount (₦)</Label>
                    <Input id="target-amount" type="number" placeholder="1000000" value={newGoal.targetAmount} onChange={(e) => setNewGoal(p => ({ ...p, targetAmount: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthly-contribution">Monthly Contribution (₦)</Label>
                    <Input id="monthly-contribution" type="number" placeholder="50000" value={newGoal.monthlyContribution} onChange={(e) => setNewGoal(p => ({ ...p, monthlyContribution: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={newGoal.category} onValueChange={(v) => setNewGoal(p => ({ ...p, category: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emergency">Emergency Fund</SelectItem>
                        <SelectItem value="housing">Housing</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="retirement">Retirement</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="debt">Debt Payoff</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={newGoal.priority} onValueChange={(v) => setNewGoal(p => ({ ...p, priority: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target-date">Target Date</Label>
                  <Input id="target-date" type="date" value={newGoal.targetDate} onChange={(e) => setNewGoal(p => ({ ...p, targetDate: e.target.value }))} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddGoalDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateGoal}>
                  Create Goal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goal Value</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalTargetAmount)}</div>
            <p className="text-sm text-muted-foreground">
              Across {goals.filter(g => g.status === 'active').length} active goals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCurrentAmount)}</div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600">{overallProgress.toFixed(1)}%</span>
              <span className="text-muted-foreground">of total goals</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Commitment</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMonthlyContribution)}</div>
            <p className="text-sm text-muted-foreground">
              {((totalMonthlyContribution / 500000) * 100).toFixed(1)}% of income
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goals Completed</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.filter(g => g.status === 'completed').length}</div>
            <p className="text-sm text-muted-foreground">
              This year
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col gap-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="active" className="text-xs sm:text-sm">Active</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs sm:text-sm">Completed</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Priority Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {goals.filter(g => g.priority === 'high' && g.status === 'active').slice(0, 3).map((goal) => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100;
                    return (
                      <div key={goal.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(goal.category)}
                          <span className="text-sm font-medium">{goal.title}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{progress.toFixed(0)}%</div>
                          <div className="text-xs text-muted-foreground">{formatCurrency(goal.currentAmount)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-500" />
                  Quick Wins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {goals
                    .filter(g => g.status === 'active')
                    .sort((a, b) => (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount))
                    .slice(0, 3)
                    .map((goal) => {
                      const progress = (goal.currentAmount / goal.targetAmount) * 100;
                      return (
                        <div key={goal.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(goal.category)}
                            <span className="text-sm font-medium">{goal.title}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{progress.toFixed(0)}%</div>
                            <div className="text-xs text-green-600">Almost there!</div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Needs Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {goals
                    .filter(g => g.status === 'active' && calculateDaysUntilTarget(g.targetDate) < 180)
                    .slice(0, 3)
                    .map((goal) => {
                      const daysLeft = calculateDaysUntilTarget(goal.targetDate);
                      const progress = (goal.currentAmount / goal.targetAmount) * 100;
                      return (
                        <div key={goal.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(goal.category)}
                            <span className="text-sm font-medium">{goal.title}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{progress.toFixed(0)}%</div>
                            <div className="text-xs text-red-600">{daysLeft} days left</div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Goals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredGoals.slice(0, 4).map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {goals.filter(g => g.status === 'active').map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Completed Goals Yet</h3>
            <p className="text-muted-foreground mb-4">
              Keep working towards your active goals to see them here when completed.
            </p>
            <Button>View Active Goals</Button>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Goal Categories Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(goals.reduce((acc, goal) => {
                    acc[goal.category] = (acc[goal.category] || 0) + goal.targetAmount;
                    return acc;
                  }, {} as Record<string, number>)).map(([category, amount]) => {
                    const percentage = (amount / totalTargetAmount) * 100;
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(category)}
                            <span className="capitalize font-medium">{category}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(amount)}</div>
                            <div className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Savings Momentum</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    You're saving {formatCurrency(totalMonthlyContribution)} per month across all goals. 
                    At this rate, you'll achieve {goals.filter(g => g.status === 'active' && (g.currentAmount / g.targetAmount) > 0.8).length} goals within the next 6 months!
                  </AlertDescription>
                </Alert>
                
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monthly savings rate</span>
                    <span className="font-medium">{formatCurrency(totalMonthlyContribution)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Annual projection</span>
                    <span className="font-medium">{formatCurrency(totalMonthlyContribution * 12)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Average goal completion</span>
                    <span className="font-medium">{overallProgress.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};