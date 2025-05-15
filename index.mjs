import express from 'express';
import BowlDAO from './server/collections/BowlCollection.mjs';
import OrderDAO from './server/collections/OrderCollection.mjs';
import ShopDAO from './server/collections/ShopCollection.mjs';    // ← add this
import UserDAO from './server/collections/UserCollection.mjs';
import User from './server/models/User.mjs';


const app = express();
const PORT = process.env.PORT || 3000;

const bowlDao = new BowlDAO();
const orderDao = new OrderDAO();
const shopDao = new ShopDAO();
const userDao = new UserDAO();

app.use(express.json());

// Root welcome route
app.get('/', (req, res) => {
  res.send('🍜 Welcome to the Poke Bowl API!');
});

// Create a new bowl
app.post('/api/bowls', async (req, res) => {
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

// User routes
app.post('/api/login', async (req, res) => {
  try {
  const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Get user by username
    const user = await userDao.getUserByUsername(username);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Create a User model instance to verify password
    const userModel = new User();
    
    try {
      const isValidPassword = await userModel.verifyPassword(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      // Format user for response (excluding password)
      const formattedUser = userModel.formatUser(user);
      res.json({
        success: true,
        message: 'Login successful',
        user: formattedUser
      });
    } catch (verifyError) {
      console.error('Password verification error:', verifyError);
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
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

// Register new user
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

// Order routes
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await orderDao.getAllOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// server/index.mjs
app.post('/api/orders', async (req, res) => {
  const { bowls, /* other orderData */ } = req.body;

  try {
    // 1) Fetch current availability per size from the bowls table
    const avail = await bowlDao.getAvailability();    
    // 2) Count how many of each size the user requested
    const needed = { R: 0, M: 0, L: 0 };
    for (let id of bowls) {
      const b = await bowlDao.getAllBowls()
        .then(list => list.find(x => x.id === id));
      needed[b.size] = (needed[b.size] || 0) + 1;
    }
    // 3) Validate against current stock
    for (let size of ['R','M','L']) {
      if (needed[size] > avail[size]) {
        return res
          .status(400)
          .json({ success: false, message: `Not enough ${size} bowls available` });
      }
    }

    // 4) All good → create the order
    const result = await orderDao.addOrder(req.body);
    if (!result.success) {
      return res.status(400).json(result);
    }

    // 5) Decrement inventory for each bowl ordered
    await Promise.all(
      bowls.map(async (id) => {
        // fetch the bowl to get its current quantity
        const bowl = await bowlDao.getAllBowls()
          .then(list => list.find(x => x.id === id));
        // subtract 1 from its stored quantity
        return bowlDao.updateBowlQuantity(id, bowl.quantity - 1);
      })
    );

    // 6) Return success
    res.status(201).json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const result = await orderDao.updateOrderStatus(req.params.id, req.body.status);
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const result = await orderDao.deleteOrder(req.params.id);
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
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


// 2) Sizes availability
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
// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
