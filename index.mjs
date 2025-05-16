import express from 'express';
import BowlDAO from './server/collections/BowlCollection.mjs';
import OrderDAO from './server/collections/OrderCollection.mjs';
import ShopDAO from './server/collections/ShopCollection.mjs';    // ← add this
import UserDAO from './server/collections/UserCollection.mjs';
import User from './server/models/User.mjs';
import session from 'express-session';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Add CORS middleware before session and routes
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

const bowlDao = new BowlDAO();
const orderDao = new OrderDAO();
const shopDao = new ShopDAO();
const userDao = new UserDAO();

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  next();
};

// Session configuration
app.use(session({
  secret: 'your-secret-key', // Change this to a secure secret in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: false, // Changed to false to make cookie visible
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
    sameSite: 'lax'
  }
}));

// Configure body-parser with increased limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root welcome route
app.get('/', (req, res) => {
  res.send('🍜 Welcome to the Poke Bowl API!');
});

// Public routes - anyone can access
app.get('/api/availability', async (_req, res) => {
  try {
    console.log('Fetching availability...');
    const avail = await bowlDao.getAvailability();
    
    if (!avail) {
      console.error('No availability data returned from bowlDao');
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch availability data' 
      });
    }

    console.log('Availability data:', avail);
    return res.json(avail);
  } catch (err) {
    console.error('Error in availability endpoint:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Error fetching availability data',
      error: err.message 
    });
  }
});

// Authentication routes
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await userDao.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const userModel = new User();
    
    try {
      const isValidPassword = await userModel.verifyPassword(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const formattedUser = userModel.formatUser(user);
      
      // Set user in session
      req.session.user = formattedUser;
      
      // Get the session cookie
      const sessionCookie = req.sessionID;
      
      // Set the cookie in the response
      res.cookie('connect.sid', sessionCookie, {
        httpOnly: false,
        maxAge: 24 * 60 * 60 * 1000,
        path: '/',
        sameSite: 'lax'
      });
      
      res.json({
        success: true,
        message: 'Login successful',
        user: formattedUser,
        sessionId: sessionCookie
      });
    } catch (verifyError) {
      console.error('Password verification error:', verifyError);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login'
    });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error logging out'
      });
    }
    res.clearCookie('connect.sid');
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
});

app.get('/api/sessions/current', (req, res) => {
  if (req.session.user) {
    res.json({
      success: true,
      user: req.session.user
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email, fullName } = req.body;
    
    if (!username || !password || !email || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const result = await userDao.addUser({
      username,
      password,
      email,
      fullName
    });

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration'
    });
  }
});

// Protected routes - require authentication
app.post('/api/orders', requireAuth, async (req, res) => {
  try {
    console.log('Received request body:', JSON.stringify(req.body, null, 2));
    const { bowls } = req.body;

    // Debug log
    console.log('Received bowls:', bowls);

    // Validation: check all bowls have a size
    if (!Array.isArray(bowls) || bowls.some(bowl => !bowl || !bowl.size)) {
      console.error('Invalid bowl data:', bowls);
      return res.status(400).json({ success: false, message: 'Invalid bowl data: each bowl must have a size.' });
    }

    // 1) Fetch current availability per size from the bowls table
    const avail = await bowlDao.getAvailability();    
    console.log('Current availability:', avail);

    // 2) Count how many of each size the user requested
    const needed = { R: 0, M: 0, L: 0 };
    for (let bowl of bowls) {
      needed[bowl.size] = (needed[bowl.size] || 0) + (bowl.quantity || 1);
    }
    console.log('Needed quantities:', needed);

    // 3) Validate against current stock
    for (let size of ['R','M','L']) {
      if (needed[size] > avail[size]) {
        console.error(`Not enough ${size} bowls available. Needed: ${needed[size]}, Available: ${avail[size]}`);
        return res
          .status(400)
          .json({ success: false, message: `Not enough ${size} bowls available` });
      }
    }

    // 4) All good → create the order
    const orderData = {
      ...req.body,
      userId: req.session.user.id
    };
    console.log('Creating order with data:', orderData);

    const result = await orderDao.addOrder(orderData);
    console.log('Order creation result:', result);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    // Return success response
    return res.json({
      success: true,
      message: 'Order created successfully',
      order: result.order
    });

  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while processing your order',
      error: error.message 
    });
  }
});

