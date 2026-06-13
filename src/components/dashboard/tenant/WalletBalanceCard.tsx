import { Wallet, ArrowDownRight, ArrowUpRight, Send, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "./utils";

interface WalletBalanceCardProps {
  balance: number;
  isLoading: boolean;
  totalEarnings?: number;
  totalSpent?: number;
  onDeposit: () => void;
  onWithdraw: () => void;
  onTransfer: () => void;
  isDepositing: boolean;
  isWithdrawing: boolean;
  isTransferring: boolean;
}

export const WalletBalanceCard: React.FC<WalletBalanceCardProps> = ({
  balance,
  isLoading,
  totalEarnings,
  totalSpent,
  onDeposit,
  onWithdraw,
  onTransfer,
  isDepositing,
  isWithdrawing,
  isTransferring,
}) => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-3 sm:p-4 border mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="space-y-2 sm:space-y-3">
          <div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
              <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm font-medium">Wallet Balance</span>
            </div>
            {isLoading ? (
              <div className="h-8 w-36 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(balance)}</p>
            )}
          </div>
          {(totalEarnings !== undefined || totalSpent !== undefined) && (
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
              {totalEarnings !== undefined && (
                <div className="flex items-center gap-1 sm:gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>Earned: <span className="font-semibold">{formatCurrency(totalEarnings)}</span></span>
                </div>
              )}
              {totalSpent !== undefined && (
                <div className="flex items-center gap-1 sm:gap-1.5 text-rose-600 dark:text-rose-400">
                  <TrendingDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>Spent: <span className="font-semibold">{formatCurrency(totalSpent)}</span></span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-2">
          <Button size="sm" onClick={onDeposit} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" disabled={isDepositing}>
            <ArrowDownRight className="h-4 w-4 mr-1 shrink-0" />
            <span className="truncate">{isDepositing ? "..." : "Deposit"}</span>
          </Button>
          <Button size="sm" variant="outline" onClick={onWithdraw} className="w-full sm:w-auto" disabled={isWithdrawing}>
            <ArrowUpRight className="h-4 w-4 mr-1 shrink-0" />
            <span className="truncate">{isWithdrawing ? "..." : "Withdraw"}</span>
          </Button>
          <Button size="sm" variant="outline" onClick={onTransfer} className="w-full sm:w-auto" disabled={isTransferring}>
            <Send className="h-4 w-4 mr-1 shrink-0" />
            <span className="truncate">{isTransferring ? "..." : "Transfer"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
