/**
 * Database Migration Runner for NoteFlow
 * 
 * This script runs all SQL migration files in order to set up the database schema.
 * Usage: node run-migrations.js
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

// Database configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'noteflow',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
};

// Migration files directory
const migrationsDir = path.join(__dirname, 'migrations');

// Get all SQL files in order
function getMigrationFiles() {
  return fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql') && file.match(/^\d+_/))
    .sort();
}

// Run a single migration file
async function runMigration(client, filename) {
  const filePath = path.join(migrationsDir, filename);
  const sql = fs.readFileSync(filePath, 'utf8');
  
  console.log(`Running migration: ${filename}`);
  
  try {
    await client.query(sql);
    console.log(`✓ ${filename} completed successfully`);
    return true;
  } catch (error) {
    console.error(`✗ Error in ${filename}:`, error.message);
    throw error;
  }
}

// Main migration function
async function runAllMigrations() {
  const client = new Client(config);
  
  try {
    // Connect to database
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully\n');
    
    // Enable pgcrypto extension for UUID generation
    console.log('Enabling pgcrypto extension...');
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    console.log('✓ pgcrypto extension enabled\n');
    
    // Get migration files
    const migrationFiles = getMigrationFiles();
    console.log(`Found ${migrationFiles.length} migration files\n`);
    
    // Run migrations in order
    for (const file of migrationFiles) {
      await runMigration(client, file);
    }
    
    console.log('\n✓ All migrations completed successfully!');
    
    // Display table summary
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('\nCreated tables:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\nDatabase connection closed.');
  }
}

// Run migrations
if (require.main === module) {
  runAllMigrations()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { runAllMigrations };
