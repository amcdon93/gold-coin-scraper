import { chromium } from 'playwright';

/**
 * Detailed BullionByPost Scraper
 * 
 * This scraper will click on each product link and scrape detailed data
 * from individual product pages.
 * 
 * Usage:
 * node src/bullionbypost-detailed.js
 */

async function scrapeBullionByPostDetailed() {
  console.log('🚀 Detailed BullionByPost Scraper Starting...');
  console.log('📝 This will click on each product and scrape detailed data');
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
    
    console.log('🔧 Step 5: Finding product links...');
    
    // Find all product links that are actual products (not navigation links)
    const productLinks = await page.evaluate(() => {
      const links = [];
      
      // Look for links that contain specific product patterns
      const allLinks = document.querySelectorAll('a[href*="/gold-coins/"]');
      
      allLinks.forEach((link) => {
        const href = link.href;
        const text = link.textContent.trim();
        
        // Filter for actual product links (not navigation)
        if (href && 
            href.includes('/gold-coins/') && 
            !href.includes('/gold-coins/') && // Avoid category pages
            text.length > 0 &&
            !text.includes('Gold Coins') && // Avoid navigation
            !text.includes('Best value') && // Avoid navigation
            !text.includes('CGT Free')) { // Avoid navigation
          
          links.push({
            url: href,
            text: text,
            title: link.getAttribute('title') || text
          });
        }
      });
      
      return links;
    });
    
    console.log(`✅ Found ${productLinks.length} product links`);
    
    if (productLinks.length === 0) {
      console.log('⚠️ No product links found, trying alternative approach...');
      
      // Try alternative approach - look for any clickable product elements
      const alternativeLinks = await page.evaluate(() => {
        const links = [];
        
        // Look for any elements that might be products
        const productElements = document.querySelectorAll('a[href*="product"], a[href*="coin"], .product, .item');
        
        productElements.forEach((element) => {
          const href = element.href;
          const text = element.textContent.trim();
          
          if (href && text.length > 0) {
            links.push({
              url: href,
              text: text,
              title: element.getAttribute('title') || text
            });
          }
        });
        
        return links;
      });
      
      console.log(`✅ Found ${alternativeLinks.length} alternative links`);
      productLinks.push(...alternativeLinks);
    }
    
    if (productLinks.length === 0) {
      throw new Error('No product links found on the page');
    }
    
    console.log('📋 Product links found:');
    productLinks.slice(0, 10).forEach((link, index) => {
      console.log(`   ${index + 1}. ${link.text} (${link.url})`);
    });
    
    if (productLinks.length > 10) {
      console.log(`   ... and ${productLinks.length - 10} more`);
    }
    
    console.log('🔧 Step 6: Scraping detailed data from each product...');
    
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
        productData.originalText = product.text;
        
        scrapedData.push(productData);
        
        console.log(`✅ Scraped: ${productData.title || 'No title'}`);
        console.log(`   Price: ${productData.price || 'No price'}`);
        console.log(`   Weight: ${productData.weight || 'No weight'}`);
        console.log(`   Purity: ${productData.purity || 'No purity'}`);
        
        // Take screenshot of each product page
        await page.screenshot({ path: `bullionbypost-product-${i + 1}.png` });
        console.log(`   Screenshot saved as bullionbypost-product-${i + 1}.png`);
        
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
    
    console.log('\n🔧 Step 7: Taking final screenshot...');
    await page.screenshot({ path: 'bullionbypost-detailed-final.png' });
    console.log('✅ Final screenshot saved as bullionbypost-detailed-final.png');
    
    console.log('\n🎉 Detailed BullionByPost scraper completed!');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Check the screenshots to see what was scraped');
    console.log('   2. Customize selectors for better data extraction');
    console.log('   3. Deploy to Railway for automated scraping');
    console.log('   4. Set up database to store the data');
    console.log('');
    
    await browser.close();
    console.log('✅ Browser closed successfully');
    
    return scrapedData;
    
  } catch (error) {
    console.error('❌ Error in detailed BullionByPost scraper:', error.message);
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
  scrapeBullionByPostDetailed().catch(console.error);
}

export { scrapeBullionByPostDetailed }; 