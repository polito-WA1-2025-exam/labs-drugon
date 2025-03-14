function Order(id, userId, bowls, totalPrice) {
    this.id = id;
    this.userId = userId;        // ID of the user who placed the order
    this.bowls = bowls;          // Array of Bowl objects
    this.totalPrice = totalPrice;// Total price after all calculations
    this.specialRequests = '';   // Special requests for the entire order
  }