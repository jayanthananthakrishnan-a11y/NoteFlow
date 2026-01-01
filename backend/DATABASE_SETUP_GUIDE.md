# NoteFlow Database Setup Guide

This guide will walk you through setting up the PostgreSQL database for NoteFlow.

## 📋 Prerequisites

1. **PostgreSQL 12 or higher** installed
2. **Node.js 16 or higher** installed
3. **npm** package manager

## 🚀 Quick Start

### Step 1: Install PostgreSQL

#### Windows
Download from [PostgreSQL Official Site](https://www.postgresql.org/download/windows/)

#### macOS
```bash
brew install postgresql
brew services start postgresql
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Create Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE noteflow;

# Create user (optional)
CREATE USER noteflow_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE noteflow TO noteflow_user;

# Exit
\q
```

### Step 3: Configure Environment

Copy the example environment file:
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Client Configuration
CLIENT_URL=http://localhost:5173

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=noteflow
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_POOL_MIN=2
DB_POOL_MAX=10
```

### Step 4: Install Dependencies

```bash
cd backend
npm install
```

This will install:
- `pg` - PostgreSQL client for Node.js
- Other existing dependencies

### Step 5: Run Migrations

```bash
# Run all migrations
npm run migrate
```

This will:
1. Enable pgcrypto extension
2. Create all tables in order
3. Set up foreign keys and indexes
4. Create triggers for analytics
5. Display a summary of created tables

### Step 6: Seed Sample Data (Optional)

```bash
# For development/testing only
psql -h localhost -U postgres -d noteflow -f migrations/seed_data.sql
```

This creates:
- 6 sample users (3 creators, 3 viewers)
- 6 sample notes
- Sample payments, comments, bookmarks, likes, views
- Sample flashcards

## 📊 Database Schema

The database includes the following tables:

### Core Tables
- **users** - User accounts (creators and viewers)
- **notes** - Educational content
- **payments** - Payment transactions
- **comments** - User reviews and ratings
- **bookmarks** - Saved notes
- **flashcards** - Quiz questions and flashcards
- **likes** - Note likes
- **note_views** - View tracking
- **analytics** - Aggregated statistics

### Relationships
- Users create Notes (1:N)
- Users make Payments for Notes (N:M)
- Users comment on Notes (N:M)
- Users bookmark/like Notes (N:M)
- Notes have Flashcards (1:N)
- Notes have Analytics (1:1)

See [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md) for complete schema documentation.

See [`DATABASE_ER_DIAGRAM.md`](./DATABASE_ER_DIAGRAM.md) for visual ER diagram.

## 🔧 Verification

### Check Tables
```sql
psql -U postgres -d noteflow

-- List all tables
\dt

-- Check table structure
\d users
\d notes
\d payments

-- Exit
\q
```

### Test Connection from Node.js
```javascript
const db = require('./config/database');

// Test query
db.query('SELECT NOW()', [])
  .then(res => console.log('Database connected:', res.rows[0]))
  .catch(err => console.error('Database error:', err));
```

## 📁 File Structure

```
backend/
├── config/
│   └── database.js           # Database connection configuration
├── migrations/
│   ├── 001_create_users_table.sql
│   ├── 002_create_notes_table.sql
│   ├── 003_create_payments_table.sql
│   ├── 004_create_comments_table.sql
│   ├── 005_create_bookmarks_table.sql
│   ├── 006_create_flashcards_table.sql
│   ├── 007_create_likes_table.sql
│   ├── 008_create_note_views_table.sql
│   ├── 009_create_analytics_table.sql
│   ├── 010_create_triggers.sql
│   ├── seed_data.sql         # Sample data for testing
│   └── README.md             # Migration documentation
├── models/                   # Database models (to be created)
├── routes/                   # API routes (to be created)
├── run-migrations.js         # Migration runner script
├── DATABASE_SCHEMA.md        # Complete schema documentation
├── DATABASE_ER_DIAGRAM.md    # ER diagram documentation
├── DATABASE_SETUP_GUIDE.md   # This file
├── .env.example              # Environment template
└── package.json              # Dependencies and scripts
```

## 🛠️ Useful Commands

### Database Management

```bash
# Connect to database
psql -U postgres -d noteflow

# Backup database
pg_dump -U postgres noteflow > backup.sql

# Restore database
psql -U postgres noteflow < backup.sql

# Drop database (⚠️ careful!)
dropdb -U postgres noteflow
```

### Migration Commands

```bash
# Run migrations
npm run migrate

# Seed data
npm run seed

# Manual migration
psql -U postgres -d noteflow -f migrations/001_create_users_table.sql
```

### Development

```bash
# Start backend server
npm run dev

# Run with database logging
NODE_ENV=development npm run dev
```

## 🔐 Security Best Practices

1. **Never commit `.env` file** - Keep credentials secure
2. **Use strong passwords** - For database and JWT secrets
3. **Use environment variables** - Don't hardcode credentials
4. **Limit database permissions** - Use dedicated user for app
5. **Enable SSL in production** - Secure database connections
6. **Regular backups** - Prevent data loss
7. **Hash passwords** - Use bcrypt (already implemented)
8. **Validate input** - Prevent SQL injection

## 🐛 Troubleshooting

### Connection Refused
- Check PostgreSQL is running: `pg_isready`
- Check port: default is 5432
- Verify credentials in `.env`

### Permission Denied
```sql
-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE noteflow TO postgres;
```

### Extension Error
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Migration Fails
- Check PostgreSQL version (12+)
- Run migrations in order
- Check for existing tables: `\dt`
- Drop and recreate if needed

### Cannot Find Module 'pg'
```bash
# Install dependencies
npm install
```

## 📖 Next Steps

After database setup:

1. **Create Models** - Model classes for each table
2. **Create Controllers** - Business logic handlers
3. **Create Routes** - API endpoints
4. **Add Validation** - Input validation middleware
5. **Add Tests** - Unit and integration tests
6. **API Documentation** - Document all endpoints
7. **Deploy** - Deploy to production environment

## 🔗 Related Documentation

- [Database Schema](./DATABASE_SCHEMA.md) - Detailed table structures
- [ER Diagram](./DATABASE_ER_DIAGRAM.md) - Visual relationships
- [Migrations README](./migrations/README.md) - Migration instructions
- [PostgreSQL Docs](https://www.postgresql.org/docs/) - Official documentation

## 💡 Tips

1. **Use transactions** for multi-step operations
2. **Index frequently queried columns** (already done)
3. **Monitor query performance** with EXPLAIN
4. **Use connection pooling** (configured in database.js)
5. **Regular VACUUM and ANALYZE** for optimization
6. **Set up monitoring** with tools like pgAdmin or DataGrip

## 📞 Support

For issues:
1. Check PostgreSQL logs
2. Verify environment variables
3. Check network connectivity
4. Review error messages carefully
5. Consult PostgreSQL documentation

---

**Database setup complete!** 🎉 You're ready to build the NoteFlow API.
