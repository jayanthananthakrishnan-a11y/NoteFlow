# Notes API Documentation

Complete API documentation for the NoteFlow Notes endpoints.

## Base URL
```
http://localhost:5000/api/notes
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

### 1. Create Note (Upload)

**Endpoint:** `POST /api/notes`  
**Access:** Private (Creator only)  
**Description:** Upload a new note to the platform

#### Request Headers
```
Authorization: Bearer <creator-jwt-token>
Content-Type: application/json
```

#### Request Body
```json
{
  "title": "Advanced Calculus Notes",
  "subject": "Mathematics",
  "topics": ["Derivatives", "Integrals", "Limits"],
  "description": "Comprehensive notes covering advanced calculus topics with detailed explanations and examples",
  "content_type": "pdf",
  "content_urls": [
    "https://example.com/calculus-part1.pdf",
    "https://example.com/calculus-part2.pdf"
  ],
  "thumbnail_url": "https://example.com/thumbnails/calculus.jpg",
  "free_topics": ["Derivatives"],
  "paid_topics": ["Integrals", "Limits"],
  "price": 9.99,
  "is_published": true
}
```

#### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Note created successfully",
  "data": {
    "note": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "creator_id": "user123-4567-8901-2345-678901234567",
      "title": "Advanced Calculus Notes",
      "subject": "Mathematics",
      "topics": ["Derivatives", "Integrals", "Limits"],
      "description": "Comprehensive notes covering advanced calculus topics...",
      "content_type": "pdf",
      "content_urls": [
        "https://example.com/calculus-part1.pdf",
        "https://example.com/calculus-part2.pdf"
      ],
      "thumbnail_url": "https://example.com/thumbnails/calculus.jpg",
      "free_topics": ["Derivatives"],
      "paid_topics": ["Integrals", "Limits"],
      "price": "9.99",
      "is_published": true,
      "date_uploaded": "2025-12-20T23:00:00.000Z",
      "date_modified": null
    }
  }
}
```

#### Error Responses

