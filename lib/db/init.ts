// Simple database initialization that creates tables from schema
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.DATABASE_URL || path.join(process.cwd(), 'tempo.db');

export function initializeDatabase() {
  const db = new Database(DB_PATH);
  
  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create tables if they don't exist
  db.exec(`
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

  console.log('Database initialized successfully');
  db.close();
}

// Call this at startup
if (require.main === module) {
  initializeDatabase();
}