# API Payload Structure Test

## Expected Backend API Request (from your specification):

```bash
curl -X POST "http://localhost:5000/api/estates/64f1a1.../tenants" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {{JWT_TOKEN}}" \
  -d '{
    "unitLabel": "Unit 12",
    "firstName": "Ada",
    "surname": "Obi", 
    "otherNames": "Chinonso",
    "email": "ada@example.com",
    "whatsapp": "+2348012345678",
    "rentAmount": 250000,
    "tenantType": "new",
    "electricMeterNumber": "EM-44902",
    "nextDueDate": "15/12/2025"
  }'
```

## Updated Frontend Payload (matches your API):

The `submitTenant` function now sends:

```typescript
{
  unitLabel: "Unit 12",                    // ✅ matches
  firstName: "Ada",                        // ✅ matches  
  surname: "Obi",                         // ✅ matches
  otherNames: "Chinonso",                 // ✅ matches (optional)
  email: "ada@example.com",               // ✅ matches (optional)
  whatsapp: "+2348012345678",             // ✅ matches (optional)
  rentAmount: 250000,                     // ✅ matches (number)
  tenantType: "new",                      // ✅ matches
  electricMeterNumber: "EM-44902",        // ✅ matches (optional)
  nextDueDate: "15/12/2025"              // ✅ matches DD/MM/YYYY format
}
```

## Key Changes Made:

1. **Field Names Updated:**
   - `tenantEmail` → `email`
   - `whatsappNumber` → `whatsapp`
   - Removed `tenantName` (not needed in creation payload)
   - Removed `status` (not in your API spec)

2. **Date Format:**
   - Frontend date input: `YYYY-MM-DD` (HTML date input)
   - API payload: `DD/MM/YYYY` (converted automatically)

3. **Required vs Optional:**
   - **Required:** `unitLabel`, `firstName`, `surname`, `rentAmount`
   - **Optional:** `otherNames`, `email`, `whatsapp`, `tenantType`, `electricMeterNumber`, `nextDueDate`

4. **Form Validation:**
   - First name and surname are required for form submission
   - Unit label and rent amount are required
   - All other fields are optional

## Data Flow:

1. **User fills form** with separate name fields
2. **Form validates** required fields (firstName, surname, unitLabel, rentAmount)
3. **API payload created** with exact field names your backend expects
4. **Date converted** from `YYYY-MM-DD` to `DD/MM/YYYY`
5. **Request sent** to `POST /api/estates/:estateId/tenants`

## Backward Compatibility:

The frontend still supports displaying tenants with old field structure:
- Shows `tenantName` if available, falls back to combining `firstName + otherNames + surname`
- Shows `whatsapp` first, then `whatsappNumber`, then `tenantPhone`
- Shows `email` first, then `tenantEmail`

---

# Global Wallet Endpoint

## ✅ Done! Global Wallet Summary

A new global wallet endpoint has been added that aggregates all 9 wallets across all estates.

### Endpoint
```
GET /api/wallets/global-summary
```

### Response Structure

```json
{
  "success": true,
  "data": {
    "growthEngine": {
      "marketing": {
        "name": "Growth Engine Marketing",
        "balance": 0,
        "percentage": 25
      },
      "operations": {
        "name": "Growth Engine Operations",
        "balance": 0,
        "percentage": 15
      },
      "savings": {
        "name": "Growth Engine Savings",
        "balance": 0,
        "percentage": 10
      },
      "total": 0,
      "percentage": 50
    },
    "fulfillmentEngine": {
      "marketing": {
        "name": "Fulfillment Engine Marketing",
        "balance": 0,
        "percentage": 15
      },
      "operations": {
        "name": "Fulfillment Engine Operations",
        "balance": 0,
        "percentage": 9
      },
      "savings": {
        "name": "Fulfillment Engine Family Savings",
        "balance": 0,
        "percentage": 6
      },
      "total": 0,
      "percentage": 30
    },
    "innovationEngine": {
      "marketing": {
        "name": "Innovation Engine Marketing",
        "balance": 0,
        "percentage": 10
      },
      "operations": {
        "name": "Innovation Engine Operations",
        "balance": 0,
        "percentage": 6
      },
      "savings": {
        "name": "Innovation Engine Savings",
        "balance": 0,
        "percentage": 4
      },
      "total": 0,
      "percentage": 20
    },
    "summary": {
      "totalBalance": 0,
      "totalReceived": 0,
      "totalMarketing": 0,
      "totalOperations": 0,
      "totalSavings": 0
    }
  }
}
```

### Wallet Structure Overview

The endpoint returns data organized by 3 engines, each with 3 sub-wallets:

1. **Growth Engine** (50% allocation)
   - Marketing (25%)
   - Operations (15%)
   - Savings (10%)

2. **Fulfillment Engine** (30% allocation)
   - Marketing (15%)
   - Operations (9%)
   - Family Savings (6%)

3. **Innovation Engine** (20% allocation)
   - Marketing (10%)
   - Operations (6%)
   - Savings (4%)

### Summary Fields

- `totalBalance` - Combined balance across all 9 wallets
- `totalReceived` - Total funds received across all wallets
- `totalMarketing` - Sum of all marketing allocations
- `totalOperations` - Sum of all operations allocations
- `totalSavings` - Sum of all savings allocations

### Usage Example

```bash
curl -X GET "http://localhost:5000/api/wallets/global-summary" \
  -H "Authorization: Bearer {{JWT_TOKEN}}"
```

### Frontend Implementation

This endpoint is consumed by the `WalletDashboard` component to display aggregated wallet data across all estates and initiatives.