import { chromium } from 'playwright';

async function testTitleExtraction() {
  console.log('🔍 Testing title extraction from Chards product page...');
  
  const testUrl = 'https://www.chards.co.uk/2022-gold-double-sovereign-uncirculated-coin/15698';
  
  try {
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    console.log(`📄 Loading: ${testUrl}`);
    await page.goto(testUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Handle cookie consent if present
    try {
      const cookieButton = await page.waitForSelector('button.cky-btn.cky-btn-accept', { 
        timeout: 5000 
      });
      
      if (cookieButton) {
        console.log('🍪 Handling cookie consent...');
        await cookieButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ Cookie consent handled');
      }
    } catch (error) {
      console.log('ℹ️ No cookie consent found');
    }
    
    await page.waitForTimeout(2000);
    
    // Test the updated title selector
    const titleData = await page.evaluate(() => {
      const data = {};
      
      // Use the reliable h1 selector
      const titleElement = document.querySelector('h1');
      if (titleElement) {
        data.title = titleElement.textContent.trim();
      }
      
      // Test price extraction
      const priceElement = document.querySelector('p.tw-text-\\[2rem\\]');
      if (priceElement) {
        data.price = priceElement.textContent.trim();
      }
      
      return data;
    });
    
    console.log('\n📊 Updated Title Extraction Results:');
    console.log('====================================');
    console.log(`Title (h1): ${titleData.title || 'Not found'}`);
    console.log(`Price: ${titleData.price || 'Not found'}`);
    
    await browser.close();
    
    console.log('\n✅ Title extraction test completed!');
    
  } catch (error) {
    console.error('❌ Error during title extraction test:', error.message);
  }
}

// Run the test
testTitleExtraction().catch(console.error); 