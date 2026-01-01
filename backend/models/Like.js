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

class Like {
  /**
   * Toggle like on a note (add if doesn't exist, remove if exists)
   * @param {string} userId - The ID of the user
   * @param {string} noteId - The ID of the note
   * @returns {Promise<Object>} Result with action and like count
   */
  static async toggle(userId, noteId) {
    // Check if like exists
    const checkQuery = `
      SELECT id FROM likes
      WHERE user_id = $1 AND note_id = $2
    `;
    const checkResult = await pool.query(checkQuery, [userId, noteId]);

    let action;
    if (checkResult.rows.length > 0) {
      // Unlike: Remove the like
      const deleteQuery = `
        DELETE FROM likes
        WHERE user_id = $1 AND note_id = $2
        RETURNING id
      `;
      await pool.query(deleteQuery, [userId, noteId]);
      action = 'unliked';
    } else {
      // Like: Add the like
      const insertQuery = `
        INSERT INTO likes (user_id, note_id)
        VALUES ($1, $2)
        RETURNING *
      `;
      await pool.query(insertQuery, [userId, noteId]);
      action = 'liked';
    }

    // Get updated like count
    const likeCount = await this.getCount(noteId);

    return {
      action,
      likeCount,
      isLiked: action === 'liked'
    };
  }

  /**
   * Get total likes count for a note
   * @param {string} noteId - The ID of the note
   * @returns {Promise<number>} Total number of likes
   */
  static async getCount(noteId) {
    const query = `
      SELECT COUNT(*) as count
      FROM likes
      WHERE note_id = $1
    `;
    const result = await pool.query(query, [noteId]);
    return parseInt(result.rows[0].count);
  }

  /**
   * Check if user has liked a note
   * @param {string} userId - The ID of the user
   * @param {string} noteId - The ID of the note
   * @returns {Promise<boolean>} True if user has liked the note
   */
  static async hasUserLiked(userId, noteId) {
    const query = `
      SELECT id FROM likes
      WHERE user_id = $1 AND note_id = $2
      LIMIT 1
    `;
    const result = await pool.query(query, [userId, noteId]);
    return result.rows.length > 0;
  }

  /**
   * Get all likes for a note with user information
   * @param {string} noteId - The ID of the note
   * @param {number} limit - Number of likes per page
   * @param {number} offset - Number of likes to skip
   * @returns {Promise<Object>} Likes and total count
   */
  static async getByNoteId(noteId, limit = 50, offset = 0) {
    const likesQuery = `
      SELECT 
        l.id,
        l.date,
        u.id as user_id,
        u.username,
        u.name
      FROM likes l
      JOIN users u ON l.user_id = u.id
      WHERE l.note_id = $1
      ORDER BY l.date DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM likes
      WHERE note_id = $1
    `;

    const [likesResult, countResult] = await Promise.all([
      pool.query(likesQuery, [noteId, limit, offset]),
      pool.query(countQuery, [noteId])
    ]);

    return {
      likes: likesResult.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset
    };
  }

  /**
   * Get all notes liked by a user
   * @param {string} userId - The ID of the user
   * @param {number} limit - Number of notes per page
   * @param {number} offset - Number of notes to skip
   * @returns {Promise<Object>} Liked notes and total count
   */
  static async getLikedNotesByUser(userId, limit = 20, offset = 0) {
    const notesQuery = `
      SELECT 
        n.*,
        l.date as liked_date,
        u.username as creator_username,
        u.name as creator_name
      FROM likes l
      JOIN notes n ON l.note_id = n.id
      JOIN users u ON n.created_by = u.id
      WHERE l.user_id = $1
      ORDER BY l.date DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM likes
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
   * Remove a like
   * @param {string} userId - The ID of the user
   * @param {string} noteId - The ID of the note
   * @returns {Promise<boolean>} True if removed, false otherwise
   */
  static async remove(userId, noteId) {
    const query = `
      DELETE FROM likes
      WHERE user_id = $1 AND note_id = $2
      RETURNING id
    `;
    const result = await pool.query(query, [userId, noteId]);
    return result.rows.length > 0;
  }
}

export default Like;
