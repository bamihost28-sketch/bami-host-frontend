import { Wallet, Building2 } from "lucide-react";
import { formatCurrency } from "./utils";

interface PaymentMethodSelectorProps {
  paymentMethod: "wallet" | "bank_transfer";
  onMethodChange: (method: "wallet" | "bank_transfer") => void;
  walletBalance: number;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethod,
  onMethodChange,
  walletBalance,
}) => {
  return (
    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 border">
      <p className="font-medium text-slate-900 dark:text-white mb-3">Payment Method</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onMethodChange("wallet")}
          className={`p-3 rounded-lg border-2 transition-all ${
            paymentMethod === "wallet"
              ? "border-green-600 bg-green-50 dark:bg-green-900/20"
              : "border-slate-300 dark:border-slate-600"
          }`}
        >
          <div className="flex items-center gap-2 justify-center">
            <Wallet className="h-4 w-4" />
            <div className="text-left">
              <p className="font-medium text-sm">Wallet</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {formatCurrency(walletBalance)} available
              </p>
            </div>
          </div>
        </button>
        <button
          onClick={() => onMethodChange("bank_transfer")}
          className={`p-3 rounded-lg border-2 transition-all ${
            paymentMethod === "bank_transfer"
              ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
              : "border-slate-300 dark:border-slate-600"
          }`}
        >
          <div className="flex items-center gap-2 justify-center">
            <Building2 className="h-4 w-4" />
            <div className="text-left">
              <p className="font-medium text-sm">Bank Transfer</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">UBA account</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
