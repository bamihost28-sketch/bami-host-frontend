# Wallet System - Setup & Configuration

⚠️ **IMPORTANT: Paystack is the ONLY supported payment method for deposits.**

No alternative payment methods (bank transfers, card payments, wallet transfers, etc.) are supported. All deposits must be processed through Paystack.

---

## Backend Requirements

Your backend API must expose these endpoints:

### 1. Get User Wallet
```
GET /api/wallet
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "_id": "69ebbe70c620c3fab7550edb",
    "userId": { "_id": "...", "name": "...", "email": "..." },
    "balance": 120000,
    "currency": "NGN",
    "currencySymbol": "₦",
    "totalEarnings": 150000,
    "totalSpent": 30000,
    "transactions": ["id1", "id2"],
    "isActive": true,
    "lastUpdated": "2026-04-29T11:10:47.711Z",
    "createdAt": "2026-04-24T19:03:12.203Z",
    "updatedAt": "2026-04-29T11:10:47.964Z"
  }
}
```

### 2. Initialize Paystack Deposit
```
POST /api/wallet/paystack/initialize
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "amount": 5000  // Amount in Naira
}

Response:
{
  "success": true,
  "data": {
    "authorization_url": "https://checkout.paystack.com/...",
    "access_code": "...",
    "reference": "..."
  }
}
```

### 3. Verify Paystack Payment
```
GET /api/wallet/paystack/verify/{reference}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "reference": "...",
    "amount": 5000,
    "status": "success",
    "newBalance": 125000,
    "wallet": { ...full wallet object... }
  }
}
```

### 4. Get Wallet Transactions
```
GET /api/wallet/transactions
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "userId": "...",
      "walletId": "...",
      "type": "deposit",
      "amount": 5000,
      "currency": "NGN",
      "status": "completed",
      "paymentMethod": "paystack",
      "reference": "...",
      "description": "...",
      "metadata": { ...paystack response... },
      "createdAt": "2026-04-29T..."
    }
  ]
}
```

## Frontend Configuration

### 1. Environment Variables (if needed)
Create `.env.local` if your app uses environment-specific config:
```
VITE_API_BASE_URL=http://localhost:4000
VITE_PAYSTACK_PUBLIC_KEY=pk_test_... # If using client-side Paystack
```

### 2. Update Backend URL
The `BASE_API_URL` is configured in `src/services/api.ts`. Ensure it points to your backend:
```typescript
// src/services/api.ts
export const BASE_API_URL = process.env.VITE_API_BASE_URL || 'http://localhost:4000';
```

### 3. Paystack Callback Configuration (Backend)
Your backend should be configured with the Paystack callback URL:
```
Callback URL: {FRONTEND_URL}/dashboard/wallet/verify
```

For example:
- Development: `http://localhost:5173/dashboard/wallet/verify`
- Production: `https://yourdomain.com/dashboard/wallet/verify`

## Integration Steps

### Step 1: Add Routes (Already Done ✅)
Routes are already added to `DashboardRouter.tsx`:
- `/dashboard/wallet` - Original wallet dashboard
- `/dashboard/wallet/manage` - Full wallet management page
- `/dashboard/wallet/deposit` - Deposit page
- `/dashboard/wallet/verify` - Paystack callback handler

### Step 2: Add Wallet to Sidebar
Update your `DashboardLayout` sidebar navigation to include wallet links:

```tsx
import { Wallet, Send } from 'lucide-react';

const sidebarItems = [
  {
    label: 'Wallet',
    href: '/dashboard/wallet',
    icon: Wallet,
  },
  {
    label: 'Deposit',
    href: '/dashboard/wallet/deposit',
    icon: Send,
  },
];
```

### Step 3: Add Widget to Dashboard
```tsx
import { WalletWidget } from '@/components/wallet';

export function Dashboard() {
  return (
    <div className="space-y-6">
      <WalletWidget />
      {/* Other dashboard content */}
    </div>
  );
}
```

### Step 4: Use Hooks in Custom Components
```tsx
import { useWallet, usePaystackDeposit } from '@/hooks/useWallet';

export function CustomComponent() {
  const { wallet, formattedBalance } = useWallet();
  const { initializeDeposit } = usePaystackDeposit();

  return (
    <div>
      <p>Balance: {formattedBalance}</p>
      <button onClick={() => initializeDeposit(1000)}>
        Deposit ₦1,000
      </button>
    </div>
  );
}
```

