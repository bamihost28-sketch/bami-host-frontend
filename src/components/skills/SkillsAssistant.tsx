import { useState } from "react";
import { Zap, Palette, Megaphone, DollarSign, Settings2, Users, TrendingUp, X, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BASE_API_URL } from "@/services/api";

interface SkillSuggestion {
  skill: string;
  icon: React.ElementType;
  color: string;
  trigger: string;
  action: string;
  path: string;
}

interface Props {
  overview?: any;
  className?: string;
}

const SKILL_ICONS: Record<string, React.ElementType> = {
  designer: Palette,
  marketer: Megaphone,
  sales: TrendingUp,
  finance: DollarSign,
  operations: Settings2,
  hr: Users,
};

const SKILL_COLORS: Record<string, string> = {
  designer: "bg-purple-100 text-purple-700 border-purple-200",
  marketer: "bg-orange-100 text-orange-700 border-orange-200",
  sales: "bg-green-100 text-green-700 border-green-200",
  finance: "bg-emerald-100 text-emerald-700 border-emerald-200",
  operations: "bg-slate-100 text-slate-700 border-slate-200",
  hr: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

function buildSuggestions(overview: any): SkillSuggestion[] {
  const suggestions: SkillSuggestion[] = [];
  if (!overview) return suggestions;

  const s = overview.summary ?? overview;
  const vacant = s.units_vacant ?? 0;
  const pendingEnquiries = s.pending_enquiries ?? 0;
  const pendingApplications = s.pending_applications ?? 0;
  const openIssues = s.open_issues ?? 0;
  const overdueCount = s.tenants_overdue ?? 0;
  const collectionRate = s.collection_rate_pct ?? 100;
  const occupancy = s.occupancy_pct ?? 100;

  // Marketer: vacant units need to be marketed
  if (vacant > 0) {
    suggestions.push({
      skill: "marketer",
      icon: Megaphone,
      color: "marketer",
      trigger: `${vacant} vacant unit${vacant > 1 ? "s" : ""} need filling`,
      action: "Create a campaign to attract enquiries for your vacant units",
      path: "/dashboard/skills/marketing",
    });
  }

  // Sales: pending enquiries need to be converted
  if (pendingEnquiries > 0) {
    suggestions.push({
      skill: "sales",
      icon: TrendingUp,
      color: "sales",
      trigger: `${pendingEnquiries} pending enquir${pendingEnquiries > 1 ? "ies" : "y"} waiting`,
      action: "Follow up on enquiries — move them through your sales pipeline",
      path: "/dashboard/skills/sales",
    });
  }

  // Finance: poor collection rate
  if (collectionRate < 90 && overdueCount > 0) {
    suggestions.push({
      skill: "finance",
      icon: DollarSign,
      color: "finance",
      trigger: `Collection rate at ${collectionRate}% — ${overdueCount} overdue tenant${overdueCount > 1 ? "s" : ""}`,
      action: "Review your cash flow and plan arrears recovery strategy",
      path: "/dashboard/skills/finance",
    });
  }

  // Operations: open maintenance issues
  if (openIssues > 2) {
    suggestions.push({
      skill: "operations",
      icon: Settings2,
      color: "operations",
      trigger: `${openIssues} open maintenance issues need attention`,
      action: "Assign vendors to resolve outstanding issues",
      path: "/dashboard/skills/operations",
    });
  }

  // Designer: if occupancy is low, the Designer agent auto-creates listing graphics
  if (occupancy < 75 && vacant > 0) {
    suggestions.push({
      skill: "designer",
      icon: Palette,
      color: "designer",
      trigger: `Occupancy at ${occupancy}% — your Designer agent is creating listing graphics`,
      action: "Review the AI-designed marketing graphics for your vacant units in Autopilot",
      path: "/dashboard/autopilot",
    });
  }

  // Pending applications need review
  if (pendingApplications > 0) {
    suggestions.push({
      skill: "hr",
      icon: Users,
      color: "hr",
      trigger: `${pendingApplications} rental application${pendingApplications > 1 ? "s" : ""} to review`,
      action: "Review and approve or reject pending rental applications",
      path: "/dashboard/estate",
    });
  }

  return suggestions.slice(0, 4); // Show max 4
}

export function SkillsAssistant({ overview, className }: Props) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintSkill, setHintSkill] = useState<string | null>(null);

  const suggestions = buildSuggestions(overview).filter(
    s => !dismissed.includes(s.skill + s.trigger)
  );

  if (suggestions.length === 0) return null;

  const fetchAIHint = async (skill: string, trigger: string) => {
    setHintLoading(true);
    setHintSkill(skill);
    setAiHint(null);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${BASE_API_URL}/api/coach/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: `As my ${skill} advisor, I have this situation: ${trigger}. Give me ONE specific action I should take right now. Keep it to 2 sentences max.`,
          history: [],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiHint(data?.reply || data?.message || "Ask your AI coach for advice on this.");
      }
    } catch {
      setAiHint("Check the AI coach for personalised advice on this situation.");
    } finally {
      setHintLoading(false);
    }
  };

  return (
    <Card className={`border-2 border-dashed border-slate-200 dark:border-slate-700 ${className ?? ""}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Business Skills — Active Signals
        </CardTitle>
        <p className="text-xs text-slate-500">Your AI skills spotted these situations that need your attention</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((s) => {
          const Icon = s.icon;
          const colorClass = SKILL_COLORS[s.color] ?? "bg-slate-100 text-slate-700";
          const isActive = hintSkill === s.skill && hintLoading;
          const hasHint = hintSkill === s.skill && aiHint;

          return (
            <div key={s.skill + s.trigger} className={`rounded-lg border p-3 ${colorClass}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{s.trigger}</p>
                    <p className="text-xs opacity-80 mt-0.5">{s.action}</p>
                    {hasHint && (
                      <div className="mt-2 p-2 bg-white/60 rounded text-xs text-slate-700 italic">
                        💡 {aiHint}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setDismissed(d => [...d, s.skill + s.trigger])}
                  className="opacity-50 hover:opacity-100 flex-shrink-0 mt-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <div className="flex gap-2 mt-2 ml-6">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs px-2"
                  onClick={() => fetchAIHint(s.skill, s.trigger)}
                  disabled={isActive}
                >
                  {isActive ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : "💡"}
                  AI Advice
                </Button>
                <a href={s.path}>
                  <Button size="sm" variant="ghost" className="h-7 text-xs px-2">
                    Go to skill <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </a>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
