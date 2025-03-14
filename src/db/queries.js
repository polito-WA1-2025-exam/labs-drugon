// src/db/queries.js
import db from './initdb.js';

// ---------- 1. Retrieve Data ----------

// a) Get all bowls
export function getAllBowls() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM bowls`, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// b) Get bowls by size
export function getBowlsBySize(size) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM bowls WHERE size = ?`, [size], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// c) Search bowls by ingredient (substring search)
export function searchBowlsByIngredient(ingredient) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM bowls WHERE ingredients LIKE ?`, [`%${ingredient}%`], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// d) Get bowls by protein type
export function getBowlsByProtein(protein) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM bowls WHERE proteins LIKE ?`, [`%${protein}%`], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// ---------- 2. Modify Data ----------

// a) Insert a new bowl
export function insertBowl({ size, base, proteins, ingredients, quantity }) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO bowls (size, base, proteins, ingredients, quantity)
       VALUES (?, ?, ?, ?, ?)`,
      [size, base, proteins, ingredients, quantity],
      function(err) {
        if (err) {
          reject(new Error(`Failed to insert bowl: ${err.message}`));
        } else {
          resolve({ 
            success: true,
            message: 'Bowl inserted successfully',
            id: this.lastID 
          });
        }
      }
    );
  });
}

// b) Delete a bowl by ID
export function deleteBowl(id) {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM bowls WHERE id = ?`, [id], function(err) {
      if (err) {
        reject(new Error(`Failed to delete bowl: ${err.message}`));
      } else if (this.changes === 0) {
        resolve({
          success: false,
          message: `No bowl found with ID ${id}`
        });
      } else {
        resolve({
          success: true,
          message: `Bowl with ID ${id} deleted successfully`,
          changes: this.changes
        });
      }
    });
  });
}

// c) Update a bowl's quantity
export function updateBowlQuantity(id, newQuantity) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE bowls SET quantity = ? WHERE id = ?`,
      [newQuantity, id],
      function(err) {
        if (err) {
          reject(new Error(`Failed to update bowl quantity: ${err.message}`));
        } else if (this.changes === 0) {
          resolve({
            success: false,
            message: `No bowl found with ID ${id}`
          });
        } else {
          resolve({
            success: true,
            message: `Bowl quantity updated successfully`,
            changes: this.changes
          });
        }
      }
    );
  });
}

// d) Update all bowls of a specific size
export function updateAllBowlsOfSize(size, updates) {
  const setClause = Object.keys(updates)
    .map(key => `${key} = ?`)
    .join(', ');
  const values = [...Object.values(updates), size];

  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE bowls SET ${setClause} WHERE size = ?`,
      values,
      function(err) {
        if (err) {
          reject(new Error(`Failed to update bowls: ${err.message}`));
        } else {
          resolve({
            success: true,
            message: `Updated ${this.changes} bowls of size ${size}`,
            changes: this.changes
          });
        }
      }
    );
  });
}
