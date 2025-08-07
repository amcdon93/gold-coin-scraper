import { chromium } from 'playwright';

/**
 * Pre-Authenticated Codegen
 * 
 * This script launches a browser that you can manually authenticate
 * with Cloudflare first, then use for codegen.
 * 
 * Usage:
 * node src/codegen-pre-auth.js
 */

const preAuthConfig = {
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

async function runPreAuthCodegen() {
  console.log('🚀 Launching Pre-Authenticated Codegen...');
  console.log('📝 This approach lets you authenticate with Cloudflare first');
  console.log('');
  console.log('💡 STEP-BY-STEP PROCESS:');
  console.log('   1. A browser window will open');
  console.log('   2. Navigate to your target website');
  console.log('   3. Complete Cloudflare challenges manually');
  console.log('   4. Wait for the page to fully load');
  console.log('   5. Press ENTER in this terminal when ready');
  console.log('   6. Then codegen will start recording your actions');
  console.log('');
  console.log('💡 CLOUDFLARE BYPASS STRATEGY:');
  console.log('   • Authenticate with Cloudflare BEFORE starting codegen');
  console.log('   • This way codegen only records your scraping actions');
  console.log('   • No automation during the authentication phase');
  console.log('');
  
  const browser = await chromium.launch(preAuthConfig);
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
  
  console.log('✅ Browser launched!');
  console.log('🌐 Navigate to your target website and complete Cloudflare challenges');
  console.log('⏳ Press ENTER when you\'re ready to start codegen recording...');
  console.log('');
  
  // Wait for user to press Enter
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  await new Promise(resolve => {
    rl.question('Press ENTER when ready to start codegen...', () => {
      rl.close();
      resolve();
    });
  });
  
  console.log('');
  console.log('🚀 Starting codegen recording...');
  console.log('💡 Now interact with the page - your actions will be recorded!');
  console.log('📋 Copy the generated code from the codegen window when done');
  console.log('');
  
  // Start codegen recording
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  
  try {
    const command = 'npx playwright codegen --target=javascript';
    console.log('🔧 Running codegen command:', command);
    console.log('⏳ Codegen window will open...');
    console.log('');
    
    const { stdout, stderr } = await execAsync(command, { 
      stdio: 'inherit'
    });
    
    if (stdout) console.log(stdout);
    if (stderr) console.log(stderr);
    
  } catch (error) {
    console.error('❌ Error running codegen:', error.message);
  }
  
  await context.close();
  await browser.close();
}

// Run the codegen
runPreAuthCodegen().catch(console.error); 