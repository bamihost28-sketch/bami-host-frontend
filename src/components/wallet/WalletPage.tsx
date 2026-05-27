import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { WalletBalance } from './WalletBalance';
import { DepositForm } from './DepositForm';
import { DepositHistory } from './DepositHistory';
import { TransactionHistory } from './TransactionHistory';
import { Wallet as WalletIcon, TrendingUp, History, ClipboardList } from 'lucide-react';

export const WalletPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-3">
          <div className="bg-green-600 p-3 rounded-lg">
            <WalletIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Wallet</h1>
            <p className="text-muted-foreground">Manage your balance and transactions</p>
          </div>
        </div>

        <Tabs defaultValue="balance" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="balance" className="flex items-center gap-2">
              <WalletIcon className="h-4 w-4" />
              Balance
            </TabsTrigger>
            <TabsTrigger value="deposit" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Deposit
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              My Requests
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="balance" className="space-y-6 mt-6">
            <WalletBalance />
          </TabsContent>

          <TabsContent value="deposit" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <DepositForm />
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">How it works</h3>
                  <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
                    <li className="flex gap-2">
                      <span className="font-bold">1.</span>
                      <span>Transfer to the UBA account shown</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">2.</span>
                      <span>Enter the exact amount you sent</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">3.</span>
                      <span>Upload your bank transfer screenshot</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">4.</span>
                      <span>Admin reviews and credits your wallet</span>
                    </li>
                  </ol>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 dark:text-green-300 mb-1">Confirmation time</h3>
                  <p className="text-sm text-green-800 dark:text-green-400">
                    Deposits are typically confirmed within a few hours. Contact admin if you need urgent assistance.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <DepositHistory />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <TransactionHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
