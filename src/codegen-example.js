/**
 * Example of how to use Playwright Codegen to generate scraping logic
 * 
 * To use this:
 * 1. Run: npm run codegen
 * 2. Navigate to the vendor website
 * 3. Interact with the page (click, scroll, wait for elements)
 * 4. Copy the generated code below
 * 5. Integrate into your scraper
 */

// Example of generated code from Playwright Codegen:
export async function exampleCodegenLogic(page) {
  // Navigate to the website
  await page.goto('https://example-vendor.com/gold-coins/sovereign');
  
  // Wait for cookie consent and accept
  await page.waitForSelector('#cookie-accept');
  await page.click('#cookie-accept');
  
  // Wait for product grid to load
  await page.waitForSelector('.product-grid');
  
  // Scroll to load more products (if lazy loading)
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  
  // Wait for additional products to load
  await page.waitForTimeout(2000);
  
  // Click on a product to see details (if needed)
  await page.click('.product-card:first-child');
  
  // Wait for product details to load
  await page.waitForSelector('.product-price');
  
  // Extract data
  const title = await page.textContent('.product-title');
  const price = await page.textContent('.product-price');
  
  console.log(`Title: ${title}, Price: ${price}`);
}

/**
 * Steps to integrate Codegen output into your scraper:
 * 
 * 1. Run codegen: npm run codegen
 * 2. Navigate to the vendor's sovereign page
 * 3. Accept cookies if needed
 * 4. Wait for products to load
 * 5. Scroll if needed for lazy loading
 * 6. Click on products to see details
 * 7. Copy the generated selectors and interactions
 * 8. Replace the example selectors in your scraper with the actual ones
 * 
 * Example integration:
 */

export async function scrapeExampleVendor(browser) {
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...',
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  const results = [];
  
  try {
    // Use the generated navigation logic
    await page.goto('https://example-vendor.com/gold-coins/sovereign');
    
    // Use the generated cookie handling
    await page.waitForSelector('#cookie-accept');
    await page.click('#cookie-accept');
    
    // Use the generated product grid waiting
    await page.waitForSelector('.product-grid');
    
    // Use the generated scrolling logic
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(2000);
    
    // Extract products using the generated selectors
    const productCards = await page.$$('.product-card');
    
    for (const card of productCards) {
      const title = await card.$('.product-title');
      const price = await card.$('.product-price');
      
      if (title && price) {
        const titleText = await title.textContent();
        const priceText = await price.textContent();
        
        results.push({
          title: titleText.trim(),
          price: extractPrice(priceText),
          url: await card.$eval('a', el => el.href),
          vendor: 'ExampleVendor'
        });
      }
    }
    
  } finally {
    await context.close();
  }
  
  return results;
}

function extractPrice(priceText) {
  // Your price extraction logic here
  const match = priceText.match(/£([\d.]+)/);
  return match ? parseFloat(match[1]) : null;
} 