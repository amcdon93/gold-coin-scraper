import { chromium } from 'playwright';

/**
 * Optimized Chards Gold Sovereign Scraper (Testing Version)
 * 
 * Speed optimizations:
 * - Parallel page processing (5 pages at once)
 * - Parallel product scraping (10 products at once)
 * - Connection pooling with browser reuse
 * - Reduced delays and timeouts
 * - Batch processing
 * - Eliminated redundant sequential processing
 * 
 * TESTING MODE: Limited to first 5 pages and max 50 products
 * 
 * Usage:
 * node src/chards-scraper-optimized.js
 */

async function handleCookieConsent(page) {
  try {
    const cookieButton = await page.waitForSelector('button.cky-btn.cky-btn-accept', { 
      timeout: 3000 
    });
    
    if (cookieButton) {
      await cookieButton.click();
      await page.waitForTimeout(500);
    }
  } catch (error) {
    // Cookie consent not found, continue
  }
}

async function getProductUrlsFromPageParallel(baseUrl, pageNumber = 1) {
  console.log(`📄 Scanning page ${pageNumber} for in-stock products...`);
  
  try {
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    await page.goto(baseUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    await handleCookieConsent(page);
    await page.waitForTimeout(1000);
    
    const productLinks = await page.evaluate((pageNumber) => {
      const links = [];
      const productElements = document.querySelectorAll('a[href*="/"][title]');
      
      productElements.forEach((link) => {
        const href = link.href;
        const title = link.getAttribute('title') || link.textContent.trim();
        
        const stockElement = link.closest('div')?.querySelector('p.tw-text-xs.tw-font-regular.tw-font-sans.tw-text-tw-text-chards-purple');
        const isInStock = stockElement && stockElement.textContent.trim() === 'In Stock';
        
        if (isInStock && href && title) {
          links.push({
            url: href,
            title: title,
            pageNumber: pageNumber
          });
        }
      });
      
      return links;
    }, pageNumber);
    
    await browser.close();
    console.log(`✅ Found ${productLinks.length} in-stock products on page ${pageNumber}`);
    return productLinks;
    
  } catch (error) {
    console.error(`❌ Error scanning page ${pageNumber}:`, error.message);
    return [];
  }
}

async function scrapeProductPageChardsOptimized(productUrl, productInfo, browser) {
  try {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    await page.goto(productUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    await handleCookieConsent(page);
    await page.waitForTimeout(1000);
    
    const productData = await page.evaluate(() => {
      const data = {};
      
      // Get title
      const titleElement = document.querySelector('h1');
      if (titleElement) {
        data.title = titleElement.textContent.trim();
      }
      
      // Get price
      const priceElement = document.querySelector('p.tw-text-\\[2rem\\]');
      if (priceElement) {
        data.price = priceElement.textContent.trim();
      }
      
      // Get stock status
      const stockElement = document.querySelector('p.tw-text-xs.tw-font-regular.tw-font-sans.tw-text-tw-text-chards-purple');
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
    productData.vendor = 'Chards';
    productData.pageNumber = productInfo.pageNumber;
    
    return productData;
    
  } catch (error) {
    return {
      url: productUrl,
      title: productInfo.title,
      vendor: 'Chards',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function scrapeChardsOptimized() {
  console.log('🚀 Optimized Chards Gold Sovereign Scraper Starting...');
  console.log('⚡ PRODUCTION MODE: Full scraping enabled');
  console.log('');

  try {
    // Step 1: Get product URLs from limited pages in parallel batches
    console.log('🔧 STEP 1: Scanning pages for in-stock products...');
    
    const baseUrl = 'https://www.chards.co.uk/category/buy-coins/a/gold/sovereign';
    let allProductUrls = [];
    
    // PRODUCTION MODE: Process all 23 pages
    const totalPages = 23; // Full scraping
    const batchSize = 5;
    
    for (let batchStart = 1; batchStart <= totalPages; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize - 1, totalPages);
      console.log(`📄 Scanning pages ${batchStart}-${batchEnd} in parallel...`);
      
      const batchPromises = [];
      for (let pageNum = batchStart; pageNum <= batchEnd; pageNum++) {
        const pageUrl = pageNum === 1 ? baseUrl : `${baseUrl}?page=${pageNum}`;
        batchPromises.push(getProductUrlsFromPageParallel(pageUrl, pageNum));
      }
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(result => allProductUrls.push(...result));
      
      // Small delay between batches to be respectful
      if (batchEnd < totalPages) {
        console.log('⏳ Waiting 1 second between batches...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`✅ Step 1 complete! Found ${allProductUrls.length} in-stock products across ${totalPages} pages`);
    
    if (allProductUrls.length === 0) {
      throw new Error('No in-stock products found');
    }
    
    // PRODUCTION MODE: No limits
    const maxProducts = allProductUrls.length;
    
    // Show found products summary
    console.log('\n📋 Products found by page:');
    const pageCounts = {};
    allProductUrls.forEach(product => {
      pageCounts[product.pageNumber] = (pageCounts[product.pageNumber] || 0) + 1;
    });
    
    Object.keys(pageCounts).sort((a, b) => parseInt(a) - parseInt(b)).forEach(pageNum => {
      console.log(`   Page ${pageNum}: ${pageCounts[pageNum]} products`);
    });
    
    console.log('');
    
    // Step 2: Scrape products in parallel batches
    console.log('🔧 STEP 2: Scraping product details...');
    console.log('');
    
    const scrapedData = [];
    
    // Scrape limited products for testing
    const productsToScrape = allProductUrls;
    console.log(`📊 Will scrape ${productsToScrape.length} products in parallel batches`);
    
    // Create a shared browser instance for better performance
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    // Process products in parallel batches of 10
    const productBatchSize = 10;
    
    for (let i = 0; i < productsToScrape.length; i += productBatchSize) {
      const batch = productsToScrape.slice(i, i + productBatchSize);
      const batchNumber = Math.floor(i/productBatchSize) + 1;
      const totalBatches = Math.ceil(productsToScrape.length/productBatchSize);
      
      console.log(`\n🔍 Scraping batch ${batchNumber}/${totalBatches}: ${batch.length} products`);
      
      const batchPromises = batch.map((product, index) => 
        scrapeProductPageChardsOptimized(product.url, product, browser)
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
      if (i + productBatchSize < productsToScrape.length) {
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
      console.log(`   Page: ${product.pageNumber}`);
      console.log(`   Price: ${product.price || 'Not available'}`);
      console.log(`   Stock: ${product.stock || 'Not available'}`);
    });
    
    console.log(`\n✅ Successfully scraped ${scrapedData.length} Chards products (TESTING MODE)`);
    
    console.log('\n🎉 Optimized Chards scraper completed!');
    console.log('');
    console.log('💡 Speed optimizations:');
    console.log('   ✅ Parallel page scanning (5 pages at once)');
    console.log('   ✅ Parallel product scraping (10 products at once)');
    console.log('   ✅ Shared browser instance');
    console.log('   ✅ Reduced timeouts and delays');
    console.log('   ✅ Batch processing for efficiency');
    console.log('   ✅ Testing mode with limited scope');
    console.log('');
    
    return scrapedData;
    
  } catch (error) {
    console.error('❌ Error in optimized Chards scraper:', error.message);
    throw error;
  }
}

export { scrapeChardsOptimized }; 