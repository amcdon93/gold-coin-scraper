import { chromium } from 'playwright';

/**
 * Railway-Compatible Gold Coin Scraper Template
 * 
 * This template is designed for Railway deployment and can handle Cloudflare.
 * It uses headless Playwright with advanced anti-detection.
 * 
 * Usage:
 * node src/railway-scraper-template.js
 */

const railwayConfig = {
  headless: true, // Required for Railway
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
    '--disable-web-security',
    '--ignore-certificate-errors',
    '--ignore-ssl-errors',
    '--ignore-certificate-errors-spki-list',
    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ],
};

const contextOptions = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  viewport: { width: 1920, height: 1080 },
  locale: 'en-GB',
  timezoneId: 'Europe/London',
  permissions: ['geolocation'],
  geolocation: { latitude: 51.5074, longitude: -0.1278 }, // London
  extraHTTPHeaders: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-GB,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
  },
};

// Anti-detection script
const antiDetectionScript = () => {
  // Override webdriver property
  Object.defineProperty(navigator, 'webdriver', {
    get: () => undefined,
  });

  // Override plugins
  Object.defineProperty(navigator, 'plugins', {
    get: () => [1, 2, 3, 4, 5],
  });

  // Override languages
  Object.defineProperty(navigator, 'languages', {
    get: () => ['en-GB', 'en'],
  });

  // Override chrome
  window.chrome = {
    runtime: {},
    loadTimes: function() {},
    csi: function() {},
    app: {}
  };

  // Override permissions
  const originalQuery = window.navigator.permissions.query;
  window.navigator.permissions.query = (parameters) => (
    parameters.name === 'notifications' ?
      Promise.resolve({ state: Notification.permission }) :
      originalQuery(parameters)
  );

  // Override automation indicators
  delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
  delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
  delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
};

// Human-like behavior script
const humanBehaviorScript = () => {
  // Random delays
  const originalSetTimeout = window.setTimeout;
  window.setTimeout = function(fn, delay) {
    const randomDelay = delay + Math.random() * 1000;
    return originalSetTimeout(fn, randomDelay);
  };

  // Random mouse movements
  setInterval(() => {
    const event = new MouseEvent('mousemove', {
      clientX: Math.random() * window.innerWidth,
      clientY: Math.random() * window.innerHeight
    });
    document.dispatchEvent(event);
  }, 5000 + Math.random() * 10000);
};

async function scrapeGoldCoins() {
  console.log('🚀 Railway-Compatible Gold Coin Scraper');
  console.log('📝 Designed for Railway deployment with Cloudflare bypass');
  console.log('');

  try {
    const browser = await chromium.launch(railwayConfig);
    const context = await browser.newContext(contextOptions);

    // Add anti-detection scripts
    await context.addInitScript(antiDetectionScript);
    await context.addInitScript(humanBehaviorScript);

    const page = await context.newPage();

    console.log('✅ Browser launched in headless mode');
    console.log('🌐 Ready to scrape gold coin data');
    console.log('');

    // Example: Scrape from a gold coin vendor
    // Replace this URL with your actual target
    const targetUrl = process.env.TARGET_URL || 'https://example-gold-vendor.com';
    
    console.log(`🌐 Navigating to: ${targetUrl}`);
    
    // Navigate with retry logic for Cloudflare
    let retries = 3;
    let success = false;
    
    while (retries > 0 && !success) {
      try {
        await page.goto(targetUrl, { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });
        
        // Check if we hit Cloudflare
        const cloudflareDetected = await page.evaluate(() => {
          return document.title.includes('Cloudflare') || 
                 document.body.textContent.includes('Checking your browser') ||
                 document.body.textContent.includes('Please wait');
        });
        
        if (cloudflareDetected) {
          console.log('⚠️ Cloudflare detected, waiting...');
          await page.waitForTimeout(10000); // Wait 10 seconds
          
          // Try to find and click "I'm human" button if it exists
          try {
            await page.click('input[type="checkbox"]', { timeout: 5000 });
            await page.waitForTimeout(2000);
          } catch (e) {
            // No checkbox found, continue
          }
        }
        
        success = true;
        console.log('✅ Successfully loaded the page');
        
      } catch (error) {
        retries--;
        console.log(`❌ Attempt failed, retries left: ${retries}`);
        if (retries > 0) {
          await page.waitForTimeout(5000);
        }
      }
    }
    
    if (!success) {
      throw new Error('Failed to load page after multiple attempts');
    }

    // Example scraping logic - customize for your target site
    console.log('🔍 Starting data extraction...');
    
    const scrapedData = await page.evaluate(() => {
      const products = [];
      
      // Example selectors - customize for your target site
      const productElements = document.querySelectorAll('.product-item, .coin-item, .gold-item');
      
      productElements.forEach((element, index) => {
        try {
          const title = element.querySelector('.product-title, .coin-title, .gold-title')?.textContent?.trim();
          const price = element.querySelector('.product-price, .coin-price, .gold-price')?.textContent?.trim();
          const weight = element.querySelector('.product-weight, .coin-weight, .gold-weight')?.textContent?.trim();
          const purity = element.querySelector('.product-purity, .coin-purity, .gold-purity')?.textContent?.trim();
          
          if (title || price) {
            products.push({
              id: index + 1,
              title: title || 'N/A',
              price: price || 'N/A',
              weight: weight || 'N/A',
              purity: purity || 'N/A',
              timestamp: new Date().toISOString()
            });
          }
        } catch (e) {
          console.log(`Error extracting product ${index + 1}:`, e);
        }
      });
      
      return products;
    });
    
    console.log('📊 Scraped data:');
    console.log(JSON.stringify(scrapedData, null, 2));
    console.log('');
    console.log(`✅ Successfully scraped ${scrapedData.length} products`);
    
    // Here you would typically save to database or send to API
    // For Railway, you might want to save to a database or send to another service
    
    await context.close();
    await browser.close();
    console.log('✅ Browser closed successfully');
    
    return scrapedData;
    
  } catch (error) {
    console.error('❌ Error scraping gold coins:', error.message);
    throw error;
  }
}

// Run the scraper
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeGoldCoins().catch(console.error);
}

export { scrapeGoldCoins }; 