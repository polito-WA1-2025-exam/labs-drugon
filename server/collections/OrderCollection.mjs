import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import Order from '../models/Order.mjs';
import path from 'path';
import { fileURLToPath } from 'url';
import BowlDAO from './BowlCollection.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function OrderDAO() {
    let db = null;
    const orderModel = new Order();
    const bowlDao = new BowlDAO();

    // Initialize database connection
    const initializeDb = async () => {
        if (!db) {
            db = await open({
                filename: 'poke_shop.db',
                driver: sqlite3.Database
            });

            // Drop and recreate orders table to ensure correct schema
            await db.exec(`
                DROP TABLE IF EXISTS orders;
                CREATE TABLE orders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    userId INTEGER NOT NULL,
                    bowls TEXT NOT NULL,
                    totalPrice REAL NOT NULL,
                    status TEXT NOT NULL,
                    specialRequests TEXT,
                    createdAt TEXT NOT NULL,
                    FOREIGN KEY (userId) REFERENCES users(id)
                )
            `);

            // Check if specialRequests column exists, if not add it
            try {
                await db.get("SELECT specialRequests FROM orders LIMIT 1");
            } catch (error) {
                if (error.code === 'SQLITE_ERROR') {
                    console.log('Adding specialRequests column to orders table...');
                    await db.exec('ALTER TABLE orders ADD COLUMN specialRequests TEXT');
                }
            }
        }
        return db;
    };

    // Add a new order
    this.addOrder = async ({ userId, bowls, totalPrice, status = 'pending', specialRequests = '' }) => {
        try {
            // Convert bowls array to JSON string for storage
            const bowlsJson = JSON.stringify(bowls);
            
            const db = await initializeDb();
            const result = await db.run(
                `INSERT INTO orders (userId, bowls, totalPrice, status, specialRequests, createdAt)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    bowlsJson,
                    totalPrice,
                    status,
                    specialRequests || '',  // Ensure it's never null
                    new Date().toISOString()
                ]
            );

            const createdOrder = await db.get('SELECT * FROM orders WHERE id = ?', result.lastID);

            // Insert each bowl into the bowls table with status 'ordered' and today's date
            for (const bowl of bowls) {
                await bowlDao.addBowl({
                    ...bowl,
                    status: 'ordered',
                    orderId: result.lastID,  // Set the orderId to link the bowl to this order
                    createdAt: new Date().toISOString()
                });
            }
            
            return {
                success: true,
                message: 'Order added successfully',
                order: {
                    ...createdOrder,
                    bowls: JSON.parse(createdOrder.bowls)
                }
            };
        } catch (error) {
            console.error('Error adding order:', error);
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
            console.log('Attempting to delete order:', id);
            const db = await initializeDb();
            
            // First get the order details to know which bowls to update
            const order = await db.get('SELECT * FROM orders WHERE id = ?', [id]);
            console.log('Found order:', order);
            
            if (!order) {
                console.log('No order found with id:', id);
                return { success: false, message: 'Order not found' };
            }

            // Parse the bowls from the order
            const bowls = JSON.parse(order.bowls);
            console.log('Parsed bowls:', bowls);

            // Update the status of the bowls back to 'available'
            for (const bowl of bowls) {
                const quantity = bowl.quantity || 1;
                
                // Update all bowls associated with this order
                await db.run(
                    `UPDATE bowls 
                     SET status = 'available', 
                         orderId = NULL, 
                         updatedAt = CURRENT_TIMESTAMP 
                     WHERE orderId = ?`,
                    [id]
                );
            }

            // Delete the order
            const result = await db.run('DELETE FROM orders WHERE id = ?', [id]);
            console.log('Delete result:', result);

            if (result.changes === 0) {
                console.log('No rows were deleted');
                return { success: false, message: 'Order not found' };
            }

            return { success: true, message: 'Order deleted successfully' };
        } catch (error) {
            console.error('Error in deleteOrder:', error);
            throw new Error(`Error deleting order: ${error.message}`);
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