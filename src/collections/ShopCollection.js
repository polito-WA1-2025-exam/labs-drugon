// /collections/ShopCollection.js

import Shop from '../models/Shop.js';

class ShopCollection {
  constructor() {
    this.shops = [];
  }

  // CREATE: Add a new Shop
  addShop(shop) {
    this.shops.push(shop);
  }

  // READ: Retrieve all Shops
  getAllShops() {
    return this.shops;
  }

  // READ: Retrieve a Shop by ID
  getShopById(id) {
    return this.shops.find((s) => s.id === id);
  }

  // UPDATE: Update a Shop
  updateShop(id, updates) {
    const shop = this.getShopById(id);
    if (!shop) return false;

    Object.keys(updates).forEach((key) => {
      if (shop.hasOwnProperty(key)) {
        shop[key] = updates[key];
      }
    });
    return true;
  }

  // DELETE: Remove a Shop
  removeShop(id) {
    const index = this.shops.findIndex((s) => s.id === id);
    if (index !== -1) {
      this.shops.splice(index, 1);
      return true;
    }
    return false;
  }
}

export default ShopCollection;
