export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateString?: string | null) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
    case "paid":
    case "completed":
    case "approved":
      return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700";
    case "pending":
    case "in_progress":
      return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700";
    case "expired":
    case "overdue":
      return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700";
    default:
      return "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700";
  }
};

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case "plumbing":
      return "Droplets";
    case "electrical":
      return "Zap";
    case "ac_repair":
      return "AirVent";
    case "security":
      return "Shield";
    case "cleaning":
      return "SprayCan";
    default:
      return "Wrench";
  }
};