**400 Bad Request - Validation Error**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Title must be between 3 and 255 characters",
      "param": "title",
      "location": "body"
    }
  ]
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "message": "No token provided. Authorization denied."
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Access denied. Required role: creator"
}
```

---

### 2. Get All Notes

**Endpoint:** `GET /api/notes`  
**Access:** Public  
**Description:** Fetch all published notes with optional filters and pagination

#### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `subject` | string | No | Filter by subject | `Mathematics` |
| `creator_id` | UUID | No | Filter by creator | `user123-4567-...` |
| `search` | string | No | Search in title/description | `calculus` |
| `price_filter` | string | No | Filter by price: `free` or `paid` | `free` |
| `sort_by` | string | No | Sort field (default: `date_uploaded`) | `price` |
| `sort_order` | string | No | Sort order: `asc` or `desc` (default: `desc`) | `asc` |
| `limit` | integer | No | Results per page (default: 20, max: 100) | `10` |
| `offset` | integer | No | Number of results to skip (default: 0) | `20` |

#### Example Request
```
GET /api/notes?subject=Mathematics&price_filter=free&limit=10&offset=0
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Notes retrieved successfully",
  "data": {
    "notes": [
      {
        "id": "note-uuid-1",
        "creator_id": "user-uuid-1",
        "creator_name": "John Doe",
        "creator_email": "john@example.com",
        "creator_type": "creator",
        "title": "Introduction to Calculus",
        "subject": "Mathematics",
        "topics": ["Limits", "Derivatives"],
        "description": "Basic calculus concepts explained",
        "content_type": "pdf",
        "content_urls": ["https://example.com/intro-calc.pdf"],
        "thumbnail_url": "https://example.com/thumb1.jpg",
        "free_topics": ["Limits", "Derivatives"],
        "paid_topics": null,
        "price": "0.00",
        "is_published": true,
        "date_uploaded": "2025-12-20T10:00:00.000Z",
        "date_modified": null
      },
      {
        "id": "note-uuid-2",
        "creator_id": "user-uuid-2",
        "creator_name": "Jane Smith",
        "creator_email": "jane@example.com",
        "creator_type": "creator",
        "title": "Linear Algebra Basics",
        "subject": "Mathematics",
        "topics": ["Matrices", "Vectors"],
        "description": "Fundamental linear algebra concepts",
        "content_type": "mixed",
        "content_urls": ["https://example.com/linalg.pdf"],
        "thumbnail_url": "https://example.com/thumb2.jpg",
        "free_topics": ["Vectors"],
        "paid_topics": null,
        "price": "0.00",
        "is_published": true,
        "date_uploaded": "2025-12-19T15:30:00.000Z",
        "date_modified": null
      }
    ],
    "pagination": {
      "total": 45,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

### 3. Get Single Note by ID

**Endpoint:** `GET /api/notes/:id`  
**Access:** Public (content access depends on purchase status)  
**Description:** Fetch a single note with content access based on purchase status

#### Example Request
```
GET /api/notes/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Authorization: Bearer <optional-jwt-token>
```

#### Success Response - Unpurchased Paid Note (200 OK)
```json
{
  "success": true,
  "message": "Note retrieved successfully",
  "data": {
    "note": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "creator_id": "user123-4567-8901-2345-678901234567",
      "creator_name": "John Doe",
      "creator_email": "john@example.com",
      "creator_profile_picture": "https://example.com/profiles/john.jpg",
      "title": "Advanced Calculus Notes",
      "subject": "Mathematics",
      "topics": ["Derivatives", "Integrals", "Limits"],
      "description": "Comprehensive notes covering advanced calculus topics",
      "content_type": "pdf",
      "thumbnail_url": "https://example.com/thumbnails/calculus.jpg",
      "free_topics": ["Derivatives"],
      "paid_topics": ["Integrals", "Limits"],
      "price": "9.99",
      "date_uploaded": "2025-12-20T23:00:00.000Z",
      "date_modified": null,
      "is_purchased": false,
      "is_owner": false,
      "content_access": {
        "can_view_full": false,
        "available_content": [
          "https://example.com/calculus-part1.pdf"
        ],
        "locked_content_count": 1
      }
    }
  }
}
```

#### Success Response - Purchased or Free Note (200 OK)
```json
{
  "success": true,
  "message": "Note retrieved successfully",
  "data": {
    "note": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "creator_id": "user123-4567-8901-2345-678901234567",
      "creator_name": "John Doe",
      "creator_email": "john@example.com",
      "creator_profile_picture": "https://example.com/profiles/john.jpg",
      "title": "Advanced Calculus Notes",
      "subject": "Mathematics",
      "topics": ["Derivatives", "Integrals", "Limits"],
      "description": "Comprehensive notes covering advanced calculus topics",
      "content_type": "pdf",
      "thumbnail_url": "https://example.com/thumbnails/calculus.jpg",
      "free_topics": ["Derivatives"],
      "paid_topics": ["Integrals", "Limits"],
      "price": "9.99",
      "date_uploaded": "2025-12-20T23:00:00.000Z",
      "date_modified": null,
      "is_purchased": true,
      "is_owner": false,
      "content_access": {
        "can_view_full": true,
        "available_content": [
          "https://example.com/calculus-part1.pdf",
          "https://example.com/calculus-part2.pdf"
        ]
      }
    }
  }
}
```

#### Error Response (404 Not Found)
```json
{
  "success": false,
  "message": "Note not found"
}
```

---

### 4. Update Note

**Endpoint:** `PUT /api/notes/:id`  
**Access:** Private (Creator only, must be note owner)  
**Description:** Update an existing note

#### Request Headers
```
Authorization: Bearer <creator-jwt-token>
Content-Type: application/json
```

#### Request Body (partial update allowed)
```json
{
  "title": "Updated Advanced Calculus Notes",
  "description": "Updated description with more details",
  "price": 12.99,
  "is_published": true
}
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Note updated successfully",
  "data": {
    "note": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "creator_id": "user123-4567-8901-2345-678901234567",
      "title": "Updated Advanced Calculus Notes",
      "subject": "Mathematics",
      "topics": ["Derivatives", "Integrals", "Limits"],
      "description": "Updated description with more details",
      "content_type": "pdf",
      "content_urls": [
        "https://example.com/calculus-part1.pdf",
        "https://example.com/calculus-part2.pdf"
      ],
      "thumbnail_url": "https://example.com/thumbnails/calculus.jpg",
      "free_topics": ["Derivatives"],
      "paid_topics": ["Integrals", "Limits"],
      "price": "12.99",
      "is_published": true,
      "date_uploaded": "2025-12-20T23:00:00.000Z",
      "date_modified": "2025-12-20T23:30:00.000Z"
    }
  }
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "message": "No valid fields provided for update"
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "message": "No token provided. Authorization denied."
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Access denied. Required role: creator"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Note not found or you are not authorized to update this note"
}
```

---

### 5. Delete Note

**Endpoint:** `DELETE /api/notes/:id`  
**Access:** Private (Creator only, must be note owner)  
**Description:** Delete a note permanently

#### Request Headers
```
Authorization: Bearer <creator-jwt-token>
```

#### Example Request
```
DELETE /api/notes/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Note deleted successfully"
}
```

#### Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "message": "No token provided. Authorization denied."
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Access denied. Required role: creator"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Note not found or you are not authorized to delete this note"
}
```

---

## Testing with cURL

### Create a Note
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Authorization: Bearer YOUR_CREATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Note",
    "subject": "Mathematics",
    "topics": ["Algebra"],
    "description": "Test description",
    "content_type": "pdf",
    "content_urls": ["https://example.com/test.pdf"],
    "price": 0
  }'
```

### Get All Notes
```bash
curl http://localhost:5000/api/notes?subject=Mathematics&limit=5
```

### Get Single Note
```bash
curl http://localhost:5000/api/notes/YOUR_NOTE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update a Note
```bash
curl -X PUT http://localhost:5000/api/notes/YOUR_NOTE_ID \
  -H "Authorization: Bearer YOUR_CREATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "price": 5.99
  }'
