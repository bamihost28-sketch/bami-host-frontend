import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Target, 
  Save, 
  ArrowRight, 
  TrendingUp,
  Calendar,
  CheckCircle2,
  Lightbulb
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface UserNumber {
  id: string;
  targetAmount: string;
  targetType: 'revenue' | 'profit' | 'valuation' | 'net-worth' | 'other';
  timeframe: string;
  whyThisNumber: string;
  createdAt: Date;
  lastUpdated: Date;
}

const STORAGE_KEY = "user_target_number_v1";

const createEmptyNumber = (): UserNumber => ({
  id: `number_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  targetAmount: '',
  targetType: 'revenue',
  timeframe: '',
  whyThisNumber: '',
  createdAt: new Date(),
  lastUpdated: new Date()
});

export const WhatsYourNumber: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userNumber, setUserNumber] = useState<UserNumber>(createEmptyNumber());
  const [isEditing, setIsEditing] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (user?.id) {
      try {
        const saved = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          setUserNumber({
            ...parsed,
            createdAt: new Date(parsed.createdAt),
            lastUpdated: new Date(parsed.lastUpdated)
          });
          setHasNumber(!!parsed.targetAmount);
        }
      } catch (error) {
        console.warn("Failed to load user number from storage", error);
      }
    }
  }, [user?.id]);

  const saveNumber = () => {
    if (!userNumber.targetAmount.trim()) {
      toast({
        title: "Target Required",
        description: "Please enter your target number to save.",
        variant: "destructive"
      });
      return;
    }

    const updatedNumber = {
      ...userNumber,
      lastUpdated: new Date()
    };

    if (user?.id) {
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(updatedNumber));
      setUserNumber(updatedNumber);
      setHasNumber(true);
      setIsEditing(false);

      toast({
        title: "Your Number Saved! 🎯",
        description: `Target set: ${formatTargetDisplay(updatedNumber)}`,
      });
    }
  };

  const formatTargetDisplay = (number: UserNumber) => {
    const typeLabels = {
      revenue: 'Revenue',
      profit: 'Profit',
      valuation: 'Business Valuation',
      'net-worth': 'Net Worth',
      other: 'Target'
    };
    
    return `${typeLabels[number.targetType]}: ${number.targetAmount}${number.timeframe ? ` by ${number.timeframe}` : ''}`;
  };

  const formatCurrency = (amount: string) => {
    // Simple formatting - you can enhance this
    const numAmount = parseFloat(amount.replace(/[^\d.-]/g, ''));
    if (isNaN(numAmount)) return amount;
    
    if (numAmount >= 1000000) {
      return `₦${(numAmount / 1000000).toFixed(1)}M`;
    } else if (numAmount >= 1000) {
      return `₦${(numAmount / 1000).toFixed(0)}K`;
    }
    return `₦${numAmount.toLocaleString()}`;
  };

  const openScalableImpactPlanner = () => {
    // Planner is now merged into the Scale dashboard as the "Your Number" tab
    navigate('/dashboard/scale#planner');
  };

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-6 h-6 text-blue-600" />
          <CardTitle className="text-xl text-blue-900">What's Your Number?</CardTitle>
          {hasNumber && !isEditing && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Set
            </Badge>
          )}
        </div>
        <CardDescription className="text-slate-600 leading-relaxed">
          Define your target — the number that, once achieved, will allow you to live your <strong>Level 7 Life</strong>. 
          This becomes the North Star that guides every Big 5 decision you make.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {!hasNumber || isEditing ? (
          // Editing/Setup Mode
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Your Target Number
                </label>
                <Input
                  placeholder="e.g., 5,000,000 or 5M"
                  value={userNumber.targetAmount}
                  onChange={(e) => setUserNumber(prev => ({ ...prev, targetAmount: e.target.value }))}
                  className="text-lg font-semibold"
                />
                <div className="text-xs text-slate-500 mt-1">
                  Examples: 1M, 5,000,000, 10 million
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Type of Target
                </label>
                <select 
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  value={userNumber.targetType}
                  onChange={(e) => setUserNumber(prev => ({ 
                    ...prev, 
                    targetType: e.target.value as UserNumber['targetType']
                  }))}
                >
                  <option value="revenue">Annual Revenue</option>
                  <option value="profit">Annual Profit</option>
                  <option value="valuation">Business Valuation</option>
                  <option value="net-worth">Personal Net Worth</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Target Timeframe (Optional)
              </label>
              <Input
                placeholder="e.g., December 2027, 3 years, by age 40"
                value={userNumber.timeframe}
                onChange={(e) => setUserNumber(prev => ({ ...prev, timeframe: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Why is this your number?
              </label>
              <Textarea
                placeholder="What will achieving this number mean for you and your family? What will it enable you to do or become?"
                value={userNumber.whyThisNumber}
                onChange={(e) => setUserNumber(prev => ({ ...prev, whyThisNumber: e.target.value }))}
                rows={3}
                className="resize-none"
              />
              <div className="text-xs text-slate-500 mt-1">
                This helps keep you motivated when the journey gets difficult
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={saveNumber} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4" />
                Save My Number
              </Button>
              {hasNumber && (
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  className="gap-2"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        ) : (
          // Display Mode
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <Target className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                <div className="font-semibold text-lg mb-1">
                  {formatTargetDisplay(userNumber)}
                </div>
                {userNumber.whyThisNumber && (
                  <div className="text-sm mt-2 italic">
                    "{userNumber.whyThisNumber}"
                  </div>
                )}
              </AlertDescription>
            </Alert>

            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                className="gap-2"
                size="sm"
              >
                Edit Number
              </Button>
              <Badge variant="secondary" className="gap-1">
                <Calendar className="w-3 h-3" />
                Set {new Date(userNumber.createdAt).toLocaleDateString()}
              </Badge>
            </div>
          </div>
        )}

        <Separator />

        {/* Scalable Impact Planner Access */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-slate-800">Ready to Build Your Plan?</h3>
          </div>
          
          <div className="bg-white rounded-lg border p-4 space-y-3">
            <p className="text-sm text-slate-600 leading-relaxed">
              Now that you've defined your number, use the <strong>Scalable Impact Planner</strong> to 
              create a systematic roadmap for reaching it. The planner helps you walk through the 7 Levels 
              of Scale and build your Level 7 plan.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={openScalableImpactPlanner}
                className="gap-2 bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <TrendingUp className="w-4 h-4" />
                Open Scalable Impact Planner
                <ArrowRight className="w-4 h-4" />
              </Button>
              
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {hasNumber && userNumber.targetAmount && (
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="text-sm font-medium text-slate-700 mb-2">Quick Analysis</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-500">Formatted Target</div>
                <div className="font-semibold text-slate-800">
                  {formatCurrency(userNumber.targetAmount)}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Focus Area</div>
                <div className="font-semibold text-slate-800 capitalize">
                  {userNumber.targetType.replace('-', ' ')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Motivational Footer */}
        <div className="text-center py-2 border-t">
          <p className="text-xs text-slate-500 italic">
            "Your number isn't just a goal—it's your freedom target. Every Big 5 action should move you closer to it."
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsYourNumber;