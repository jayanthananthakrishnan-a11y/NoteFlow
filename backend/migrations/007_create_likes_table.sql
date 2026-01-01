-- Migration: Create Likes Table
-- Description: Stores user likes on notes

-- Create Likes table
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    date TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_likes_user ON likes(user_id);
CREATE INDEX idx_likes_note ON likes(note_id);
CREATE INDEX idx_likes_date ON likes(date);

-- Add unique constraint to prevent duplicate likes
CREATE UNIQUE INDEX unique_user_note_like 
ON likes(user_id, note_id);

-- Add comments
COMMENT ON TABLE likes IS 'Stores user likes on notes';
