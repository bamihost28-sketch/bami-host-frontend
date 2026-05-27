export interface User {
  _id: string;
  name: string;
  email: string;
  id: string;
}

export interface Wallet {
  _id: string;
  userId: User;
  balance: number;
  currency: string;
  currencySymbol: string;
  totalEarnings: number;
  totalSpent: number;
  transactions: string[];
  isActive: boolean;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
  id: string;
}

export interface WalletResponse {
  success: boolean;
  data: Wallet;
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface BankTransferInstructions {
  bankAccount: BankAccount;
  reference: string;
  amount: number;
  description: string;
}

export interface DepositRequestResponse {
  success: boolean;
  data: BankTransferInstructions;
}

export interface DepositInitializeRequest {
  amount: number;
}

export interface WalletTransaction {
  _id: string;
  userId: string;
  walletId: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: 'bank_transfer' | 'cash' | 'wallet' | string;
  reference?: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransactionResponse {
  success: boolean;
  data: WalletTransaction[];
}

export interface DepositError {
  success: false;
  message: string;
  error?: string;
}
