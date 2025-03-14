# Group "GROUP NAME"

## Members
- s334026 Miryavifard Hojjat
- s334033  Behlooei Dolatsaraei Ali

# Exercise "NAME OF EXERCISE"

# Lab Journal
hi there 
(you may update this file to keep track of the progress of your group work, throughout the weeks)

# Poke Bowl Shop Database

## Database Structure

### Tables

1. **Bowls Table**
   - `id` (INTEGER): Primary key, auto-incrementing
   - `size` (TEXT): Bowl size ('R', 'M', 'L')
   - `base` (TEXT): Base ingredient (rice, quinoa, salad, etc.)
   - `proteins` (TEXT): Comma-separated list of proteins
   - `ingredients` (TEXT): Comma-separated list of additional ingredients
   - `quantity` (INTEGER): Number of bowls in stock

2. **Orders Table**
   - `id` (INTEGER): Primary key, auto-incrementing
   - `specialRequests` (TEXT): Special instructions for the order

## Database Operations

### Retrieval Operations
1. Get all bowls
2. Get bowls by size
3. Search bowls by ingredient
4. Get bowls by protein type

### Modification Operations
1. Insert new bowl
2. Delete bowl by ID
3. Update bowl quantity
4. Bulk update bowls by size

## Testing

Run the tests using:
```bash
node test/db_tests.js
```

This will perform a complete test of all database operations including:
- Inserting test data
- Retrieving data with various conditions
- Updating single and multiple records
- Deleting records
