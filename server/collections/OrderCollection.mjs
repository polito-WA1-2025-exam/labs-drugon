import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import Order from '../models/Order.mjs';
import path from 'path';

export default function OrderDAO() {
    let db = null;
    const orderModel = new Order();

    // Initialize database connection
    const initializeDb = async () => {
        if (!db) {
            db = await open({
                filename: 'poke_shop.db',
                driver: sqlite3.Database
            });

            // Create orders table if it doesn't exist
            await db.exec(`
                CREATE TABLE IF NOT EXISTS orders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    userId INTEGER NOT NULL,
                    bowls TEXT NOT NULL,
                    totalPrice REAL NOT NULL,
                    status TEXT NOT NULL,
                    createdAt TEXT NOT NULL,
                    FOREIGN KEY (userId) REFERENCES users(id)
                )
            `);
        }
        return db;
    };

    // Add a new order
    this.addOrder = async ({ userId, bowls, totalPrice }) => {
        try {
            const order = orderModel.createOrder(userId, bowls, totalPrice);
            orderModel.validateOrder(order);

            const db = await initializeDb();
            const result = await db.run(
                `INSERT INTO orders (userId, bowls, totalPrice, status, createdAt)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    order.userId,
                    Array.isArray(order.bowls) ? order.bowls.join(',') : order.bowls,
                    order.totalPrice,
                    order.status,
                    new Date().toISOString()
                ]
            );

            const createdOrder = await db.get('SELECT * FROM orders WHERE id = ?', result.lastID);
            
            return {
                success: true,
                message: 'Order added successfully',
                order: orderModel.formatOrder(createdOrder)
            };
        } catch (error) {
            return {
                success: false,
                message: `Error adding order: ${error.message}`
            };
        }
    };

    // Get all orders
    this.getAllOrders = async () => {
        const db = await initializeDb();
        const orders = await db.all('SELECT * FROM orders');
        return orders.map(order => orderModel.formatOrder(order));
    };

    // Get orders by user ID
    this.getOrdersByUser = async (userId) => {
        const db = await initializeDb();
        const orders = await db.all('SELECT * FROM orders WHERE userId = ?', userId);
        return orders.map(order => orderModel.formatOrder(order));
    };

    // Get order by ID
    this.getOrderById = async (id) => {
        const db = await initializeDb();
        const order = await db.get('SELECT * FROM orders WHERE id = ?', id);
        return order ? orderModel.formatOrder(order) : null;
    };

    // Get orders by status
    this.getOrdersByStatus = async (status) => {
        const db = await initializeDb();
        const orders = await db.all('SELECT * FROM orders WHERE status = ?', status);
        return orders.map(order => orderModel.formatOrder(order));
    };

    // Update order status
    this.updateOrderStatus = async (id, newStatus) => {
        try {
            const db = await initializeDb();
            const order = await this.getOrderById(id);
            
            if (!order) {
                return {
                    success: false,
                    message: `Order with ID ${id} not found`
                };
            }

            // Check if status transition is valid
            if (newStatus === 'confirmed' && !orderModel.canBeConfirmed(order)) {
                return {
                    success: false,
                    message: 'Order cannot be confirmed'
                };
            }

            if (newStatus === 'completed' && !orderModel.canBeCompleted(order)) {
                return {
                    success: false,
                    message: 'Order cannot be completed'
                };
            }

            if (newStatus === 'cancelled' && !orderModel.canBeCancelled(order)) {
                return {
                    success: false,
                    message: 'Order cannot be cancelled'
                };
            }

            const result = await db.run(
                'UPDATE orders SET status = ? WHERE id = ?',
                [newStatus, id]
            );

            const updatedOrder = await db.get('SELECT * FROM orders WHERE id = ?', id);
            return {
                success: true,
                message: 'Order status updated successfully',
                order: orderModel.formatOrder(updatedOrder)
            };
        } catch (error) {
            return {
                success: false,
                message: `Error updating order status: ${error.message}`
            };
        }
    };

    // Delete an order
    this.deleteOrder = async (id) => {
        try {
            const db = await initializeDb();
            const result = await db.run('DELETE FROM orders WHERE id = ?', id);

            if (result.changes === 0) {
                return {
                    success: false,
                    message: `Order with ID ${id} not found`
                };
            }

            return {
                success: true,
                message: 'Order deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: `Error deleting order: ${error.message}`
            };
        }
    };

    // Clear all orders (useful for testing)
    this.clearOrders = async () => {
        try {
            const db = await initializeDb();
            await db.run('DELETE FROM orders');
            await db.run('DELETE FROM sqlite_sequence WHERE name = "orders"'); // Reset autoincrement
            
            return {
                success: true,
                message: 'All orders cleared'
            };
        } catch (error) {
            return {
                success: false,
                message: `Error clearing orders: ${error.message}`
            };
        }
    };
} 