import { chromium } from 'playwright';

/**
 * Simple BullionByPost Scraper
 * 
 * This is a simplified version that will definitely show output
 * and work step by step for testing.
 * 
 * Usage:
 * node src/bullionbypost-simple.js
 */

async function runSimpleBullionByPostScraper() {
  console.log('🚀 Simple BullionByPost Scraper Starting...');
  console.log('📝 This will test scraping BullionByPost step by step');
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
    
    console.log('🔧 Step 4: Navigating to BullionByPost...');
    console.log('🌐 Target: https://www.bullionbypost.co.uk/gold-coins/full-sovereign-gold-coin/');
    
    await page.goto('https://www.bullionbypost.co.uk/gold-coins/full-sovereign-gold-coin/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    console.log('✅ Successfully navigated to BullionByPost');
    
    console.log('🔧 Step 5: Getting page info...');
    const title = await page.title();
    const url = page.url();
    console.log('✅ Page title:', title);
    console.log('✅ Current URL:', url);
    
    console.log('🔧 Step 6: Taking screenshot...');
    await page.screenshot({ path: 'bullionbypost-simple.png' });
    console.log('✅ Screenshot saved as bullionbypost-simple.png');
    
    console.log('🔧 Step 7: Looking for product links...');
    
    // Try to find product links
    const productLinks = await page.evaluate(() => {
      const links = [];
      
      // Look for any links that might be products
      const allLinks = document.querySelectorAll('a[href*="/gold-coins/"]');
      console.log(`Found ${allLinks.length} links with /gold-coins/`);
      
      allLinks.forEach((link, index) => {
        links.push({
          url: link.href,
          text: link.textContent.trim(),
          index: index + 1
        });
      });
      
      return links;
    });
    
    console.log(`✅ Found ${productLinks.length} product links`);
    
    if (productLinks.length > 0) {
      console.log('📋 Product links found:');
      productLinks.slice(0, 5).forEach((link, index) => {
        console.log(`   ${index + 1}. ${link.text} (${link.url})`);
      });
      
      if (productLinks.length > 5) {
        console.log(`   ... and ${productLinks.length - 5} more`);
      }
    } else {
      console.log('⚠️ No product links found');
    }
    
    console.log('🔧 Step 8: Looking for product titles...');
    
    // Try to find product titles
    const productTitles = await page.evaluate(() => {
      const titles = [];
      
      // Look for common title selectors
      const titleSelectors = [
        'h1', 'h2', 'h3',
        '.product-title', '.product-name',
        '[class*="title"]', '[class*="name"]'
      ];
      
      titleSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          const text = element.textContent.trim();
          if (text && text.length > 0) {
            titles.push({
              selector: selector,
              text: text
            });
          }
        });
      });
      
      return titles;
    });
    
    console.log(`✅ Found ${productTitles.length} potential product titles`);
    
    if (productTitles.length > 0) {
      console.log('📋 Product titles found:');
      productTitles.slice(0, 5).forEach((title, index) => {
        console.log(`   ${index + 1}. ${title.text} (${title.selector})`);
      });
    }
    
    console.log('🔧 Step 9: Looking for prices...');
    
    // Try to find prices
    const prices = await page.evaluate(() => {
      const priceElements = [];
      
      // Look for price-related elements
      const priceSelectors = [
        '.price', '.product-price',
        '[class*="price"]', 'span[class*="price"]'
      ];
      
      priceSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          const text = element.textContent.trim();
          if (text && text.includes('£')) {
            priceElements.push({
              selector: selector,
              text: text
            });
          }
        });
      });
      
      return priceElements;
    });
    
    console.log(`✅ Found ${prices.length} price elements`);
    
    if (prices.length > 0) {
      console.log('📋 Prices found:');
      prices.slice(0, 5).forEach((price, index) => {
        console.log(`   ${index + 1}. ${price.text} (${price.selector})`);
      });
    }
    
    console.log('');
    console.log('🎉 SUCCESS! Simple BullionByPost scraper is working!');
    console.log('');
    console.log('📊 Test Results:');
    console.log('   ✅ Browser launched in headless mode');
    console.log('   ✅ Navigation successful to BullionByPost');
    console.log('   ✅ Screenshot captured');
    console.log(`   ✅ Found ${productLinks.length} product links`);
    console.log(`   ✅ Found ${productTitles.length} product titles`);
    console.log(`   ✅ Found ${prices.length} price elements`);
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Check the screenshot to see what was loaded');
    console.log('   2. Customize selectors for better data extraction');
    console.log('   3. Deploy to Railway for automated scraping');
    console.log('');
    
    await browser.close();
    console.log('✅ Browser closed successfully');
    
  } catch (error) {
    console.error('❌ Error in simple BullionByPost scraper:', error.message);
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('   1. Check your internet connection');
    console.log('   2. Check if BullionByPost is accessible');
    console.log('   3. Try running with different selectors');
    console.log('   4. Look at the screenshot for clues');
  }
}

// Run the scraper
runSimpleBullionByPostScraper().catch(console.error); 