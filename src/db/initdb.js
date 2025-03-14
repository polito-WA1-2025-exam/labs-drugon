// src/db/initDB.js
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

sqlite3.verbose();

// Connect to or create the database file
const db = new sqlite3.Database(join(__dirname, 'poke_shop.db'), (err) => {
  if (err) {
    console.error('Failed to open database:', err);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Create tables if they don't exist
db.serialize(() => {
  // Bowls table
  db.run(`
    CREATE TABLE IF NOT EXISTS bowls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      size TEXT NOT NULL,            -- 'R', 'M', 'L'
      base TEXT NOT NULL,            -- 'rice', 'black rice', 'salad'
      proteins TEXT,                 -- can store as comma-separated or JSON
      ingredients TEXT,              -- can store as comma-separated or JSON
      quantity INTEGER NOT NULL
    )
  `);

  // Orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      specialRequests TEXT           -- e.g., "No onion", "Allergic to peanuts"
      -- add more columns if needed
    )
  `);

  // (Optional) Additional tables, e.g. 'shops', 'users'
});

// Export the database object so other files can use it
export default db;