// Get user's orders - requires authentication
app.get('/api/orders', requireAuth, async (req, res) => {
  try {
    console.log('Fetching orders for user:', req.session.user.id);
    const orders = await orderDao.getOrdersByUser(req.session.user.id);
    console.log('Found orders:', orders);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete an order by ID (requires authentication)
app.delete('/api/orders/:id', requireAuth, async (req, res) => {
  try {
    console.log('Delete order request received for ID:', req.params.id);
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      console.log('Invalid order ID:', req.params.id);
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }
    // Only allow users to delete their own orders
    const orders = await orderDao.getOrdersByUser(req.session.user.id);
    console.log('User orders:', orders);
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      console.log('Order not found or not owned by user');
      return res.status(404).json({ success: false, message: 'Order not found or not yours' });
    }
    console.log('Found order to delete:', order);
    const result = await orderDao.deleteOrder(orderId);
    console.log('Delete result:', result);
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in delete order endpoint:', error);
    res.status(500).json({ success: false, message: 'Error deleting order', error: error.message });
  }
});

// Protected routes for bowl management
app.post('/api/bowls', requireAuth, async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'Request body is required'
      });
    }

    const result = await bowlDao.addBowl(req.body);
    
    if (!result) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create bowl'
      });
    }

    return res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    console.error('Error creating bowl:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating the bowl'
    });
  }
});

// Get all bowls
app.get('/bowls', async (req, res) => {
  const bowls = await bowlDao.getAllBowls();
  res.json(bowls);
});

// Get bowl by ID
app.get('/bowls/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const all = await bowlDao.getAllBowls();
  const found = all.find(b => b.id === id);
  found ? res.json(found) : res.status(404).json({ error: 'Bowl not found' });
});

// Get bowls by size
app.get('/bowls/size/:size', async (req, res) => {
  const size = req.params.size;
  const result = await bowlDao.getBowlsBySize(size);
  res.json(result);
});

// Get bowls by ingredient
app.get('/bowls/ingredient/:ingredient', async (req, res) => {
  const ingredient = req.params.ingredient;
  const result = await bowlDao.searchBowlsByIngredient(ingredient);
  res.json(result);
});

// Get bowls by protein
app.get('/bowls/protein/:protein', async (req, res) => {
  const protein = req.params.protein;
  const result = await bowlDao.getBowlsByProtein(protein);
  res.json(result);
});

// Update full bowl (using quantity as example)
app.put('/bowls/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const result = await bowlDao.updateBowlQuantity(id, req.body.quantity);
  result.success ? res.json(result) : res.status(404).json(result);
});

// Update quantity only (PATCH)
app.patch('/bowls/:id/quantity', async (req, res) => {
  const id = parseInt(req.params.id);
  const result = await bowlDao.updateBowlQuantity(id, req.body.quantity);
  result.success ? res.json(result) : res.status(404).json(result);
});

// Delete a bowl
app.delete('/bowls/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const result = await bowlDao.removeBowl(id);
  result.success ? res.json(result) : res.status(404).json(result);
});

// Clear users (for testing purposes)
app.post('/api/clear-users', async (req, res) => {
  try {
    const result = await userDao.clearUsers();
    res.json(result);
  } catch (error) {
    console.error('Error clearing users:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing users'
    });
  }
});

// 1) List all shops
//    GET  /api/shops
app.get('/api/shops', async (req, res) => {
  try {
    const shops = await shopDao.getAllShops();
    res.json(shops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Create a new shop
// POST /api/shops
app.post('/api/shops', async (req, res) => {
  try {
    const result = await shopDao.addShop(req.body);
  if (result.success) {
      return res.status(201).json(result);
  } else {
      return res.status(400).json(result);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Clear all bowls
app.post('/api/bowls/clear', async (req, res) => {
  try {
    const result = await bowlDao.clearBowls();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error clearing bowls',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
