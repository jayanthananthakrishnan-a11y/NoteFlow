# NoteFlow Testing Setup & Bug Fixes

## 🚨 Critical Issues Fixed

### 1. **Missing Export in auth.js** ✅ FIXED
- **Issue**: `getToken` was not exported, causing app to fail loading
- **Fix**: Added `export const getToken = getAuthToken;` alias in `src/utils/auth.js`
- **Status**: ✅ Complete

### 2. **Frontend Using Sample Data Instead of Backend API** ✅ FIXED
- **Issue**: Home page was showing hardcoded sample notes with numeric IDs instead of fetching from backend
- **Fix**: Updated `src/pages/Home.jsx` to fetch notes from backend API
- **Fix**: Updated `src/components/NoteCard.jsx` to handle both old and new data formats
- **Status**: ✅ Complete

### 3. **PostgreSQL Database Not Running** ⚠️ REQUIRES USER ACTION
- **Issue**: Backend cannot connect to database (ECONNREFUSED on port 5432)
- **Status**: ⚠️ **YOU NEED TO START POSTGRESQL**

---

## 🔧 Database Setup Required

### Step 1: Start PostgreSQL Service (Windows)

```powershell
# Option 1: Using Services GUI
1. Press Win + R
2. Type: services.msc
3. Find "PostgreSQL" service
4. Right-click → Start

# Option 2: Using Command Line (Run as Administrator)
net start postgresql-x64-14
# (Replace with your PostgreSQL version)
```

### Step 2: Verify PostgreSQL is Running

```bash
# Check if PostgreSQL is accepting connections
pg_isready -h localhost -p 5432
```

### Step 3: Create Database & Run Migrations

```bash
# Navigate to backend directory
cd backend

# Create database (if not exists)
psql -U postgres -c "CREATE DATABASE noteflow;"

# Run migrations
npm run migrate

# Seed sample data
psql -U postgres -d noteflow -f migrations/seed_data.sql
```

### Step 4: Update Database Credentials

Edit `backend/.env` file with your PostgreSQL password:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=noteflow
DB_USER=postgres
DB_PASSWORD=your_actual_postgres_password_here
```

### Step 5: Restart Backend Server

After database setup:
1. Stop the current backend server (Ctrl+C in Terminal 2)
2. Restart it: `cd backend && node server.js`

---

## 📋 Testing Checklist (Once Database is Running)

### Phase 1: Guest User Testing
- [ ] Home page loads with real notes from backend
- [ ] Click on free note → Should show full content
- [ ] Click on paid note → Should show preview only with "Purchase" button
- [ ] Like button disabled for guests (must login)
- [ ] Bookmark button disabled for guests (must login)
- [ ] Comments visible but cannot add (must login)

### Phase 2: Authentication Testing
- [ ] Sign up as new viewer
- [ ] Login successfully
- [ ] JWT token stored in localStorage
- [ ] Dashboard accessible after login
- [ ] Logout clears token and redirects to home

### Phase 3: Viewer Features Testing
- [ ] View free notes (full access)
- [ ] View paid notes preview
- [ ] Purchase paid note
- [ ] View purchased note (full access)
- [ ] Like/unlike notes (real-time count updates)
- [ ] Bookmark/unbookmark notes
- [ ] Add/edit/delete comments on notes
- [ ] View bookmarks in Dashboard
- [ ] View purchases in My Purchases page

### Phase 4: Creator Features Testing
- [ ] Sign up/login as creator
- [ ] Upload new note with title, subject, content
- [ ] Set free vs paid pricing
- [ ] Set free topics vs paid topics
- [ ] View uploaded notes in Creator Dashboard
- [ ] View earnings breakdown
- [ ] Edit existing notes
- [ ] Delete notes

### Phase 5: Backend Validation Testing
- [ ] is_owner correctly identifies note creator
- [ ] is_purchased correctly identifies purchased notes
- [ ] can_view_full correctly grants/denies access
- [ ] Free notes accessible to all users
- [ ] Paid notes show preview for non-purchasers
- [ ] Paid notes show full content for purchasers/owners
- [ ] JWT authentication works on all protected routes

---

## 🐛 Known Issues & Fixes Applied

### Fixed Issues:

1. **✅ Auth Export Missing**
   - File: `src/utils/auth.js`
   - Added: `export const getToken = getAuthToken;`

2. **✅ Home Page Static Data**
   - File: `src/pages/Home.jsx`
   - Changed: From using `sampleNotes` to fetching from API

3. **✅ NoteCard Component**
   - File: `src/components/NoteCard.jsx`
   - Updated: Handles both old sample format and new API format

### Pending Issues to Test:

4. **⏳ Backend Validation Logic**
   - Location: `backend/routes/notes.js` GET `/api/notes/:id`
   - Need to verify: `is_owner`, `is_purchased`, `can_view_full` flags

5. **⏳ Content Access Control**
   - Test: Free note access for guests
   - Test: Paid note preview for guests
   - Test: Paid note full access after purchase

6. **⏳ Engagement Features**
   - Test: Comments CRUD operations
   - Test: Like toggle functionality
   - Test: Bookmark add/remove

---

## 🚀 Quick Start for Testing (After DB Setup)

### Terminal Setup:

**Terminal 1: Frontend**
```bash
npm run dev
# Should be running on http://localhost:5173
```

**Terminal 2: Backend**
```bash
cd backend
node server.js
# Should be running on http://localhost:5000
```

### Browser Testing:

1. **Open**: http://localhost:5173
2. **Check Console**: Should have no errors
3. **Home Page**: Should show notes from database
4. **Test Guest Access**: Click on a free note
5. **Test Auth Flow**: Sign up → Login → Test features

---

## 📊 Sample Test Data Available

After seeding, you'll have:

- **6 Users**: 3 creators, 3 viewers
- **6 Notes**: Mix of free and paid
- **5 Payments**: Sample purchase history
- **5 Comments**: Sample reviews
- **5 Bookmarks**: Sample saved notes
- **6 Likes**: Sample note likes
- **8 Views**: Sample view tracking
- **5 Flashcards**: Sample quiz questions

### Test Credentials (After Seeding):

**Creator Account:**
- Email: `sarah.johnson@example.com`
- Password: `password123`

**Viewer Account:**
- Email: `john.smith@example.com`
- Password: `password123`

---

## 🔍 Debugging Tips

### Check Backend Logs:
```bash
# Look for errors in Terminal 2
# Should show:
- "Server running on port 5000"
- "Database connected successfully"
```

### Check Frontend Console:
```bash
# Open browser DevTools (F12)
# Console tab should show:
- "[vite] connected"
- No red errors
```

### Test API Directly:
```bash
# Test notes endpoint
curl http://localhost:5000/api/notes

# Test specific note
curl http://localhost:5000/api/notes/10000000-0000-0000-0000-000000000006
```

---

## 📝 Next Steps

1. **Start PostgreSQL** (see Step 1 above)
2. **Run migrations and seed data** (see Steps 2-3 above)
3. **Restart backend server**
4. **Refresh frontend** (F5 in browser)
5. **Begin systematic testing** (use checklist above)

Once database is running, we can proceed with comprehensive end-to-end testing of all features!

---

**Status**: Database setup required before testing can proceed.
