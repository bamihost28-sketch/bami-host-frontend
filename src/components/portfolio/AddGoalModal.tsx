import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BamiHostLogo } from "@/components/brand";
import { Plus, Target, Calendar, DollarSign, Lightbulb } from "lucide-react";

interface AddGoalModalProps {
  onAddGoal: (goal: any) => void;
  categories: string[];
}

export const AddGoalModal = ({ onAddGoal, categories }: AddGoalModalProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    targetAmount: "",
    targetDate: "",
    priority: "medium" as "low" | "medium" | "high",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newGoal = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      targetAmount: formData.targetAmount ? parseFloat(formData.targetAmount) : undefined,
      targetDate: formData.targetDate,
      priority: formData.priority,
      status: "not-started" as const,
      currentAmount: 0,
    };

    onAddGoal(newGoal);
    setOpen(false);
    setFormData({
      title: "",
      description: "",
      category: "",
      targetAmount: "",
      targetDate: "",
      priority: "medium",
    });
  };

  const hustleGoalSuggestions = [
    { category: "food", suggestion: "Master home cooking to save ₦50,000 monthly" },
    { category: "healthcare", suggestion: "Build ₦500,000 health emergency fund" },
    { category: "shelter", suggestion: "Save ₦2M for dream home down payment" },
    { category: "family", suggestion: "Plan epic family vacation worth ₦300,000" },
    { category: "transport", suggestion: "Upgrade to fuel-efficient vehicle" },
    { category: "education", suggestion: "Earn professional certification for career boost" },
    { category: "self-branding", suggestion: "Build personal website and online presence" },
  ];

  const selectedCategorySuggestion = hustleGoalSuggestions.find(
    s => s.category === formData.category
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline">Add Hustle Goal</span>
          <span className="xs:hidden">Add Goal</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <BamiHostLogo variant="icon-only" />
            <div>
              <DialogTitle className="text-xl">Add New Hustle Goal</DialogTitle>
              <DialogDescription>
                Set a new goal to level up your personal hustle game
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose your hustle category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' & ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCategorySuggestion && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Bami Host Suggestion</span>
              </div>
              <p className="text-sm text-green-700">{selectedCategorySuggestion.suggestion}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              placeholder="e.g., Master meal prep to save money"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your hustle goal and why it matters to you..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAmount" className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Target Amount (Optional)
              </Label>
              <Input
                id="targetAmount"
                type="number"
                placeholder="0"
                value={formData.targetAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Target Date
              </Label>
              <Input
                id="targetDate"
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Priority Level</Label>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as const).map((priority) => (
                <Badge
                  key={priority}
                  variant={formData.priority === priority ? "default" : "outline"}
                  className={`cursor-pointer ${
                    formData.priority === priority 
                      ? priority === "high" 
                        ? "bg-red-600 hover:bg-red-700" 
                        : priority === "medium"
                        ? "bg-yellow-600 hover:bg-yellow-700"
                        : "bg-green-600 hover:bg-green-700"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, priority }))}
                >
                  <Target className="h-3 w-3 mr-1" />
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              disabled={!formData.title || !formData.description || !formData.category}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Hustle Goal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};