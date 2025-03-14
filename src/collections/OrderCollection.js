import Order from '../models/Order.js';
import BowlCollection from './BowlCollection.js';

class OrderCollection {
    constructor() {
        this.orders = [];
        this.lastId = 0;
    }
    
    // Add a new order
    addOrder(userId, bowls, totalPrice) {
        const id = ++this.lastId;
        const newOrder = new Order(id, userId, bowls, totalPrice);
        this.orders.push(newOrder);
        return newOrder;
    }
    
    // Get orders by user ID
    getOrdersByUserId(userId) {
        return this.orders.filter(order => order.userId === userId);
    }
    
    // Get order by ID
    getOrderById(id) {
        return this.orders.find(order => order.id === id);
    }
    
    // Calculate total price for an order
    calculateOrderPrice(bowls, shopPrices) {
        const bowlCollection = new BowlCollection();
        let totalPrice = 0;
        
        // Calculate price for each bowl
        for (const bowl of bowls) {
            totalPrice += bowlCollection.calculateBowlPrice(bowl, shopPrices);
        }
        
        // Apply 10% discount if more than 4 bowls in total
        const totalBowls = bowls.reduce((sum, bowl) => sum + bowl.quantity, 0);
        if (totalBowls > 4) {
            totalPrice *= 0.9;
        }
        
        return totalPrice;
    }
    
    // Remove an order
    removeOrder(id) {
        const index = this.orders.findIndex(order => order.id === id);
        if (index !== -1) {
            this.orders.splice(index, 1);
            return true;
        }
        return false;
    }
}

export default OrderCollection;