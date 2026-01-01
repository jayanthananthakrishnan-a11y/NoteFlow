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

class Comment {
  /**
   * Add a new comment to a note
   * @param {string} userId - The ID of the user
   * @param {string} noteId - The ID of the note
   * @param {string} text - The comment text
   * @param {number|null} rating - Optional rating (1-5)
   * @returns {Promise<Object>} The created comment
   */
  static async create(userId, noteId, text, rating = null) {
    const query = `
      INSERT INTO comments (user_id, note_id, text, rating)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [userId, noteId, text, rating]);
    return result.rows[0];
  }

  /**
   * Get all comments for a note with pagination
   * @param {string} noteId - The ID of the note
   * @param {number} limit - Number of comments per page
   * @param {number} offset - Number of comments to skip
   * @returns {Promise<Object>} Comments and total count
   */
  static async getByNoteId(noteId, limit = 10, offset = 0) {
    // Get comments with user information
    const commentsQuery = `
      SELECT 
        c.id,
        c.text,
        c.rating,
        c.date,
        c.edited_date,
        u.id as user_id,
        u.username,
        u.name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.note_id = $1 AND c.is_deleted = false
      ORDER BY c.date DESC
      LIMIT $2 OFFSET $3
    `;
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM comments
      WHERE note_id = $1 AND is_deleted = false
    `;

    const [commentsResult, countResult] = await Promise.all([
      pool.query(commentsQuery, [noteId, limit, offset]),
      pool.query(countQuery, [noteId])
    ]);

    return {
      comments: commentsResult.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset
    };
  }

  /**
   * Get a comment by ID
   * @param {string} commentId - The ID of the comment
   * @returns {Promise<Object|null>} The comment or null
   */
  static async getById(commentId) {
    const query = `
      SELECT 
        c.*,
        u.username,
        u.name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = $1 AND c.is_deleted = false
    `;
    const result = await pool.query(query, [commentId]);
    return result.rows[0] || null;
  }

  /**
   * Update a comment
   * @param {string} commentId - The ID of the comment
   * @param {string} userId - The ID of the user (for authorization)
   * @param {string} text - The updated text
   * @param {number|null} rating - The updated rating
   * @returns {Promise<Object|null>} The updated comment or null
   */
  static async update(commentId, userId, text, rating = null) {
    const query = `
      UPDATE comments
      SET text = $1, rating = $2, edited_date = NOW()
      WHERE id = $3 AND user_id = $4 AND is_deleted = false
      RETURNING *
    `;
    const result = await pool.query(query, [text, rating, commentId, userId]);
    return result.rows[0] || null;
  }

  /**
   * Soft delete a comment
   * @param {string} commentId - The ID of the comment
   * @param {string} userId - The ID of the user (for authorization)
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  static async delete(commentId, userId) {
    const query = `
      UPDATE comments
      SET is_deleted = true
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;
    const result = await pool.query(query, [commentId, userId]);
    return result.rows.length > 0;
  }

  /**
   * Get average rating for a note
   * @param {string} noteId - The ID of the note
   * @returns {Promise<Object>} Average rating and count
   */
  static async getAverageRating(noteId) {
    const query = `
      SELECT 
        COALESCE(AVG(rating), 0) as average_rating,
        COUNT(rating) as rating_count
      FROM comments
      WHERE note_id = $1 AND rating IS NOT NULL AND is_deleted = false
    `;
    const result = await pool.query(query, [noteId]);
    return {
      averageRating: parseFloat(result.rows[0].average_rating).toFixed(1),
      ratingCount: parseInt(result.rows[0].rating_count)
    };
  }

  /**
   * Check if user has already commented on a note
   * @param {string} userId - The ID of the user
   * @param {string} noteId - The ID of the note
   * @returns {Promise<boolean>} True if user has commented
   */
  static async hasUserCommented(userId, noteId) {
    const query = `
      SELECT id FROM comments
      WHERE user_id = $1 AND note_id = $2 AND is_deleted = false
      LIMIT 1
    `;
    const result = await pool.query(query, [userId, noteId]);
    return result.rows.length > 0;
  }
}

export default Comment;
