// /models/Order.js
class Order {
    constructor(id, bowls, specialRequests) {
      this.id = id;
      this.bowls = bowls;                // array of Bowl objects or bowl IDs
      this.specialRequests = specialRequests || "";
      // e.g., "Allergic to peanuts" or "No onion"
    }
  }
  
  export default Order;
  