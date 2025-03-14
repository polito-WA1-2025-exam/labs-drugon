// src/test/sample_data.js
import {
    getAllBowls,
    getBowlsBySize,
    insertBowl,
    updateBowlQuantity,
    deleteBowl
  } from '../src/db/queries.js';
  
  async function testDB() {
    try {
      // 1) Insert first bowl
      const bowl1 = {
        size: 'L',
        base: 'rice',
        proteins: 'salmon',
        ingredients: 'avocado,mango,cucumber',
        quantity: 1
      };
      
      const insertResult1 = await insertBowl(bowl1);
      console.log('Inserted first bowl with id:', insertResult1.id);

      // 2) Insert second bowl
      const bowl2 = {
        size: 'M',
        base: 'quinoa',
        proteins: 'chicken',
        ingredients: 'corn,edamame,carrots',
        quantity: 2
      };
      
      const insertResult2 = await insertBowl(bowl2);
      console.log('Inserted second bowl with id:', insertResult2.id);
  
      // 3) Show all bowls in the table
      console.log('\n=== All Bowls in Table ===');
      const allBowls = await getAllBowls();
      console.table(allBowls); // Using console.table for better formatting
      
    } catch (err) {
      console.error('Error during DB operations:', err);
    }
  }
  
  testDB();
  