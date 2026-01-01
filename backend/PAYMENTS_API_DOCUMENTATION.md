# NoteFlow Payments API Documentation

Complete documentation for the NoteFlow payment and monetization system.

---

## Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Error Handling](#error-handling)
5. [Testing](#testing)
6. [Integration Guide](#integration-guide)

---

## Overview

The NoteFlow payment system enables:
- **One-time purchases** of paid notes
- **Transaction tracking** with complete payment history
- **Access control** for purchased content
- **Creator earnings** dashboard and analytics

### Key Features

- ✅ Duplicate purchase prevention
- ✅ Automatic access grant after purchase
- ✅ Creator earnings tracking
- ✅ Purchase history for users
- ✅ JWT authentication required
- ✅ Comprehensive error handling

---

## Database Schema

### Payments Table

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status payment_status NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255) UNIQUE,
    date TIMESTAMP NOT NULL DEFAULT NOW(),
    metadata JSONB
);

-- Payment Status ENUM
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Indexes
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_note ON payments(note_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_date ON payments(date);

-- Unique constraint to prevent duplicate purchases
CREATE UNIQUE INDEX unique_user_note_purchase 
ON payments(user_id, note_id) 
WHERE status = 'completed';
```

### Key Columns

- **id**: Unique payment identifier (UUID)
- **user_id**: Reference to the purchasing user
- **note_id**: Reference to the purchased note
- **amount**: Payment amount (decimal)
- **currency**: ISO 4217 currency code (default: USD)
- **status**: Payment status (pending, completed, failed, refunded)
- **payment_method**: Payment method used (e.g., credit_card, paypal)
- **transaction_id**: External payment gateway transaction ID
- **date**: Transaction timestamp
- **metadata**: Additional JSON data about the transaction

---

## API Endpoints

### Base URL
```
http://localhost:5000/api/payments
```

All endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

### 1. Purchase a Note

**Endpoint:** `POST /api/payments/purchase`

**Description:** Purchase a paid note with one-time payment

**Authentication:** Required (any authenticated user)

#### Request Body

```json
{
  "note_id": "550e8400-e29b-41d4-a716-446655440000",
  "payment_method": "credit_card"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| note_id | UUID | Yes | ID of the note to purchase |
| payment_method | String | No | Payment method (default: "internal") |

#### Success Response (201)

```json
{
  "success": true,
  "message": "Note purchased successfully",
  "data": {
    "payment": {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "note_id": "550e8400-e29b-41d4-a716-446655440000",
      "amount": 9.99,
      "currency": "USD",
      "status": "completed",
      "date": "2025-12-25T14:30:00.000Z"
    },
    "note": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Advanced Calculus Notes",
      "subject": "Mathematics",
      "creator_name": "Dr. Smith",
      "content_access": {
        "can_view_full": true
      }
    }
  }
}
```

#### Error Responses

**400 Bad Request - Already Purchased**
```json
{
  "success": false,
  "message": "You have already purchased this note"
}
```

**400 Bad Request - Free Note**
```json
{
  "success": false,
  "message": "This note is free and does not require purchase"
}
```

**403 Forbidden - Own Note**
```json
{
  "success": false,
  "message": "You cannot purchase your own note"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Note not found"
}
```

#### Example Usage

```bash
curl -X POST http://localhost:5000/api/payments/purchase \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "note_id": "550e8400-e29b-41d4-a716-446655440000",
    "payment_method": "credit_card"
  }'
```

```javascript
// JavaScript/React Example
const purchaseNote = async (noteId) => {
  const response = await fetch('http://localhost:5000/api/payments/purchase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      note_id: noteId,
      payment_method: 'credit_card'
    })
  });
  
  const data = await response.json();
  return data;
};
```

---

### 2. Get My Purchases

**Endpoint:** `GET /api/payments/my-purchases`

**Description:** Retrieve all notes purchased by the authenticated user

**Authentication:** Required (any authenticated user)

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| limit | Integer | No | 20 | Results per page (max: 100) |
| offset | Integer | No | 0 | Results to skip |

#### Success Response (200)

```json
{
  "success": true,
  "message": "Purchases retrieved successfully",
  "data": {
    "purchases": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "note_id": "550e8400-e29b-41d4-a716-446655440000",
        "note_title": "Advanced Calculus Notes",
        "note_subject": "Mathematics",
        "note_thumbnail": "https://example.com/thumb.jpg",
        "note_content_type": "pdf",
        "creator_name": "Dr. Smith",
        "amount": 9.99,
        "currency": "USD",
        "status": "completed",
        "date": "2025-12-25T14:30:00.000Z"
      },
      {
        "id": "770e8400-e29b-41d4-a716-446655440000",
        "note_id": "880e8400-e29b-41d4-a716-446655440000",
        "note_title": "Organic Chemistry Guide",
        "note_subject": "Chemistry",
        "note_thumbnail": "https://example.com/chem.jpg",
        "note_content_type": "pdf",
        "creator_name": "Prof. Johnson",
        "amount": 12.50,
        "currency": "USD",
        "status": "completed",
        "date": "2025-12-20T10:15:00.000Z"
      }
    ],
    "pagination": {
      "total": 2,
      "limit": 20,
      "offset": 0
    }
  }
}
```

#### Example Usage

```bash
# Get first page
curl -X GET "http://localhost:5000/api/payments/my-purchases" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get with pagination
curl -X GET "http://localhost:5000/api/payments/my-purchases?limit=10&offset=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

```javascript
// JavaScript/React Example
const getMyPurchases = async (limit = 20, offset = 0) => {
  const response = await fetch(
    `http://localhost:5000/api/payments/my-purchases?limit=${limit}&offset=${offset}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const data = await response.json();
  return data;
};
```

---

### 3. Get Creator Earnings

**Endpoint:** `GET /api/payments/creator-earnings`

**Description:** Get earnings summary and transaction history for a creator

**Authentication:** Required (creator users only)

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| limit | Integer | No | 20 | Transactions per page (max: 100) |
| offset | Integer | No | 0 | Transactions to skip |
| period | String | No | - | Time grouping (day, week, month, year) |

#### Success Response (200)

```json
{
  "success": true,
  "message": "Earnings retrieved successfully",
  "data": {
    "summary": {
      "totalSales": 25,
      "totalEarnings": 249.75,
      "currency": "USD"
    },
    "transactions": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "amount": 9.99,
        "currency": "USD",
        "date": "2025-12-25T14:30:00.000Z",
        "status": "completed",
        "note_id": "550e8400-e29b-41d4-a716-446655440000",
        "note_title": "Advanced Calculus Notes",
        "buyer_name": "John Doe",
        "buyer_email": "john@example.com"
      }
    ],
    "pagination": {
      "limit": 20,
      "offset": 0
    }
  }
}
```

#### Response with Analytics (using period parameter)

```json
{
  "success": true,
  "message": "Earnings retrieved successfully",
  "data": {
    "summary": {
      "totalSales": 25,
      "totalEarnings": 249.75,
      "currency": "USD"
    },
    "transactions": [...],
    "analytics": [
      {
        "period": "2025-12",
        "sales_count": "10",
        "total_amount": "99.90"
      },
      {
        "period": "2025-11",
        "sales_count": "15",
        "total_amount": "149.85"
      }
    ],
    "pagination": {
      "limit": 20,
      "offset": 0
    }
  }
}
```

#### Error Response (403) - Not a Creator

```json
{
  "success": false,
  "message": "Access denied. Only creators can view earnings"
}
```

#### Example Usage

```bash
# Get basic earnings
curl -X GET "http://localhost:5000/api/payments/creator-earnings" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get with monthly analytics
curl -X GET "http://localhost:5000/api/payments/creator-earnings?period=month" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

```javascript
// JavaScript/React Example
const getCreatorEarnings = async (period = null) => {
  const url = period 
    ? `http://localhost:5000/api/payments/creator-earnings?period=${period}`
    : 'http://localhost:5000/api/payments/creator-earnings';
    
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data;
};
```

---

### 4. Get Payment Details

**Endpoint:** `GET /api/payments/:id`

**Description:** Get details of a specific payment (for payment owner or note creator)

**Authentication:** Required

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Payment ID |

#### Success Response (200)

```json
{
  "success": true,
  "message": "Payment retrieved successfully",
  "data": {
    "payment": {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "user_id": "440e8400-e29b-41d4-a716-446655440000",
      "note_id": "550e8400-e29b-41d4-a716-446655440000",
      "note_title": "Advanced Calculus Notes",
      "amount": 9.99,
      "currency": "USD",
      "status": "completed",
      "payment_method": "credit_card",
      "transaction_id": "TXN-1735141800000-abc123",
      "date": "2025-12-25T14:30:00.000Z",
      "metadata": {
        "note_title": "Advanced Calculus Notes",
        "creator_name": "Dr. Smith",
        "purchase_date": "2025-12-25T14:30:00.000Z"
      }
    }
  }
}
```

#### Error Responses

**403 Forbidden**
```json
{
  "success": false,
  "message": "Access denied. You can only view your own payments"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Payment not found"
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "message": "Error message description",
  "errors": [
    {
      "field": "note_id",
      "message": "Invalid note ID format"
    }
  ]
}
```

### Common HTTP Status Codes

| Code | Description | Example |
|------|-------------|---------|
| 200 | Success | Data retrieved successfully |
| 201 | Created | Payment created successfully |
| 400 | Bad Request | Invalid input or validation error |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | User lacks permission for action |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal server error |

### Validation Errors

When validation fails, the API returns a 400 status with details:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "Note ID is required",
      "path": "note_id",
      "location": "body"
    }
  ]
}
```

---

## Testing

### Manual Testing with cURL

#### 1. Purchase a Note

```bash
# First, login to get a token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  | jq -r '.data.token')

# Purchase a note
curl -X POST http://localhost:5000/api/payments/purchase \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "note_id": "your-note-uuid-here",
    "payment_method": "credit_card"
  }' | jq
```

#### 2. Get My Purchases

```bash
curl -X GET http://localhost:5000/api/payments/my-purchases \
  -H "Authorization: Bearer $TOKEN" | jq
```

#### 3. Get Creator Earnings

```bash
# Login as creator
CREATOR_TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"creator@example.com","password":"password123"}' \
  | jq -r '.data.token')

# Get earnings
curl -X GET "http://localhost:5000/api/payments/creator-earnings?period=month" \
  -H "Authorization: Bearer $CREATOR_TOKEN" | jq
```

### Testing Scenarios

#### Scenario 1: Successful Purchase
1. User logs in
2. User browses notes
3. User purchases a paid note
4. System creates payment record
5. User gains access to full content

#### Scenario 2: Duplicate Purchase Prevention
1. User tries to purchase already-owned note
2. System returns 400 error
3. No duplicate payment created

#### Scenario 3: Creator Cannot Purchase Own Note
1. Creator tries to purchase their own note
2. System returns 403 error
3. No payment created

#### Scenario 4: Free Note Access
1. User tries to purchase free note
2. System returns 400 error
3. No payment needed

---

## Integration Guide

### Frontend Integration (React Example)

```javascript
// services/paymentService.js
import api from './api';

export const paymentService = {
  // Purchase a note
  async purchaseNote(noteId, paymentMethod = 'credit_card') {
    try {
      const response = await api.post('/payments/purchase', {
        note_id: noteId,
        payment_method: paymentMethod
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user's purchases
  async getMyPurchases(limit = 20, offset = 0) {
    try {
      const response = await api.get('/payments/my-purchases', {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get creator earnings
  async getCreatorEarnings(period = null, limit = 20, offset = 0) {
    try {
      const params = { limit, offset };
      if (period) params.period = period;
      
      const response = await api.get('/payments/creator-earnings', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
```

### Usage in React Component

```javascript
// components/PurchaseButton.jsx
import React, { useState } from 'react';
import { paymentService } from '../services/paymentService';

const PurchaseButton = ({ note, onPurchaseSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await paymentService.purchaseNote(note.id);
      onPurchaseSuccess(result);
      alert('Purchase successful! You now have access to the full content.');
    } catch (err) {
      setError(err.message);
      alert(`Purchase failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (note.is_purchased || note.is_owner) {
    return <span>✓ You have access</span>;
  }

  if (note.price === 0) {
    return <span>Free</span>;
  }

  return (
    <div>
      <button 
        onClick={handlePurchase}
        disabled={loading}
        className="purchase-button"
      >
        {loading ? 'Processing...' : `Purchase for $${note.price}`}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default PurchaseButton;
```

### Access Control Example

```javascript
// components/NoteContent.jsx
import React, { useEffect, useState } from 'react';
import { noteService } from '../services/noteService';

const NoteContent = ({ noteId }) => {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      const data = await noteService.getNote(noteId);
      setNote(data.note);
      setLoading(false);
    };
    fetchNote();
  }, [noteId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{note.title}</h1>
      
      {note.content_access.can_view_full ? (
        // Show full content
        <div className="full-content">
          {note.content_access.available_content.map((url, idx) => (
            <iframe key={idx} src={url} title={`Page ${idx + 1}`} />
          ))}
        </div>
      ) : (
        // Show locked content message
        <div className="locked-content">
          <p>Preview available</p>
          <p>🔒 {note.content_access.locked_content_count} pages locked</p>
          <PurchaseButton note={note} onPurchaseSuccess={fetchNote} />
        </div>
      )}
    </div>
  );
};
```

---

## Security Considerations

### Authentication
- All endpoints require JWT authentication
- Tokens should be stored securely (httpOnly cookies or secure storage)
- Tokens expire after configured time period

### Authorization
- Users can only purchase notes they don't own
- Users can only view their own purchases
- Creators can only view their own earnings
- Payment details accessible only to buyer or seller

### Data Validation
- All inputs are validated using express-validator
- UUID format validation for IDs
- Amount range validation
- Duplicate purchase prevention at database level

### Payment Processing
- Current implementation simulates payment (for development)
- Production should integrate with:
  - Stripe
  - PayPal
  - Other payment gateways
- Implement webhook handlers for payment status updates
- Add retry logic for failed transactions

---

## Future Enhancements

### Planned Features
1. **Refund Support**: Allow refunds within timeframe
2. **Subscription Model**: Monthly/yearly access plans
3. **Bundle Purchases**: Buy multiple notes at discount
4. **Payment Gateway Integration**: Stripe/PayPal integration
5. **Invoice Generation**: PDF invoices for purchases
6. **Tax Calculation**: Automatic tax calculation by region
7. **Payment Analytics**: Advanced analytics dashboard
8. **Promo Codes**: Discount code system
9. **Payment Webhooks**: Real-time payment notifications
10. **Multi-currency Support**: Support for multiple currencies

---

## Support

For questions or issues:
- Check the error response messages
- Review the validation rules
- Ensure JWT token is valid and not expired
- Verify user has required permissions
- Check database migrations are up to date

---

**Last Updated:** December 25, 2025  
**API Version:** 1.0.0  
**Documentation Version:** 1.0.0
