import { chromium } from 'playwright';

/**
 * BullionByPost Custom Scraper
 * 
 * This version uses specific selectors provided by the user:
 * - Title: <h1 class="page-title">
 * - Stock: <span class="text-success">In Stock</span>
 * - Price: <strong class="prod-price">
 * 
 * Only scrapes products with "Buy" buttons from two specific base URLs.
 * 
 * Usage:
 * node src/bullionbypost-custom.js
 */

async function getProductUrlsFromPage(baseUrl) {
  console.log(`🔍 Getting product URLs from: ${baseUrl}`);
  
  try {
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    await page.goto(baseUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Get all "Buy" buttons (only products in stock)
    const buyButtons = await page.evaluate(() => {
      const buttons = [];
      const buyLinks = document.querySelectorAll('a.btn.btn-success.btn-block.product-link');
      
      buyLinks.forEach((link) => {
        const href = link.href;
        const text = link.textContent.trim();
        const title = link.getAttribute('title');
        
        // Only include if button text is "Buy"
        if (text === 'Buy' && href) {
          buttons.push({
            url: href,
            text: text,
            title: title || 'Buy Product'
          });
        }
      });
      
      return buttons;
    });
    
    console.log(`✅ Found ${buyButtons.length} "Buy" buttons on this page`);
    await browser.close();
    return buyButtons;
    
  } catch (error) {
    console.error(`❌ Error getting product URLs from ${baseUrl}:`, error.message);
    return [];
  }
}

async function scrapeProductPageCustom(productUrl, productInfo) {
  console.log(`🔍 Scraping: ${productInfo.title || productInfo.text}`);
  
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
    
    // Extract data using specific selectors
    const productData = await page.evaluate(() => {
      const data = {};
      
      // Extract title - <h1 class="page-title">
      const titleElement = document.querySelector('h1.page-title');
      if (titleElement) {
        data.title = titleElement.textContent.trim();
      }
      
      // Extract price - <strong class="prod-price">
      const priceElement = document.querySelector('strong.prod-price');
      if (priceElement) {
        data.price = priceElement.textContent.trim();
      }
      
      // Extract stock status - <span class="text-success">In Stock</span>
      const stockElement = document.querySelector('span.text-success');
      if (stockElement) {
        data.stock = stockElement.textContent.trim();
      }
      
      return data;
    });
    
    // Add metadata
    productData.url = productUrl;
    productData.timestamp = new Date().toISOString();
    productData.originalTitle = productInfo.title;
    
    await browser.close();
    
    console.log(`✅ Scraped: ${productData.title || 'No title'}`);
    if (productData.price) console.log(`   Price: ${productData.price}`);
    if (productData.stock) console.log(`   Stock: ${productData.stock}`);
    
    return productData;
    
  } catch (error) {
    console.log(`❌ Error scraping product: ${error.message}`);
    return {
      url: productUrl,
      title: productInfo.title,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function scrapeBullionByPostCustom() {
  console.log('🚀 BullionByPost Custom Scraper Starting...');
  console.log('📝 Using specific selectors for title, price, and stock status');
  console.log('');

  try {
    // Step 1: Get product URLs from both base URLs
    console.log('🔧 STEP 1: Getting product URLs from both base pages...');
    
    const baseUrls = [
      'https://www.bullionbypost.co.uk/gold-coins/full-sovereign-gold-coin/',
      'https://www.bullionbypost.co.uk/gold-coins/full-sovereign-gold-coin/?&page=2'
    ];
    
    let allProductUrls = [];
    
    for (const baseUrl of baseUrls) {
      const productUrls = await getProductUrlsFromPage(baseUrl);
      allProductUrls.push(...productUrls);
    }
    
    console.log(`✅ Step 1 complete! Found ${allProductUrls.length} products with "Buy" buttons`);
    
    if (allProductUrls.length === 0) {
      throw new Error('No products with "Buy" buttons found');
    }
    
    // Show found products
    console.log('\n📋 Products found with "Buy" buttons:');
    allProductUrls.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.title} (${product.url})`);
    });
    
    console.log('');
    
    // Step 2: Scrape each product individually
    console.log('🔧 STEP 2: Scraping each product with custom selectors...');
    console.log('');
    
    const scrapedData = [];
    
    // Scrape ALL products (not limited)
    const productsToScrape = allProductUrls;
    console.log(`📊 Will scrape ALL ${productsToScrape.length} products`);
    
    for (let i = 0; i < productsToScrape.length; i++) {
      const product = productsToScrape[i];
      console.log(`\n🔍 Scraping product ${i + 1}/${productsToScrape.length}: ${product.title}`);
      
      // Add delay between requests
      if (i > 0) {
        console.log('⏳ Waiting 3 seconds between requests...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      const productData = await scrapeProductPageCustom(product.url, product);
      productData.id = i + 1;
      
      scrapedData.push(productData);
    }
    
    console.log('\n📊 Final Scraped Data:');
    console.log('=======================');
    
    scrapedData.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.title || 'No title'}`);
      console.log(`   URL: ${product.url}`);
      if (product.price) console.log(`   Price: ${product.price}`);
      if (product.stock) console.log(`   Stock: ${product.stock}`);
      if (product.error) {
        console.log(`   Error: ${product.error}`);
      }
    });
    
    console.log(`\n✅ Successfully scraped ${scrapedData.length} products`);
    
    console.log('\n🎉 Custom BullionByPost scraper completed!');
    console.log('');
    console.log('💡 This approach:');
    console.log('   ✅ Only scrapes products with "Buy" buttons (in stock)');
    console.log('   ✅ Uses specific selectors for clean data');
    console.log('   ✅ Only gets title, price, and stock status');
    console.log('   ✅ Ready for Railway deployment');
    console.log('');
    
    return scrapedData;
    
  } catch (error) {
    console.error('❌ Error in custom BullionByPost scraper:', error.message);
    throw error;
  }
}

export { scrapeBullionByPostCustom }; 