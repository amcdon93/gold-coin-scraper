import { chromium } from 'playwright';

/**
 * Chards Gold Sovereign Scraper
 * 
 * This scraper handles:
 * - Cookie consent popup
 * - 23 pages of sovereign products
 * - In-stock filtering
 * - Title and price extraction
 * 
 * Usage:
 * node src/chards-scraper.js
 */

async function handleCookieConsent(page) {
  try {
    // Wait for cookie button to appear
    const cookieButton = await page.waitForSelector('button.cky-btn.cky-btn-accept', { 
      timeout: 5000 
    });
    
    if (cookieButton) {
      console.log('🍪 Handling cookie consent...');
      await cookieButton.click();
      await page.waitForTimeout(1000); // Wait for popup to disappear
      console.log('✅ Cookie consent handled');
    }
  } catch (error) {
    console.log('ℹ️ No cookie consent found or already handled');
  }
}

async function getProductUrlsFromPage(baseUrl, pageNumber = 1) {
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
    
    // Handle cookie consent if present
    await handleCookieConsent(page);
    
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Get all product links that are in stock
    const productLinks = await page.evaluate((pageNumber) => {
      const links = [];
      const productElements = document.querySelectorAll('a[href*="/"][title]');
      
      productElements.forEach((link) => {
        const href = link.href;
        const title = link.getAttribute('title') || link.textContent.trim();
        
        // Check if this product is in stock
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
    
    console.log(`✅ Found ${productLinks.length} in-stock products on page ${pageNumber}`);
    await browser.close();
    return productLinks;
    
  } catch (error) {
    console.error(`❌ Error getting product URLs from page ${pageNumber}:`, error.message);
    return [];
  }
}

async function scrapeProductPageChards(productUrl, productInfo) {
  console.log(`🔍 Scraping: ${productInfo.title}`);
  
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
    
    // Handle cookie consent if present
    await handleCookieConsent(page);
    
    await page.waitForTimeout(2000);
    
    // Extract data using specific selectors
    const productData = await page.evaluate(() => {
      const data = {};
      
      // Extract title - use the most reliable h1 selector
      const titleElement = document.querySelector('h1');
      if (titleElement) {
        data.title = titleElement.textContent.trim();
      }
      
      // Extract price - <p class="tw-text-[2rem]...">
      const priceElement = document.querySelector('p.tw-text-\\[2rem\\]');
      if (priceElement) {
        data.price = priceElement.textContent.trim();
      }
      
      return data;
    });
    
    // Add metadata
    productData.url = productUrl;
    productData.timestamp = new Date().toISOString();
    productData.originalTitle = productInfo.title;
    productData.vendor = 'Chards';
    productData.pageNumber = productInfo.pageNumber;
    
    await browser.close();
    
    console.log(`✅ Scraped: ${productData.title || 'No title'}`);
    if (productData.price) console.log(`   Price: ${productData.price}`);
    
    return productData;
    
  } catch (error) {
    console.log(`❌ Error scraping product: ${error.message}`);
    return {
      url: productUrl,
      title: productInfo.title,
      vendor: 'Chards',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function scrapeChards() {
  console.log('🚀 Chards Gold Sovereign Scraper Starting...');
  console.log('📝 Scraping all 23 pages for in-stock products');
  console.log('');

  try {
    // Step 1: Get product URLs from all 23 pages
    console.log('🔧 STEP 1: Getting product URLs from all pages...');
    
    const baseUrl = 'https://www.chards.co.uk/category/buy-coins/a/gold/sovereign';
    let allProductUrls = [];
    
    // Scrape all 23 pages
    for (let pageNum = 1; pageNum <= 23; pageNum++) {
      const pageUrl = pageNum === 1 ? baseUrl : `${baseUrl}?page=${pageNum}`;
      console.log(`📄 Processing page ${pageNum}/23...`);
      
      const productUrls = await getProductUrlsFromPage(pageUrl, pageNum);
      allProductUrls.push(...productUrls);
      
      // Add delay between pages to avoid overwhelming the server
      if (pageNum < 23) {
        console.log('⏳ Waiting 2 seconds between pages...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`✅ Step 1 complete! Found ${allProductUrls.length} in-stock products across all pages`);
    
    if (allProductUrls.length === 0) {
      throw new Error('No in-stock products found');
    }
    
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
    
    // Step 2: Scrape each product individually
    console.log('🔧 STEP 2: Scraping each product with Chards selectors...');
    console.log('');
    
    const scrapedData = [];
    
    // Scrape ALL products (not limited)
    const productsToScrape = allProductUrls;
    console.log(`📊 Will scrape ALL ${productsToScrape.length} products`);
    
    for (let i = 0; i < productsToScrape.length; i++) {
      const product = productsToScrape[i];
      console.log(`\n🔍 Scraping product ${i + 1}/${productsToScrape.length}: ${product.title}`);
      console.log(`   Page: ${product.pageNumber}, URL: ${product.url}`);
      
      // Add delay between requests
      if (i > 0) {
        console.log('⏳ Waiting 3 seconds between requests...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      const productData = await scrapeProductPageChards(product.url, product);
      productData.id = i + 1;
      
      scrapedData.push(productData);
    }
    
    console.log('\n📊 Final Scraped Data:');
    console.log('=======================');
    
    scrapedData.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.title || 'No title'}`);
      console.log(`   Vendor: ${product.vendor}`);
      console.log(`   Page: ${product.pageNumber}`);
      console.log(`   URL: ${product.url}`);
      if (product.price) console.log(`   Price: ${product.price}`);
      if (product.error) {
        console.log(`   Error: ${product.error}`);
      }
    });
    
    console.log(`\n✅ Successfully scraped ${scrapedData.length} Chards products`);
    
    console.log('\n🎉 Chards scraper completed!');
    console.log('');
    console.log('💡 This approach:');
    console.log('   ✅ Handles cookie consent automatically');
    console.log('   ✅ Scrapes all 23 pages');
    console.log('   ✅ Only gets in-stock products');
    console.log('   ✅ Uses specific Chards selectors');
    console.log('   ✅ Ready for Railway deployment');
    console.log('');
    
    return scrapedData;
    
  } catch (error) {
    console.error('❌ Error in Chards scraper:', error.message);
    throw error;
  }
}

export { scrapeChards }; 