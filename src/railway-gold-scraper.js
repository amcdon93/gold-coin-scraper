import { chromium } from 'playwright';

/**
 * Railway Gold Coin Scraper
 * 
 * This scraper is designed for Railway deployment and will
 * scrape actual gold coin data from real websites.
 * 
 * Usage:
 * node src/railway-gold-scraper.js
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

async function scrapeGoldCoins() {
  console.log('🚀 Railway Gold Coin Scraper Starting...');
  console.log('📝 This will scrape real gold coin data');
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
    
    // Test with a real gold coin website
    // Using a popular gold dealer website
    const targetUrl = process.env.TARGET_URL || 'https://www.bullionbypost.co.uk/gold-coins/';
    
    console.log(`🔧 Step 5: Navigating to: ${targetUrl}`);
    console.log('⏳ This may take a moment...');
    
    try {
      await page.goto(targetUrl, { 
        waitUntil: 'networkidle',
        timeout: 60000 
      });
      console.log('✅ Successfully navigated to target website');
      
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
      console.log('⚠️ Navigation failed, trying alternative approach...');
      // Try a different approach or fallback URL
      await page.goto('https://www.chards.co.uk/gold-coins', { 
        waitUntil: 'networkidle',
        timeout: 60000 
      });
      console.log('✅ Successfully navigated to alternative website');
    }
    
    console.log('🔧 Step 6: Extracting page information...');
    const pageTitle = await page.title();
    console.log('✅ Page title:', pageTitle);
    
    console.log('🔧 Step 7: Looking for gold coin products...');
    
    // Try to find gold coin products on the page
    const scrapedData = await page.evaluate(() => {
      const products = [];
      
      // Common selectors for gold coin products
      const selectors = [
        '.product-item',
        '.coin-item', 
        '.gold-item',
        '.product',
        '[class*="product"]',
        '[class*="coin"]',
        '[class*="gold"]',
        'article',
        '.item',
        '.listing-item'
      ];
      
      let productElements = [];
      
      // Try each selector
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          productElements = elements;
          console.log(`Found ${elements.length} products with selector: ${selector}`);
          break;
        }
      }
      
      // If no specific product elements found, look for any clickable items
      if (productElements.length === 0) {
        const links = document.querySelectorAll('a[href*="coin"], a[href*="gold"], a[href*="product"]');
        productElements = links;
        console.log(`Found ${links.length} potential product links`);
      }
      
      // Extract data from found elements
      productElements.forEach((element, index) => {
        try {
          // Try to extract title
          const titleSelectors = [
            '.product-title', '.coin-title', '.gold-title',
            '.title', 'h1', 'h2', 'h3', 'h4',
            '[class*="title"]', '[class*="name"]'
          ];
          
          let title = '';
          for (const titleSelector of titleSelectors) {
            const titleElement = element.querySelector(titleSelector);
            if (titleElement) {
              title = titleElement.textContent.trim();
              break;
            }
          }
          
          // Try to extract price
          const priceSelectors = [
            '.product-price', '.coin-price', '.gold-price',
            '.price', '[class*="price"]',
            'span[class*="price"]', 'div[class*="price"]'
          ];
          
          let price = '';
          for (const priceSelector of priceSelectors) {
            const priceElement = element.querySelector(priceSelector);
            if (priceElement) {
              price = priceElement.textContent.trim();
              break;
            }
          }
          
          // If no structured data found, get text content
          if (!title) {
            title = element.textContent.substring(0, 100).trim();
          }
          
          if (title || price) {
            products.push({
              id: index + 1,
              title: title || 'N/A',
              price: price || 'N/A',
              url: element.href || element.querySelector('a')?.href || 'N/A',
              timestamp: new Date().toISOString()
            });
          }
          
        } catch (e) {
          console.log(`Error extracting product ${index + 1}:`, e);
        }
      });
      
      return products;
    });
    
    console.log('');
    console.log('📊 Scraped Data:');
    console.log('================');
    
    if (scrapedData.length > 0) {
      scrapedData.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title}`);
        console.log(`   Price: ${product.price}`);
        console.log(`   URL: ${product.url}`);
        console.log('');
      });
      
      console.log(`✅ Successfully scraped ${scrapedData.length} products`);
    } else {
      console.log('⚠️ No products found with standard selectors');
      console.log('💡 This might be due to:');
      console.log('   • Different website structure');
      console.log('   • Cloudflare blocking');
      console.log('   • Dynamic content loading');
      console.log('   • Custom selectors needed');
    }
    
    console.log('');
    console.log('🔧 Step 8: Taking screenshot for debugging...');
    await page.screenshot({ path: 'gold-scraper-screenshot.png' });
    console.log('✅ Screenshot saved as gold-scraper-screenshot.png');
    
    console.log('');
    console.log('🎉 Railway Gold Scraper completed!');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Check the screenshot to see what was loaded');
    console.log('   2. Customize selectors for your target site');
    console.log('   3. Set TARGET_URL environment variable');
    console.log('   4. Deploy to Railway');
    console.log('');
    
    await context.close();
    await browser.close();
    console.log('✅ Browser closed successfully');
    
    return scrapedData;
    
  } catch (error) {
    console.error('❌ Error in gold scraper:', error.message);
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('   1. Check your internet connection');
    console.log('   2. Try a different target URL');
    console.log('   3. Check if the site is accessible');
    console.log('   4. Look at the screenshot for clues');
    throw error;
  }
}

// Run the scraper
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeGoldCoins().catch(console.error);
}

export { scrapeGoldCoins }; 