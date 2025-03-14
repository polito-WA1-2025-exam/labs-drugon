// test/db_tests.js
import {
  getAllBowls,
  getBowlsBySize,
  searchBowlsByIngredient,
  getBowlsByProtein,
  insertBowl,
  updateBowlQuantity,
  deleteBowl,
  updateAllBowlsOfSize
} from '../src/db/queries.js';

const db = require('../src/utils/db');
const assert = require('assert');

async function runTests() {
  try {
    console.log('=== Starting Database Tests ===\n');

    // 1. Insert Test Data
    console.log('1. Testing Insert Operations:');
    const bowls = [
      {
        size: 'L',
        base: 'brown rice',
        proteins: 'salmon,tuna',
        ingredients: 'avocado,mango,cucumber',
        quantity: 1
      },
      {
        size: 'M',
        base: 'quinoa',
        proteins: 'chicken',
        ingredients: 'corn,edamame,carrots',
        quantity: 2
      },
      {
        size: 'L',
        base: 'salad',
        proteins: 'tofu',
        ingredients: 'cucumber,carrots,sesame',
        quantity: 3
      }
    ];

    for (const bowl of bowls) {
      const result = await insertBowl(bowl);
      console.log(result.message, `(ID: ${result.id})`);
    }

    // 2. Test Retrieval Operations
    console.log('\n2. Testing Retrieval Operations:');
    
    console.log('\na. Get All Bowls:');
    const allBowls = await getAllBowls();
    console.table(allBowls);

    console.log('\nb. Get Large Bowls:');
    const largeBowls = await getBowlsBySize('L');
    console.table(largeBowls);

    console.log('\nc. Search Bowls with Cucumber:');
    const cucumberBowls = await searchBowlsByIngredient('cucumber');
    console.table(cucumberBowls);

    console.log('\nd. Get Bowls with Salmon:');
    const salmonBowls = await getBowlsByProtein('salmon');
    console.table(salmonBowls);

    // 3. Test Update Operations
    console.log('\n3. Testing Update Operations:');
    
    if (allBowls.length > 0) {
      const updateResult = await updateBowlQuantity(allBowls[0].id, 5);
      console.log('a. Update Single Bowl:', updateResult.message);

      const bulkUpdateResult = await updateAllBowlsOfSize('L', { quantity: 4 });
      console.log('b. Update All Large Bowls:', bulkUpdateResult.message);
    }

    // 4. Show Updated Data
    console.log('\n4. Final Database State:');
    const finalState = await getAllBowls();
    console.table(finalState);

    // 5. Test Delete Operation
    if (allBowls.length > 0) {
      console.log('\n5. Testing Delete Operation:');
      const deleteResult = await deleteBowl(allBowls[0].id);
      console.log(deleteResult.message);
    }

    // Test user creation
    function testUserCreation() {
        const username = 'testuser';
        const email = 'test@example.com';
        const password = 'password123';

        db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, password],
            function(err) {
                if (err) {
                    console.error('Error creating user:', err);
                } else {
                    console.log('User created successfully with ID:', this.lastID);
                }
            }
        );
    }

    // Test post creation
    function testPostCreation() {
        const userId = 1; // Assuming user with ID 1 exists
        const title = 'Test Post';
        const content = 'This is a test post content';

        db.run('INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)',
            [userId, title, content],
            function(err) {
                if (err) {
                    console.error('Error creating post:', err);
                } else {
                    console.log('Post created successfully with ID:', this.lastID);
                }
            }
        );
    }

    // Test user retrieval
    function testUserRetrieval() {
        const username = 'testuser';
        
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            if (err) {
                console.error('Error retrieving user:', err);
            } else {
                console.log('Retrieved user:', row);
            }
        });
    }

    // Test post retrieval
    function testPostRetrieval() {
        const userId = 1;
        
        db.all('SELECT * FROM posts WHERE user_id = ?', [userId], (err, rows) => {
            if (err) {
                console.error('Error retrieving posts:', err);
            } else {
                console.log('Retrieved posts:', rows);
            }
        });
    }

    // Run tests
    console.log('Running database tests...');
    testUserCreation();
    testPostCreation();
    testUserRetrieval();
    testPostRetrieval();

  } catch (err) {
    console.error('Test Error:', err.message);
  }
}

runTests(); 