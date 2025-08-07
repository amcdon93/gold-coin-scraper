import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

/**
 * Selenium Setup for Cloudflare Bypass
 * 
 * This uses Selenium with your real Chrome browser to bypass Cloudflare.
 * Selenium often works better with Cloudflare because it uses your actual browser.
 * 
 * Usage:
 * node src/selenium-setup.js
 */

async function runSeleniumSetup() {
  console.log('🚀 Setting up Selenium for Cloudflare Bypass...');
  console.log('📝 This uses your real Chrome browser with existing profile');
  console.log('💡 Selenium often bypasses Cloudflare better than Playwright');
  console.log('');
  
  try {
    // Configure Chrome options to use your existing profile
    const options = new chrome.Options();
    
    // Use your existing Chrome user data
    const userDataDir = `${process.env.LOCALAPPDATA}\\Google\\Chrome\\User Data`;
    options.addArguments(`--user-data-dir=${userDataDir}`);
    options.addArguments('--profile-directory=Default');
    
    // Anti-detection settings
    options.addArguments('--disable-blink-features=AutomationControlled');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-setuid-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--no-first-run');
    options.addArguments('--disable-default-apps');
    options.addArguments('--disable-extensions');
    options.addArguments('--disable-plugins');
    options.addArguments('--disable-translate');
    options.addArguments('--no-default-browser-check');
    options.addArguments('--no-experiments');
    
    // Set user agent
    options.addArguments('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('✅ Chrome options configured');
    console.log('📁 Using user data directory:', userDataDir);
    console.log('');
    
    // Build the driver
    const driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    
    console.log('✅ Selenium driver created successfully');
    console.log('');
    console.log('💡 CLOUDFLARE BYPASS STRATEGY:');
    console.log('   1. Uses your REAL Chrome browser with existing profile');
    console.log('   2. Uses your existing cookies and settings');
    console.log('   3. Looks like normal browsing to Cloudflare');
    console.log('   4. Should bypass most detection mechanisms');
    console.log('');
    console.log('💡 WHAT TO DO:');
    console.log('   1. A Chrome window will open with your profile');
    console.log('   2. Navigate to your target website');
    console.log('   3. Your existing cookies might bypass Cloudflare');
    console.log('   4. If Cloudflare appears, complete it manually');
    console.log('   5. Test that you can browse the site normally');
    console.log('   6. Press ENTER when ready to start scraping');
    console.log('');
    
    // Navigate to a test page first
    await driver.get('https://www.google.com');
    console.log('✅ Browser opened successfully');
    console.log('🌐 Navigate to your target website');
    console.log('⏳ Press ENTER when ready to start scraping...');
    console.log('');
    
    // Wait for user input
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    await new Promise(resolve => {
      rl.question('Press ENTER when ready to start scraping...', () => {
        rl.close();
        resolve();
      });
    });
    
    console.log('');
    console.log('🚀 Starting scraping process...');
    console.log('💡 Now you can write Selenium code to scrape the site');
    console.log('');
    
    // Example scraping code
    console.log('📝 Example Selenium scraping code:');
    console.log(`
// Example: Scrape gold coin data
const products = await driver.findElements(By.css('.product-item'));
for (const product of products) {
  const title = await product.findElement(By.css('.product-title')).getText();
  const price = await product.findElement(By.css('.product-price')).getText();
  console.log(\`Title: \${title}, Price: \${price}\`);
}
    `);
    
    console.log('💡 Keep the browser open for manual testing');
    console.log('⏳ Press ENTER to close the browser...');
    console.log('');
    
    // Wait for user to close
    await new Promise(resolve => {
      const rl2 = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      rl2.question('Press ENTER to close browser...', () => {
        rl2.close();
        resolve();
      });
    });
    
    await driver.quit();
    console.log('✅ Browser closed successfully');
    
  } catch (error) {
    console.error('❌ Error setting up Selenium:', error.message);
    console.log('');
    console.log('💡 You may need to install Selenium:');
    console.log('   npm install selenium-webdriver');
    console.log('');
    console.log('💡 And ChromeDriver:');
    console.log('   npm install chromedriver');
  }
}

// Run the setup
runSeleniumSetup().catch(console.error); 