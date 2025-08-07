import { chromium } from 'playwright';

/**
 * BullionByPost Gold Coin Scraper
 * 
 * This scraper is designed specifically for BullionByPost.co.uk
 * It will navigate to the gold coins page and click on each product
 * to scrape detailed data.
 * 
 * Usage:
 * node src/bullionbypost-scraper.js
 */

const railwayConfig = {
  headless: true,
  slowMo: 2000,
  args: [
    '--disable-blink-features=AutomationControlled',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-first-run',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-plugins',
    '--disable-translate',
    '--no-default-browser-check',
    '--no-experiments',
    '--ignore-certificate-errors',
    '--ignore-ssl-errors',
    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ],
};

const contextOptions = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  viewport: { width: 1920, height: 1080 },
  locale: 'en-GB',
  timezoneId: 'Europe/London',
  extraHTTPHeaders: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-GB,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  },
};

// Anti-detection script
const antiDetectionScript = () => {
  Object.defineProperty(navigator, 'webdriver', {
    get: () => undefined,
  });
  
  Object.defineProperty(navigator, 'plugins', {
    get: () => [1, 2, 3, 4, 5],
  });
  
  Object.defineProperty(navigator, 'languages', {
    get: () => ['en-GB', 'en'],
  });
  
  window.chrome = {
    runtime: {},
    loadTimes: function() {},
    csi: function() {},
    app: {}
  };
  
  delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
  delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
  delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
};

