-- Migration: Create Analytics Table
-- Description: Stores aggregated metrics for each note

-- Create Analytics table
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID UNIQUE NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    total_views INTEGER NOT NULL DEFAULT 0,
    unique_views INTEGER NOT NULL DEFAULT 0,
    total_likes INTEGER NOT NULL DEFAULT 0,
    total_bookmarks INTEGER NOT NULL DEFAULT 0,
    total_purchases INTEGER NOT NULL DEFAULT 0,
    total_revenue DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    average_rating DECIMAL(3,2),
    total_comments INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE UNIQUE INDEX idx_analytics_note ON analytics(note_id);
CREATE INDEX idx_analytics_views ON analytics(total_views);
CREATE INDEX idx_analytics_purchases ON analytics(total_purchases);
CREATE INDEX idx_analytics_revenue ON analytics(total_revenue);
CREATE INDEX idx_analytics_rating ON analytics(average_rating);

-- Add comments
COMMENT ON TABLE analytics IS 'Stores aggregated metrics for each note';
COMMENT ON COLUMN analytics.unique_views IS 'Count of unique viewers (estimated)';
COMMENT ON COLUMN analytics.average_rating IS 'Average rating from 1.00 to 5.00';
