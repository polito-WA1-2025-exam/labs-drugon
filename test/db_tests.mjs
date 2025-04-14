// test/db_tests.mjs
import BowlDAO from '../src/collections/BowlCollection.mjs';
import OrderDAO from '../src/collections/OrderCollection.mjs';
import ShopDAO from '../src/collections/ShopCollection.mjs';
import UserDAO from '../src/collections/UserCollection.mjs';

async function runBowlTests(bowlDao) {
    console.log('=== Starting Bowl Tests ===\n');

    // Clear any existing data
    console.log('Clearing existing data...');
    const clearResult = await bowlDao.clearBowls();
    console.log(clearResult.message);

    // 1. Test Bowl Creation
    console.log('\n1. Testing Bowl Creation:');
    const bowlsToCreate = [
        {
            size: 'L',
            base: 'rice',
            proteins: 'salmon,tuna',
            ingredients: 'avocado,mango,cucumber',
            quantity: 1
        },
        {
            size: 'M',
            base: 'rice',
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

    const createdBowls = [];
    for (const bowlData of bowlsToCreate) {
        const result = await bowlDao.addBowl(bowlData);
        if (result.success) {
            console.log('Added bowl successfully:', result.bowl);
            createdBowls.push(result.bowl);
        } else {
            console.error('Failed to add bowl:', result.message);
        }
    }

    // 2. Test Bowl Retrieval
    console.log('\n2. Testing Bowl Retrieval:');
    const allBowls = await bowlDao.getAllBowls();
    console.log('Total bowls:', allBowls.length);
    console.table(allBowls);

    // Test specific queries
    const largeBowls = await bowlDao.getBowlsBySize('L');
    const cucumberBowls = await bowlDao.searchBowlsByIngredient('cucumber');
    console.log('Large bowls:', largeBowls.length);
    console.log('Bowls with cucumber:', cucumberBowls.length);

    // 3. Test Bowl Updates
    if (createdBowls.length > 0) {
        console.log('\n3. Testing Bowl Updates:');
        const updateResult = await bowlDao.updateBowlQuantity(createdBowls[0].id, 5);
        console.log('Update result:', updateResult.success ? 'Success' : 'Failed');
    }

    return createdBowls;
}

async function runShopTests(shopDao) {
    console.log('\n=== Starting Shop Tests ===\n');

    // Clear existing data
    const clearResult = await shopDao.clearShops();
    console.log(clearResult.message);

    // 1. Test Shop Creation
    console.log('\n1. Testing Shop Creation:');
    const shopsToCreate = [
        {
            name: "Downtown Poke",
            address: "123 Main St",
            openingHours: {
                monday: "09:00-21:00",
                tuesday: "09:00-21:00",
                wednesday: "09:00-21:00",
                thursday: "09:00-21:00",
                friday: "09:00-22:00",
                saturday: "10:00-22:00",
                sunday: "10:00-20:00"
            }
        },
        {
            name: "Beach Poke",
            address: "456 Ocean Ave",
            openingHours: {
                monday: "10:00-20:00",
                tuesday: "10:00-20:00",
                wednesday: "10:00-20:00",
                thursday: "10:00-20:00",
                friday: "10:00-21:00",
                saturday: "11:00-21:00",
                sunday: "11:00-19:00"
            }
        }
    ];

    const createdShops = [];
    for (const shopData of shopsToCreate) {
        const result = await shopDao.addShop(shopData);
        if (result.success) {
            console.log('Added shop successfully:', result.shop);
            createdShops.push(result.shop);
        } else {
            console.error('Failed to add shop:', result.message);
        }
    }

    // 2. Test Shop Retrieval
    console.log('\n2. Testing Shop Retrieval:');
    const allShops = await shopDao.getAllShops();
    console.log('Total shops:', allShops.length);
    console.table(allShops);

    // 3. Test Shop Updates
    if (createdShops.length > 0) {
        console.log('\n3. Testing Shop Updates:');
        const updateResult = await shopDao.updateShop(createdShops[0].id, {
            name: "Downtown Poke Plus"
        });
        console.log('Update result:', updateResult.success ? 'Success' : 'Failed');
    }

    return createdShops;
}

async function runUserTests(userDao) {
    console.log('\n=== Starting User Tests ===\n');

    // Clear existing data
    const clearResult = await userDao.clearUsers();
    console.log(clearResult.message);

    // 1. Test User Creation
    console.log('\n1. Testing User Creation:');
    const usersToCreate = [
        {
            username: "john_doe",
            password: "password123",
            email: "john@example.com",
            fullName: "John Doe"
        },
        {
            username: "jane_smith",
            password: "password456",
            email: "jane@example.com",
            fullName: "Jane Smith"
        }
    ];

    const createdUsers = [];
    for (const userData of usersToCreate) {
        const result = await userDao.addUser(userData);
        if (result.success) {
            console.log('Added user successfully:', result.user);
            createdUsers.push(result.user);
        } else {
            console.error('Failed to add user:', result.message);
        }
    }

    // 2. Test User Retrieval
    console.log('\n2. Testing User Retrieval:');
    const allUsers = await userDao.getAllUsers();
    console.log('Total users:', allUsers.length);
    console.table(allUsers);

    // 3. Test User Updates
    if (createdUsers.length > 0) {
        console.log('\n3. Testing User Updates:');
        const updateResult = await userDao.updateUser(createdUsers[0].id, {
            email: "john.doe@example.com"
        });
        console.log('Update result:', updateResult.success ? 'Success' : 'Failed');
    }

    return createdUsers;
}

async function runOrderTests(orderDao, users, bowls) {
    console.log('\n=== Starting Order Tests ===\n');

    // Clear existing data
    const clearResult = await orderDao.clearOrders();
    console.log(clearResult.message);

    if (users.length === 0 || bowls.length === 0) {
        console.log('Skipping order tests: need users and bowls first');
        return [];
    }

    // 1. Test Order Creation
    console.log('\n1. Testing Order Creation:');
    const ordersToCreate = [
        {
            userId: users[0].id,
            bowls: bowls.slice(0, 2).map(b => b.id).join(','),
            totalPrice: 25.98
        },
        {
            userId: users[1].id,
            bowls: bowls.slice(-1).map(b => b.id).join(','),
            totalPrice: 15.99
        }
    ];

    const createdOrders = [];
    for (const orderData of ordersToCreate) {
        const result = await orderDao.addOrder(orderData);
        if (result.success) {
            console.log('Added order successfully:', result.order);
            createdOrders.push(result.order);
        } else {
            console.error('Failed to add order:', result.message);
        }
    }

    // 2. Test Order Retrieval
    console.log('\n2. Testing Order Retrieval:');
    const allOrders = await orderDao.getAllOrders();
    console.log('Total orders:', allOrders.length);
    console.table(allOrders);

    // 3. Test Order Status Updates
    if (createdOrders.length > 0) {
        console.log('\n3. Testing Order Status Updates:');
        const updateResult = await orderDao.updateOrderStatus(createdOrders[0].id, 'confirmed');
        console.log('Update result:', updateResult.success ? 'Success' : 'Failed');
    }

    return createdOrders;
}

async function runAllTests() {
    try {
        // Initialize all DAOs
        const bowlDao = new BowlDAO();
        const shopDao = new ShopDAO();
        const userDao = new UserDAO();
        const orderDao = new OrderDAO();

        // Run tests in sequence (some tests depend on others)
        const bowls = await runBowlTests(bowlDao);
        const shops = await runShopTests(shopDao);
        const users = await runUserTests(userDao);
        const orders = await runOrderTests(orderDao, users, bowls);

        console.log('\n=== All Tests Completed Successfully ===');
    } catch (error) {
        console.error('\nTest failed:', error.message);
        process.exit(1);
    }
}

// Run all tests
runAllTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
}); 