## Common Issues & Solutions

### Issue: "Cannot find module '@/components/wallet'"
**Solution:** Ensure `index.ts` barrel export exists in `src/components/wallet/`

### Issue: "Wallet is undefined" when loading component
**Solution:** This is expected during loading. Use the `isLoading` state from hooks:
```tsx
const { wallet, isLoading } = useWallet();

if (isLoading) return <Skeleton />;
if (!wallet) return <ErrorMessage />;

return <div>{wallet.balance}</div>;
```

### Issue: Payment redirect doesn't work
**Solution:** Ensure backend:
1. Returns `authorization_url` from Paystack API
2. Callback URL is set to `/dashboard/wallet/verify`
3. Paystack API credentials are correct

### Issue: Verification page shows "No payment reference found"
**Solution:** Check that:
1. Paystack is redirecting with `reference` or `trxref` query parameter
2. Browser URL shows: `/dashboard/wallet/verify?reference=...`
3. No URL encoding issues

## Testing the Wallet Locally

### 1. Mock API Responses (if backend not ready)
Update `src/services/walletApi.ts` to use mock data for development:

```tsx
const mockWallet: Wallet = {
  _id: 'test-id',
  userId: { _id: 'user-id', name: 'Test User', email: 'test@example.com', id: 'user-id' },
  balance: 50000,
  currency: 'NGN',
  currencySymbol: '₦',
  totalEarnings: 100000,
  totalSpent: 50000,
  transactions: [],
  isActive: true,
  lastUpdated: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  id: 'test-id',
};

// In DashboardRouter for testing
if (process.env.NODE_ENV === 'development' && mockMode) {
  return <WalletPage />; // Will use mock data
}
```

### 2. Paystack Sandbox Testing
1. Create account at https://paystack.com
2. Get test API keys from dashboard
3. Configure backend with test keys
4. Use Paystack test card: `4084084084084081`, CVV: `408`, Expiry: `12/40`

### 3. Local Testing Flow
1. Start frontend: `npm run dev`
2. Start backend: `npm run server` (or your command)
3. Login to app
4. Navigate to `/dashboard/wallet/deposit`
5. Enter test amount (e.g., ₦500)
6. Click Deposit
7. Should redirect to Paystack sandbox
8. Use test card to "pay"
9. Should redirect back to `/dashboard/wallet/verify?reference=...`
10. Should show success screen

## Performance Tips

### Caching
- Wallet data is cached for 5 minutes
- Invalidated automatically after deposit
- Adjust stale time in `walletApi.ts` if needed:

```tsx
getPersonalWallet: builder.query<WalletResponse, void>({
  query: () => '/api/wallet',
  providesTags: ['PersonalWallet'],
  keepUnusedDataFor: 300, // 5 minutes in seconds
}),
```

### Pagination
For large transaction lists, implement pagination:

```tsx
// Backend endpoint
GET /api/wallet/transactions?page=1&limit=20

// Frontend hook
const useWalletTransactions = (page = 1, limit = 20) => {
  return useGetWalletTransactionsQuery({ page, limit });
};
```

## Security Best Practices

✅ **Already Implemented:**
- No card details stored on frontend
- All payment processing through Paystack
- Atomic wallet updates (no race conditions)
- Duplicate transaction prevention
- Backend verification of all payments

✅ **Recommended Backend Practices:**
- Verify Paystack webhook signature
- Check payment amount matches request
- Implement rate limiting on deposit endpoint
- Log all wallet transactions
- Use HTTPS for all API calls
- Implement timeout on webhook verification

## Deployment Checklist

Before deploying to production:

- [ ] Update `BASE_API_URL` to production backend
- [ ] Update Paystack callback URL in dashboard
- [ ] Use Paystack live API keys (not sandbox)
- [ ] Test deposit flow end-to-end
- [ ] Set up error logging (Sentry, LogRocket, etc.)
- [ ] Configure CORS for production domain
- [ ] Test with real transactions (small amount)
- [ ] Set up monitoring/alerts for failed transactions
- [ ] Document wallet feature in user guide
- [ ] Train support team on wallet operations

---

**Last Updated:** 29 April 2026
**Status:** Ready for Production Integration
