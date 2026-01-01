-- Migration: Create Comments Table
-- Description: Stores user comments and ratings on notes

-- Create Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    date TIMESTAMP NOT NULL DEFAULT NOW(),
    edited_date TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create indexes
CREATE INDEX idx_comments_note ON comments(note_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_date ON comments(date);
CREATE INDEX idx_comments_rating ON comments(rating);
CREATE INDEX idx_comments_is_deleted ON comments(is_deleted);

-- Add comments
COMMENT ON TABLE comments IS 'Stores user comments and ratings on notes';
COMMENT ON COLUMN comments.rating IS 'Optional rating from 1 to 5 stars';
COMMENT ON COLUMN comments.is_deleted IS 'Soft delete flag - true means comment is deleted';
