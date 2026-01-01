/**
 * Note Model
 * Handles database operations for notes using PostgreSQL
 */

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

/**
 * Note Repository - handles all note data operations
 */
export const NoteRepository = {
  /**
   * Create a new note
   * @param {Object} noteData - Note data to create
   * @returns {Promise<Object>} Created note
   */
  async create(noteData) {
    const {
      creator_id,
      title,
      subject,
      topics,
      description,
      content_type,
      content_urls,
      thumbnail_url,
      free_topics,
      paid_topics,
      price,
      is_published = true
    } = noteData;

    const query = `
      INSERT INTO notes (
        creator_id, title, subject, topics, description, 
        content_type, content_urls, thumbnail_url, 
        free_topics, paid_topics, price, is_published
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      creator_id,
      title,
      subject,
      JSON.stringify(topics),
      description,
      content_type,
      JSON.stringify(content_urls),
      thumbnail_url,
      free_topics ? JSON.stringify(free_topics) : null,
      paid_topics ? JSON.stringify(paid_topics) : null,
      price || 0.00,
      is_published
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  },

  /**
   * Find all notes with optional filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Array of notes
   */
  async findAll(filters = {}) {
    let query = `
      SELECT
        n.*,
        u.name as creator_name,
        u.email as creator_email,
        u.role as creator_type
      FROM notes n
      LEFT JOIN users u ON n.creator_id = u.id
      WHERE n.is_published = true
    `;
    
    const values = [];
    let valueIndex = 1;

    // Filter by subject
    if (filters.subject) {
      query += ` AND LOWER(n.subject) = LOWER($${valueIndex})`;
      values.push(filters.subject);
      valueIndex++;
    }

    // Filter by creator_id
    if (filters.creator_id) {
      query += ` AND n.creator_id = $${valueIndex}`;
      values.push(filters.creator_id);
      valueIndex++;
    }

    // Search in title or description
    if (filters.search) {
      query += ` AND (
        LOWER(n.title) LIKE LOWER($${valueIndex}) OR 
        LOWER(n.description) LIKE LOWER($${valueIndex})
      )`;
      values.push(`%${filters.search}%`);
      valueIndex++;
    }

    // Filter by price (free or paid)
    if (filters.price_filter === 'free') {
      query += ` AND n.price = 0`;
    } else if (filters.price_filter === 'paid') {
      query += ` AND n.price > 0`;
    }

    // Sorting
    const sortBy = filters.sort_by || 'date_uploaded';
    const sortOrder = filters.sort_order === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY n.${sortBy} ${sortOrder}`;

    // Pagination
    const limit = parseInt(filters.limit) || 20;
    const offset = parseInt(filters.offset) || 0;
    query += ` LIMIT $${valueIndex} OFFSET $${valueIndex + 1}`;
    values.push(limit, offset);

    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  },

  /**
   * Find note by ID
   * @param {string} id - Note ID
   * @param {string} userId - User ID (to check if user has purchased)
   * @returns {Promise<Object>} Note object
   */
  async findById(id, userId = null) {
    const query = `
      SELECT
        n.*,
        u.name as creator_name,
        u.email as creator_email,
        u.role as creator_type,
        u.profile_picture as creator_profile_picture,
        CASE
          WHEN $2::uuid IS NOT NULL AND EXISTS (
            SELECT 1 FROM payments
            WHERE note_id = n.id
            AND user_id = $2::uuid
            AND payment_status = 'completed'
          ) THEN true
          ELSE false
        END as is_purchased,
        CASE
          WHEN $2::uuid IS NOT NULL AND n.creator_id = $2::uuid THEN true
          ELSE false
        END as is_owner
      FROM notes n
      LEFT JOIN users u ON n.creator_id = u.id
      WHERE n.id = $1 AND n.is_published = true
    `;

    try {
      const result = await pool.query(query, [id, userId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching note by ID:', error);
      throw error;
    }
  },

  /**
   * Update note
   * @param {string} id - Note ID
   * @param {string} creatorId - Creator ID (for authorization)
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated note
   */
  async update(id, creatorId, updates) {
    const allowedFields = [
      'title', 'subject', 'topics', 'description', 
      'content_type', 'content_urls', 'thumbnail_url',
      'free_topics', 'paid_topics', 'price', 'is_published'
    ];

    const updateFields = [];
    const values = [];
    let valueIndex = 1;

    // Build dynamic update query
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = $${valueIndex}`);
        
        // Convert arrays/objects to JSON for JSONB fields
        if (['topics', 'content_urls', 'free_topics', 'paid_topics'].includes(key)) {
          values.push(value ? JSON.stringify(value) : null);
        } else {
          values.push(value);
        }
        valueIndex++;
      }
    }

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    // Add date_modified
    updateFields.push(`date_modified = NOW()`);

    const query = `
      UPDATE notes
      SET ${updateFields.join(', ')}
      WHERE id = $${valueIndex} AND creator_id = $${valueIndex + 1}
      RETURNING *
    `;

    values.push(id, creatorId);

    try {
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  },

  /**
   * Delete note
   * @param {string} id - Note ID
   * @param {string} creatorId - Creator ID (for authorization)
   * @returns {Promise<boolean>} Success status
   */
  async delete(id, creatorId) {
    const query = `
      DELETE FROM notes
      WHERE id = $1 AND creator_id = $2
      RETURNING id
    `;

    try {
      const result = await pool.query(query, [id, creatorId]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  },

  /**
   * Get notes count by filters
   * @param {Object} filters - Filter options
   * @returns {Promise<number>} Total count
   */
  async count(filters = {}) {
    let query = `
      SELECT COUNT(*) as total
      FROM notes n
      WHERE n.is_published = true
    `;
    
    const values = [];
    let valueIndex = 1;

    if (filters.subject) {
      query += ` AND LOWER(n.subject) = LOWER($${valueIndex})`;
      values.push(filters.subject);
      valueIndex++;
    }

    if (filters.creator_id) {
      query += ` AND n.creator_id = $${valueIndex}`;
      values.push(filters.creator_id);
      valueIndex++;
    }

    if (filters.search) {
      query += ` AND (
        LOWER(n.title) LIKE LOWER($${valueIndex}) OR 
        LOWER(n.description) LIKE LOWER($${valueIndex})
      )`;
      values.push(`%${filters.search}%`);
      valueIndex++;
    }

    if (filters.price_filter === 'free') {
      query += ` AND n.price = 0`;
    } else if (filters.price_filter === 'paid') {
      query += ` AND n.price > 0`;
    }

    try {
      const result = await pool.query(query, values);
      return parseInt(result.rows[0].total);
    } catch (error) {
      console.error('Error counting notes:', error);
      throw error;
    }
  }
};

export default NoteRepository;
