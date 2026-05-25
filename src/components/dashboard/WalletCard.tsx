import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type WalletVariant = "default" | "summary" | "growth" | "fulfillment" | "innovation";

interface WalletCardProps {
  label: string;
  value: number;
  percentage?: number;
  showProgress?: boolean;
  variant?: WalletVariant;
  subLabel?: string;
  description?: string;
}

const VARIANT_STYLES: Record<WalletVariant, { card: string; label: string; amount: string; badge: string; progress: string }> = {
  default: {
    card: "bg-card border border-border",
    label: "text-muted-foreground",
    amount: "text-foreground",
    badge: "bg-muted text-muted-foreground",
    progress: "",
  },
  summary: {
    card: "bg-muted/40 border border-border",
    label: "text-muted-foreground",
    amount: "text-foreground",
    badge: "bg-muted text-muted-foreground",
    progress: "",
  },
  growth: {
    card: "bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900",
    label: "text-blue-700 dark:text-blue-400",
    amount: "text-blue-900 dark:text-blue-100",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    progress: "[&>div]:bg-blue-500",
  },
  fulfillment: {
    card: "bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900",
    label: "text-emerald-700 dark:text-emerald-400",
    amount: "text-emerald-900 dark:text-emerald-100",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    progress: "[&>div]:bg-emerald-500",
  },
  innovation: {
    card: "bg-purple-50 border border-purple-200 dark:bg-purple-950/20 dark:border-purple-900",
    label: "text-purple-700 dark:text-purple-400",
    amount: "text-purple-900 dark:text-purple-100",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    progress: "[&>div]:bg-purple-500",
  },
};

export const WalletCard = ({
  label,
  value,
  percentage,
  showProgress = false,
  variant = "default",
  subLabel,
  description,
}: WalletCardProps) => {
  const styles = VARIANT_STYLES[variant];

  if (variant === "summary") {
    return (
      <div className={cn("rounded-xl p-4 text-center space-y-1", styles.card)}>
        <p className={cn("text-xs font-semibold uppercase tracking-wider", styles.label)}>{label}</p>
        <p className={cn("text-lg font-bold", styles.amount)}>₦{value.toLocaleString()}</p>
        {subLabel && <p className="text-[10px] text-muted-foreground">{subLabel}</p>}
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl p-4 space-y-3", styles.card)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={cn("text-xs font-bold uppercase tracking-wider truncate", styles.label)}>{label}</p>
          {description && <p className="text-[10px] text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {percentage !== undefined && (
          <span className={cn("shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded", styles.badge)}>
            {percentage}%
          </span>
        )}
      </div>
      <p className={cn("text-xl font-bold", styles.amount)}>₦{value.toLocaleString()}</p>
      {showProgress && percentage !== undefined && (
        <Progress value={percentage} className={cn("h-1.5", styles.progress)} />
      )}
    </div>
  );
};
