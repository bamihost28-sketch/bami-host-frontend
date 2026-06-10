import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "./utils";

interface BillingItem {
  code: string;
  label: string;
  amount: number;
}

interface PaymentSummaryProps {
  selectedItems: string[];
  allItems: BillingItem[];
  totalAmount: number;
  rentMonths?: number;
}

export const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  selectedItems,
  allItems,
  totalAmount,
  rentMonths,
}) => {
  const recurringCodes = new Set(["rent", "service_charge"]);

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4 border">
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium text-slate-900 dark:text-white">Selected Items:</span>
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="space-y-1 mb-3">
        {selectedItems.map(code => {
          const item = allItems.find(i => i.code === code);
          if (!item) return null;
          const showMonths = rentMonths && rentMonths > 1 && recurringCodes.has(code);
          return (
            <div key={code} className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                {item.label}
                {showMonths && (
                  <span className="ml-1 text-xs text-slate-400">× {rentMonths} mo</span>
                )}
              </span>
              <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(item.amount)}</span>
            </div>
          );
        })}
      </div>
      <Separator className="my-3" />
      <div className="flex justify-between items-center">
        <span className="font-semibold text-slate-900 dark:text-white text-lg">Total Amount:</span>
        <span className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalAmount)}</span>
      </div>
    </div>
  );
};
