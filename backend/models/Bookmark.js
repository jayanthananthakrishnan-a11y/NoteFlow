import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'noteflow',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  min: parseInt(process.env.DB_POOL_MIN) || 2,
  max: parseInt(process.env.DB_POOL_MAX) || 10,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

class Bookmark {
  /**
   * Toggle bookmark on a note (add if doesn't exist, remove if exists)
   * @param {string} userId - The ID of the user
   * @param {string} noteId - The ID of the note
   * @returns {Promise<Object>} Result with action and bookmark status
   */
  static async toggle(userId, noteId) {
    // Check if bookmark exists
    const checkQuery = `
      SELECT id FROM bookmarks
      WHERE user_id = $1 AND note_id = $2
    `;
    const checkResult = await pool.query(checkQuery, [userId, noteId]);

    let action;
    let bookmark = null;

    if (checkResult.rows.length > 0) {
      // Remove bookmark
      const deleteQuery = `
        DELETE FROM bookmarks
        WHERE user_id = $1 AND note_id = $2
        RETURNING id
      `;
      await pool.query(deleteQuery, [userId, noteId]);
      action = 'removed';
    } else {
      // Add bookmark
      const insertQuery = `
        INSERT INTO bookmarks (user_id, note_id)
        VALUES ($1, $2)
        RETURNING *
      `;
      const result = await pool.query(insertQuery, [userId, noteId]);
      bookmark = result.rows[0];
      action = 'added';
    }

    return {
      action,
      isBookmarked: action === 'added',
      bookmark
    };
  }

  /**
   * Add a bookmark
   * @param {string} userId - The ID of the user
   * @param {string} noteId - The ID of the note
   * @returns {Promise<Object>} The created bookmark
   */
  static async create(userId, noteId) {
    const query = `
      INSERT INTO bookmarks (user_id, note_id)
      VALUES ($1, $2)
      ON CONFLICT ON CONSTRAINT unique_user_note_bookmark DO NOTHING
      RETURNING *
    `;
    const result = await pool.query(query, [userId, noteId]);
    return result.rows[0] || null;
  }

  /**
   * Remove a bookmark
   * @param {string} userId - The ID of the user
   * @param {string} noteId - The ID of the note
   * @returns {Promise<boolean>} True if removed, false otherwise
   */
  static async remove(userId, noteId) {
    const query = `
      DELETE FROM bookmarks
      WHERE user_id = $1 AND note_id = $2
      RETURNING id
    `;
    const result = await pool.query(query, [userId, noteId]);
    return result.rows.length > 0;
  }

  /**
   * Check if user has bookmarked a note
   * @param {string} userId - The ID of the user
   * @param {string} noteId - The ID of the note
   * @returns {Promise<boolean>} True if user has bookmarked the note
   */
  static async hasUserBookmarked(userId, noteId) {
    const query = `
      SELECT id FROM bookmarks
      WHERE user_id = $1 AND note_id = $2
      LIMIT 1
    `;
    const result = await pool.query(query, [userId, noteId]);
    return result.rows.length > 0;
  }

  /**
   * Get all bookmarked notes for a user with pagination
   * @param {string} userId - The ID of the user
   * @param {number} limit - Number of bookmarks per page
   * @param {number} offset - Number of bookmarks to skip
   * @returns {Promise<Object>} Bookmarked notes and total count
   */
  static async getByUserId(userId, limit = 20, offset = 0) {
    const notesQuery = `
      SELECT 
        n.*,
        b.date as bookmarked_date,
        u.username as creator_username,
        u.name as creator_name,
        (SELECT COUNT(*) FROM likes WHERE note_id = n.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE note_id = n.id AND is_deleted = false) as comment_count
      FROM bookmarks b
      JOIN notes n ON b.note_id = n.id
      JOIN users u ON n.created_by = u.id
      WHERE b.user_id = $1
      ORDER BY b.date DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM bookmarks
      WHERE user_id = $1
    `;

    const [notesResult, countResult] = await Promise.all([
      pool.query(notesQuery, [userId, limit, offset]),
      pool.query(countQuery, [userId])
    ]);

    return {
      notes: notesResult.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset
    };
  }

  /**
   * Get bookmark count for a note
   * @param {string} noteId - The ID of the note
   * @returns {Promise<number>} Total number of bookmarks
   */
  static async getCount(noteId) {
    const query = `
      SELECT COUNT(*) as count
      FROM bookmarks
      WHERE note_id = $1
    `;
    const result = await pool.query(query, [noteId]);
    return parseInt(result.rows[0].count);
  }

  /**
   * Get all bookmarks for a note with user information
   * @param {string} noteId - The ID of the note
   * @param {number} limit - Number of bookmarks per page
   * @param {number} offset - Number of bookmarks to skip
   * @returns {Promise<Object>} Bookmarks and total count
   */
  static async getByNoteId(noteId, limit = 50, offset = 0) {
    const bookmarksQuery = `
      SELECT 
        b.id,
        b.date,
        u.id as user_id,
        u.username,
        u.name
      FROM bookmarks b
      JOIN users u ON b.user_id = u.id
      WHERE b.note_id = $1
      ORDER BY b.date DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM bookmarks
      WHERE note_id = $1
    `;

    const [bookmarksResult, countResult] = await Promise.all([
      pool.query(bookmarksQuery, [noteId, limit, offset]),
      pool.query(countQuery, [noteId])
    ]);

    return {
      bookmarks: bookmarksResult.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset
    };
  }

  /**
   * Get bookmark statistics for a user
   * @param {string} userId - The ID of the user
   * @returns {Promise<Object>} Bookmark statistics
   */
  static async getUserStats(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_bookmarks,
        COUNT(DISTINCT n.subject) as subjects_count,
        COUNT(DISTINCT n.created_by) as creators_count
      FROM bookmarks b
      JOIN notes n ON b.note_id = n.id
      WHERE b.user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return {
      totalBookmarks: parseInt(result.rows[0].total_bookmarks),
      subjectsCount: parseInt(result.rows[0].subjects_count),
      creatorsCount: parseInt(result.rows[0].creators_count)
    };
  }
}

export default Bookmark;
