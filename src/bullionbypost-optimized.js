import { chromium, firefox } from 'playwright';

/**
 * Optimized BullionByPost Custom Scraper (Testing Version)
 * 
 * Speed optimizations:
 * - Parallel product scraping (5 products at once)
 * - Shared browser instance
 * - Reduced delays and timeouts
 * - Batch processing
 * 
 * TESTING MODE: Limited to first 20 products
 * 
 * Usage:
 * node src/bullionbypost-optimized.js
 */

async function getProductUrlsFromPageOptimized(baseUrl) {
  console.log(`📄 Scanning page for "Buy" buttons: ${baseUrl}`);
  
  try {
    console.log('🔧 Launching browser...');
    let browser;
    try {
      // Try using system Chrome/Chromium
      browser = await chromium.launch({ 
        headless: true,
        executablePath: '/usr/bin/google-chrome-stable',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-software-rasterizer']
      });
      console.log('✅ System Chrome browser launched successfully');
    } catch (chromeError) {
      console.log('⚠️ System Chrome failed, trying Firefox...');
      try {
        browser = await firefox.launch({ 
          headless: true,
          executablePath: '/usr/bin/firefox'
        });
        console.log('✅ System Firefox browser launched successfully');
      } catch (firefoxError) {
        console.log('⚠️ System Firefox failed, trying Playwright Firefox...');
        try {
          browser = await firefox.launch({ 
            headless: true
          });
          console.log('✅ Playwright Firefox browser launched successfully');
        } catch (playwrightFirefoxError) {
          console.log('⚠️ Playwright Firefox failed, trying minimal Chromium...');
          browser = await chromium.launch({ 
            headless: true,
            args: ['--no-sandbox']
          });
          console.log('✅ Minimal Chromium browser launched successfully');
        }
      }
    }
    
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    await page.goto(baseUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    // Handle cookie consent banner
    try {
      console.log('🍪 Checking for cookie consent banner...');
      const acceptButton = await page.waitForSelector('#accept_all', { timeout: 5000 });
      if (acceptButton) {
        console.log('🍪 Found cookie banner, clicking "Accept All"...');
        await acceptButton.click();
        await page.waitForTimeout(2000); // Wait for banner to disappear
        console.log('✅ Cookie consent accepted');
      }
    } catch (cookieError) {
      console.log('ℹ️ No cookie banner found or already accepted');
    }
    
    const buyButtons = await page.evaluate(() => {
      const buttons = [];
      const buyLinks = document.querySelectorAll('a.btn.btn-success.btn-block.product-link');
      
      buyLinks.forEach((link) => {
        const href = link.href;
        const text = link.textContent.trim();
        const title = link.getAttribute('title');
        
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
    console.error(`❌ Error scanning page ${baseUrl}:`, error.message);
    return [];
  }
}

async function scrapeProductPageOptimized(productUrl, productInfo, browser) {
  try {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    await page.goto(productUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    // Handle cookie consent banner
    try {
      const acceptButton = await page.waitForSelector('#accept_all', { timeout: 3000 });
      if (acceptButton) {
        await acceptButton.click();
        await page.waitForTimeout(1000);
      }
    } catch (cookieError) {
      // Cookie banner not found, continue
    }
    
    await page.waitForTimeout(1000);
    
    const productData = await page.evaluate(() => {
      const data = {};
      
      const titleElement = document.querySelector('h1.page-title');
      if (titleElement) {
        data.title = titleElement.textContent.trim();
      }
      
      const priceElement = document.querySelector('strong.prod-price');
      if (priceElement) {
        data.price = priceElement.textContent.trim();
      }
      
      const stockElement = document.querySelector('span.text-success');
      if (stockElement) {
        data.stock = stockElement.textContent.trim();
      }
      
      return data;
    });
    
    await page.close();
    
    // Add metadata
    productData.url = productUrl;
    productData.timestamp = new Date().toISOString();
    productData.originalTitle = productInfo.title;
    productData.vendor = 'BullionByPost';
    
    return productData;
    
  } catch (error) {
    return {
      url: productUrl,
      title: productInfo.title,
      vendor: 'BullionByPost',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function scrapeBullionByPostOptimized() {
  console.log('🚀 Optimized BullionByPost Custom Scraper Starting...');
  console.log('⚡ TESTING MODE: Limited to first 20 products');
  console.log('');

  try {
    // Step 1: Get product URLs from both base URLs
    console.log('🔧 STEP 1: Scanning pages for "Buy" buttons...');
    
    const baseUrls = [
      'https://www.bullionbypost.co.uk/gold-coins/full-sovereign-gold-coin/',
      'https://www.bullionbypost.co.uk/gold-coins/full-sovereign-gold-coin/?&page=2'
    ];
    
    // Process both URLs in parallel
    const urlPromises = baseUrls.map(url => getProductUrlsFromPageOptimized(url));
    const urlResults = await Promise.all(urlPromises);
    
    let allProductUrls = [];
    urlResults.forEach(result => allProductUrls.push(...result));
    
    console.log(`✅ Step 1 complete! Found ${allProductUrls.length} products with "Buy" buttons`);
    
    if (allProductUrls.length === 0) {
      throw new Error('No products with "Buy" buttons found');
    }
    
    // PRODUCTION MODE: No limits
    const maxProducts = allProductUrls.length;
    
    // Show found products
    console.log('\n📋 Products found with "Buy" buttons:');
    allProductUrls.slice(0, 5).forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.title} (${product.url})`);
    });
    if (allProductUrls.length > 5) {
      console.log(`   ... and ${allProductUrls.length - 5} more products`);
    }
    
    console.log('');
    
    // Step 2: Scrape each product in parallel batches
    console.log('🔧 STEP 2: Scraping product details...');
    console.log('');
    
    const scrapedData = [];
    
    // Scrape limited products for testing
    const productsToScrape = allProductUrls;
    console.log(`📊 Will scrape ${productsToScrape.length} products in parallel batches`);
    
    // Create a shared browser instance for better performance
    let browser;
    try {
      // Try using system Chrome/Chromium
      browser = await chromium.launch({ 
        headless: true,
        executablePath: '/usr/bin/google-chrome-stable',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-software-rasterizer']
      });
      console.log('✅ System Chrome browser launched successfully');
    } catch (chromeError) {
      console.log('⚠️ System Chrome failed, trying Firefox...');
      try {
        browser = await firefox.launch({ 
          headless: true,
          executablePath: '/usr/bin/firefox'
        });
        console.log('✅ System Firefox browser launched successfully');
      } catch (firefoxError) {
        console.log('⚠️ System Firefox failed, trying Playwright Firefox...');
        try {
          browser = await firefox.launch({ 
            headless: true
          });
          console.log('✅ Playwright Firefox browser launched successfully');
        } catch (playwrightFirefoxError) {
          console.log('⚠️ Playwright Firefox failed, trying minimal Chromium...');
          browser = await chromium.launch({ 
            headless: true,
            args: ['--no-sandbox']
          });
          console.log('✅ Minimal Chromium browser launched successfully');
        }
      }
    }
    
    // Process products in parallel batches of 5
    const batchSize = 5;
    
    for (let i = 0; i < productsToScrape.length; i += batchSize) {
      const batch = productsToScrape.slice(i, i + batchSize);
      const batchNumber = Math.floor(i/batchSize) + 1;
      const totalBatches = Math.ceil(productsToScrape.length/batchSize);
      
      console.log(`\n🔍 Scraping batch ${batchNumber}/${totalBatches}: ${batch.length} products`);
      
      const batchPromises = batch.map((product, index) => 
        scrapeProductPageOptimized(product.url, product, browser)
      );
      
      const batchResults = await Promise.all(batchPromises);
      
      // Add IDs to batch results
      batchResults.forEach((product, index) => {
        product.id = i + index + 1;
        scrapedData.push(product);
      });
      
      const successfulCount = batchResults.filter(p => p.title && !p.error).length;
      console.log(`✅ Batch ${batchNumber} complete: ${successfulCount}/${batch.length} successful`);
      
      // Show sample results from this batch
      const successfulProducts = batchResults.filter(p => p.title && !p.error).slice(0, 3);
      successfulProducts.forEach((product, index) => {
        console.log(`   ${i + index + 1}. ${product.title} - ${product.price || 'Price not available'}`);
      });
      
      // Small delay between batches
      if (i + batchSize < productsToScrape.length) {
        console.log('⏳ Waiting 500ms between batches...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    await browser.close();
    
    console.log('\n📊 Final Scraped Data Summary:');
    console.log('===============================');
    console.log(`Total products scraped: ${scrapedData.length}`);
    console.log(`Successful scrapes: ${scrapedData.filter(p => p.title && !p.error).length}`);
    console.log(`Failed scrapes: ${scrapedData.filter(p => p.error).length}`);
    
    // Show first 5 successful results as sample
    const successfulProducts = scrapedData.filter(p => p.title && !p.error).slice(0, 5);
    console.log('\n📋 Sample Results:');
    successfulProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.title}`);
      console.log(`   Vendor: ${product.vendor}`);
      console.log(`   Price: ${product.price || 'Not available'}`);
      console.log(`   Stock: ${product.stock || 'Not available'}`);
    });
    
    console.log(`\n✅ Successfully scraped ${scrapedData.length} BullionByPost products (TESTING MODE)`);
    
    console.log('\n🎉 Optimized BullionByPost scraper completed!');
    console.log('');
    console.log('💡 Speed optimizations:');
    console.log('   ✅ Parallel URL collection');
    console.log('   ✅ Parallel product scraping (5 products at once)');
    console.log('   ✅ Shared browser instance');
    console.log('   ✅ Reduced timeouts and delays');
    console.log('   ✅ Batch processing for efficiency');
    console.log('   ✅ Testing mode with limited scope');
    console.log('');
    
    return scrapedData;
    
  } catch (error) {
    console.error('❌ Error in optimized BullionByPost scraper:', error.message);
    throw error;
  }
}

export { scrapeBullionByPostOptimized }; 