import { chromium } from 'playwright';

/**
 * User Profile Codegen
 * 
 * This script uses your existing Chrome user profile with cookies
 * and settings to bypass Cloudflare detection.
 * 
 * Usage:
 * node src/codegen-user-profile.js
 */

const userProfileConfig = {
  headless: false,
  slowMo: 1000,
  args: [
    '--disable-blink-features=AutomationControlled',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-plugins',
    '--disable-translate',
    '--no-default-browser-check',
    '--no-experiments',
    // Use your existing Chrome user data
    `--user-data-dir=${process.env.LOCALAPPDATA}\\Google\\Chrome\\User Data`,
    '--profile-directory=Default',
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

async function runUserProfileCodegen() {
  console.log('🚀 Launching User Profile Codegen...');
  console.log('📝 Uses your existing Chrome profile with cookies and settings');
  console.log('💡 This should bypass Cloudflare using your existing authentication');
  console.log('');
  
  try {
    console.log('💡 CLOUDFLARE BYPASS STRATEGY:');
    console.log('   1. Uses your REAL Chrome user profile');
    console.log('   2. Uses your existing cookies and settings');
    console.log('   3. Looks like normal browsing to Cloudflare');
    console.log('   4. Should bypass most detection mechanisms');
    console.log('');
    console.log('💡 WHAT TO DO:');
    console.log('   1. A browser window will open with your profile');
    console.log('   2. Navigate to your target website');
    console.log('   3. Your existing cookies might bypass Cloudflare');
    console.log('   4. If Cloudflare appears, complete it manually');
    console.log('   5. Interact with the page naturally');
    console.log('   6. Copy the generated code when done');
    console.log('');
    console.log('💡 TIPS:');
    console.log('   • Your browser has existing cookies/settings');
    console.log('   • This looks like normal browsing to Cloudflare');
    console.log('   • Complete any challenges manually');
    console.log('   • Wait between actions');
    console.log('');
    
    const browser = await chromium.launch(userProfileConfig);
    const context = await browser.newContext(contextOptions);
    
    // Add anti-detection scripts
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      window.chrome = {
        runtime: {},
      };
    });
    
    const page = await context.newPage();
    
    console.log('✅ Browser launched with your user profile!');
    console.log('🌐 Navigate to your target website');
    console.log('🖱️  Interact with the page naturally');
    console.log('📋 Copy the generated code from the codegen window');
    console.log('');
    console.log('💡 Cloudflare bypass tips:');
    console.log('   • Your existing cookies might bypass Cloudflare');
    console.log('   • Complete any challenges manually');
    console.log('   • Wait between actions');
    console.log('   • Move mouse naturally');
    console.log('   • Scroll occasionally');
    console.log('');
    
    // Keep the browser open for manual interaction
    await page.waitForEvent('close');
    
    await context.close();
    await browser.close();
    
  } catch (error) {
    console.error('❌ Error running codegen:', error.message);
    console.log('');
    console.log('💡 Alternative approaches:');
    console.log('   1. Try: npm run codegen-stealth');
    console.log('   2. Or: npm run codegen-working');
    console.log('   3. Or run manually: npx playwright codegen');
  }
}

// Run the codegen
runUserProfileCodegen().catch(console.error); 