async function scrapeBullionByPost() {
  console.log('🚀 BullionByPost Gold Coin Scraper Starting...');
  console.log('📝 This will scrape detailed data from each product');
  console.log('');

  try {
    console.log('🔧 Step 1: Launching browser...');
    const browser = await chromium.launch(railwayConfig);
    console.log('✅ Browser launched successfully');
    
    console.log('🔧 Step 2: Creating context...');
    const context = await browser.newContext(contextOptions);
    console.log('✅ Context created successfully');
    
    console.log('🔧 Step 3: Adding anti-detection scripts...');
    await context.addInitScript(antiDetectionScript);
    console.log('✅ Anti-detection scripts added');
    
    console.log('🔧 Step 4: Creating page...');
    const page = await context.newPage();
    console.log('✅ Page created successfully');
    
    // Navigate to BullionByPost gold coins page
    const targetUrl = 'https://www.bullionbypost.co.uk/gold-coins/full-sovereign-gold-coin/';
    
    console.log(`🔧 Step 5: Navigating to: ${targetUrl}`);
    console.log('⏳ This may take a moment...');
    
    try {
      await page.goto(targetUrl, { 
        waitUntil: 'networkidle',
        timeout: 60000 
      });
      console.log('✅ Successfully navigated to BullionByPost');
      
      // Check if we hit Cloudflare
      const cloudflareDetected = await page.evaluate(() => {
        return document.title.includes('Cloudflare') || 
               document.body.textContent.includes('Checking your browser') ||
               document.body.textContent.includes('Please wait');
      });
      
      if (cloudflareDetected) {
        console.log('⚠️ Cloudflare detected, waiting...');
        await page.waitForTimeout(15000);
        console.log('✅ Waited for Cloudflare challenge');
      }
      
    } catch (error) {
      console.log('⚠️ Navigation failed:', error.message);
      throw error;
    }
    
    console.log('🔧 Step 6: Getting page information...');
    const pageTitle = await page.title();
    console.log('✅ Page title:', pageTitle);
    
    console.log('🔧 Step 7: Looking for product links...');
    
    // Find all product links on the page
    const productLinks = await page.evaluate(() => {
      const links = [];
      
      // Common selectors for BullionByPost product links
      const selectors = [
        'a[href*="/gold-coins/"]',
        'a[href*="/product/"]',
        '.product-link',
        '.item-link',
        'a[class*="product"]',
        'a[class*="item"]'
      ];
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          elements.forEach(element => {
            const href = element.href;
            if (href && href.includes('/gold-coins/')) {
              links.push({
                url: href,
                text: element.textContent.trim(),
                title: element.getAttribute('title') || element.textContent.trim()
              });
            }
          });
          break;
        }
      }
      
      return links;
    });
    
    console.log(`✅ Found ${productLinks.length} product links`);
    
    if (productLinks.length === 0) {
      console.log('⚠️ No product links found, taking screenshot for debugging...');
      await page.screenshot({ path: 'bullionbypost-no-links.png' });
      console.log('✅ Screenshot saved as bullionbypost-no-links.png');
      throw new Error('No product links found on the page');
    }
    
    console.log('🔧 Step 8: Scraping detailed data from each product...');
    
    const scrapedData = [];
    
    // Limit to first 5 products for testing
    const productsToScrape = productLinks.slice(0, 5);
    console.log(`📊 Will scrape ${productsToScrape.length} products (limited for testing)`);
    
    for (let i = 0; i < productsToScrape.length; i++) {
      const product = productsToScrape[i];
      console.log(`\n🔍 Scraping product ${i + 1}/${productsToScrape.length}: ${product.text}`);
      
      try {
        // Navigate to product page
        await page.goto(product.url, { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });
        
        // Wait a bit for page to load
        await page.waitForTimeout(2000);
        
        // Extract detailed product data
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
            const element = document.querySelector(selector);
            if (element) {
              data.price = element.textContent.trim();
              break;
            }
          }
          
          // Extract weight
          const weightSelectors = [
            '[class*="weight"]',
            '[class*="size"]',
            'span:contains("g")',
            'span:contains("oz")'
          ];
          
          for (const selector of weightSelectors) {
            const element = document.querySelector(selector);
            if (element && (element.textContent.includes('g') || element.textContent.includes('oz'))) {
              data.weight = element.textContent.trim();
              break;
            }
          }
          
          // Extract purity
          const puritySelectors = [
            '[class*="purity"]',
            '[class*="karat"]',
            'span:contains("%")',
            'span:contains("k")'
          ];
          
          for (const selector of puritySelectors) {
            const element = document.querySelector(selector);
            if (element && (element.textContent.includes('%') || element.textContent.includes('k'))) {
              data.purity = element.textContent.trim();
              break;
            }
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
          
          // Get all text content for debugging
          data.allText = document.body.textContent.substring(0, 500);
          
          return data;
        });
        
        // Add URL and timestamp
        productData.url = product.url;
        productData.timestamp = new Date().toISOString();
        productData.id = i + 1;
        
        scrapedData.push(productData);
        
        console.log(`✅ Scraped: ${productData.title || 'No title'}`);
        console.log(`   Price: ${productData.price || 'No price'}`);
        console.log(`   Weight: ${productData.weight || 'No weight'}`);
        console.log(`   Purity: ${productData.purity || 'No purity'}`);
        
        // Take screenshot of each product page
        await page.screenshot({ path: `product-${i + 1}.png` });
        console.log(`   Screenshot saved as product-${i + 1}.png`);
        
      } catch (error) {
        console.log(`❌ Error scraping product ${i + 1}:`, error.message);
        scrapedData.push({
          id: i + 1,
          url: product.url,
          title: product.text,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    console.log('\n📊 Final Scraped Data:');
    console.log('=======================');
    
    scrapedData.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.title || 'No title'}`);
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
    
    console.log('\n🔧 Step 9: Taking final screenshot...');
    await page.screenshot({ path: 'bullionbypost-final.png' });
    console.log('✅ Final screenshot saved as bullionbypost-final.png');
    
    console.log('\n🎉 BullionByPost scraper completed!');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Check the screenshots to see what was scraped');
    console.log('   2. Customize selectors for better data extraction');
    console.log('   3. Deploy to Railway for automated scraping');
    console.log('   4. Set up database to store the data');
    console.log('');
    
    await context.close();
    await browser.close();
    console.log('✅ Browser closed successfully');
    
    return scrapedData;
    
  } catch (error) {
    console.error('❌ Error in BullionByPost scraper:', error.message);
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('   1. Check your internet connection');
    console.log('   2. Check if BullionByPost is accessible');
    console.log('   3. Look at the screenshots for clues');
    console.log('   4. Try running with different selectors');
    throw error;
  }
}

// Run the scraper
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeBullionByPost().catch(console.error);
}

export { scrapeBullionByPost }; 