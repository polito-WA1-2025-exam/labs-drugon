// /collections/UserCollection.js

import User from '../models/User.js';

class UserCollection {
  constructor() {
    this.users = [];
  }

  // CREATE: Add a new User
  addUser(user) {
    this.users.push(user);
  }

  // READ: Retrieve all Users
  getAllUsers() {
    return this.users;
  }

  // READ: Retrieve a User by ID
  getUserById(id) {
    return this.users.find((u) => u.id === id);
  }

  // UPDATE: Update a User
  updateUser(id, updates) {
    const user = this.getUserById(id);
    if (!user) return false;

    Object.keys(updates).forEach((key) => {
      if (user.hasOwnProperty(key)) {
        user[key] = updates[key];
      }
    });
    return true;
  }

  // DELETE: Remove a User
  removeUser(id) {
    const index = this.users.findIndex((u) => u.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }
}

export default UserCollection;
