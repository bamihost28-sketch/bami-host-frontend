import { useCallback } from 'react';
import { useToast } from './use-toast';
import {
  useGetPersonalWalletQuery,
  useGetWalletTransactionsQuery,
} from '../services/walletApi';
import type { Wallet } from '../types/wallet';

export interface UseWalletReturn {
  wallet: Wallet | undefined;
  isLoading: boolean;
  isError: boolean;
  error: any;
  refetch: () => void;
  formattedBalance: string;
  formatAmount: (amount: number) => string;
}

export const useWallet = (): UseWalletReturn => {
  const { toast } = useToast();
  const { data, isLoading, isError, error, refetch } = useGetPersonalWalletQuery();

  const wallet = data?.data;

  const formatAmount = useCallback((amount: number): string => {
    if (!wallet) return `₦${amount.toLocaleString()}`;
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: wallet.currency || 'NGN',
      minimumFractionDigits: 2,
    });
    return formatter.format(amount);
  }, [wallet]);

  const formattedBalance = wallet
    ? `${wallet.currencySymbol}${wallet.balance.toLocaleString()}`
    : '₦0';

  if (isError) {
    console.error('Error fetching wallet:', error);
  }

  return { wallet, isLoading, isError, error, refetch, formattedBalance, formatAmount };
};

export const useWalletTransactions = () => {
  const { data, isLoading, isError, error, refetch } = useGetWalletTransactionsQuery();
  return {
    transactions: data?.data || [],
    isLoading,
    isError,
    error,
    refetch,
  };
};

