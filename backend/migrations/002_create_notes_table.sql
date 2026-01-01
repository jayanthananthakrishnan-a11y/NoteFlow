-- Migration: Create Notes Table
-- Description: Stores educational content uploaded by creators

-- Create ENUM type for content type
CREATE TYPE content_type AS ENUM ('pdf', 'image', 'mixed');

-- Create Notes table
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

-- Create indexes
CREATE INDEX idx_notes_creator ON notes(creator_id);
CREATE INDEX idx_notes_subject ON notes(subject);
CREATE INDEX idx_notes_date_uploaded ON notes(date_uploaded);
CREATE INDEX idx_notes_price ON notes(price);
CREATE INDEX idx_notes_is_published ON notes(is_published);

-- Add GIN indexes for JSONB columns (for better query performance)
CREATE INDEX idx_notes_topics ON notes USING GIN(topics);
CREATE INDEX idx_notes_free_topics ON notes USING GIN(free_topics);
CREATE INDEX idx_notes_paid_topics ON notes USING GIN(paid_topics);

-- Add comments
COMMENT ON TABLE notes IS 'Stores educational content uploaded by creators';
COMMENT ON COLUMN notes.topics IS 'Array of topics covered in JSON format';
COMMENT ON COLUMN notes.content_urls IS 'Array of URLs to content files (PDFs, images) in JSON format';
