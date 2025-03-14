function OrderCollection() {
    this.orders = [];
    this.lastId = 0;
    
    // Add a new order
    this.addOrder = function(userId, bowls, totalPrice) {
      const id = ++this.lastId;
      const newOrder = new Order(id, userId, bowls, totalPrice);
      this.orders.push(newOrder);
      return newOrder;
    };
    
    // Get orders by user ID
    this.getOrdersByUserId = function(userId) {
      return this.orders.filter(order => order.userId === userId);
    };
    
    // Get order by ID
    this.getOrderById = function(id) {
      return this.orders.find(order => order.id === id);
    };
    
    // Calculate total price for an order
    this.calculateOrderPrice = function(bowls, shopPrices) {
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
    };
    
    // Remove an order
    this.removeOrder = function(id) {
      const index = this.orders.findIndex(order => order.id === id);
      if (index !== -1) {
        this.orders.splice(index, 1);
        return true;
      }
      return false;
    };
  }