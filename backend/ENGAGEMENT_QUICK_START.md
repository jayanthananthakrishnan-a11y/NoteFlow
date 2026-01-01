# NoteFlow Engagement Features - Quick Start Guide

## Overview
This guide will help you quickly set up and test the Comments, Likes, and Bookmarks features in NoteFlow.

---

## Prerequisites

1. **Database**: PostgreSQL running with NoteFlow database
2. **Migrations**: Run the following migrations:
   - `004_create_comments_table.sql`
   - `005_create_bookmarks_table.sql`
   - `007_create_likes_table.sql`
3. **Backend**: Node.js server running on port 5000
4. **Frontend**: React app running on port 5173

---

## Step 1: Restart the Backend Server

The new routes have been added to the server. **Restart the backend server** to load them:

1. Stop the current server (Ctrl+C in Terminal 2)
2. Restart with: `cd backend && node server.js`
3. Look for these lines in the output:
   ```
   💬 Comments endpoints available at /api/comments
   ❤️  Likes endpoints available at /api/likes
   🔖 Bookmarks endpoints available at /api/bookmarks
   ```

---

## Step 2: Test the APIs

### Option 1: Using the Browser/Postman

**Test Health Check:**
```
GET http://localhost:5000/api/health
```

**Test Get Comments (No Auth Required):**
```
GET http://localhost:5000/api/comments?note_id=YOUR_NOTE_ID
```

### Option 2: Using cURL

#### 1. Get Like Count (Public)
```bash
curl http://localhost:5000/api/likes?note_id=YOUR_NOTE_ID
```

#### 2. Add Comment (Requires Auth)
First, login to get a token:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"yourpassword"}'
```

Save the token, then add a comment:
```bash
curl -X POST http://localhost:5000/api/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "note_id": "YOUR_NOTE_ID",
    "text": "This is a test comment!",
    "rating": 5
  }'
```

#### 3. Toggle Like (Requires Auth)
```bash
curl -X POST http://localhost:5000/api/likes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"note_id": "YOUR_NOTE_ID"}'
```

#### 4. Toggle Bookmark (Requires Auth)
```bash
curl -X POST http://localhost:5000/api/bookmarks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"note_id": "YOUR_NOTE_ID"}'
```

---

## Step 3: Test the Frontend Components

### 1. Update a Note Page

To use the new components, update your [`Note.jsx`](../src/pages/Note.jsx) page:

```jsx
import Comments from '../components/Comments';
import LikeButton from '../components/LikeButton';
import BookmarkButton from '../components/BookmarkButton';

// Inside your Note component:
<div className="flex gap-4 mb-6">
  <LikeButton 
    noteId={note.id} 
    onLikeChange={(data) => console.log('Like changed:', data)}
  />
  <BookmarkButton 
    noteId={note.id}
    onBookmarkChange={(data) => console.log('Bookmark changed:', data)}
  />
</div>

<Comments noteId={note.id} />
```

### 2. Test in Browser

1. Navigate to any note page (e.g., http://localhost:5173/notes/1)
2. Try the following:
   - ✅ Click Like button (should toggle)
   - ✅ Click Bookmark button (should toggle)
   - ✅ Add a comment with rating
   - ✅ Edit your comment
   - ✅ Delete your comment
   - ✅ View comments from other users
   - ✅ See like/bookmark counts update

---

## Step 4: Verify Database

Connect to PostgreSQL and verify data:

```sql
-- Check comments
SELECT * FROM comments ORDER BY date DESC LIMIT 10;

-- Check likes
SELECT * FROM likes ORDER BY date DESC LIMIT 10;

-- Check bookmarks
SELECT * FROM bookmarks ORDER BY date DESC LIMIT 10;

-- Get note with engagement stats
SELECT 
  n.id,
  n.title,
  COUNT(DISTINCT l.id) as like_count,
  COUNT(DISTINCT b.id) as bookmark_count,
  COUNT(DISTINCT c.id) as comment_count,
  AVG(c.rating) as avg_rating
