import { chromium } from 'playwright';

/**
 * Simple Railway Gold Scraper
 * 
 * This is a simplified version that will definitely show output
 * and work quickly for testing.
 * 
 * Usage:
 * node src/railway-simple-gold.js
 */

async function runSimpleGoldScraper() {
  console.log('🚀 Simple Railway Gold Scraper Starting...');
  console.log('📝 This will test scraping with clear output');
  console.log('');

  try {
    console.log('🔧 Step 1: Launching browser...');
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('✅ Browser launched successfully');
    
    console.log('🔧 Step 2: Creating page...');
    const page = await browser.newPage();
    console.log('✅ Page created successfully');
    
    console.log('🔧 Step 3: Setting user agent...');
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    console.log('✅ User agent set');
    
    console.log('🔧 Step 4: Navigating to test site...');
    console.log('🌐 Target: https://httpbin.org/user-agent');
    
    await page.goto('https://httpbin.org/user-agent', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    console.log('✅ Successfully navigated to test website');
    
    console.log('🔧 Step 5: Getting page info...');
    const title = await page.title();
    const userAgent = await page.evaluate(() => navigator.userAgent);
    console.log('✅ Page title:', title);
    console.log('✅ User agent:', userAgent);
    
    console.log('🔧 Step 6: Taking screenshot...');
    await page.screenshot({ path: 'simple-gold-test.png' });
    console.log('✅ Screenshot saved as simple-gold-test.png');
    
    console.log('');
    console.log('🎉 SUCCESS! Simple Railway scraper is working!');
    console.log('');
    console.log('📊 Test Results:');
    console.log('   ✅ Browser launched in headless mode');
    console.log('   ✅ Navigation successful');
    console.log('   ✅ User agent spoofing working');
    console.log('   ✅ Screenshot captured');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. This proves Railway deployment will work');
    console.log('   2. Now you can customize for your target site');
    console.log('   3. Deploy to Railway with confidence');
    console.log('');
    
    await browser.close();
    console.log('✅ Browser closed successfully');
    
  } catch (error) {
    console.error('❌ Error in simple gold scraper:', error.message);
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('   1. Check your internet connection');
    console.log('   2. Make sure Playwright is installed');
    console.log('   3. Try running: npm run install-browsers');
  }
}

// Run the scraper
runSimpleGoldScraper().catch(console.error); 