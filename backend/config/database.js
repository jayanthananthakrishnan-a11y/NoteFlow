/**
 * Database Configuration for NoteFlow
 * PostgreSQL connection setup using pg library
 */

const { Pool } = require('pg');
require('dotenv').config();

// Database configuration from environment variables
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'noteflow',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  
  // Connection pool settings
  min: parseInt(process.env.DB_POOL_MIN) || 2,
  max: parseInt(process.env.DB_POOL_MAX) || 10,
  
  // Connection timeout
  connectionTimeoutMillis: 5000,
  
  // Idle timeout
  idleTimeoutMillis: 30000,
};

// Create connection pool
const pool = new Pool(config);

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test database connection
pool.on('connect', () => {
  console.log('Database connected successfully');
});

/**
 * Execute a query with parameters
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log query in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 * @returns {Promise} Database client
 */
const getClient = async () => {
  const client = await pool.connect();
  
  const query = client.query.bind(client);
  const release = client.release.bind(client);
  
  // Set a timeout for client checkout
  const timeout = setTimeout(() => {
    console.error('Client has been checked out for more than 5 seconds!');
  }, 5000);
  
  // Override release to clear timeout
  client.release = () => {
    clearTimeout(timeout);
    return release();
  };
  
  return client;
};

/**
 * Execute multiple queries in a transaction
 * @param {Function} callback - Function containing transaction logic
 * @returns {Promise} Transaction result
 */
const transaction = async (callback) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Close all database connections
 */
const close = async () => {
  await pool.end();
  console.log('Database pool closed');
};

module.exports = {
  pool,
  query,
  getClient,
  transaction,
  close,
};
