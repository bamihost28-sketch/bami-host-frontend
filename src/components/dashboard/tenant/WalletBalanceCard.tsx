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
    <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4 border mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
              <Wallet className="h-5 w-5" />
              <span className="text-sm font-medium">Wallet Balance</span>
            </div>
            {isLoading ? (
              <div className="h-9 w-40 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(balance)}</p>
            )}
          </div>
          {(totalEarnings !== undefined || totalSpent !== undefined) && (
            <div className="flex items-center gap-4 text-sm">
              {totalEarnings !== undefined && (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Earned: <span className="font-semibold">{formatCurrency(totalEarnings)}</span></span>
                </div>
              )}
              {totalSpent !== undefined && (
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <TrendingDown className="h-3.5 w-3.5" />
                  <span>Spent: <span className="font-semibold">{formatCurrency(totalSpent)}</span></span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={onDeposit} className="bg-green-600 hover:bg-green-700" disabled={isDepositing}>
            <ArrowDownRight className="h-4 w-4 mr-1" />
            {isDepositing ? "Depositing..." : "Deposit"}
          </Button>
          <Button size="sm" variant="outline" onClick={onWithdraw} disabled={isWithdrawing}>
            <ArrowUpRight className="h-4 w-4 mr-1" />
            {isWithdrawing ? "Withdrawing..." : "Withdraw"}
          </Button>
          <Button size="sm" variant="outline" onClick={onTransfer} disabled={isTransferring}>
            <Send className="h-4 w-4 mr-1" />
            {isTransferring ? "Transferring..." : "Transfer"}
          </Button>
        </div>
      </div>
    </div>
  );
};
