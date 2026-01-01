# Database Migrations

This directory contains PostgreSQL migration files for the NoteFlow database schema.

## Migration Files

Execute migrations in the following order:

1. `001_create_users_table.sql` - Users table with authentication
2. `002_create_notes_table.sql` - Notes/content table
3. `003_create_payments_table.sql` - Payment transactions
4. `004_create_comments_table.sql` - Comments and ratings
5. `005_create_bookmarks_table.sql` - User bookmarks/favorites
6. `006_create_flashcards_table.sql` - Flashcards and quiz questions
7. `007_create_likes_table.sql` - Note likes
8. `008_create_note_views_table.sql` - View tracking
9. `009_create_analytics_table.sql` - Aggregated analytics
10. `010_create_triggers.sql` - Automatic analytics updates

## Prerequisites

- PostgreSQL 12 or higher
- Database created with UUID extension:
  ```sql
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";
  ```

## Running Migrations

### Option 1: Using psql (Command Line)

```bash
# Set your database connection details
export PGHOST=localhost
export PGPORT=5432
export PGDATABASE=noteflow
export PGUSER=your_username
export PGPASSWORD=your_password

# Run all migrations in order
for file in backend/migrations/*.sql; do
  echo "Running migration: $file"
  psql -f "$file"
done
```

### Option 2: Using psql with Single Command

```bash
psql -h localhost -U your_username -d noteflow -f backend/migrations/001_create_users_table.sql
psql -h localhost -U your_username -d noteflow -f backend/migrations/002_create_notes_table.sql
# ... continue for all files
```

### Option 3: Using Node.js (Recommended for Development)

```javascript
// See run-migrations.js in the backend directory
npm run migrate
```

### Option 4: Using a Migration Tool

For production environments, consider using:
- **node-pg-migrate**: PostgreSQL migration runner for Node.js
- **Flyway**: Database migration tool
- **Liquibase**: Database schema change management

## Rolling Back Migrations

To roll back migrations, you'll need to drop tables in reverse order:

```sql
DROP TRIGGER IF EXISTS trigger_initialize_note_analytics ON notes;
DROP TRIGGER IF EXISTS trigger_update_bookmark_count ON bookmarks;
DROP TRIGGER IF EXISTS trigger_update_like_count ON likes;
DROP TRIGGER IF EXISTS trigger_update_comment_analytics ON comments;
DROP TRIGGER IF EXISTS trigger_update_note_purchases ON payments;
DROP TRIGGER IF EXISTS trigger_update_note_views ON note_views;

DROP FUNCTION IF EXISTS initialize_note_analytics();
DROP FUNCTION IF EXISTS update_bookmark_count();
DROP FUNCTION IF EXISTS update_like_count();
DROP FUNCTION IF EXISTS update_comment_analytics();
DROP FUNCTION IF EXISTS update_note_purchases();
DROP FUNCTION IF EXISTS update_note_views();

DROP TABLE IF EXISTS analytics CASCADE;
DROP TABLE IF EXISTS note_views CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS flashcards CASCADE;
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS difficulty_level;
DROP TYPE IF EXISTS question_type;
DROP TYPE IF EXISTS payment_status;
DROP TYPE IF EXISTS content_type;
DROP TYPE IF EXISTS user_role;
```

## Verifying Migrations

After running migrations, verify the schema:

```sql
-- List all tables
\dt

-- Check table structure
\d users
\d notes
\d payments
\d comments
\d bookmarks
\d flashcards
\d likes
\d note_views
\d analytics

-- Check triggers
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- Check foreign keys
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

## Seeding Test Data

After migrations, you can seed the database with test data:

```bash
psql -h localhost -U your_username -d noteflow -f backend/migrations/seed_data.sql
```

## Environment Setup

Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=noteflow
DB_USER=your_username
DB_PASSWORD=your_password

# Connection Pool
DB_POOL_MIN=2
DB_POOL_MAX=10
```

## Troubleshooting

### Error: "extension 'pgcrypto' does not exist"

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Error: "permission denied"

Ensure your database user has sufficient privileges:

```sql
GRANT ALL PRIVILEGES ON DATABASE noteflow TO your_username;
```

### Error: "relation already exists"

Some tables may already exist. Drop them first or use migration versioning.

## Best Practices

1. **Version Control**: Keep all migration files in version control
2. **Sequential Naming**: Use numbered prefixes (001, 002, etc.)
3. **One-Way Migrations**: Create new migrations instead of editing existing ones
4. **Test First**: Test migrations on a development database before production
5. **Backup**: Always backup production database before running migrations
6. **Idempotency**: Make migrations idempotent where possible (use `IF NOT EXISTS`)

## Production Deployment

For production deployments:

1. Backup the database
2. Run migrations in a transaction
3. Test the application after migration
4. Have a rollback plan ready
5. Monitor for errors

```sql
BEGIN;
-- Run migration
\i backend/migrations/001_create_users_table.sql
-- Verify
SELECT COUNT(*) FROM users;
COMMIT;
-- Or ROLLBACK if there are issues
```
