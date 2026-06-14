# Wallet System Implementation Guide

## Overview

A complete wallet management system with **Paystack integration for deposits only**. Users can deposit funds to their wallet using Paystack securely.

⚠️ **Important:** Deposits can ONLY be processed through Paystack. No other payment methods are supported.

## What Was Implemented

### 1. **Types** (`src/types/wallet.ts`)
- `Wallet` - User's wallet with balance, earnings, and spending
- `WalletResponse` - API response wrapper
- `WalletTransaction` - Transaction records
- `PaystackInitializeResponse` - Paystack payment initialization
- `PaystackVerifyResponse` - Payment verification response
- Supporting types for requests and errors

### 2. **API Service** (`src/services/walletApi.ts`)
Extended with new RTK Query endpoints:
- `getPersonalWallet` - Fetch user's wallet
- `initializePaystackDeposit` - Start Paystack payment
- `verifyPaystackDeposit` - Verify and credit wallet
- `getWalletTransactions` - Fetch transaction history

### 3. **Hooks** (`src/hooks/useWallet.ts`)
- **`useWallet()`** - Get wallet data with formatting utilities
  ```tsx
  const { wallet, isLoading, formattedBalance, formatAmount } = useWallet();
  ```

- **`useWalletTransactions()`** - Fetch transaction history
  ```tsx
  const { transactions, isLoading } = useWalletTransactions();
  ```

- **`usePaystackDeposit()`** - Handle deposit flow
  ```tsx
  const { initializeDeposit, verifyDeposit, isInitializing } = usePaystackDeposit();
  ```

### 4. **Components** (`src/components/wallet/`)

#### **WalletBalance.tsx**
Displays key wallet statistics:
- Available balance with currency symbol
- Total earnings (TrendingUp icon)
- Total spent (TrendingDown icon)
- Last update timestamp
- Loading skeleton states

```tsx
import { WalletBalance } from '@/components/wallet';

<WalletBalance />
```

#### **DepositForm.tsx**
Initialize Paystack deposit:
- Amount input (minimum ₦100)
- Validation messages
- Loading state with spinner
- Info alert about Paystack
- Disabled button handling

```tsx
import { DepositForm } from '@/components/wallet';

<DepositForm />
```

#### **DepositVerification.tsx**
Handle Paystack redirect and payment verification:
- Auto-verify payment using URL reference
- Loading, success, and error states
- Display new balance after deposit
- Auto-redirect to wallet after 3 seconds
- Payment reference display

```tsx
// Mounted at /dashboard/wallet/verify?reference=...
import { DepositVerification } from '@/components/wallet';

<DepositVerification />
```

#### **TransactionHistory.tsx**
Display recent transactions:
- Transaction type with icons
- Status badges (completed, pending, failed)
- Amount with currency formatting
- Date/time information
- Pagination (shows last 10, link to all)

```tsx
import { TransactionHistory } from '@/components/wallet';

<TransactionHistory />
```

#### **WalletWidget.tsx**
Compact dashboard widget:
- Quick balance overview
- Quick stats grid (earnings/spent)
- Action buttons (Deposit, View Details)
- Active/Inactive status indicator
- Perfect for dashboards

```tsx
import { WalletWidget } from '@/components/wallet';

<WalletWidget />
```

#### **WalletPage.tsx**
Complete wallet page with tabs:
- Balance tab - Shows all wallet statistics
- Deposit tab - Deposit form + info sidebar
- History tab - Transaction history
- Responsive layout with gradient background
- How-it-works guide
- Security information

```tsx
import { WalletPage } from '@/components/wallet';

<WalletPage />
```

### 5. **Routes Added**
In `DashboardRouter.tsx`:
- `/dashboard/wallet` - Original wallet dashboard
- `/dashboard/wallet/manage` - Full wallet management page
- `/dashboard/wallet/deposit` - Deposit initiation
- `/dashboard/wallet/verify` - Paystack callback/verification

### 6. **Type Exports** (`src/components/wallet/index.ts`)
Barrel export for easy imports:
```tsx
import { WalletBalance, DepositForm, WalletPage } from '@/components/wallet';
```

## Usage Examples

### Display Wallet Balance
```tsx
import { WalletBalance } from '@/components/wallet';

export function Dashboard() {
  return (
    <div>
      <WalletBalance />
    </div>
  );
}
```

### Complete Wallet Page
```tsx
import { WalletPage } from '@/components/wallet';

export function WalletSection() {
  return <WalletPage />;
}
```

### Custom Deposit Flow
```tsx
import { usePaystackDeposit } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';

export function CustomDeposit() {
  const { initializeDeposit, isInitializing } = usePaystackDeposit();

  const handleDeposit = () => {
    initializeDeposit(5000); // Deposit ₦5,000
  };

  return (
    <Button onClick={handleDeposit} disabled={isInitializing}>
      {isInitializing ? 'Processing...' : 'Deposit Now'}
    </Button>
  );
}
```

