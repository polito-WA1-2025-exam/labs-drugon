// /collections/ShopCollection.mjs
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import Shop from '../models/Shop.mjs';
import path from 'path';

export default function ShopDAO() {
    let db = null;
    const shopModel = new Shop();

    // Initialize database connection
    const initializeDb = async () => {
        if (!db) {
            db = await open({
                filename: 'poke_shop.db',
                driver: sqlite3.Database
            });

            // Create shops table if it doesn't exist
            await db.exec(`
                CREATE TABLE IF NOT EXISTS shops (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    address TEXT NOT NULL,
                    openingHours TEXT NOT NULL,
                    isActive BOOLEAN NOT NULL DEFAULT 1,
                    createdAt TEXT NOT NULL
                )
            `);
        }
        return db;
    };

    // Add a new shop
    this.addShop = async ({ name, address, openingHours }) => {
        try {
            const shop = shopModel.createShop(name, address, openingHours);
            shopModel.validateShop(shop);

            const db = await initializeDb();
            const result = await db.run(
                `INSERT INTO shops (name, address, openingHours, isActive, createdAt)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    shop.name,
                    shop.address,
                    typeof shop.openingHours === 'object' ? JSON.stringify(shop.openingHours) : shop.openingHours,
                    shop.isActive ? 1 : 0,
                    new Date().toISOString()
                ]
            );

            const createdShop = await db.get('SELECT * FROM shops WHERE id = ?', result.lastID);
            
            return {
                success: true,
                message: 'Shop added successfully',
                shop: shopModel.formatShop(createdShop)
            };
        } catch (error) {
            return {
                success: false,
                message: `Error adding shop: ${error.message}`
            };
        }
    };

    // Get all shops
    this.getAllShops = async () => {
        const db = await initializeDb();
        const shops = await db.all('SELECT * FROM shops');
        return shops.map(shop => shopModel.formatShop(shop));
    };

    // Get shop by ID
    this.getShopById = async (id) => {
        const db = await initializeDb();
        const shop = await db.get('SELECT * FROM shops WHERE id = ?', id);
        return shop ? shopModel.formatShop(shop) : null;
    };

    // Get active shops
    this.getActiveShops = async () => {
        const db = await initializeDb();
        const shops = await db.all('SELECT * FROM shops WHERE isActive = 1');
        return shops.map(shop => shopModel.formatShop(shop));
    };

    // Get currently open shops
    this.getOpenShops = async () => {
        const shops = await this.getActiveShops();
        return shops.filter(shop => shopModel.isOpen(shop));
    };

    // Update shop
    this.updateShop = async (id, updates) => {
        try {
            const db = await initializeDb();
            const currentShop = await this.getShopById(id);
            
            if (!currentShop) {
                return {
                    success: false,
                    message: `Shop with ID ${id} not found`
                };
            }

            const updatedShop = {
                ...currentShop,
                ...updates
            };

            shopModel.validateShop(updatedShop);

            const result = await db.run(
                `UPDATE shops 
                 SET name = ?, address = ?, openingHours = ?, isActive = ?
                 WHERE id = ?`,
                [
                    updatedShop.name,
                    updatedShop.address,
                    typeof updatedShop.openingHours === 'object' ? JSON.stringify(updatedShop.openingHours) : updatedShop.openingHours,
                    updatedShop.isActive ? 1 : 0,
                    id
                ]
            );

            if (result.changes === 0) {
                return {
                    success: false,
                    message: `Shop with ID ${id} not found`
                };
            }

            const shop = await db.get('SELECT * FROM shops WHERE id = ?', id);
            return {
                success: true,
                message: 'Shop updated successfully',
                shop: shopModel.formatShop(shop)
            };
        } catch (error) {
            return {
                success: false,
                message: `Error updating shop: ${error.message}`
            };
        }
    };

    // Set shop active status
    this.setShopActive = async (id, isActive) => {
        try {
            const db = await initializeDb();
            const result = await db.run(
                'UPDATE shops SET isActive = ? WHERE id = ?',
                [isActive ? 1 : 0, id]
            );

            if (result.changes === 0) {
                return {
                    success: false,
                    message: `Shop with ID ${id} not found`
                };
            }

            const shop = await db.get('SELECT * FROM shops WHERE id = ?', id);
            return {
                success: true,
                message: `Shop ${isActive ? 'activated' : 'deactivated'} successfully`,
                shop: shopModel.formatShop(shop)
            };
        } catch (error) {
            return {
                success: false,
                message: `Error updating shop status: ${error.message}`
            };
        }
    };

    // Delete a shop
    this.deleteShop = async (id) => {
        try {
            const db = await initializeDb();
            const result = await db.run('DELETE FROM shops WHERE id = ?', id);

            if (result.changes === 0) {
                return {
                    success: false,
                    message: `Shop with ID ${id} not found`
                };
            }

            return {
                success: true,
                message: 'Shop deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: `Error deleting shop: ${error.message}`
            };
        }
    };

    // Clear all shops (useful for testing)
    this.clearShops = async () => {
        try {
            const db = await initializeDb();
            await db.run('DELETE FROM shops');
            await db.run('DELETE FROM sqlite_sequence WHERE name = "shops"'); // Reset autoincrement
            
            return {
                success: true,
                message: 'All shops cleared'
            };
        } catch (error) {
            return {
                success: false,
                message: `Error clearing shops: ${error.message}`
            };
        }
    };
}; 