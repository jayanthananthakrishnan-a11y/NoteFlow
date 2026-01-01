-- Migration: Create Database Triggers
-- Description: Automatic updates for analytics table

-- =============================================
-- Trigger 1: Update Analytics on Note View
-- =============================================

CREATE OR REPLACE FUNCTION update_note_views()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update analytics record
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

-- =============================================
-- Trigger 2: Update Analytics on Payment
-- =============================================

CREATE OR REPLACE FUNCTION update_note_purchases()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update analytics when payment is completed
    IF NEW.status = 'completed' THEN
        -- Check if this is a new completion (not an update of existing completed payment)
        IF (TG_OP = 'INSERT') OR (OLD.status != 'completed') THEN
            -- Ensure analytics record exists
            INSERT INTO analytics (note_id, total_purchases, total_revenue, last_updated)
            VALUES (NEW.note_id, 0, 0.00, NOW())
            ON CONFLICT (note_id) DO NOTHING;
            
            -- Update purchase count and revenue
            UPDATE analytics
            SET 
                total_purchases = total_purchases + 1,
                total_revenue = total_revenue + NEW.amount,
                last_updated = NOW()
            WHERE note_id = NEW.note_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_note_purchases
AFTER INSERT OR UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_note_purchases();

-- =============================================
-- Trigger 3: Update Analytics on Comment (Rating)
-- =============================================

CREATE OR REPLACE FUNCTION update_comment_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure analytics record exists
    INSERT INTO analytics (note_id, average_rating, total_comments, last_updated)
    VALUES (NEW.note_id, NULL, 0, NOW())
    ON CONFLICT (note_id) DO NOTHING;
    
    -- Update average rating and comment count
    UPDATE analytics
    SET 
        average_rating = (
            SELECT AVG(rating)::DECIMAL(3,2)
            FROM comments
            WHERE note_id = NEW.note_id 
            AND rating IS NOT NULL 
            AND is_deleted = FALSE
        ),
        total_comments = (
            SELECT COUNT(*)
            FROM comments
            WHERE note_id = NEW.note_id 
            AND is_deleted = FALSE
        ),
        last_updated = NOW()
    WHERE note_id = NEW.note_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_analytics
AFTER INSERT OR UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_comment_analytics();

-- =============================================
-- Trigger 4: Update Analytics on Like
-- =============================================

CREATE OR REPLACE FUNCTION update_like_count()
RETURNS TRIGGER AS $$
DECLARE
    note_id_var UUID;
    delta INTEGER;
BEGIN
    -- Determine the note_id and delta based on operation
    IF TG_OP = 'DELETE' THEN
        note_id_var := OLD.note_id;
        delta := -1;
    ELSE
        note_id_var := NEW.note_id;
        delta := 1;
    END IF;
    
    -- Ensure analytics record exists
    INSERT INTO analytics (note_id, total_likes, last_updated)
    VALUES (note_id_var, 0, NOW())
    ON CONFLICT (note_id) DO NOTHING;
    
    -- Update like count
    UPDATE analytics
    SET 
        total_likes = GREATEST(0, total_likes + delta),
        last_updated = NOW()
    WHERE note_id = note_id_var;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_like_count
AFTER INSERT OR DELETE ON likes
FOR EACH ROW
EXECUTE FUNCTION update_like_count();

-- =============================================
-- Trigger 5: Update Analytics on Bookmark
-- =============================================

CREATE OR REPLACE FUNCTION update_bookmark_count()
RETURNS TRIGGER AS $$
DECLARE
    note_id_var UUID;
    delta INTEGER;
BEGIN
    -- Determine the note_id and delta based on operation
    IF TG_OP = 'DELETE' THEN
        note_id_var := OLD.note_id;
        delta := -1;
    ELSE
        note_id_var := NEW.note_id;
        delta := 1;
    END IF;
    
    -- Ensure analytics record exists
    INSERT INTO analytics (note_id, total_bookmarks, last_updated)
    VALUES (note_id_var, 0, NOW())
    ON CONFLICT (note_id) DO NOTHING;
    
    -- Update bookmark count
    UPDATE analytics
    SET 
        total_bookmarks = GREATEST(0, total_bookmarks + delta),
        last_updated = NOW()
    WHERE note_id = note_id_var;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bookmark_count
AFTER INSERT OR DELETE ON bookmarks
FOR EACH ROW
EXECUTE FUNCTION update_bookmark_count();

-- =============================================
-- Trigger 6: Initialize Analytics on Note Creation
-- =============================================

CREATE OR REPLACE FUNCTION initialize_note_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Create analytics record for new note
    INSERT INTO analytics (
        note_id, 
        total_views, 
        unique_views, 
        total_likes, 
        total_bookmarks, 
        total_purchases, 
        total_revenue, 
        total_comments,
        last_updated
    )
    VALUES (
        NEW.id, 
        0, 
        0, 
        0, 
        0, 
        0, 
        0.00, 
        0,
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_initialize_note_analytics
AFTER INSERT ON notes
FOR EACH ROW
EXECUTE FUNCTION initialize_note_analytics();

-- Add comments
COMMENT ON FUNCTION update_note_views() IS 'Updates total_views in analytics when a note is viewed';
COMMENT ON FUNCTION update_note_purchases() IS 'Updates purchases and revenue in analytics when a payment is completed';
COMMENT ON FUNCTION update_comment_analytics() IS 'Updates average_rating and comment count in analytics';
COMMENT ON FUNCTION update_like_count() IS 'Updates total_likes in analytics when likes are added or removed';
COMMENT ON FUNCTION update_bookmark_count() IS 'Updates total_bookmarks in analytics when bookmarks are added or removed';
COMMENT ON FUNCTION initialize_note_analytics() IS 'Creates initial analytics record when a new note is created';
