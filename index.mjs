import express from 'express';
import BowlDAO from './server/collections/BowlCollection.mjs';
import OrderDAO from './server/collections/OrderCollection.mjs';
import ShopDAO from './server/collections/ShopCollection.mjs';    // ← add this


const app = express();
const PORT = process.env.PORT || 3000;

const bowlDao = new BowlDAO();
const orderDao = new OrderDAO();

const shopDao  = new ShopDAO();                                  

app.use(express.json());

// Root welcome route
app.get('/', (req, res) => {
  res.send('🍜 Welcome to the Poke Bowl API!');
});

// Create a new bowl
app.post('/bowls', async (req, res) => {
  const result = await bowlDao.addBowl(req.body);
  result.success ? res.status(201).json(result) : res.status(400).json(result);
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

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await userDao.verifyCredentials(username, password);

  if (result.success) {
    res.json(result); // success: send user
  } else {
    res.status(401).json(result); // failure: unauthorized
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
//    GET  /api/availability
//    (for now we return the static daily limits; later you can subtract real orders)
// Replace your static version with this:
app.get('/api/availability', async (_req, res) => {
  try {
    const avail = await bowlDao.getAvailability();
    res.json(avail);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
