import { chromium } from 'playwright';

/**
 * Simple test to verify Playwright is working
 */
async function simpleTest() {
  console.log('🧪 Running simple Playwright test...');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to a simple page
    await page.goto('https://example.com');
    
    // Get the title
    const title = await page.title();
    console.log(`✅ Successfully loaded page with title: "${title}"`);
    
    // Test price extraction function
    const testPrices = [
      '£625.10',
      'Price from £625.10',
      '£600 - £650',
      '£625.10 per coin',
      'Price: £625.10'
    ];
    
    console.log('\n💰 Testing price extraction:');
    testPrices.forEach(priceText => {
      const extracted = extractPrice(priceText);
      console.log(`"${priceText}" → ${extracted}`);
    });
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

/**
 * Extract price from text, handling bulk pricing
 * @param {string} priceText - Raw price text
 * @returns {number|null} Extracted price
 */
function extractPrice(priceText) {
  if (!priceText) return null;
  
  // Remove currency symbols and clean up
  const cleaned = priceText.replace(/[£$€,]/g, '').trim();
  
  // Handle "Price from £X" format
  const fromMatch = cleaned.match(/from\s*([\d.]+)/i);
  if (fromMatch) {
    return parseFloat(fromMatch[1]);
  }
  
  // Handle "£X - £Y" format (take highest)
  const rangeMatch = cleaned.match(/([\d.]+)\s*-\s*([\d.]+)/);
  if (rangeMatch) {
    const price1 = parseFloat(rangeMatch[1]);
    const price2 = parseFloat(rangeMatch[2]);
    return Math.max(price1, price2);
  }
  
  // Handle "£X per coin" format
  const perCoinMatch = cleaned.match(/([\d.]+)\s*per\s*coin/i);
  if (perCoinMatch) {
    return parseFloat(perCoinMatch[1]);
  }
  
  // Handle simple price
  const simpleMatch = cleaned.match(/([\d.]+)/);
  if (simpleMatch) {
    return parseFloat(simpleMatch[1]);
  }
  
  return null;
}

// Run the test
simpleTest()
  .then(() => {
    console.log('\n🎉 Simple test completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Simple test failed:', error);
    process.exit(1);
  }); 