### Dashboard Widget
```tsx
import { WalletWidget } from '@/components/wallet';

export function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <WalletWidget />
      {/* Other widgets */}
    </div>
  );
}
```

## Paystack Deposit Flow (Step-by-Step)

1. **User Opens Deposit Form**
   - Enters amount (minimum ₦100)
   - Clicks "Deposit" button

2. **Backend Initializes Payment** (POST `/api/wallet/paystack/initialize`)
   - Creates payload with: email, amount (in kobo), callback URL, metadata
   - Calls Paystack API
   - Returns `authorization_url`, `access_code`, `reference`

3. **Frontend Redirects to Paystack**
   - User is redirected to Paystack payment page
   - User enters card/bank details

4. **Paystack Processes Payment**
   - Payment is processed securely
   - Paystack redirects to: `/wallet/verify?reference={reference}`

5. **Frontend Verifies Payment** (GET `/api/wallet/paystack/verify/{reference}`)
   - Captures reference from URL
   - Auto-verifies with backend
   - Backend checks with Paystack API
   - If successful:
     - Wallet balance is incremented
     - Total earnings is updated
     - Transaction record is created
     - User is notified

6. **User Sees Success Screen**
   - New balance is displayed
   - Auto-redirects to wallet in 3 seconds

## API Endpoints Required

Your backend should provide:
```
GET    /api/wallet                           - Get user's wallet
POST   /api/wallet/paystack/initialize       - Initialize Paystack deposit (ONLY payment method)
GET    /api/wallet/paystack/verify/:reference - Verify & credit wallet from Paystack
GET    /api/wallet/transactions              - Get wallet transaction history
```

⚠️ **NOTE:** Paystack is the ONLY supported deposit payment method. All deposits must go through the Paystack integration.

Expected wallet response format:
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "userId": {
      "_id": "string",
      "name": "string",
      "email": "string"
    },
    "balance": 120000,
    "currency": "NGN",
    "currencySymbol": "₦",
    "totalEarnings": 150000,
    "totalSpent": 30000,
    "transactions": ["id1", "id2"],
    "isActive": true,
    "lastUpdated": "2026-04-29T11:10:47.711Z"
  }
}
```

## Styling & UI

All components use:
- **Shadcn/UI components** - Card, Button, Input, Badge, Alert
- **Lucide icons** - Wallet, TrendingUp, TrendingDown, etc.
- **Tailwind CSS** - Responsive design with gradients and animations
- **Dark mode compatible** - Works with existing theme provider

## Error Handling

Each hook has error states:
```tsx
const { wallet, isError, error } = useWallet();

if (isError) {
  console.error('Wallet error:', error);
}
```

Toast notifications for:
- Minimum amount validation
- Payment initialization errors
- Verification failures
- Success messages

## Performance

- RTK Query caching automatically manages:
  - Wallet data caching with 5-minute stale time
  - Automatic cache invalidation after deposit
  - Optimized re-renders

- Transaction history can be paginated from backend

## Security

- All payment data handled through Paystack (PCI DSS compliant)
- No card details stored on BamiHustle servers
- Duplicate transaction checks in backend
- Atomic wallet updates using MongoDB operators

## Next Steps (Optional Enhancements)

1. **Withdrawal Feature**
   - Create withdrawal request form
   - Bank transfer integration

2. **Transaction Details Modal**
   - Click transaction for full details
   - Metadata display

3. **Wallet Analytics**
   - Charts showing spending trends
   - Monthly deposit/spend summaries

4. **Multiple Wallets**
   - Support for different business types
   - Sub-wallet allocations

5. **Notifications**
   - Email confirmations for deposits
   - In-app notifications for transactions

## Files Created/Modified

### New Files
- ✅ `src/types/wallet.ts` - Wallet types
- ✅ `src/hooks/useWallet.ts` - Wallet hooks
- ✅ `src/components/wallet/WalletBalance.tsx`
- ✅ `src/components/wallet/DepositForm.tsx`
- ✅ `src/components/wallet/DepositVerification.tsx`
- ✅ `src/components/wallet/TransactionHistory.tsx`
- ✅ `src/components/wallet/WalletWidget.tsx`
- ✅ `src/components/wallet/WalletPage.tsx`
- ✅ `src/components/wallet/index.ts` - Barrel export

### Modified Files
- ✅ `src/services/walletApi.ts` - Added endpoints
- ✅ `src/components/dashboard/DashboardRouter.tsx` - Added routes

### Already Configured
- ✅ `src/store/store.ts` - walletApi already registered
- ✅ `src/contexts/AuthContext.tsx` - User has email property

## Testing Checklist

- [ ] Wallet balance displays correctly
- [ ] Deposit form validates minimum amount
- [ ] Paystack redirects work
- [ ] Payment verification auto-triggers
- [ ] Success screen shows new balance
- [ ] Transaction history displays
- [ ] Widget shows on dashboard
- [ ] Error states handled gracefully
- [ ] Toast notifications appear
- [ ] Auto-redirect after 3 seconds works

---

**Implementation Date:** 29 April 2026
**Status:** ✅ Complete and Ready to Use