```

### Delete a Note
```bash
curl -X DELETE http://localhost:5000/api/notes/YOUR_NOTE_ID \
  -H "Authorization: Bearer YOUR_CREATOR_TOKEN"
```

---

## Testing with Postman

1. **Import Collection**: Create a new collection called "NoteFlow Notes API"

2. **Set Environment Variables**:
   - `base_url`: `http://localhost:5000/api`
   - `creator_token`: Your creator JWT token
   - `viewer_token`: Your viewer JWT token
   - `note_id`: A valid note ID

3. **Create Requests**: Add the above endpoints to your collection

4. **Test Scenarios**:
   - Create note as creator ✓
   - Try to create note as viewer (should fail) ✗
   - Get all notes (no auth needed) ✓
   - Get single note with/without auth
   - Update note as owner ✓
   - Try to update note as non-owner (should fail) ✗
   - Delete note as owner ✓

---

## Database Schema Reference

The notes are stored in PostgreSQL with the following structure:

```sql
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    topics JSONB NOT NULL,
    description TEXT,
    content_type content_type NOT NULL,
    content_urls JSONB NOT NULL,
    thumbnail_url VARCHAR(500),
    free_topics JSONB,
    paid_topics JSONB,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    date_uploaded TIMESTAMP NOT NULL DEFAULT NOW(),
    date_modified TIMESTAMP
);
```

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development only)",
  "errors": [/* Validation errors if applicable */]
}
```

### Common HTTP Status Codes
- `200 OK`: Successful GET, PUT, DELETE
- `201 Created`: Successful POST
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Notes

1. **Authentication**: Creator endpoints require both authentication and creator role
2. **Content Access**: Content URLs are filtered based on purchase status
3. **Pagination**: Use `limit` and `offset` for efficient data retrieval
4. **Validation**: All inputs are validated before processing
5. **JSON Fields**: `topics`, `content_urls`, `free_topics`, and `paid_topics` are stored as JSONB in PostgreSQL
