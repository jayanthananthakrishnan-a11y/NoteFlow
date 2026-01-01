# NoteFlow Database Entity-Relationship Diagram

## Visual ER Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            NoteFlow Database Schema                          │
└─────────────────────────────────────────────────────────────────────────────┘

                                    ┌─────────────┐
                                    │    USERS    │
                                    ├─────────────┤
                                    │ id (PK)     │
                                    │ name        │
                                    │ email       │
                                    │ password    │
                                    │ role        │
                                    │ profile_pic │
                                    │ bio         │
                                    │ date_created│
                                    └──────┬──────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    │ (creator_id)         │                      │
                    │                      │                      │
            ┌───────▼───────┐      ┌──────▼──────┐       ┌───────▼────────┐
            │     NOTES     │      │  PAYMENTS   │       │   COMMENTS     │
            ├───────────────┤      ├─────────────┤       ├────────────────┤
            │ id (PK)       │◄─────┤ id (PK)     │       │ id (PK)        │
            │ creator_id FK │      │ user_id FK  │       │ user_id FK     │
            │ title         │      │ note_id FK  │       │ note_id FK     │
            │ subject       │      │ amount      │       │ text           │
            │ topics        │      │ currency    │       │ rating         │
            │ description   │      │ status      │       │ date           │
            │ content_type  │      │ transaction │       │ edited_date    │
            │ content_urls  │      │ date        │       │ is_deleted     │
            │ free_topics   │      └─────────────┘       └────────────────┘
            │ paid_topics   │              │                      │
            │ price         │              │                      │
            │ date_uploaded │              │                      │
            └───────┬───────┘              │                      │
                    │                      │                      │
      ┌─────────────┼──────────────────────┼──────────────────────┤
      │             │                      │                      │
      │             │                      │                      │
┌─────▼──────┐ ┌───▼────────┐  ┌─────────▼─────┐  ┌─────────────▼────┐
│ FLASHCARDS │ │  BOOKMARKS │  │  NOTE_VIEWS   │  │      LIKES        │
├────────────┤ ├────────────┤  ├───────────────┤  ├──────────────────┤
│ id (PK)    │ │ id (PK)    │  │ id (PK)       │  │ id (PK)          │
│ note_id FK │ │ user_id FK │  │ user_id FK    │  │ user_id FK       │
│ question   │ │ note_id FK │  │ note_id FK    │  │ note_id FK       │
│ options    │ │ date       │  │ date          │  │ date             │
│ answer     │ └────────────┘  │ session_id    │  └──────────────────┘
│ type       │                 └───────────────┘
│ difficulty │                         │
│ explanation│                         │
│ order_index│                         │
└────────────┘                         │
                                       │
                              ┌────────▼──────────┐
                              │    ANALYTICS      │
                              ├───────────────────┤
                              │ id (PK)           │
                              │ note_id FK UNIQUE │
                              │ total_views       │
                              │ unique_views      │
                              │ total_likes       │
                              │ total_bookmarks   │
                              │ total_purchases   │
                              │ total_revenue     │
                              │ average_rating    │
                              │ total_comments    │
                              │ last_updated      │
                              └───────────────────┘
