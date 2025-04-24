// server/collections/BowlCollection.mjs
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import Bowl from '../models/Bowl.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

export default function BowlDAO() {
  let db = null;
  let bowlModel = null;

  // Get absolute path to the database file inside /server/db
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const dbPath = path.join(__dirname, '../db/poke_shop.db');

  // Initialize database connection
  const initializeDb = async () => {
    if (!db) {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      // Drop and recreate the bowls table
      await db.exec(`
          DROP TABLE IF EXISTS bowls;
          CREATE TABLE bowls (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              size TEXT NOT NULL,
              base TEXT NOT NULL,
              proteins TEXT NOT NULL,
              ingredients TEXT NOT NULL,
              quantity INTEGER NOT NULL,
              status TEXT DEFAULT 'available',
              createdAt TEXT NOT NULL
          )
      `);

      // Initialize bowl model with database connection
      bowlModel = new Bowl(db);
    }
    return db;
  };

  // Add a new bowl
  this.addBowl = async ({ size, base, proteins, ingredients, quantity }) => {
    try {
      const bowl = bowlModel.createBowl(size, base, proteins, ingredients, quantity);
      bowlModel.validateBowl(bowl);

      const db = await initializeDb();
      const result = await db.run(
        `INSERT INTO bowls (size, base, proteins, ingredients, quantity, createdAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          bowl.size,
          bowl.base,
          Array.isArray(bowl.proteins) ? bowl.proteins.join(',') : bowl.proteins,
          Array.isArray(bowl.ingredients) ? bowl.ingredients.join(',') : bowl.ingredients,
          bowl.quantity,
          new Date().toISOString()
        ]
      );

      const createdBowl = await db.get('SELECT * FROM bowls WHERE id = ?', result.lastID);
      
      return {
        success: true,
        message: 'Bowl added successfully',
        bowl: bowlModel.formatBowl(createdBowl)
      };
    } catch (error) {
      return {
        success: false,
        message: `Error adding bowl: ${error.message}`
      };
    }
  };

  // Get all bowls
  this.getAllBowls = async () => {
    const db = await initializeDb();
    const bowls = await db.all('SELECT * FROM bowls');
    return bowls.map(bowl => bowlModel.formatBowl(bowl));
  };

  // Get bowls by size
  this.getBowlsBySize = async (size) => {
    const db = await initializeDb();
    const bowls = await db.all('SELECT * FROM bowls WHERE size = ?', size);
    return bowls.map(bowl => bowlModel.formatBowl(bowl));
  };

  // Search bowls by ingredient
  this.searchBowlsByIngredient = async (ingredient) => {
    const db = await initializeDb();
    const bowls = await db.all(
      "SELECT * FROM bowls WHERE ingredients LIKE ?",
      [`%${ingredient}%`]
    );
    return bowls.map(bowl => bowlModel.formatBowl(bowl));
  };

  // Get bowls by protein
  this.getBowlsByProtein = async (protein) => {
    const db = await initializeDb();
    const bowls = await db.all(
      "SELECT * FROM bowls WHERE proteins LIKE ?",
      [`%${protein}%`]
    );
    return bowls.map(bowl => bowlModel.formatBowl(bowl));
  };

  // Update bowl quantity
  this.updateBowlQuantity = async (id, newQuantity) => {
    try {
      const db = await initializeDb();
      const result = await db.run(
        'UPDATE bowls SET quantity = ? WHERE id = ?',
        [newQuantity, id]
      );

      if (result.changes === 0) {
        return {
          success: false,
          message: `Bowl with ID ${id} not found`
        };
      }

      const updatedBowl = await db.get('SELECT * FROM bowls WHERE id = ?', id);
      return {
        success: true,
        message: 'Bowl quantity updated successfully',
        bowl: bowlModel.formatBowl(updatedBowl)
      };
    } catch (error) {
      return {
        success: false,
        message: `Error updating bowl: ${error.message}`
      };
    }
  };

  // Update all bowls of a specific size
  this.updateAllBowlsOfSize = async (size, updates) => {
    try {
      const db = await initializeDb();
      const result = await db.run(
        'UPDATE bowls SET quantity = ? WHERE size = ?',
        [updates.quantity, size]
      );

      const updatedBowls = await db.all('SELECT * FROM bowls WHERE size = ?', size);
      return {
        success: true,
        message: `Updated ${result.changes} bowls of size ${size}`,
        bowls: updatedBowls.map(bowl => bowlModel.formatBowl(bowl))
      };
    } catch (error) {
      return {
        success: false,
        message: `Error updating bowls: ${error.message}`
      };
    }
  };

  // Remove a bowl
  this.removeBowl = async (id) => {
    try {
      const db = await initializeDb();
      const result = await db.run('DELETE FROM bowls WHERE id = ?', id);

      if (result.changes === 0) {
        return {
          success: false,
          message: `Bowl with ID ${id} not found`
        };
      }

      return {
        success: true,
        message: 'Bowl removed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: `Error removing bowl: ${error.message}`
      };
    }
  };

  // Clear all bowls (useful for testing)
  this.clearBowls = async () => {
    try {
      const db = await initializeDb();
      await db.run('DELETE FROM bowls');
      await db.run('DELETE FROM sqlite_sequence WHERE name = "bowls"'); // Reset autoincrement
      
      return {
        success: true,
        message: 'All bowls cleared'
      };
    } catch (error) {
      return {
        success: false,
        message: `Error clearing bowls: ${error.message}`
      };
    }
  };

  // Get remaining count per size
  this.getAvailability = async () => {
    await initializeDb(); // Ensure database is initialized
    return await bowlModel.getAvailability();
  };
}