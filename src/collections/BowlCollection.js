// /collections/BowlCollection.js

import Bowl from '../models/Bowl.js';

class BowlCollection {
  constructor() {
    // Internal array to store Bowl objects
    this.bowls = [];
  }

  // CREATE: Add a new Bowl
  addBowl(bowl) {
    this.bowls.push(bowl);
  }

  // READ: Retrieve all Bowls
  getAllBowls() {
    return this.bowls;
  }

  // READ: Retrieve a Bowl by ID
  getBowlById(id) {
    return this.bowls.find((b) => b.id === id);
  }

  // UPDATE: Update a Bowl (partial updates allowed)
  updateBowl(id, updates) {
    const bowl = this.getBowlById(id);
    if (!bowl) return false;

    // Apply each key in `updates` to the found bowl
    Object.keys(updates).forEach((key) => {
      if (bowl.hasOwnProperty(key)) {
        bowl[key] = updates[key];
      }
    });
    return true;
  }

  // DELETE: Remove a Bowl by ID
  removeBowl(id) {
    const index = this.bowls.findIndex((b) => b.id === id);
    if (index !== -1) {
      this.bowls.splice(index, 1);
      return true;
    }
    return false;
  }
}

export default BowlCollection;
