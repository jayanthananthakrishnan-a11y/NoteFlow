-- Migration: Create Bookmarks Table
-- Description: Stores user bookmarks/favorites for notes

-- Create Bookmarks table
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    date TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_note ON bookmarks(note_id);
CREATE INDEX idx_bookmarks_date ON bookmarks(date);

-- Add unique constraint to prevent duplicate bookmarks
CREATE UNIQUE INDEX unique_user_note_bookmark 
ON bookmarks(user_id, note_id);

-- Add comments
COMMENT ON TABLE bookmarks IS 'Stores user bookmarks/favorites for notes';
