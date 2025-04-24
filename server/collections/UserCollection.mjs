// /collections/UserCollection.mjs

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import User from '../models/User.mjs';
import path from 'path';

export default function UserDAO() {
    let db = null;
    const userModel = new User();

    // Initialize database connection
    const initializeDb = async () => {
        if (!db) {
            db = await open({
                filename: 'poke_shop.db',
                driver: sqlite3.Database
            });

            // Create users table if it doesn't exist
            await db.exec(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    email TEXT NOT NULL,
                    fullName TEXT NOT NULL,
                    createdAt TEXT NOT NULL
                )
            `);
        }
        return db;
    };

    // Add a new user
    this.addUser = async ({ username, password, email, fullName }) => {
        try {
            const user = userModel.createUser(null, username, password, email, fullName);
            userModel.validateUser(user);

            // Check if username already exists
            const db = await initializeDb();
            const existingUser = await db.get('SELECT id FROM users WHERE username = ?', username);
            if (existingUser) {
                throw new Error('Username already exists');
            }

            // Hash password before storing
            const hashedPassword = await userModel.hashPassword(password);

            const result = await db.run(
                `INSERT INTO users (username, password, email, fullName, createdAt)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    username,
                    hashedPassword,
                    email,
                    fullName,
                    new Date().toISOString()
                ]
            );

            const createdUser = await db.get('SELECT * FROM users WHERE id = ?', result.lastID);
            return {
                success: true,
                message: 'User added successfully',
                user: userModel.formatUser(createdUser)
            };
        } catch (error) {
            return {
                success: false,
                message: `Error adding user: ${error.message}`
            };
        }
    };

    // Get all users
    this.getAllUsers = async () => {
        const db = await initializeDb();
        const users = await db.all('SELECT * FROM users');
        return users.map(user => userModel.formatUser(user));
    };

    // Get user by ID
    this.getUserById = async (id) => {
        const db = await initializeDb();
        const user = await db.get('SELECT * FROM users WHERE id = ?', id);
        return user ? userModel.formatUser(user) : null;
    };

    // Get user by username
    this.getUserByUsername = async (username) => {
        const db = await initializeDb();
        const user = await db.get('SELECT * FROM users WHERE username = ?', username);
        return user || null;
    };

    // Update user
    this.updateUser = async (id, updates) => {
        try {
            const db = await initializeDb();
            const currentUser = await this.getUserById(id);
            
            if (!currentUser) {
                return {
                    success: false,
                    message: `User with ID ${id} not found`
                };
            }

            // Don't allow changing the ID
            delete updates.id;

            const updatedUser = {
                ...currentUser,
                ...updates
            };

            userModel.validateUser(updatedUser);

            // If password is being updated, hash it
            if (updates.password) {
                updates.password = await userModel.hashPassword(updates.password);
            }

            // Build the update query dynamically based on provided fields
            const updateFields = Object.keys(updates)
                .filter(key => key !== 'id' && key !== 'createdAt')
                .map(key => `${key} = ?`)
                .join(', ');
            
            const updateValues = Object.keys(updates)
                .filter(key => key !== 'id' && key !== 'createdAt')
                .map(key => updates[key]);

            const result = await db.run(
                `UPDATE users SET ${updateFields} WHERE id = ?`,
                [...updateValues, id]
            );

            if (result.changes === 0) {
                return {
                    success: false,
                    message: `User with ID ${id} not found`
                };
            }

            const user = await db.get('SELECT * FROM users WHERE id = ?', id);
            return {
                success: true,
                message: 'User updated successfully',
                user: userModel.formatUser(user)
            };
        } catch (error) {
            return {
                success: false,
                message: `Error updating user: ${error.message}`
            };
        }
    };

    // Verify user credentials
    this.verifyCredentials = async (username, password) => {
        try {
            const db = await initializeDb();
            const user = await db.get('SELECT * FROM users WHERE username = ?', username);
            
            if (!user) {
                return {
                    success: false,
                    message: 'Invalid username or password'
                };
            }

            const isValid = await userModel.verifyPassword(password, user.password);
            if (!isValid) {
                return {
                    success: false,
                    message: 'Invalid username or password'
                };
            }

            return {
                success: true,
                message: 'Login successful',
                user: userModel.formatUser(user)
            };
        } catch (error) {
            return {
                success: false,
                message: `Error verifying credentials: ${error.message}`
            };
        }
    };

    // Delete a user
    this.deleteUser = async (id) => {
        try {
            const db = await initializeDb();
            const result = await db.run('DELETE FROM users WHERE id = ?', id);

            if (result.changes === 0) {
                return {
                    success: false,
                    message: `User with ID ${id} not found`
                };
            }

            return {
                success: true,
                message: 'User deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: `Error deleting user: ${error.message}`
            };
        }
    };

    // Clear all users (useful for testing)
    this.clearUsers = async () => {
        try {
            const db = await initializeDb();
            await db.run('DELETE FROM users');
            await db.run('DELETE FROM sqlite_sequence WHERE name = "users"'); // Reset autoincrement
            
            return {
                success: true,
                message: 'All users cleared'
            };
        } catch (error) {
            return {
                success: false,
                message: `Error clearing users: ${error.message}`
            };
        }
    };
} 