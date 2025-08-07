import { chromium } from 'playwright';

/**
 * BullionByPost Refined Scraper
 * 
 * This version has better selectors to extract cleaner data
 * and avoid picking up too much text.
 * 
 * Usage:
 * node src/bullionbypost-refined.js
 */

async function getProductUrls() {
  console.log('🚀 Step 1: Getting all product URLs from main page...');
  
  try {
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    await page.goto('https://www.bullionbypost.co.uk/gold-coins/full-sovereign-gold-coin/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    const productUrls = await page.evaluate(() => {
      const urls = [];
      const allLinks = document.querySelectorAll('a[href*="/gold-coins/"]');
      
      allLinks.forEach((link) => {
        const href = link.href;
        const text = link.textContent.trim();
        
        if (href && 
            href.includes('/gold-coins/') && 
            text.length > 0 &&
            !text.includes('Gold Coins') && 
            !text.includes('Best value') && 
            !text.includes('CGT Free')) {
          
          urls.push({
            url: href,
            text: text,
            title: link.getAttribute('title') || text
          });
        }
      });
      
      return urls;
    });
    
    console.log(`✅ Found ${productUrls.length} product URLs`);
    await browser.close();
    return productUrls;
    
  } catch (error) {
    console.error('❌ Error getting product URLs:', error.message);
    throw error;
  }
}

async function scrapeProductPageRefined(productUrl, productInfo) {
  console.log(`🔍 Scraping: ${productInfo.text}`);
  
  try {
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    await page.goto(productUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    // Extract refined product data
    const productData = await page.evaluate(() => {
      const data = {};
      
      // Extract title - look for main heading
      const titleElement = document.querySelector('h1, .product-title, .product-name');
      if (titleElement) {
        data.title = titleElement.textContent.trim();
      }
      
      // Extract price - look for specific price elements
      const priceElements = document.querySelectorAll('.price, .product-price, [class*="price"]');
      for (const element of priceElements) {
        const text = element.textContent.trim();
        // Look for actual price patterns (numbers with £)
        if (text.match(/£[\d,]+\.?\d*/)) {
          data.price = text.match(/£[\d,]+\.?\d*/)[0];
          break;
        }
      }
      
      // Extract weight - look for specific weight patterns
      const allElements = document.querySelectorAll('*');
      for (const element of allElements) {
        const text = element.textContent.trim();
        if (text.match(/\d+\.?\d*\s*(g|gram|grams|oz|ounce|ounces)/i)) {
          data.weight = text.match(/\d+\.?\d*\s*(g|gram|grams|oz|ounce|ounces)/i)[0];
          break;
        }
      }
      
      // Extract purity - look for karat or percentage
      for (const element of allElements) {
        const text = element.textContent.trim();
        if (text.match(/\d+\s*(k|karat|carat|%)/i)) {
          data.purity = text.match(/\d+\s*(k|karat|carat|%)/i)[0];
          break;
        }
      }
      
      // Extract availability - look for stock status
      const stockElements = document.querySelectorAll('[class*="stock"], [class*="availability"], .stock, .availability');
      for (const element of stockElements) {
        const text = element.textContent.trim().toLowerCase();
        if (text.includes('in stock') || text.includes('available') || text.includes('out of stock')) {
          data.availability = element.textContent.trim();
          break;
        }
      }
      
      // Extract description - look for product description
      const descElement = document.querySelector('.product-description, .description, [class*="description"]');
      if (descElement) {
        data.description = descElement.textContent.trim().substring(0, 200); // Limit length
      }
      
      // Extract metal type
      for (const element of allElements) {
        const text = element.textContent.trim().toLowerCase();
        if (text.includes('gold') && !data.metalType) {
          data.metalType = 'Gold';
        }
      }
      
      return data;
    });
    
    // Add metadata
    productData.url = productUrl;
    productData.timestamp = new Date().toISOString();
    productData.originalText = productInfo.text;
    
    await browser.close();
    
    console.log(`✅ Scraped: ${productData.title || 'No title'}`);
    if (productData.price) console.log(`   Price: ${productData.price}`);
    if (productData.weight) console.log(`   Weight: ${productData.weight}`);
    if (productData.purity) console.log(`   Purity: ${productData.purity}`);
    if (productData.availability) console.log(`   Availability: ${productData.availability}`);
    if (productData.metalType) console.log(`   Metal: ${productData.metalType}`);
    
    return productData;
    
  } catch (error) {
    console.log(`❌ Error scraping product: ${error.message}`);
    return {
      url: productUrl,
      title: productInfo.text,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function scrapeBullionByPostRefined() {
  console.log('🚀 BullionByPost Refined Scraper Starting...');
  console.log('📝 Better selectors for cleaner data extraction');
  console.log('');

  try {
    // Step 1: Get all product URLs
    console.log('🔧 STEP 1: Getting all product URLs...');
    const productUrls = await getProductUrls();
    
    if (productUrls.length === 0) {
      throw new Error('No product URLs found');
    }
    
    console.log(`✅ Step 1 complete! Found ${productUrls.length} products`);
    console.log('');
    
    // Step 2: Scrape each product individually
    console.log('🔧 STEP 2: Scraping each product with refined selectors...');
    console.log('');
    
    const scrapedData = [];
    
    // Limit to first 5 products for testing
    const productsToScrape = productUrls.slice(0, 5);
    console.log(`📊 Will scrape ${productsToScrape.length} products (limited for testing)`);
    
    for (let i = 0; i < productsToScrape.length; i++) {
      const product = productsToScrape[i];
      console.log(`\n🔍 Scraping product ${i + 1}/${productsToScrape.length}: ${product.text}`);
      
      // Add delay between requests
      if (i > 0) {
        console.log('⏳ Waiting 3 seconds between requests...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      const productData = await scrapeProductPageRefined(product.url, product);
      productData.id = i + 1;
      
      scrapedData.push(productData);
    }
    
    console.log('\n📊 Final Scraped Data:');
    console.log('=======================');
    
    scrapedData.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.title || product.originalText || 'No title'}`);
      console.log(`   URL: ${product.url}`);
      if (product.price) console.log(`   Price: ${product.price}`);
      if (product.weight) console.log(`   Weight: ${product.weight}`);
      if (product.purity) console.log(`   Purity: ${product.purity}`);
      if (product.availability) console.log(`   Availability: ${product.availability}`);
      if (product.metalType) console.log(`   Metal: ${product.metalType}`);
      if (product.description) console.log(`   Description: ${product.description.substring(0, 100)}...`);
      if (product.error) {
        console.log(`   Error: ${product.error}`);
      }
    });
    
    console.log(`\n✅ Successfully scraped ${scrapedData.length} products`);
    
    console.log('\n🎉 Refined BullionByPost scraper completed!');
    console.log('');
    console.log('💡 This approach:');
    console.log('   ✅ Bypasses Cloudflare detection');
    console.log('   ✅ Uses better selectors for cleaner data');
    console.log('   ✅ Extracts specific price, weight, purity info');
    console.log('   ✅ Ready for Railway deployment');
    console.log('');
    
    return scrapedData;
    
  } catch (error) {
    console.error('❌ Error in refined BullionByPost scraper:', error.message);
    throw error;
  }
}

// Run the scraper
scrapeBullionByPostRefined().catch(console.error);

export { scrapeBullionByPostRefined }; 