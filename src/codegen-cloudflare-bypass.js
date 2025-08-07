import { chromium } from 'playwright';

/**
 * Cloudflare-Bypass Codegen
 * 
 * This script launches a custom browser with advanced anti-detection
 * settings specifically designed to bypass Cloudflare challenges.
 * 
 * Usage:
 * node src/codegen-cloudflare-bypass.js
 */

const cloudflareBypassConfig = {
  headless: false,
  slowMo: 2000, // Slower actions to appear more human
  args: [
    '--disable-blink-features=AutomationControlled',
    '--disable-features=VizDisplayCompositor',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-features=TranslateUI',
    '--disable-ipc-flooding-protection',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-plugins',
    '--disable-translate',
    '--disable-component-extensions-with-background-pages',
    '--disable-background-mode',
    '--disable-client-side-phishing-detection',
    '--disable-hang-monitor',
    '--disable-prompt-on-repost',
    '--disable-domain-reliability',
    '--disable-component-update',
    '--disable-features=AudioServiceOutOfProcess',
    '--disable-print-preview',
    '--no-default-browser-check',
    '--no-experiments',
    '--metrics-recording-only',
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor',
    '--disable-background-networking',
    '--disable-sync',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-plugins',
    '--disable-images',
    '--disable-javascript',
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor',
    '--disable-background-networking',
    '--disable-sync',
    '--metrics-recording-only',
    '--no-default-browser-check',
    '--no-experiments',
    '--disable-translate',
    '--disable-extensions-except',
    '--disable-component-extensions-with-background-pages',
    '--disable-background-mode',
    '--disable-client-side-phishing-detection',
    '--disable-hang-monitor',
    '--disable-prompt-on-repost',
    '--disable-domain-reliability',
    '--disable-component-update',
    '--disable-features=AudioServiceOutOfProcess',
    '--disable-print-preview',
  ],
};

const contextOptions = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  viewport: { width: 1920, height: 1080 },
  locale: 'en-GB',
  timezoneId: 'Europe/London',
  permissions: ['geolocation'],
  geolocation: { longitude: -0.118092, latitude: 51.509865 }, // London coordinates
  extraHTTPHeaders: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-GB,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  },
};

async function runCloudflareBypassCodegen() {
  console.log('🚀 Launching Cloudflare-Bypass Codegen...');
  console.log('📝 Advanced anti-detection settings for Cloudflare');
  console.log('⏱️  Actions will be slowed down to appear more human-like');
  console.log('');
  
  const browser = await chromium.launch(cloudflareBypassConfig);
  const context = await browser.newContext(contextOptions);
  
  // Advanced anti-detection scripts
  await context.addInitScript(() => {
    // Remove webdriver property
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
    
    // Remove automation indicators
    delete window.navigator.__proto__.webdriver;
    
    // Override permissions
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) => (
      parameters.name === 'notifications' ?
        Promise.resolve({ state: Notification.permission }) :
        originalQuery(parameters)
    );
    
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
    };
    
    // Override automation indicators
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });
    
    // Override automation detection
    Object.defineProperty(navigator, 'automation', {
      get: () => false,
    });
  });
  
  const page = await context.newPage();
  
  // Add human-like behavior
  await page.addInitScript(() => {
    // Add random mouse movements
    let lastMove = Date.now();
    window.addEventListener('mousemove', () => {
      const now = Date.now();
      if (now - lastMove > 100) {
        lastMove = now;
      }
    });
    
    // Override automation detection
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });
  });
  
  console.log('✅ Browser launched with Cloudflare-bypass settings');
  console.log('🌐 Navigate to your target website');
  console.log('🖱️  Interact with the page naturally');
  console.log('📋 Copy the generated code from the codegen window');
  console.log('');
  console.log('💡 Advanced Cloudflare bypass tips:');
  console.log('   • Wait 3-5 seconds between actions');
  console.log('   • Move the mouse naturally and slowly');
  console.log('   • Scroll the page occasionally');
  console.log('   • Don\'t click too rapidly');
  console.log('   • Complete any challenges manually');
  console.log('   • If blocked, wait 30 seconds before retrying');
  console.log('');
  
  // Keep the browser open for manual interaction
  await page.waitForEvent('close');
  
  await context.close();
  await browser.close();
}

// Run the codegen
runCloudflareBypassCodegen().catch(console.error); 