/**
 * Payment Model
 * Handles database operations for payment transactions using PostgreSQL
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
 * Payment Repository - handles all payment data operations
 */
export const PaymentRepository = {
  /**
   * Create a new payment transaction
   * @param {Object} paymentData - Payment data to create
   * @returns {Promise<Object>} Created payment
   */
  async create(paymentData) {
    const {
      user_id,
      note_id,
      amount,
      currency = 'USD',
      status = 'completed',
      payment_method = 'internal',
      transaction_id = null,
      metadata = null
    } = paymentData;

    const query = `
      INSERT INTO payments (
        user_id, note_id, amount, currency, status, 
        payment_method, transaction_id, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      user_id,
      note_id,
      amount,
      currency,
      status,
      payment_method,
      transaction_id,
      metadata ? JSON.stringify(metadata) : null
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  /**
   * Check if user has already purchased a note
   * @param {string} userId - User ID
   * @param {string} noteId - Note ID
   * @returns {Promise<boolean>} True if already purchased
   */
  async hasPurchased(userId, noteId) {
    const query = `
      SELECT id FROM payments
      WHERE user_id = $1 AND note_id = $2 AND status = 'completed'
      LIMIT 1
    `;

    try {
      const result = await pool.query(query, [userId, noteId]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking purchase status:', error);
      throw error;
    }
  },

  /**
   * Get all purchases by a user
   * @param {string} userId - User ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Array of purchases with note details
   */
  async findByUser(userId, filters = {}) {
    const query = `
      SELECT 
        p.*,
        n.title as note_title,
        n.subject as note_subject,
        n.thumbnail_url as note_thumbnail,
        n.content_type as note_content_type,
        u.name as creator_name
      FROM payments p
      INNER JOIN notes n ON p.note_id = n.id
      INNER JOIN users u ON n.creator_id = u.id
      WHERE p.user_id = $1 AND p.status = 'completed'
      ORDER BY p.date DESC
      LIMIT $2 OFFSET $3
    `;

    const limit = parseInt(filters.limit) || 20;
    const offset = parseInt(filters.offset) || 0;

    try {
      const result = await pool.query(query, [userId, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching user purchases:', error);
      throw error;
    }
  },

  /**
   * Get all earnings for a creator
   * @param {string} creatorId - Creator user ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Earnings data with transactions
   */
  async findEarningsByCreator(creatorId, filters = {}) {
    // Get total earnings
    const totalQuery = `
      SELECT 
        COUNT(*) as total_sales,
        COALESCE(SUM(p.amount), 0) as total_earnings,
        p.currency
      FROM payments p
      INNER JOIN notes n ON p.note_id = n.id
      WHERE n.creator_id = $1 AND p.status = 'completed'
      GROUP BY p.currency
    `;

    // Get recent transactions
    const transactionsQuery = `
      SELECT 
        p.id,
        p.amount,
        p.currency,
        p.date,
        p.status,
        n.id as note_id,
        n.title as note_title,
        u.name as buyer_name,
        u.email as buyer_email
      FROM payments p
      INNER JOIN notes n ON p.note_id = n.id
      INNER JOIN users u ON p.user_id = u.id
      WHERE n.creator_id = $1 AND p.status = 'completed'
      ORDER BY p.date DESC
      LIMIT $2 OFFSET $3
    `;

    const limit = parseInt(filters.limit) || 20;
    const offset = parseInt(filters.offset) || 0;

    try {
      const totalResult = await pool.query(totalQuery, [creatorId]);
      const transactionsResult = await pool.query(transactionsQuery, [creatorId, limit, offset]);

      const summary = totalResult.rows[0] || {
        total_sales: 0,
        total_earnings: 0,
        currency: 'USD'
      };

      return {
        summary: {
          totalSales: parseInt(summary.total_sales) || 0,
          totalEarnings: parseFloat(summary.total_earnings) || 0,
          currency: summary.currency || 'USD'
        },
        transactions: transactionsResult.rows
      };
    } catch (error) {
      console.error('Error fetching creator earnings:', error);
      throw error;
    }
  },

  /**
   * Get payment by ID
   * @param {string} id - Payment ID
   * @returns {Promise<Object>} Payment object
   */
  async findById(id) {
    const query = `
      SELECT 
        p.*,
        n.title as note_title,
        n.creator_id as note_creator_id
      FROM payments p
      INNER JOIN notes n ON p.note_id = n.id
      WHERE p.id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching payment by ID:', error);
      throw error;
    }
  },

  /**
   * Update payment status
   * @param {string} id - Payment ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated payment
   */
  async updateStatus(id, status) {
    const query = `
      UPDATE payments
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [status, id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },

  /**
   * Get earnings summary by time period
   * @param {string} creatorId - Creator user ID
   * @param {string} period - Time period (day, week, month, year)
   * @returns {Promise<Array>} Earnings data grouped by period
   */
  async getEarningsByPeriod(creatorId, period = 'month') {
    const dateFormat = {
      day: 'YYYY-MM-DD',
      week: 'YYYY-IW',
      month: 'YYYY-MM',
      year: 'YYYY'
    }[period] || 'YYYY-MM';

    const query = `
      SELECT 
        TO_CHAR(p.date, $2) as period,
        COUNT(*) as sales_count,
        SUM(p.amount) as total_amount
      FROM payments p
      INNER JOIN notes n ON p.note_id = n.id
      WHERE n.creator_id = $1 AND p.status = 'completed'
      GROUP BY period
      ORDER BY period DESC
      LIMIT 12
    `;

    try {
      const result = await pool.query(query, [creatorId, dateFormat]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching earnings by period:', error);
      throw error;
    }
  }
};

export default PaymentRepository;
