# NoteFlow Database Schema

## Database Selection: PostgreSQL

### Rationale:
- **ACID Compliance**: Critical for payment transactions and data integrity
- **Relational Structure**: Clear relationships between users, notes, payments, and other entities
- **Complex Queries**: Support for JOINs, aggregations, and advanced querying
- **Scalability**: Excellent performance with proper indexing
- **JSON Support**: Can store flexible data (topics, options) while maintaining relational structure

---

## Entity Relationship Overview

```
Users (1) ──────< (N) Notes
Users (1) ──────< (N) Payments
Users (1) ──────< (N) Comments
Users (1) ──────< (N) Bookmarks
Notes (1) ──────< (N) Payments
Notes (1) ──────< (N) Comments
Notes (1) ──────< (N) Bookmarks
Notes (1) ──────< (N) Flashcards
Notes (1) ──────── (1) Analytics
```

---

## 1. Users Table

Stores user account information for both Creators and Viewers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique user identifier |
| `name` | VARCHAR(255) | NOT NULL | User's full name |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| `password` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `role` | ENUM('Creator', 'Viewer') | NOT NULL, DEFAULT 'Viewer' | User role |
| `profile_picture` | VARCHAR(500) | NULL | URL to profile picture |
| `bio` | TEXT | NULL | User bio/description |
| `date_created` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation date |
| `last_login` | TIMESTAMP | NULL | Last login timestamp |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Account status |
| `email_verified` | BOOLEAN | NOT NULL, DEFAULT FALSE | Email verification status |

**Indexes:**
- `idx_users_email` on `email`
- `idx_users_role` on `role`

---

## 2. Notes Table

Stores educational content uploaded by creators.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique note identifier |
| `creator_id` | UUID | FOREIGN KEY → Users(id), NOT NULL | Note creator |
| `title` | VARCHAR(255) | NOT NULL | Note title |
| `subject` | VARCHAR(100) | NOT NULL | Subject category (e.g., Math, Physics) |
| `topics` | JSONB | NOT NULL | Array of topics covered |
| `description` | TEXT | NULL | Note description |
| `content_type` | ENUM('pdf', 'image', 'mixed') | NOT NULL | Type of content |
| `content_urls` | JSONB | NOT NULL | Array of URLs to content files |
| `thumbnail_url` | VARCHAR(500) | NULL | Preview thumbnail |
| `free_topics` | JSONB | NULL | Array of free topic names |
| `paid_topics` | JSONB | NULL | Array of paid topic names |
| `price` | DECIMAL(10,2) | NOT NULL, DEFAULT 0.00 | Price for paid content |
| `is_published` | BOOLEAN | NOT NULL, DEFAULT TRUE | Publication status |
| `date_uploaded` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Upload timestamp |
| `date_modified` | TIMESTAMP | NULL | Last modification date |

**Indexes:**
- `idx_notes_creator` on `creator_id`
- `idx_notes_subject` on `subject`
- `idx_notes_date` on `date_uploaded`
- `idx_notes_price` on `price`

---

## 3. Payments Table

Tracks all payment transactions for note purchases.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique payment identifier |
| `user_id` | UUID | FOREIGN KEY → Users(id), NOT NULL | Buyer |
| `note_id` | UUID | FOREIGN KEY → Notes(id), NOT NULL | Purchased note |
| `amount` | DECIMAL(10,2) | NOT NULL | Payment amount |
| `currency` | VARCHAR(3) | NOT NULL, DEFAULT 'USD' | Currency code |
| `status` | ENUM('pending', 'completed', 'failed', 'refunded') | NOT NULL | Payment status |
| `payment_method` | VARCHAR(50) | NULL | Payment method used |
| `transaction_id` | VARCHAR(255) | UNIQUE, NULL | External transaction ID |
| `date` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Payment timestamp |
| `metadata` | JSONB | NULL | Additional payment data |

**Indexes:**
- `idx_payments_user` on `user_id`
- `idx_payments_note` on `note_id`
- `idx_payments_status` on `status`
- `idx_payments_date` on `date`

**Unique Constraint:**
- `unique_user_note_purchase` on (`user_id`, `note_id`, `status`) WHERE `status = 'completed'`

---

## 4. Comments Table

