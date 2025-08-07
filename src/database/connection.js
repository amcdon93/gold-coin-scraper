import pg from 'pg';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db = null;
let dbType = null;

// Initialize database connection
export async function initDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (databaseUrl && databaseUrl.startsWith('postgres://')) {
    // PostgreSQL for Railway
    console.log('🔗 Connecting to PostgreSQL database...');
    dbType = 'postgres';
    
    const client = new pg.Client({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    try {
      await client.connect();
      console.log('✅ Connected to PostgreSQL database');
      
      // Create tables if they don't exist
      await createTables(client);
      
      db = client;
      return client;
    } catch (error) {
      console.error('❌ Error connecting to PostgreSQL:', error);
      throw error;
    }
  } else {
    // SQLite for local development
    console.log('🔗 Connecting to SQLite database...');
    dbType = 'sqlite';
    
    const dbPath = join(__dirname, '../../data', 'products.db');
    
    return new Promise((resolve, reject) => {
      db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('❌ Error connecting to SQLite:', err);
          reject(err);
        } else {
          console.log('✅ Connected to SQLite database');
          createTablesSQLite(db).then(() => resolve(db)).catch(reject);
        }
      });
    });
  }
}

// Create tables for PostgreSQL
async function createTables(client) {
  const createProductsTable = `
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      price VARCHAR(100),
      stock VARCHAR(100),
      url TEXT NOT NULL,
      vendor VARCHAR(100) NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      original_title VARCHAR(500),
      page_number INTEGER,
      error TEXT
    );
  `;
  
  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor);
    CREATE INDEX IF NOT EXISTS idx_products_timestamp ON products(timestamp);
    CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
  `;
  
  try {
    await client.query(createProductsTable);
    await client.query(createIndexes);
    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

// Create tables for SQLite
async function createTablesSQLite(db) {
  const createProductsTable = `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      price TEXT,
      stock TEXT,
      url TEXT NOT NULL,
      vendor TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      original_title TEXT,
      page_number INTEGER,
      error TEXT
    );
  `;
  
  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor);
    CREATE INDEX IF NOT EXISTS idx_products_timestamp ON products(timestamp);
    CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
  `;
  
  return new Promise((resolve, reject) => {
    db.run(createProductsTable, (err) => {
      if (err) {
        console.error('❌ Error creating products table:', err);
        reject(err);
        return;
      }
      
      db.run(createIndexes, (err) => {
        if (err) {
          console.error('❌ Error creating indexes:', err);
          reject(err);
          return;
        }
        
        console.log('✅ Database tables created successfully');
        resolve();
      });
    });
  });
}

// Get database instance
export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

// Get database type
export function getDatabaseType() {
  return dbType;
}

// Close database connection
export async function closeDatabase() {
  if (db) {
    if (dbType === 'postgres') {
      await db.end();
    } else {
      db.close();
    }
    console.log('🔌 Database connection closed');
  }
} 