import express from 'express';
import BowlDAO from './server/collections/BowlCollection.mjs';

const app = express();
const PORT = process.env.PORT || 3000;

const bowlDao = new BowlDAO();

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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
