import { initDatabase, closeDatabase } from './database/connection.js';
import { saveProducts, getAllProducts, searchProducts, getProductCount } from './database/operations.js';

async function testDatabase() {
  console.log('🧪 Testing database functionality...\n');
  
  try {
    // Initialize database
    await initDatabase();
    console.log('✅ Database initialized successfully');
    
    // Test data
    const testProducts = [
      {
        title: 'Test Sovereign Gold Coin 2024',
        price: '£350.00',
        stock: 'In Stock',
        url: 'https://example.com/test1',
        vendor: 'BullionByPost',
        timestamp: new Date().toISOString(),
        originalTitle: 'Test Sovereign',
        pageNumber: 1
      },
      {
        title: 'Test Chards Gold Sovereign',
        price: '£345.00',
        stock: 'In Stock',
        url: 'https://example.com/test2',
        vendor: 'Chards',
        timestamp: new Date().toISOString(),
        originalTitle: 'Test Chards Sovereign',
        pageNumber: 1
      }
    ];
    
    // Test saving products
    console.log('\n📝 Testing product saving...');
    const savedCount = await saveProducts(testProducts);
    console.log(`✅ Saved ${savedCount} products to database`);
    
    // Test getting all products
    console.log('\n📊 Testing product retrieval...');
    const allProducts = await getAllProducts();
    console.log(`✅ Retrieved ${allProducts.length} products from database`);
    
    // Test product count
    console.log('\n🔢 Testing product count...');
    const count = await getProductCount();
    console.log(`✅ Total products in database: ${count}`);
    
    // Test search functionality
    console.log('\n🔍 Testing search functionality...');
    const searchResults = await searchProducts({ vendor: 'BullionByPost' });
    console.log(`✅ Found ${searchResults.length} BullionByPost products`);
    
    const priceResults = await searchProducts({ minPrice: '300', maxPrice: '400' });
    console.log(`✅ Found ${priceResults.length} products in price range £300-£400`);
    
    // Display sample data
    console.log('\n📋 Sample data from database:');
    allProducts.slice(0, 3).forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.title}`);
      console.log(`   Vendor: ${product.vendor}`);
      console.log(`   Price: ${product.price}`);
      console.log(`   Stock: ${product.stock}`);
      console.log(`   URL: ${product.url}`);
    });
    
    console.log('\n🎉 All database tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await closeDatabase();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testDatabase().catch(console.error); 