Stores user comments and ratings on notes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique comment identifier |
| `user_id` | UUID | FOREIGN KEY → Users(id), NOT NULL | Comment author |
| `note_id` | UUID | FOREIGN KEY → Notes(id), NOT NULL | Related note |
| `text` | TEXT | NOT NULL | Comment text |
| `rating` | INTEGER | CHECK (rating >= 1 AND rating <= 5), NULL | Rating (1-5 stars) |
| `date` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Comment timestamp |
| `edited_date` | TIMESTAMP | NULL | Last edit timestamp |
| `is_deleted` | BOOLEAN | NOT NULL, DEFAULT FALSE | Soft delete flag |

**Indexes:**
- `idx_comments_note` on `note_id`
- `idx_comments_user` on `user_id`
- `idx_comments_date` on `date`
- `idx_comments_rating` on `rating`

---

## 5. Bookmarks Table

Stores user bookmarks/favorites for notes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique bookmark identifier |
| `user_id` | UUID | FOREIGN KEY → Users(id), NOT NULL | User who bookmarked |
| `note_id` | UUID | FOREIGN KEY → Notes(id), NOT NULL | Bookmarked note |
| `date` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Bookmark timestamp |

**Indexes:**
- `idx_bookmarks_user` on `user_id`
- `idx_bookmarks_note` on `note_id`

**Unique Constraint:**
- `unique_user_note_bookmark` on (`user_id`, `note_id`)

---

## 6. Flashcards Table

Stores flashcards and quiz questions associated with notes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique flashcard identifier |
| `note_id` | UUID | FOREIGN KEY → Notes(id), NOT NULL | Related note |
| `question` | TEXT | NOT NULL | Question text |
| `options` | JSONB | NULL | Array of answer options (for MCQ) |
| `answer` | TEXT | NOT NULL | Correct answer |
| `question_type` | ENUM('flashcard', 'mcq', 'true_false') | NOT NULL | Type of question |
| `difficulty` | ENUM('easy', 'medium', 'hard') | NULL | Difficulty level |
| `explanation` | TEXT | NULL | Answer explanation |
| `date_created` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `order_index` | INTEGER | NULL | Display order |

**Indexes:**
- `idx_flashcards_note` on `note_id`
- `idx_flashcards_type` on `question_type`
- `idx_flashcards_order` on (`note_id`, `order_index`)

---

## 7. Analytics Table

Stores aggregated metrics for each note.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique analytics identifier |
| `note_id` | UUID | FOREIGN KEY → Notes(id), UNIQUE, NOT NULL | Related note |
| `total_views` | INTEGER | NOT NULL, DEFAULT 0 | Total view count |
| `unique_views` | INTEGER | NOT NULL, DEFAULT 0 | Unique viewer count |
| `total_likes` | INTEGER | NOT NULL, DEFAULT 0 | Total likes |
| `total_bookmarks` | INTEGER | NOT NULL, DEFAULT 0 | Total bookmarks |
| `total_purchases` | INTEGER | NOT NULL, DEFAULT 0 | Total purchases |
| `total_revenue` | DECIMAL(10,2) | NOT NULL, DEFAULT 0.00 | Total revenue generated |
| `average_rating` | DECIMAL(3,2) | NULL | Average rating (1-5) |
| `total_comments` | INTEGER | NOT NULL, DEFAULT 0 | Total comments |
| `last_updated` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_analytics_note` on `note_id` (UNIQUE)
- `idx_analytics_views` on `total_views`
- `idx_analytics_purchases` on `total_purchases`

---

## 8. Note Views Table (for tracking individual views)

Tracks individual note views for analytics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique view identifier |
| `user_id` | UUID | FOREIGN KEY → Users(id), NULL | Viewer (NULL for guests) |
| `note_id` | UUID | FOREIGN KEY → Notes(id), NOT NULL | Viewed note |
| `date` | TIMESTAMP | NOT NULL, DEFAULT NOW() | View timestamp |
| `session_id` | VARCHAR(255) | NULL | Session identifier |

**Indexes:**
- `idx_note_views_note` on `note_id`
- `idx_note_views_user` on `user_id`
- `idx_note_views_date` on `date`

---

## 9. Likes Table

Stores user likes on notes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique like identifier |
| `user_id` | UUID | FOREIGN KEY → Users(id), NOT NULL | User who liked |
| `note_id` | UUID | FOREIGN KEY → Notes(id), NOT NULL | Liked note |
| `date` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Like timestamp |

**Indexes:**
- `idx_likes_user` on `user_id`
- `idx_likes_note` on `note_id`

**Unique Constraint:**
- `unique_user_note_like` on (`user_id`, `note_id`)

---

## Database Triggers

### 1. Update Analytics on Note View
```sql
CREATE OR REPLACE FUNCTION update_note_views()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO analytics (note_id, total_views, unique_views, last_updated)
    VALUES (NEW.note_id, 1, 1, NOW())
    ON CONFLICT (note_id) 
    DO UPDATE SET 
        total_views = analytics.total_views + 1,
        last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_note_views
