# NoteFlow Engagement Features API Documentation

This document provides complete API documentation for Comments, Likes, and Bookmarks features in NoteFlow.

## Table of Contents
- [Comments API](#comments-api)
- [Likes API](#likes-api)
- [Bookmarks API](#bookmarks-api)
- [Authentication](#authentication)
- [Error Handling](#error-handling)

---

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Comments API

### 1. Add Comment to Note

**Endpoint:** `POST /api/comments`  
**Authentication:** Required  
**Description:** Add a comment with optional rating to a note

**Request Body:**
```json
{
  "note_id": "123e4567-e89b-12d3-a456-426614174000",
  "text": "Great notes! Very helpful for my exam preparation.",
  "rating": 5
}
```

**Field Validations:**
- `note_id` (required): Valid UUID
- `text` (required): String, max 5000 characters
- `rating` (optional): Integer between 1-5

**Success Response (201):**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "id": "987e6543-e89b-12d3-a456-426614174111",
    "text": "Great notes! Very helpful for my exam preparation.",
    "rating": 5,
    "date": "2025-12-25T15:30:00.000Z",
    "edited_date": null,
    "user_id": "456e7890-e89b-12d3-a456-426614174222",
    "username": "john_doe",
    "name": "John Doe"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Comment text is required"
}
```

---

### 2. Get Comments for Note

**Endpoint:** `GET /api/comments?note_id={noteId}&limit={limit}&offset={offset}`  
**Authentication:** Not required  
**Description:** Fetch all comments for a note with pagination

**Query Parameters:**
- `note_id` (required): UUID of the note
- `limit` (optional): Number of comments per page (default: 10, max: 100)
- `offset` (optional): Number of comments to skip (default: 0)

**Example Request:**
```
GET /api/comments?note_id=123e4567-e89b-12d3-a456-426614174000&limit=10&offset=0
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Comments retrieved successfully",
  "data": {
    "comments": [
      {
        "id": "987e6543-e89b-12d3-a456-426614174111",
        "text": "Great notes! Very helpful for my exam preparation.",
        "rating": 5,
        "date": "2025-12-25T15:30:00.000Z",
        "edited_date": null,
        "user_id": "456e7890-e89b-12d3-a456-426614174222",
        "username": "john_doe",
        "name": "John Doe"
      },
      {
        "id": "987e6543-e89b-12d3-a456-426614174112",
        "text": "Very clear and concise. Would recommend!",
        "rating": 4,
        "date": "2025-12-25T14:20:00.000Z",
        "edited_date": null,
        "user_id": "456e7890-e89b-12d3-a456-426614174223",
        "username": "jane_smith",
        "name": "Jane Smith"
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    },
    "rating": {
      "averageRating": "4.5",
      "ratingCount": 15
    }
  }
}
```

---

### 3. Get Single Comment

**Endpoint:** `GET /api/comments/:id`  
**Authentication:** Not required  
**Description:** Get a specific comment by ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Comment retrieved successfully",
  "data": {
    "id": "987e6543-e89b-12d3-a456-426614174111",
    "text": "Great notes! Very helpful for my exam preparation.",
    "rating": 5,
    "date": "2025-12-25T15:30:00.000Z",
    "edited_date": null,
    "user_id": "456e7890-e89b-12d3-a456-426614174222",
    "username": "john_doe",
    "name": "John Doe"
  }
}
```

---

### 4. Update Comment

**Endpoint:** `PUT /api/comments/:id`  
**Authentication:** Required (Comment owner only)  
**Description:** Update a comment's text and/or rating

**Request Body:**
```json
{
  "text": "Updated comment text with more details.",
  "rating": 4
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Comment updated successfully",
  "data": {
    "id": "987e6543-e89b-12d3-a456-426614174111",
    "text": "Updated comment text with more details.",
    "rating": 4,
    "date": "2025-12-25T15:30:00.000Z",
    "edited_date": "2025-12-25T16:00:00.000Z",
    "user_id": "456e7890-e89b-12d3-a456-426614174222",
    "username": "john_doe",
    "name": "John Doe"
  }
}
```

---

### 5. Delete Comment

**Endpoint:** `DELETE /api/comments/:id`  
**Authentication:** Required (Comment owner only)  
**Description:** Soft delete a comment

**Success Response (200):**
```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

---

### 6. Get Average Rating

**Endpoint:** `GET /api/comments/rating/:note_id`  
**Authentication:** Not required  
**Description:** Get average rating and rating count for a note

**Success Response (200):**
```json
{
  "success": true,
  "message": "Rating data retrieved successfully",
  "data": {
    "averageRating": "4.5",
    "ratingCount": 15
  }
}
```

---

## Likes API

### 1. Toggle Like on Note

**Endpoint:** `POST /api/likes`  
**Authentication:** Required  
**Description:** Like or unlike a note (toggle)

**Request Body:**
```json
{
  "note_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Success Response - Liked (200):**
```json
{
  "success": true,
  "message": "Note liked successfully",
  "data": {
    "action": "liked",
    "likeCount": 42,
    "isLiked": true
  }
}
```

**Success Response - Unliked (200):**
```json
{
  "success": true,
  "message": "Note unliked successfully",
  "data": {
    "action": "unliked",
    "likeCount": 41,
    "isLiked": false
  }
}
```

---

### 2. Get Like Count for Note

**Endpoint:** `GET /api/likes?note_id={noteId}`  
**Authentication:** Not required  
**Description:** Get total number of likes for a note

**Example Request:**
```
GET /api/likes?note_id=123e4567-e89b-12d3-a456-426614174000
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Like count retrieved successfully",
  "data": {
    "note_id": "123e4567-e89b-12d3-a456-426614174000",
    "likeCount": 42
  }
}
```

---

### 3. Check Like Status

**Endpoint:** `GET /api/likes/check/:note_id`  
**Authentication:** Required  
**Description:** Check if current user has liked a note

**Success Response (200):**
```json
{
  "success": true,
  "message": "Like status retrieved successfully",
  "data": {
    "note_id": "123e4567-e89b-12d3-a456-426614174000",
    "isLiked": true
  }
}
```

---

### 4. Get Liked Notes by User

**Endpoint:** `GET /api/likes/user/liked-notes?limit={limit}&offset={offset}`  
**Authentication:** Required  
**Description:** Get all notes liked by the current user

**Query Parameters:**
- `limit` (optional): Number of notes per page (default: 20, max: 100)
- `offset` (optional): Number of notes to skip (default: 0)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Liked notes retrieved successfully",
  "data": {
    "notes": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "Advanced React Patterns",
        "subject": "Computer Science",
        "price": 5.99,
        "liked_date": "2025-12-25T15:30:00.000Z",
        "creator_username": "prof_smith",
        "creator_name": "Prof. John Smith"
      }
    ],
    "pagination": {
      "total": 10,
      "limit": 20,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

---

### 5. Get Users Who Liked a Note

**Endpoint:** `GET /api/likes/note/:note_id?limit={limit}&offset={offset}`  
**Authentication:** Not required  
**Description:** Get all users who liked a specific note

**Success Response (200):**
```json
{
  "success": true,
  "message": "Likes retrieved successfully",
  "data": {
    "likes": [
      {
        "id": "like-uuid-1",
        "date": "2025-12-25T15:30:00.000Z",
        "user_id": "456e7890-e89b-12d3-a456-426614174222",
        "username": "john_doe",
        "name": "John Doe"
      }
    ],
    "pagination": {
      "total": 42,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

---

### 6. Remove Like

**Endpoint:** `DELETE /api/likes/:note_id`  
**Authentication:** Required  
**Description:** Remove like from a note

**Success Response (200):**
```json
{
  "success": true,
  "message": "Like removed successfully",
  "data": {
    "note_id": "123e4567-e89b-12d3-a456-426614174000",
    "likeCount": 41,
    "isLiked": false
  }
}
```

---

## Bookmarks API

### 1. Toggle Bookmark on Note

**Endpoint:** `POST /api/bookmarks`  
**Authentication:** Required  
**Description:** Bookmark or remove bookmark from a note (toggle)

**Request Body:**
```json
{
  "note_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Success Response - Added (200):**
```json
{
  "success": true,
  "message": "Note bookmarked successfully",
  "data": {
    "action": "added",
    "isBookmarked": true,
    "bookmark": {
      "id": "bookmark-uuid-1",
      "user_id": "456e7890-e89b-12d3-a456-426614174222",
      "note_id": "123e4567-e89b-12d3-a456-426614174000",
      "date": "2025-12-25T15:30:00.000Z"
    }
  }
}
```

**Success Response - Removed (200):**
```json
{
  "success": true,
  "message": "Bookmark removed successfully",
  "data": {
    "action": "removed",
    "isBookmarked": false,
    "bookmark": null
  }
}
```

---

### 2. Get User's Bookmarked Notes

**Endpoint:** `GET /api/bookmarks?limit={limit}&offset={offset}`  
**Authentication:** Required  
**Description:** Get all notes bookmarked by the current user

**Query Parameters:**
- `limit` (optional): Number of notes per page (default: 20, max: 100)
- `offset` (optional): Number of notes to skip (default: 0)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Bookmarked notes retrieved successfully",
  "data": {
    "notes": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "Advanced React Patterns",
        "subject": "Computer Science",
        "description": "Comprehensive guide to advanced React patterns",
        "price": 5.99,
        "bookmarked_date": "2025-12-25T15:30:00.000Z",
        "creator_username": "prof_smith",
        "creator_name": "Prof. John Smith",
        "like_count": 42,
        "comment_count": 15
      }
    ],
    "pagination": {
      "total": 5,
      "limit": 20,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

---

### 3. Check Bookmark Status

**Endpoint:** `GET /api/bookmarks/check/:note_id`  
**Authentication:** Required  
**Description:** Check if current user has bookmarked a note

**Success Response (200):**
```json
{
  "success": true,
  "message": "Bookmark status retrieved successfully",
  "data": {
    "note_id": "123e4567-e89b-12d3-a456-426614174000",
    "isBookmarked": true
  }
}
```

---

### 4. Get Bookmark Count for Note

**Endpoint:** `GET /api/bookmarks/note/:note_id`  
**Authentication:** Not required  
**Description:** Get total number of bookmarks for a note

**Success Response (200):**
```json
{
  "success": true,
  "message": "Bookmark count retrieved successfully",
  "data": {
    "note_id": "123e4567-e89b-12d3-a456-426614174000",
    "bookmarkCount": 28
  }
}
```

---

### 5. Get Users Who Bookmarked a Note

**Endpoint:** `GET /api/bookmarks/note/:note_id/users?limit={limit}&offset={offset}`  
**Authentication:** Not required  
**Description:** Get all users who bookmarked a specific note

**Success Response (200):**
```json
{
  "success": true,
  "message": "Bookmarks retrieved successfully",
  "data": {
    "bookmarks": [
      {
        "id": "bookmark-uuid-1",
        "date": "2025-12-25T15:30:00.000Z",
        "user_id": "456e7890-e89b-12d3-a456-426614174222",
        "username": "john_doe",
        "name": "John Doe"
      }
    ],
    "pagination": {
      "total": 28,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

---

### 6. Get User Bookmark Statistics

**Endpoint:** `GET /api/bookmarks/stats`  
**Authentication:** Required  
**Description:** Get bookmark statistics for the current user

**Success Response (200):**
```json
{
  "success": true,
  "message": "Bookmark statistics retrieved successfully",
  "data": {
    "totalBookmarks": 15,
    "subjectsCount": 5,
    "creatorsCount": 8
  }
}
```

---

### 7. Remove Bookmark

**Endpoint:** `DELETE /api/bookmarks/:note_id`  
**Authentication:** Required  
**Description:** Remove bookmark from a note

**Success Response (200):**
```json
{
  "success": true,
  "message": "Bookmark removed successfully",
  "data": {
    "note_id": "123e4567-e89b-12d3-a456-426614174000",
    "isBookmarked": false
  }
}
```

---

## Error Handling

All endpoints follow a consistent error response format:

### Validation Error (400)
```json
{
  "success": false,
  "message": "note_id is required"
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "message": "No token provided. Authorization denied."
}
```

### Authorization Error (403)
```json
{
  "success": false,
  "message": "You are not authorized to perform this action"
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "message": "Comment not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Failed to add comment",
  "error": "Database connection error"
}
```

---

## Testing the APIs

### Using cURL

#### Add a Comment
```bash
curl -X POST http://localhost:5000/api/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "note_id": "123e4567-e89b-12d3-a456-426614174000",
    "text": "Great notes!",
    "rating": 5
  }'
```

#### Get Comments
```bash
curl -X GET "http://localhost:5000/api/comments?note_id=123e4567-e89b-12d3-a456-426614174000&limit=10&offset=0"
```

#### Toggle Like
```bash
curl -X POST http://localhost:5000/api/likes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "note_id": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

#### Toggle Bookmark
```bash
curl -X POST http://localhost:5000/api/bookmarks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "note_id": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

---

## Integration Notes

### Frontend Integration

1. **Import API methods** from `src/services/api.js`:
```javascript
import { commentsAPI, likesAPI, bookmarksAPI } from '../services/api';
```

2. **Use in components**:
```javascript
// Add comment
const response = await commentsAPI.addComment(noteId, text, rating);

// Toggle like
const response = await likesAPI.toggleLike(noteId);

// Toggle bookmark
const response = await bookmarksAPI.toggleBookmark(noteId);
```

### Database Requirements

Ensure the following migrations are run:
- `004_create_comments_table.sql`
- `005_create_bookmarks_table.sql`
- `007_create_likes_table.sql`

### Environment Variables

Required in `.env` file:
```
JWT_SECRET=your-secret-key
DB_HOST=localhost
DB_PORT=5432
DB_NAME=noteflow
DB_USER=postgres
DB_PASSWORD=your-password
```

---

## Rate Limiting

Consider implementing rate limiting for engagement endpoints:
- Comments: 10 per minute
- Likes: 30 per minute
- Bookmarks: 30 per minute

---

## Best Practices

1. **Always validate input** on both frontend and backend
2. **Use JWT authentication** for protected endpoints
3. **Implement pagination** for large datasets
4. **Handle errors gracefully** on the frontend
5. **Cache frequently accessed data** (like counts, ratings)
6. **Use optimistic UI updates** for better UX
7. **Debounce API calls** to prevent spam

---

## Support

For issues or questions, please refer to the main README or contact the development team.
