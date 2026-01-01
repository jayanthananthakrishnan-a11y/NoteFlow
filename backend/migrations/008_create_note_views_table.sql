-- Migration: Create Note Views Table
-- Description: Tracks individual note views for analytics

-- Create Note Views table
CREATE TABLE note_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    date TIMESTAMP NOT NULL DEFAULT NOW(),
    session_id VARCHAR(255)
);

-- Create indexes
CREATE INDEX idx_note_views_note ON note_views(note_id);
CREATE INDEX idx_note_views_user ON note_views(user_id);
CREATE INDEX idx_note_views_date ON note_views(date);
CREATE INDEX idx_note_views_session ON note_views(session_id);

-- Add comments
COMMENT ON TABLE note_views IS 'Tracks individual note views for analytics';
COMMENT ON COLUMN note_views.user_id IS 'Viewer ID (NULL for guest users)';
COMMENT ON COLUMN note_views.session_id IS 'Session identifier for tracking anonymous users';
