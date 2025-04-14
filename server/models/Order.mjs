// /models/Order.mjs

export default function Order() {
    // Create a new order
    this.createOrder = (userId, bowls, totalPrice, status = 'pending', id = null) => {
        return {
            id,              // Will be set by the collection
            userId,          // ID of the user who placed the order
            bowls,          // Array of bowl IDs or comma-separated string
            totalPrice,      // Total price of the order
            status,         // 'pending', 'confirmed', 'completed', 'cancelled'
            createdAt: new Date()
        };
    };

    // Validate order data
    this.validateOrder = (order) => {
        if (order.id !== null && (typeof order.id !== 'number' || order.id < 1)) {
            throw new Error('Invalid order ID');
        }

        if (typeof order.userId !== 'number' || order.userId < 1) {
            throw new Error('Invalid user ID');
        }

        if (!order.bowls || (typeof order.bowls !== 'string' && !Array.isArray(order.bowls))) {
            throw new Error('Order must have bowls');
        }

        if (typeof order.totalPrice !== 'number' || order.totalPrice < 0) {
            throw new Error('Invalid total price');
        }

        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (!validStatuses.includes(order.status)) {
            throw new Error('Invalid order status');
        }

        return true;
    };

    // Format order data for display
    this.formatOrder = (order) => {
        return {
            ...order,
            bowls: Array.isArray(order.bowls) ? order.bowls.join(',') : order.bowls,
            createdAt: order.createdAt ? new Date(order.createdAt) : new Date()
        };
    };

    // Helper method to parse comma-separated strings into arrays
    this.parseArrayField = (field) => {
        if (Array.isArray(field)) return field;
        return field.split(',').map(item => item.trim());
    };

    // Calculate total price from bowls
    this.calculateTotalPrice = (bowls) => {
        return bowls.reduce((total, bowl) => total + bowl.price, 0);
    };

    // Check if order can be cancelled
    this.canBeCancelled = (order) => {
        return ['pending', 'confirmed'].includes(order.status);
    };

    // Check if order can be confirmed
    this.canBeConfirmed = (order) => {
        return order.status === 'pending';
    };

    // Check if order can be completed
    this.canBeCompleted = (order) => {
        return order.status === 'confirmed';
    };
} 