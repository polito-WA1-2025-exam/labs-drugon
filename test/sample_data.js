// Import all needed classes
import ShopManager from '../src/collections/ShopManager.js';
import OrderCollection from '../src/collections/OrderCollection.js';
import UserCollection from '../src/collections/UserCollection.js';
import BowlCollection from '../src/collections/BowlCollection.js';

// Create sample shop
const shopManager = new ShopManager();

// Create sample users
const userCollection = new UserCollection();
const user1 = userCollection.addUser('john_doe', 'john@example.com');
const user2 = userCollection.addUser('jane_smith', 'jane@example.com');

// Create sample bowls
const bowlCollection = new BowlCollection();
const bowl1 = bowlCollection.addBowl('R', 'rice', ['salmon'], ['avocado', 'mango', 'corn'], 2);
const bowl2 = bowlCollection.addBowl('M', 'black rice', ['tuna', 'chicken'], ['avocado', 'kale', 'wakame', 'peppers']);
const bowl3 = bowlCollection.addBowl('L', 'salad', ['tofu', 'salmon', 'chicken'], ['avocado', 'mango', 'corn', 'tomatoes', 'carrots', 'salad']);

// Create sample orders
const orderCollection = new OrderCollection();
const order1 = orderCollection.addOrder(
  user1.id, 
  [bowl1, bowl2], 
  orderCollection.calculateOrderPrice([bowl1, bowl2], shopManager.shop.prices)
);

const order2 = orderCollection.addOrder(
  user2.id, 
  [bowl3], 
  orderCollection.calculateOrderPrice([bowl3], shopManager.shop.prices)
);

// Update shop availability
shopManager.updateAvailableSizes(order1);
shopManager.updateAvailableSizes(order2);

// Display user orders
console.log("User 1 orders:", orderCollection.getOrdersByUserId(user1.id));
console.log("User 2 orders:", orderCollection.getOrdersByUserId(user2.id));
console.log("Shop availability:", shopManager.shop.availableSizes);