```

## Relationships

### One-to-Many Relationships

1. **USERS → NOTES** (1:N)
   - One user (Creator) can create many notes
   - FK: `notes.creator_id` → `users.id`
   - ON DELETE: CASCADE

2. **USERS → PAYMENTS** (1:N)
   - One user can make many payments
   - FK: `payments.user_id` → `users.id`
   - ON DELETE: CASCADE

3. **USERS → COMMENTS** (1:N)
   - One user can make many comments
   - FK: `comments.user_id` → `users.id`
   - ON DELETE: CASCADE

4. **USERS → BOOKMARKS** (1:N)
   - One user can bookmark many notes
   - FK: `bookmarks.user_id` → `users.id`
   - ON DELETE: CASCADE

5. **USERS → LIKES** (1:N)
   - One user can like many notes
   - FK: `likes.user_id` → `users.id`
   - ON DELETE: CASCADE

6. **USERS → NOTE_VIEWS** (1:N)
   - One user can view many notes
   - FK: `note_views.user_id` → `users.id`
   - ON DELETE: SET NULL (preserve view history)

7. **NOTES → PAYMENTS** (1:N)
   - One note can have many payments
   - FK: `payments.note_id` → `notes.id`
   - ON DELETE: CASCADE

8. **NOTES → COMMENTS** (1:N)
   - One note can have many comments
   - FK: `comments.note_id` → `notes.id`
   - ON DELETE: CASCADE

9. **NOTES → BOOKMARKS** (1:N)
   - One note can be bookmarked many times
   - FK: `bookmarks.note_id` → `notes.id`
   - ON DELETE: CASCADE

10. **NOTES → FLASHCARDS** (1:N)
    - One note can have many flashcards
    - FK: `flashcards.note_id` → `notes.id`
    - ON DELETE: CASCADE

11. **NOTES → LIKES** (1:N)
    - One note can be liked many times
    - FK: `likes.note_id` → `notes.id`
    - ON DELETE: CASCADE

12. **NOTES → NOTE_VIEWS** (1:N)
    - One note can have many views
    - FK: `note_views.note_id` → `notes.id`
    - ON DELETE: CASCADE

### One-to-One Relationships

1. **NOTES → ANALYTICS** (1:1)
   - Each note has one analytics record
   - FK: `analytics.note_id` → `notes.id` (UNIQUE)
   - ON DELETE: CASCADE
   - Auto-created via trigger when note is created

## Unique Constraints

1. **users.email** - Ensures unique email addresses
2. **payments(user_id, note_id)** WHERE status='completed' - Prevents duplicate purchases
3. **bookmarks(user_id, note_id)** - Prevents duplicate bookmarks
4. **likes(user_id, note_id)** - Prevents duplicate likes
5. **analytics.note_id** - Ensures one analytics record per note

## Indexes

### Users Table
- `idx_users_email` on `email` (for login queries)
- `idx_users_role` on `role` (for filtering creators/viewers)

### Notes Table
- `idx_notes_creator` on `creator_id` (for creator's notes)
- `idx_notes_subject` on `subject` (for subject filtering)
- `idx_notes_date_uploaded` on `date_uploaded` (for sorting)
- `idx_notes_price` on `price` (for price filtering)
- `idx_notes_topics` (GIN) on `topics` (for JSONB queries)

### Payments Table
- `idx_payments_user` on `user_id` (for user's purchases)
- `idx_payments_note` on `note_id` (for note's sales)
- `idx_payments_status` on `status` (for status filtering)
- `idx_payments_date` on `date` (for date range queries)

### Comments Table
- `idx_comments_note` on `note_id` (for note's comments)
- `idx_comments_user` on `user_id` (for user's comments)
- `idx_comments_rating` on `rating` (for rating queries)

### Bookmarks, Likes, Note_Views Tables
- Similar indexing pattern for efficient lookups

### Analytics Table
- `idx_analytics_note` (UNIQUE) on `note_id`
- `idx_analytics_views` on `total_views` (for trending)
- `idx_analytics_purchases` on `total_purchases` (for best sellers)

## Data Types

### PostgreSQL-Specific Types

1. **UUID** - Universally unique identifiers for all primary keys
2. **JSONB** - JSON data with indexing support (topics, options, metadata)
3. **ENUM** - Custom enumerated types:
   - `user_role`: 'Creator', 'Viewer'
   - `content_type`: 'pdf', 'image', 'mixed'
   - `payment_status`: 'pending', 'completed', 'failed', 'refunded'
   - `question_type`: 'flashcard', 'mcq', 'true_false'
   - `difficulty_level`: 'easy', 'medium', 'hard'
4. **DECIMAL(10,2)** - Monetary values (prices, revenue)
5. **TIMESTAMP** - Date and time with timezone support
6. **TEXT** - Unlimited length text (descriptions, comments)
7. **VARCHAR(N)** - Variable length strings with max length

## Triggers and Automation

All triggers automatically maintain the `analytics` table:

1. **trigger_initialize_note_analytics** - Creates analytics record on note creation
2. **trigger_update_note_views** - Increments view count on new view
3. **trigger_update_note_purchases** - Updates purchases and revenue on payment completion
4. **trigger_update_comment_analytics** - Recalculates average rating and comment count
5. **trigger_update_like_count** - Updates like count on like add/remove
6. **trigger_update_bookmark_count** - Updates bookmark count on bookmark add/remove

## Data Integrity

### Referential Integrity
- All foreign keys enforce referential integrity
- Cascade deletes where appropriate
- Prevents orphaned records

### Business Logic Constraints
- Email must be unique
- Ratings must be 1-5
- Prices must be non-negative
- One completed purchase per user per note
- One bookmark per user per note
- One like per user per note

### Data Validation
- NOT NULL constraints on required fields
- CHECK constraints on rating values
- UNIQUE constraints prevent duplicates
- ENUM types ensure valid values