FROM notes n
LEFT JOIN likes l ON n.id = l.note_id
LEFT JOIN bookmarks b ON n.id = b.note_id
LEFT JOIN comments c ON n.id = c.note_id AND c.is_deleted = false
WHERE n.id = 'YOUR_NOTE_ID'
GROUP BY n.id, n.title;
```

---

## Testing Checklist

### Backend API Tests

#### Comments API
- [ ] POST /api/comments - Add comment without rating
- [ ] POST /api/comments - Add comment with rating
- [ ] GET /api/comments?note_id={id} - Get comments list
- [ ] GET /api/comments/:id - Get single comment
- [ ] PUT /api/comments/:id - Update comment
- [ ] DELETE /api/comments/:id - Delete comment
- [ ] GET /api/comments/rating/:note_id - Get average rating

#### Likes API
- [ ] POST /api/likes - Like a note
- [ ] POST /api/likes - Unlike a note (toggle)
- [ ] GET /api/likes?note_id={id} - Get like count
- [ ] GET /api/likes/check/:note_id - Check if user liked
- [ ] GET /api/likes/user/liked-notes - Get user's liked notes
- [ ] GET /api/likes/note/:note_id - Get users who liked
- [ ] DELETE /api/likes/:note_id - Remove like

#### Bookmarks API
- [ ] POST /api/bookmarks - Bookmark a note
- [ ] POST /api/bookmarks - Remove bookmark (toggle)
- [ ] GET /api/bookmarks - Get user's bookmarks
- [ ] GET /api/bookmarks/check/:note_id - Check if bookmarked
- [ ] GET /api/bookmarks/note/:note_id - Get bookmark count
- [ ] GET /api/bookmarks/note/:note_id/users - Get users who bookmarked
- [ ] GET /api/bookmarks/stats - Get user stats
- [ ] DELETE /api/bookmarks/:note_id - Remove bookmark

### Frontend Component Tests

#### Comments Component
- [ ] Display existing comments
- [ ] Show comment count
- [ ] Show average rating with stars
- [ ] Add new comment (logged in)
- [ ] Add comment with rating
- [ ] Edit own comment
- [ ] Delete own comment
- [ ] Show "login required" message (logged out)
- [ ] Pagination (load more comments)
- [ ] Format relative timestamps
- [ ] Handle errors gracefully

#### LikeButton Component
- [ ] Display current like count
- [ ] Show liked state (filled heart)
- [ ] Show unliked state (outline heart)
- [ ] Toggle like on click (logged in)
- [ ] Show "login required" message (logged out)
- [ ] Update count on toggle
- [ ] Handle API errors
- [ ] Disable during API call

#### BookmarkButton Component
- [ ] Display bookmarked state (filled bookmark)
- [ ] Display unbookmarked state (outline bookmark)
- [ ] Toggle bookmark on click (logged in)
- [ ] Show "login required" message (logged out)
- [ ] Handle API errors
- [ ] Disable during API call

---

## Common Issues & Solutions

### Issue 1: "No token provided"
**Solution:** Make sure you're logged in and the JWT token is stored in localStorage.

### Issue 2: Comments not loading
**Solution:** 
- Check if noteId is being passed correctly
- Verify the note exists in database
- Check browser console for errors

### Issue 3: Server not starting
**Solution:**
- Port 5000 already in use: Kill existing process or change port
- Module not found: Run `npm install` in backend directory
- Database connection error: Check `.env` file settings

### Issue 4: Likes/Bookmarks not persisting
**Solution:**
- Check if user is authenticated
- Verify database tables exist (run migrations)
- Check server logs for errors

### Issue 5: Rating stars not displaying
**Solution:**
- Ensure comment has a rating value
- Check CSS/Tailwind classes are loading
- Verify star unicode character displays correctly

---

## Next Steps

After testing, consider:

1. **Add engagement metrics to dashboard**
   - Most liked notes
   - Most commented notes
   - User engagement stats

2. **Implement notifications**
   - Email when someone comments on your note
   - Notify when note reaches X likes

3. **Add moderation features**
   - Report inappropriate comments
   - Admin comment moderation

4. **Enhance UI/UX**
   - Add animations for like/bookmark
   - Show recent comments in note card
   - Display trending notes based on engagement

5. **Performance optimization**
   - Cache engagement counts
   - Implement real-time updates with WebSockets
   - Add indexes for better query performance

---

## API Documentation

For complete API documentation with all request/response examples, see:
[`ENGAGEMENT_API_DOCUMENTATION.md`](./ENGAGEMENT_API_DOCUMENTATION.md)

---

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check backend server logs
3. Verify database connections
4. Review the API documentation
5. Check authentication token validity

Happy testing! 🚀