AFTER INSERT ON note_views
FOR EACH ROW
EXECUTE FUNCTION update_note_views();
```

### 2. Update Analytics on Purchase
```sql
CREATE OR REPLACE FUNCTION update_note_purchases()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        UPDATE analytics
        SET 
            total_purchases = total_purchases + 1,
            total_revenue = total_revenue + NEW.amount,
            last_updated = NOW()
        WHERE note_id = NEW.note_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_note_purchases
AFTER INSERT OR UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_note_purchases();
```

### 3. Update Average Rating on Comment
```sql
CREATE OR REPLACE FUNCTION update_average_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE analytics
    SET 
        average_rating = (
            SELECT AVG(rating)
            FROM comments
            WHERE note_id = NEW.note_id AND rating IS NOT NULL AND is_deleted = FALSE
        ),
        total_comments = (
            SELECT COUNT(*)
            FROM comments
            WHERE note_id = NEW.note_id AND is_deleted = FALSE
        ),
        last_updated = NOW()
    WHERE note_id = NEW.note_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_average_rating
AFTER INSERT OR UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_average_rating();
```

---

## Sample Queries

### Get all notes by a creator with analytics
```sql
SELECT 
    n.*,
    a.total_views,
    a.total_purchases,
    a.total_revenue,
    a.average_rating
FROM notes n
LEFT JOIN analytics a ON n.id = a.note_id
WHERE n.creator_id = 'creator-uuid'
ORDER BY n.date_uploaded DESC;
```

### Get user's purchased notes
```sql
SELECT n.*
FROM notes n
INNER JOIN payments p ON n.id = p.note_id
WHERE p.user_id = 'user-uuid' AND p.status = 'completed';
```

### Get trending notes (most viewed in last 7 days)
```sql
SELECT 
    n.*,
    COUNT(nv.id) as recent_views
FROM notes n
INNER JOIN note_views nv ON n.id = nv.note_id
WHERE nv.date >= NOW() - INTERVAL '7 days'
GROUP BY n.id
ORDER BY recent_views DESC
LIMIT 10;
```

### Get note with full details
```sql
SELECT 
    n.*,
    u.name as creator_name,
    u.profile_picture as creator_avatar,
    a.total_views,
    a.average_rating,
    a.total_comments,
    a.total_purchases
FROM notes n
INNER JOIN users u ON n.creator_id = u.id
LEFT JOIN analytics a ON n.id = a.note_id
WHERE n.id = 'note-uuid';
```

---

## Migration Strategy

1. **Phase 1**: Core tables (Users, Notes)
2. **Phase 2**: Interaction tables (Comments, Bookmarks, Likes)
3. **Phase 3**: Monetization (Payments)
4. **Phase 4**: Learning features (Flashcards)
5. **Phase 5**: Analytics (Analytics, Note_Views)
6. **Phase 6**: Triggers and functions

---

## Security Considerations

1. **Password Storage**: Use bcrypt with minimum 10 rounds
2. **SQL Injection**: Use parameterized queries
3. **Soft Deletes**: Implement for Comments and Notes
4. **Payment Security**: Store minimal payment data, reference external transaction IDs
5. **Row-Level Security**: Implement RLS policies for multi-tenant security
6. **Audit Logs**: Consider adding audit tables for sensitive operations

---

## Performance Optimization

1. **Indexes**: Created on all foreign keys and frequently queried columns
2. **JSONB**: Used for flexible data structures with GIN indexes
3. **Materialized Views**: Consider for complex analytics queries
4. **Partitioning**: Consider table partitioning for Analytics and Note_Views as data grows
5. **Connection Pooling**: Use pgBouncer or similar for connection management
