# Payment & Receipt Integration Guide

## Overview

This guide covers the integration of payment processing and PDF receipt generation for the BamiHustle Tenant Dashboard.

## Features Implemented

### 1. **PDF Receipt Generation** ✅
- Automatic receipt generation after successful payment
- Professional receipt template with:
  - Tenant information
  - Payment details
  - Transaction reference
  - Payment date & time
  - Amount paid
- Download as PDF file
- Download individual receipts from payment history

### 2. **Payment Gateway Integration** ✅
- **Paystack Integration Only** - Card, Bank Transfer, USSD
- Easy payment method selection UI
- Secure payment processing

### 3. **Payment Types Supported**
- ✅ Rent Payment
- ✅ Service Charge Payment
- ✅ Utility Payments (Water, Electricity, Waste, Generator)

---

## Setup Instructions

### Step 1: Install Dependencies

```bash
npm install
```

This will install the required packages:
- `jspdf` - PDF generation
- `html2canvas` - HTML to canvas conversion
- `axios` - API requests

### Step 2: Configure Environment Variables

Copy `.env.example` to `.env.local` and update with your payment gateway keys:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```env
# Paystack Configuration (Only Payment Provider)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
```

### Step 3: Get Payment Gateway Keys

#### **Paystack Setup**
1. Go to https://paystack.com
2. Create an account and sign in
3. Navigate to **Dashboard → Settings → Developer**
4. Copy your **Public Key** (pk_test_... for testing, pk_live_... for production)
5. Paste in `.env.local`

### Step 4: Add Payment Script Tags (Optional)

For production, ensure the Paystack script is loaded in your `index.html`:

```html
<!-- Paystack -->
<script src="https://js.paystack.co/v1/inline.js"></script>
```

---

## Usage Guide

### Making a Payment

1. **Open Tenant Dashboard**
   - Navigate to the Tenant Dashboard
   - Click **"Pay Rent"** or **"Pay Now"** for any utility

2. **Payment Processing**
   - Paystack is the only payment method
   - Amount is automatically populated

3. **Process Payment**
   - Click **"Pay"** button
   - Redirected to payment gateway
   - Complete payment with your preferred method

4. **Receive Receipt**
   - Automatic PDF receipt generated
   - Receipt downloaded automatically
   - Payment marked as completed

### Downloading Payment Receipt

1. **From Payment History**
   - Go to **Rent & Payments** tab
   - Find the payment in history
   - Click **"Receipt"** button
   - PDF automatically downloads

2. **Receipt Contents**
   - Receipt number
   - Tenant information
   - Payment details
   - Amount paid
   - Transaction reference
   - Date & time of payment

---

## API Integration (Backend Required)

### Payment Verification Endpoint

After successful payment, the frontend sends verification request to your backend:

```
POST /api/payments/verify
Content-Type: application/json

{
  "reference": "payment_reference",
  "provider": "paystack"
}
```

**Expected Response:**
```json
{
  "success": true,
  "reference": "payment_reference",
  "amount": 250000,
  "status": "completed",
  "tenantId": "tenant_001",
  "paymentType": "rent"
}
```

### Payment Recording Endpoint

Your backend should record payments:

```
POST /api/payments/record
Content-Type: application/json

{
  "tenantId": "tenant_001",
  "amount": 250000,
  "paymentType": "rent",
  "month": "April 2025",
  "reference": "payment_reference",
  "method": "paystack",
  "status": "paid"
}
```

---

## File Locations

```
src/
├── components/
│   └── dashboard/
│       └── TenantDashboard.tsx          # Main component with UI
├── services/
│   └── paymentService.ts                # Payment gateway integration
├── utils/
│   └── receiptGenerator.ts              # PDF receipt generation
└── .env.example                         # Environment configuration template
```

---

## Security Considerations

### ✅ Best Practices Implemented
- ✅ Public keys only (never expose secret keys)
- ✅ Secure payment windows from official providers
- ✅ HTTPS required for production
- ✅ Environment variables for sensitive data

### 🔐 Additional Recommendations
- Use HTTPS in production
- Validate amounts on backend
- Store payments in secure database
- Implement audit logging
- Use webhook for payment confirmation
- Never expose private/secret keys

---

## Testing

### **Test Mode (Development)**

Use these test credentials:

#### Paystack Test Card
```
Card Number: 4084084084084081
Expiry: 12/25
CVV: 853
```

### Manual Testing Checklist
- [ ] Payment dialog opens correctly
- [ ] Paystack payment processes without errors
- [ ] Amount displays correctly
- [ ] Payment processes without errors
- [ ] Receipt generates successfully
- [ ] Receipt downloads as PDF
- [ ] Download from history works
- [ ] Error handling displays proper messages

---

## Troubleshooting

### Issue: "Generator icon not found"
**Solution:** Already fixed - replaced with `Fuel` icon

### Issue: "Payment gateway not responding"
- Check internet connection
- Verify public keys are correct
- Ensure scripts are loaded (check browser console)
- Check browser console for CORS errors

### Issue: "PDF not generating"
- Ensure html2canvas and jsPDF are installed
- Check browser console for errors
- Verify DOM has all required elements

### Issue: Environment variables not loading
```bash
# Clear cache and restart
npm run dev

# Or restart dev server
```

---

## Features TO ADD (Future)

- [ ] Auto-payment setup
- [ ] Payment reminders via email/SMS
- [ ] Payment history analytics
- [ ] Multiple payment methods per payment
- [ ] Partial payments support
- [ ] Payment plans/installments
- [ ] Online invoice generation
- [ ] Payment receipts in email
- [ ] Export payment history

---

## Support & Documentation

- **Paystack Docs:** https://paystack.com/docs
- **jsPDF Docs:** https://github.com/parallax/jsPDF
- **html2canvas Docs:** https://html2canvas.hertzen.com

---

## Version Info

- **Created:** April 24, 2026
- **Component Version:** 1.0
- **Payment Service Version:** 1.0
- **Receipt Generator Version:** 1.0

---

**Last Updated:** April 24, 2026
