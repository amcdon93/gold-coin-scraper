import { chromium } from 'playwright';

/**
 * Railway-Compatible Cloudflare Bypass
 * 
 * This script is designed to work on Railway's serverless environment.
 * It uses Playwright in headless mode with advanced anti-detection.
 * 
 * Usage:
 * node src/railway-cloudflare-bypass.js
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
    '--disable-features=VizDisplayCompositor',
    '--disable-ipc-flooding-protection',
    '--disable-renderer-backgrounding',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-client-side-phishing-detection',
    '--disable-component-extensions-with-background-pages',
    '--disable-domain-reliability',
    '--disable-features=TranslateUI,BlinkGenPropertyTrees',
    '--disable-hang-monitor',
    '--disable-prompt-on-repost',
    '--disable-sync',
    '--force-color-profile=srgb',
    '--metrics-recording-only',
    '--no-default-browser-check',
    '--no-pings',
    '--password-store=basic',
    '--use-mock-keychain',
    '--hide-scrollbars',
    '--mute-audio',
    '--no-zygote',
    '--single-process',
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-sync',
    '--disable-translate',
    '--hide-scrollbars',
    '--mute-audio',
    '--no-first-run',
    '--safebrowsing-disable-auto-update',
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

async function runRailwayCloudflareBypass() {
  console.log('🚀 Railway-Compatible Cloudflare Bypass');
  console.log('📝 Designed for Railway deployment');
  console.log('💡 Uses headless Playwright with advanced anti-detection');
  console.log('');

  try {
    console.log('💡 RAILWAY CLOUDFLARE BYPASS STRATEGY:');
    console.log('   1. Headless mode (required for Railway)');
    console.log('   2. Advanced anti-detection settings');
    console.log('   3. Realistic user agent and headers');
    console.log('   4. Geolocation spoofing');
    console.log('   5. Slow, human-like interactions');
    console.log('   6. Random delays and movements');
    console.log('');

    const browser = await chromium.launch(railwayConfig);
    const context = await browser.newContext(contextOptions);

    // Advanced anti-detection scripts
    await context.addInitScript(() => {
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

      // Add random mouse movements
      const originalMouseEvent = window.MouseEvent;
      window.MouseEvent = function(type, init) {
        if (init) {
          init.clientX = init.clientX || Math.random() * 1920;
          init.clientY = init.clientY || Math.random() * 1080;
        }
        return new originalMouseEvent(type, init);
      };

      // Override automation indicators
      delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
      delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
      delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
    });

    const page = await context.newPage();

    // Add random delays and human-like behavior
    await page.addInitScript(() => {
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
    });

    console.log('✅ Browser launched in headless mode');
    console.log('🌐 Ready to navigate to target website');
    console.log('');

    // Example: Navigate to a test site
    console.log('🧪 Testing with a simple site...');
    await page.goto('https://httpbin.org/user-agent', { waitUntil: 'networkidle' });
    
    const userAgent = await page.evaluate(() => navigator.userAgent);
    console.log('✅ User Agent:', userAgent);
    console.log('');

    // Example: Test with a Cloudflare-protected site
    console.log('🌐 Testing with target website...');
    console.log('💡 Replace this URL with your actual target:');
    console.log('   await page.goto("https://your-target-site.com");');
    console.log('');

    // Keep the browser open for testing
    console.log('⏳ Browser will stay open for 30 seconds for testing...');
    await new Promise(resolve => setTimeout(resolve, 30000));

    await context.close();
    await browser.close();
    console.log('✅ Browser closed successfully');

  } catch (error) {
    console.error('❌ Error running Railway Cloudflare bypass:', error.message);
    console.log('');
    console.log('💡 Railway deployment tips:');
    console.log('   1. Make sure to use headless: true');
    console.log('   2. Add proper error handling');
    console.log('   3. Use environment variables for URLs');
    console.log('   4. Implement retry logic for Cloudflare');
  }
}

// Run the Railway-compatible bypass
runRailwayCloudflareBypass().catch(console.error); 