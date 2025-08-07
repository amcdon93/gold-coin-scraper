import { chromium } from 'playwright';

/**
 * BullionByPost Two-Step Scraper
 * 
 * Step 1: Get all product URLs from main page (quick)
 * Step 2: Scrape each product individually (separate sessions)
 * 
 * This avoids Cloudflare detection by minimizing time on main page
 * and using separate sessions for each product.
 * 
 * Usage:
 * node src/bullionbypost-two-step.js
 */

async function getProductUrls() {
  console.log('🚀 Step 1: Getting all product URLs from main page...');
  console.log('📝 This will be quick to avoid Cloudflare detection');
  console.log('');

  try {
    console.log('🔧 Launching browser for URL collection...');
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    console.log('🔧 Navigating to main page...');
    console.log('🌐 Target: https://www.bullionbypost.co.uk/gold-coins/full-sovereign-gold-coin/');
    
    // Quick navigation with minimal wait
    await page.goto('https://www.bullionbypost.co.uk/gold-coins/full-sovereign-gold-coin/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('✅ Successfully loaded main page');
    
    // Get all product URLs quickly
    const productUrls = await page.evaluate(() => {
      const urls = [];
      
      // Look for all links that might be products
      const allLinks = document.querySelectorAll('a[href*="/gold-coins/"]');
      
      allLinks.forEach((link) => {
        const href = link.href;
        const text = link.textContent.trim();
        
        // Filter for actual product links (not navigation)
        if (href && 
            href.includes('/gold-coins/') && 
            text.length > 0 &&
            !text.includes('Gold Coins') && // Avoid navigation
            !text.includes('Best value') && // Avoid navigation
            !text.includes('CGT Free')) { // Avoid navigation
          
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
    
    // Show first few URLs
    if (productUrls.length > 0) {
      console.log('📋 Sample URLs found:');
      productUrls.slice(0, 5).forEach((url, index) => {
        console.log(`   ${index + 1}. ${url.text} (${url.url})`);
      });
      
      if (productUrls.length > 5) {
        console.log(`   ... and ${productUrls.length - 5} more`);
      }
    }
    
    await browser.close();
    console.log('✅ Browser closed, URLs collected');
    
    return productUrls;
    
  } catch (error) {
    console.error('❌ Error getting product URLs:', error.message);
    throw error;
  }
}

async function scrapeProductPage(productUrl, productInfo) {
  console.log(`🔍 Scraping: ${productInfo.text}`);
  
  try {
    // Create a NEW browser session for each product
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    // Navigate to individual product page
    await page.goto(productUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Wait a bit for page to load
    await page.waitForTimeout(2000);
    
    // Extract product data
    const productData = await page.evaluate(() => {
      const data = {};
      
      // Extract title
      const titleSelectors = [
        'h1',
        '.product-title',
        '.product-name',
        '[class*="title"]',
        '[class*="name"]'
      ];
      
      for (const selector of titleSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          data.title = element.textContent.trim();
          break;
        }
      }
      
      // Extract price
      const priceSelectors = [
        '.price',
        '.product-price',
        '[class*="price"]',
        'span[class*="price"]',
        'div[class*="price"]'
      ];
      
      for (const selector of priceSelectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          const text = element.textContent.trim();
          if (text && text.includes('£')) {
            data.price = text;
            break;
          }
        }
        if (data.price) break;
      }
      
      // Extract weight
      const weightSelectors = [
        '[class*="weight"]',
        '[class*="size"]',
        'span',
        'div'
      ];
      
      for (const selector of weightSelectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          const text = element.textContent.trim();
          if (text && (text.includes('g') || text.includes('oz'))) {
            data.weight = text;
            break;
          }
        }
        if (data.weight) break;
      }
      
      // Extract purity
      const puritySelectors = [
        '[class*="purity"]',
        '[class*="karat"]',
        'span',
        'div'
      ];
      
      for (const selector of puritySelectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          const text = element.textContent.trim();
          if (text && (text.includes('%') || text.includes('k'))) {
            data.purity = text;
            break;
          }
        }
        if (data.purity) break;
      }
      
      // Extract description
      const descSelectors = [
        '.product-description',
        '.description',
        '[class*="description"]',
        '.product-details'
      ];
      
      for (const selector of descSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          data.description = element.textContent.trim();
          break;
        }
      }
      
      // Extract availability
      const availabilitySelectors = [
        '.availability',
        '.stock',
        '[class*="stock"]',
        '[class*="availability"]'
      ];
      
      for (const selector of availabilitySelectors) {
        const element = document.querySelector(selector);
        if (element) {
          data.availability = element.textContent.trim();
          break;
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
    console.log(`   Price: ${productData.price || 'No price'}`);
    console.log(`   Weight: ${productData.weight || 'No weight'}`);
    console.log(`   Purity: ${productData.purity || 'No purity'}`);
    
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

async function scrapeBullionByPostTwoStep() {
  console.log('🚀 BullionByPost Two-Step Scraper Starting...');
  console.log('📝 Step 1: Get URLs, Step 2: Scrape individually');
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
    console.log('🔧 STEP 2: Scraping each product individually...');
    console.log('📝 This will create separate browser sessions for each product');
    console.log('');
    
    const scrapedData = [];
    
    // Limit to first 5 products for testing
    const productsToScrape = productUrls.slice(0, 5);
    console.log(`📊 Will scrape ${productsToScrape.length} products (limited for testing)`);
    
    for (let i = 0; i < productsToScrape.length; i++) {
      const product = productsToScrape[i];
      console.log(`\n🔍 Scraping product ${i + 1}/${productsToScrape.length}: ${product.text}`);
      
      // Add delay between requests to avoid detection
      if (i > 0) {
        console.log('⏳ Waiting 3 seconds between requests...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      const productData = await scrapeProductPage(product.url, product);
      productData.id = i + 1;
      
      scrapedData.push(productData);
    }
    
    console.log('\n📊 Final Scraped Data:');
    console.log('=======================');
    
    scrapedData.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.title || product.originalText || 'No title'}`);
      console.log(`   URL: ${product.url}`);
      console.log(`   Price: ${product.price || 'No price'}`);
      console.log(`   Weight: ${product.weight || 'No weight'}`);
      console.log(`   Purity: ${product.purity || 'No purity'}`);
      console.log(`   Availability: ${product.availability || 'No availability'}`);
      if (product.error) {
        console.log(`   Error: ${product.error}`);
      }
    });
    
    console.log(`\n✅ Successfully scraped ${scrapedData.length} products`);
    
    console.log('\n🎉 Two-Step BullionByPost scraper completed!');
    console.log('');
    console.log('💡 Benefits of this approach:');
    console.log('   ✅ Minimizes time on main page (reduces Cloudflare risk)');
    console.log('   ✅ Uses separate browser sessions for each product');
    console.log('   ✅ Avoids repeated navigation that triggers detection');
    console.log('   ✅ More reliable for Cloudflare-protected sites');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Customize selectors for better data extraction');
    console.log('   2. Deploy to Railway for automated scraping');
    console.log('   3. Set up database to store the data');
    console.log('');
    
    return scrapedData;
    
  } catch (error) {
    console.error('❌ Error in two-step BullionByPost scraper:', error.message);
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('   1. Check your internet connection');
    console.log('   2. Check if BullionByPost is accessible');
    console.log('   3. Try running with different selectors');
    console.log('   4. The site might be blocking automated access');
    throw error;
  }
}

// Run the scraper
scrapeBullionByPostTwoStep().catch(console.error);

export { scrapeBullionByPostTwoStep }; 