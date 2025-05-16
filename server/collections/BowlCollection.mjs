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
      try {
        db = await open({
          filename: 'poke_shop.db',
          driver: sqlite3.Database,
          mode: sqlite3.OPEN_READWRITE
        });

        // Enable foreign keys
        await db.exec('PRAGMA foreign_keys = ON');
        
        // Create the bowls table if it doesn't exist
        await db.exec(`
            CREATE TABLE IF NOT EXISTS bowls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                size TEXT NOT NULL,
                base TEXT NOT NULL,
                proteins TEXT NOT NULL,
                ingredients TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                status TEXT DEFAULT 'available',
                orderId INTEGER,
                createdAt TEXT NOT NULL,
                updatedAt TEXT,
                FOREIGN KEY (orderId) REFERENCES orders(id)
            )
        `);

        // Initialize bowl model with database connection
        bowlModel = new Bowl(db);

        // Check if we need to initialize bowls
        const count = await db.get('SELECT COUNT(*) as count FROM bowls');
        if (count.count === 0) {
          console.log('Initializing bowls table...');
          // Initialize with daily limits
          const sizes = {
            R: { count: 10, base: 'rice', proteins: ['salmon'], ingredients: ['cucumber'] },
            M: { count: 8, base: 'rice', proteins: ['salmon'], ingredients: ['cucumber'] },
            L: { count: 6, base: 'rice', proteins: ['salmon'], ingredients: ['cucumber'] }
          };

          for (const [size, data] of Object.entries(sizes)) {
            await db.run(
              `INSERT INTO bowls (size, base, proteins, ingredients, quantity, status, orderId, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                size,
                data.base,
                data.proteins.join(','),
                data.ingredients.join(','),
                data.count,  // Set the quantity to the daily limit
                'available',
                null,
                new Date().toISOString(),
                new Date().toISOString()
              ]
            );
          }
          console.log('Bowls initialized successfully');
        }
      } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
      }
    }
    return db;
  };

  // Add a new bowl
  this.addBowl = async ({ size, base, proteins, ingredients, quantity, status = 'available', orderId = null, createdAt = new Date().toISOString() }) => {
    try {
      const db = await initializeDb();
      
      // Check daily limit before adding bowl
      const availability = await bowlModel.getAvailability();
      const currentCount = await db.get(
        `SELECT COUNT(*) as count FROM bowls 
         WHERE size = ? 
         AND status = 'ordered' 
         AND DATE(createdAt) = DATE('now')
         AND orderId IS NOT NULL`,
        [size]
      );

      if (currentCount.count + quantity > bowlModel.sizes[size].limit) {
        return {
          success: false,
          message: `Cannot add ${quantity} bowls of size ${size}. Daily limit is ${bowlModel.sizes[size].limit} and ${currentCount.count} have already been ordered today.`
        };
      }
      
      // Validate bowl data
      const bowl = bowlModel.createBowl(size, base, proteins, ingredients, quantity);
      bowlModel.validateBowl(bowl);

      // Insert the bowl
      const result = await db.run(
        `INSERT INTO bowls (size, base, proteins, ingredients, quantity, status, orderId, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          bowl.size,
          bowl.base,
          Array.isArray(bowl.proteins) ? bowl.proteins.join(',') : bowl.proteins,
          Array.isArray(bowl.ingredients) ? bowl.ingredients.join(',') : bowl.ingredients,
          bowl.quantity,
          status,
          orderId,
          createdAt,
          new Date().toISOString()
        ]
      );

      // Get the created bowl
      const createdBowl = await db.get('SELECT * FROM bowls WHERE id = ?', result.lastID);
      
      if (!createdBowl) {
        throw new Error('Failed to retrieve created bowl');
      }

      return {
        success: true,
        message: 'Bowl added successfully',
        bowl: bowlModel.formatBowl(createdBowl)
      };
    } catch (error) {
      console.error('Error adding bowl:', error);
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
      
      // Re-initialize the bowls
      const sizes = {
        R: { count: 10, base: 'rice', proteins: ['salmon'], ingredients: ['cucumber'] },
        M: { count: 8, base: 'rice', proteins: ['salmon'], ingredients: ['cucumber'] },
        L: { count: 6, base: 'rice', proteins: ['salmon'], ingredients: ['cucumber'] }
      };

      for (const [size, data] of Object.entries(sizes)) {
        await db.run(
          `INSERT INTO bowls (size, base, proteins, ingredients, quantity, status, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            size,
            data.base,
            data.proteins.join(','),
            data.ingredients.join(','),
            data.count,  // Set the quantity to the daily limit
            'available',
            new Date().toISOString()
          ]
        );
      }
      
      return {
        success: true,
        message: 'All bowls cleared and re-initialized'
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