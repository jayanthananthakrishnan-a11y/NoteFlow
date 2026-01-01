# Payment System - Quick Start Guide

Quick reference for implementing the NoteFlow payment system.

## 🚀 Getting Started

### 1. Database Setup

The payments table is already created via migrations. Ensure migrations are run:

```bash
cd backend
npm run migrate
```

### 2. Start Backend Server

```bash
cd backend
npm start
# or for development
npm run dev
```

Server will start on `http://localhost:5000` with payment endpoints at `/api/payments`

---

## 📋 API Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/payments/purchase` | POST | Required | Purchase a note |
| `/api/payments/my-purchases` | GET | Required | Get user's purchases |
| `/api/payments/creator-earnings` | GET | Required (Creator) | Get creator earnings |
| `/api/payments/:id` | GET | Required | Get payment details |

---

## 💡 Quick Examples

### Purchase a Note

```bash
curl -X POST http://localhost:5000/api/payments/purchase \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"note_id": "NOTE_UUID"}'
```

### Get My Purchases

```bash
curl -X GET http://localhost:5000/api/payments/my-purchases \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Creator Earnings

```bash
curl -X GET http://localhost:5000/api/payments/creator-earnings \
  -H "Authorization: Bearer CREATOR_TOKEN"
```

---

## 🔑 Key Features

✅ **Duplicate Prevention**: Cannot purchase same note twice  
✅ **Access Control**: Automatic content unlock after purchase  
✅ **Creator Protection**: Cannot buy your own notes  
✅ **Free Note Handling**: Free notes don't require purchase  
✅ **Transaction History**: Complete purchase and earnings tracking  

---

## 🛡️ Error Handling

| Status | Scenario |
|--------|----------|
| 400 | Already purchased / Free note / Invalid input |
| 403 | Purchasing own note / Not a creator |
| 404 | Note not found |
| 401 | Not authenticated |

---

## 📦 Integration Components

### Files Created
- [`backend/models/Payment.js`](backend/models/Payment.js) - Payment data operations
- [`backend/routes/payments.js`](backend/routes/payments.js) - Payment API endpoints
- [`backend/PAYMENTS_API_DOCUMENTATION.md`](backend/PAYMENTS_API_DOCUMENTATION.md) - Full documentation

### Files Modified
- [`backend/server.js`](backend/server.js) - Registered payment routes
- [`backend/models/Note.js`](backend/models/Note.js) - Already has purchase checking logic

### Database
- Uses existing [`backend/migrations/003_create_payments_table.sql`](backend/migrations/003_create_payments_table.sql)

---

## 🧪 Testing Workflow

### 1. Create Test Users
```bash
# Create a regular user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "user@test.com",
    "password": "password123",
    "userType": "learner"
  }'

# Create a creator
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Creator",
    "email": "creator@test.com",
    "password": "password123",
    "userType": "creator"
  }'
```

### 2. Login & Get Tokens
```bash
# User token
USER_TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}' \
  | jq -r '.data.token')

# Creator token
CREATOR_TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"creator@test.com","password":"password123"}' \
  | jq -r '.data.token')
```

### 3. Create a Paid Note (as creator)
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CREATOR_TOKEN" \
  -d '{
    "title": "Test Paid Note",
    "subject": "Testing",
    "topics": ["Test Topic"],
    "description": "A test note for payment testing",
    "content_type": "pdf",
    "content_urls": ["https://example.com/test.pdf"],
    "price": 9.99
  }' | jq
```

### 4. Purchase the Note (as user)
```bash
# Replace NOTE_ID with the ID from step 3
curl -X POST http://localhost:5000/api/payments/purchase \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{"note_id": "NOTE_ID"}' | jq
```

### 5. Verify Purchase
```bash
# Check user's purchases
curl -X GET http://localhost:5000/api/payments/my-purchases \
  -H "Authorization: Bearer $USER_TOKEN" | jq

# Check creator's earnings
curl -X GET http://localhost:5000/api/payments/creator-earnings \
  -H "Authorization: Bearer $CREATOR_TOKEN" | jq
```

---

## 🔄 Access Control Flow

```
User views note → Check purchase status → Grant/Deny access

Purchase Status Checks:
1. Is user the creator? → Full access (no purchase needed)
2. Is note free (price = 0)? → Full access (no purchase needed)
3. Has user purchased? → Full access
4. Otherwise → Limited preview only
```

The [`NoteRepository.findById()`](backend/models/Note.js:161) method automatically checks purchase status and includes:
- `is_purchased`: boolean
- `is_owner`: boolean
- `content_access`: object with access details

---

## 💻 Frontend Integration Example

```javascript
// Purchase flow
const handlePurchase = async (noteId) => {
  try {
    const response = await fetch('/api/payments/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ note_id: noteId })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('Purchase successful!');
      // Refresh note to get updated access
      refreshNote();
    }
  } catch (error) {
    alert(error.message);
  }
};
```

---

## 📊 Database Schema Quick Reference

```sql
-- Payments table stores all transactions
payments (
  id UUID PRIMARY KEY,
  user_id UUID → users(id),
  note_id UUID → notes(id),
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  status payment_status, -- pending, completed, failed, refunded
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255) UNIQUE,
  date TIMESTAMP DEFAULT NOW(),
  metadata JSONB
)

-- Unique constraint prevents duplicate purchases
UNIQUE INDEX ON (user_id, note_id) WHERE status = 'completed'
```

---

## 🎯 Common Use Cases

### Check if User Can Access Note
```javascript
const note = await NoteRepository.findById(noteId, userId);
if (note.content_access.can_view_full) {
  // Show full content
} else {
  // Show purchase button
}
```

### Get Purchase History
```javascript
const purchases = await PaymentRepository.findByUser(userId);
```

### Track Creator Revenue
```javascript
const earnings = await PaymentRepository.findEarningsByCreator(creatorId);
console.log(`Total: $${earnings.summary.totalEarnings}`);
```

---

## 🚨 Important Notes

1. **Current Implementation**: Payments are simulated (auto-completed)
2. **Production**: Integrate with Stripe/PayPal for real payments
3. **Webhooks**: Add webhook handlers for payment gateway events
4. **Refunds**: Not yet implemented (planned enhancement)
5. **Currency**: Currently USD only (multi-currency planned)

---

## 📚 Full Documentation

For complete API documentation, examples, and integration guides, see:
- [Full API Documentation](./PAYMENTS_API_DOCUMENTATION.md)

---

## 🆘 Troubleshooting

### Payment endpoint returns 404
- Ensure backend server restarted after adding routes
- Check `server.js` includes payment routes

### Cannot purchase note
- Check JWT token is valid
- Verify note exists and is paid (price > 0)
- Ensure not trying to buy own note
- Check database migrations ran successfully

### Creator earnings empty
- Ensure user is a creator (`userType: 'creator'`)
- Check there are completed purchases of creator's notes

---

**Ready to Go!** 🎉

The payment system is fully functional and ready for testing and integration.
