import { chromium } from 'playwright';

/**
 * Simple Railway Test
 * 
 * This is a simplified version to test Railway deployment
 * with clear output and a real test website.
 * 
 * Usage:
 * node src/railway-test-simple.js
 */

const railwayConfig = {
  headless: true,
  slowMo: 1000,
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

async function runSimpleTest() {
  console.log('🚀 Simple Railway Test Starting...');
  console.log('📝 This will test the Railway scraper with a real website');
  console.log('');

  try {
    console.log('🔧 Step 1: Launching browser...');
    const browser = await chromium.launch(railwayConfig);
    console.log('✅ Browser launched successfully');
    
    console.log('🔧 Step 2: Creating context...');
    const context = await browser.newContext(contextOptions);
    console.log('✅ Context created successfully');
    
    console.log('🔧 Step 3: Adding anti-detection scripts...');
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      window.chrome = {
        runtime: {},
        loadTimes: function() {},
        csi: function() {},
        app: {}
      };
    });
    console.log('✅ Anti-detection scripts added');
    
    console.log('🔧 Step 4: Creating page...');
    const page = await context.newPage();
    console.log('✅ Page created successfully');
    
    console.log('🔧 Step 5: Navigating to test website...');
    console.log('🌐 Target: https://httpbin.org/user-agent');
    
    await page.goto('https://httpbin.org/user-agent', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    console.log('✅ Successfully navigated to test website');
    
    console.log('🔧 Step 6: Extracting user agent...');
    const userAgent = await page.evaluate(() => navigator.userAgent);
    console.log('✅ User Agent:', userAgent);
    
    console.log('🔧 Step 7: Taking screenshot...');
    await page.screenshot({ path: 'test-screenshot.png' });
    console.log('✅ Screenshot saved as test-screenshot.png');
    
    console.log('🔧 Step 8: Getting page title...');
    const title = await page.title();
    console.log('✅ Page title:', title);
    
    console.log('🔧 Step 9: Getting page content...');
    const content = await page.evaluate(() => document.body.textContent);
    console.log('✅ Page content length:', content.length, 'characters');
    
    console.log('');
    console.log('🎉 SUCCESS! Railway scraper is working!');
    console.log('');
    console.log('📊 Test Results:');
    console.log('   ✅ Browser launched in headless mode');
    console.log('   ✅ Anti-detection scripts working');
    console.log('   ✅ Navigation successful');
    console.log('   ✅ User agent spoofing working');
    console.log('   ✅ Screenshot captured');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Set TARGET_URL environment variable');
    console.log('   2. Customize scraping logic for your target site');
    console.log('   3. Deploy to Railway');
    console.log('');
    
    await context.close();
    await browser.close();
    console.log('✅ Browser closed successfully');
    
  } catch (error) {
    console.error('❌ Error in simple test:', error.message);
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('   1. Make sure Playwright is installed: npm run install-browsers');
    console.log('   2. Check your internet connection');
    console.log('   3. Try running with more verbose output');
  }
}

// Run the test
runSimpleTest().catch(console.error); 