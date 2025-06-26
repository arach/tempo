import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

// Database file path
const DB_PATH = process.env.DATABASE_URL || path.join(process.cwd(), 'tempo.db');

// Create SQLite database instance
const sqlite = new Database(DB_PATH);

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

// Create Drizzle instance
export const db = drizzle(sqlite, { schema });

// Simple database initialization
export function initializeDatabase() {
  try {
    // Create tables if they don't exist
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('enrichment', 'connection', 'growth', 'creative')),
        description TEXT,
        duration TEXT,
        color TEXT,
        date TEXT NOT NULL,
        position INTEGER DEFAULT 0,
        metadata TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS day_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        tags TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS template_activities (
        id TEXT PRIMARY KEY,
        template_id TEXT NOT NULL,
        title TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('enrichment', 'connection', 'growth', 'creative')),
        description TEXT,
        duration TEXT,
        color TEXT,
        position INTEGER DEFAULT 0,
        metadata TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (template_id) REFERENCES day_templates (id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);
      CREATE INDEX IF NOT EXISTS idx_activities_position ON activities(date, position);
      CREATE INDEX IF NOT EXISTS idx_template_activities_template_id ON template_activities(template_id);
      CREATE INDEX IF NOT EXISTS idx_template_activities_position ON template_activities(template_id, position);
    `);

    // Add completion columns if they don't exist (migration)
    try {
      sqlite.exec(`
        ALTER TABLE activities ADD COLUMN completed INTEGER DEFAULT 0 NOT NULL;
      `);
    } catch (error) {
      // Column already exists, which is fine
    }

    try {
      sqlite.exec(`
        ALTER TABLE activities ADD COLUMN completed_at TEXT;
      `);
    } catch (error) {
      // Column already exists, which is fine
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Close database connection
export function closeDatabase() {
  sqlite.close();
}

// Helper to ensure database is initialized
let isInitialized = false;

export function ensureDatabaseInitialized() {
  if (!isInitialized) {
    initializeDatabase();
    isInitialized = true;
  }
  return db;
}