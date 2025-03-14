// /collections/OrderCollection.js

import Order from '../models/Order.js';

class OrderCollection {
  constructor() {
    this.orders = [];
  }

  // CREATE: Add a new Order
  addOrder(order) {
    this.orders.push(order);
  }

  // READ: Retrieve all Orders
  getAllOrders() {
    return this.orders;
  }

  // READ: Retrieve an Order by ID
  getOrderById(id) {
    return this.orders.find((o) => o.id === id);
  }

  // UPDATE: Update an Order
  updateOrder(id, updates) {
    const order = this.getOrderById(id);
    if (!order) return false;

    Object.keys(updates).forEach((key) => {
      if (order.hasOwnProperty(key)) {
        order[key] = updates[key];
      }
    });
    return true;
  }

  // DELETE: Remove an Order
  removeOrder(id) {
    const index = this.orders.findIndex((o) => o.id === id);
    if (index !== -1) {
      this.orders.splice(index, 1);
      return true;
    }
    return false;
  }
}

export default OrderCollection;
