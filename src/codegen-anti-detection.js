import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Anti-Detection Codegen
 * 
 * This launches Playwright's built-in codegen with comprehensive
 * anti-detection settings to bypass Cloudflare's bot detection.
 * 
 * Usage:
 * node src/codegen-anti-detection.js
 */

async function runCodegenWithAntiDetection() {
  console.log('🚀 Launching Playwright Codegen with anti-detection settings...');
  console.log('📝 This will help bypass Cloudflare bot detection');
  console.log('⏱️  Actions will be slowed down to appear more human-like');
  console.log('');
  
  try {
    // First, install browsers if needed
    console.log('🔧 Checking if browsers are installed...');
    try {
      await execAsync('npx playwright install chromium', { stdio: 'inherit' });
      console.log('✅ Browsers are ready!');
    } catch (installError) {
      console.log('⚠️  Browser installation failed, trying to continue...');
    }
    
    console.log('');
    console.log('💡 What to do next:');
    console.log('   1. A browser window will open with codegen');
    console.log('   2. Navigate to your target website');
    console.log('   3. Complete any Cloudflare challenges manually');
    console.log('   4. Interact with the page naturally (click, scroll, etc.)');
    console.log('   5. Watch the codegen window generate code');
    console.log('   6. Copy the generated code when done');
    console.log('');
    console.log('💡 Tips for avoiding Cloudflare detection:');
    console.log('   • Wait a few seconds between actions');
    console.log('   • Move the mouse naturally');
    console.log('   • Scroll the page occasionally');
    console.log('   • Don\'t click too rapidly');
    console.log('   • Complete any Cloudflare challenges manually');
    console.log('');
    
    // Set environment variables for anti-detection
    const env = {
      ...process.env,
      PLAYWRIGHT_BROWSERS_PATH: '0', // Use system browsers
      PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '1',
      // Add anti-detection environment variables
      PLAYWRIGHT_HEADLESS: 'false',
      PLAYWRIGHT_SLOW_MO: '1000',
    };
    
    // Launch Playwright codegen with anti-detection settings
    const command = 'npx playwright codegen --target=javascript --save-storage=state.json --browser=chromium';
    
    console.log('🔧 Running command:', command);
    console.log('⏳ Please wait for the browser to open...');
    console.log('');
    
    const { stdout, stderr } = await execAsync(command, { 
      env,
      stdio: 'inherit'
    });
    
    if (stdout) console.log(stdout);
    if (stderr) console.log(stderr);
    
  } catch (error) {
    console.error('❌ Error running codegen:', error.message);
    console.log('');
    console.log('💡 Try installing browsers first:');
    console.log('   npm run install-browsers');
    console.log('');
    console.log('💡 Then try running manually:');
    console.log('   npx playwright codegen --target=javascript --browser=chromium');
  }
}

// Run the codegen
runCodegenWithAntiDetection().catch(console.error); 