import { scrapeChardsOptimized } from './chards-scraper-optimized.js';

/**
 * Test the optimized Chards scraper
 * This will verify that the redundant processing has been eliminated
 */

console.log('🧪 Testing Optimized Chards Scraper...');
console.log('This should show only:');
console.log('1. Parallel page discovery');
console.log('2. Direct product scraping');
console.log('3. NO redundant sequential page processing');
console.log('');

// Run the test
scrapeChardsOptimized()
  .then(results => {
    console.log('\n✅ Test completed successfully!');
    console.log(`📊 Total products scraped: ${results.length}`);
    console.log(`✅ Successful scrapes: ${results.filter(p => p.title && !p.error).length}`);
    console.log(`❌ Failed scrapes: ${results.filter(p => p.error).length}`);
  })
  .catch(error => {
    console.error('❌ Test failed:', error.message);
  }); 