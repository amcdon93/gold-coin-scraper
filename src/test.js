import { scrapeAllVendors, scrapeVendor } from './index.js';

/**
 * Test the scraping functionality
 */
async function testScrapers() {
  console.log('🧪 Testing Gold Coin Scrapers...\n');
  
  try {
    // Test individual vendors
    console.log('Testing BullionByPost scraper...');
    const bullionResults = await scrapeVendor('bullionbypost');
    console.log(`✅ BullionByPost: Found ${bullionResults.length} products`);
    
    if (bullionResults.length > 0) {
      console.log('Sample BullionByPost product:', bullionResults[0]);
    }
    
    console.log('\nTesting Chards scraper...');
    const chardsResults = await scrapeVendor('chards');
    console.log(`✅ Chards: Found ${chardsResults.length} products`);
    
    if (chardsResults.length > 0) {
      console.log('Sample Chards product:', chardsResults[0]);
    }
    
    // Test all vendors
    console.log('\nTesting all vendors...');
    const allResults = await scrapeAllVendors();
    console.log(`✅ Total products found: ${allResults.length}`);
    
    // Validate results
    console.log('\n📊 Validation Results:');
    console.log(`- Total products: ${allResults.length}`);
    console.log(`- Products with prices: ${allResults.filter(p => p.price).length}`);
    console.log(`- Products with URLs: ${allResults.filter(p => p.url).length}`);
    console.log(`- Unique vendors: ${new Set(allResults.map(p => p.vendor)).size}`);
    
    // Show sample results
    if (allResults.length > 0) {
      console.log('\n📋 Sample Results:');
      allResults.slice(0, 5).forEach((product, index) => {
        console.log(`${index + 1}. ${product.title} - £${product.price} (${product.vendor})`);
      });
    }
    
    return allResults;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testScrapers()
    .then(() => {
      console.log('\n✅ All tests completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Tests failed:', error);
      process.exit(1);
    });
} 